(function () {
    "use strict";

    const CONFIG = window.AlDahayanConfig || {};

    let inventoryRecords = [];
    let partsRecords = [];
    let locationRecords = [];

    let initialized = false;

    /**
     * ---------------------------------------------------------
     * Helpers
     * ---------------------------------------------------------
     */

    function normalize(value) {
        return String(value ?? "")
            .trim()
            .toLowerCase();
    }

    function number(value, fallback = 0) {
        const parsed = Number(value);

        return Number.isFinite(parsed)
            ? parsed
            : fallback;
    }

    function getInventoryConfig() {
        if (
            CONFIG &&
            typeof CONFIG.getEffectiveAppConfig === "function"
        ) {
            return (
                CONFIG.getEffectiveAppConfig().inventory || {}
            );
        }

        return {
            lowStockThreshold: 5,
            quantityDisplay: false,
            allowManualOverride: true,
            allowOnRequest: true,
            requireVerifiedStock: true,
            defaultStatus: "unknown"
        };
    }

    function getDataPath(file) {
        if (
            CONFIG &&
            typeof CONFIG.getDataPath === "function"
        ) {
            return CONFIG.getDataPath(file);
        }

        return `../data/${file}`;
    }

    /**
     * ---------------------------------------------------------
     * Load Data
     * ---------------------------------------------------------
     */

    async function loadJSON(file) {
        const response = await fetch(
            getDataPath(file),
            {
                cache: "no-cache"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load ${file}: ${response.status}`
            );
        }

        return response.json();
    }

    async function loadInventoryData() {
        try {
            const [
                inventory,
                parts,
                locations
            ] = await Promise.all([
                loadJSON("inventory.json"),
                loadJSON("oem-parts.json"),
                loadJSON("locations.json")
            ]);

            inventoryRecords =
                Array.isArray(inventory)
                    ? inventory
                    : [];

            partsRecords =
                Array.isArray(parts)
                    ? parts
                    : [];

            locationRecords =
                Array.isArray(locations)
                    ? locations
                    : [];

            return true;
        } catch (error) {
            console.error(
                "Al-Dahayan inventory data loading failed:",
                error
            );

            inventoryRecords = [];
            partsRecords = [];
            locationRecords = [];

            return false;
        }
    }

    /**
     * ---------------------------------------------------------
     * Part Lookup
     * ---------------------------------------------------------
     */

    function getPartById(partId) {
        const target = normalize(partId);

        return partsRecords.find((part) => {
            return normalize(part.id) === target;
        }) || null;
    }

    function getPartByOEM(oemNumber) {
        const target = normalize(oemNumber);

        return partsRecords.filter((part) => {
            return normalize(part.oemNumber) === target;
        });
    }

    /**
     * ---------------------------------------------------------
     * Location Lookup
     * ---------------------------------------------------------
     */

    function getLocationById(locationId) {
        const target = normalize(locationId);

        return locationRecords.find((location) => {
            return normalize(location.id) === target;
        }) || null;
    }

    /**
     * ---------------------------------------------------------
     * Stock Status
     *
     * Automatic:
     * 0       = OUT OF STOCK
     * 1–5     = LOW STOCK
     * 6+      = IN STOCK
     *
     * Manual:
     * Admin can override with:
     * in_stock
     * low_stock
     * out_of_stock
     * on_request
     * unknown
     * ---------------------------------------------------------
     */

    function calculateAutomaticStatus(quantity) {
        const config = getInventoryConfig();

        const threshold =
            number(
                config.lowStockThreshold,
                5
            );

        const qty = number(quantity, 0);

        if (qty <= 0) {
            return "out_of_stock";
        }

        if (qty <= threshold) {
            return "low_stock";
        }

        return "in_stock";
    }

    function normalizeStatus(status) {
        const value = normalize(status);

        const aliases = {
            in_stock: "in_stock",
            "in stock": "in_stock",

            low_stock: "low_stock",
            "low stock": "low_stock",

            out_of_stock: "out_of_stock",
            "out of stock": "out_of_stock",

            on_request: "on_request",
            "on request": "on_request",

            unknown: "unknown",

            discontinued: "discontinued"
        };

        return aliases[value] || "unknown";
    }

    function getRecordControlMode(record) {
        return (
            record.controlMode ||
            record.statusMode ||
            record.mode ||
            "automatic"
        ).toLowerCase();
    }

    function getEffectiveStatus(record) {
        const config = getInventoryConfig();

        const mode =
            getRecordControlMode(record);

        const manualStatus =
            normalizeStatus(
                record.manualStatus ||
                record.overrideStatus ||
                record.status
            );

        if (
            mode === "manual" &&
            config.allowManualOverride !== false
        ) {
            return manualStatus;
        }

        if (
            manualStatus === "on_request" &&
            config.allowOnRequest !== false &&
            mode === "manual"
        ) {
            return "on_request";
        }

        return calculateAutomaticStatus(
            getAvailableQuantity(record)
        );
    }

    /**
     * ---------------------------------------------------------
     * Quantity
     * ---------------------------------------------------------
     */

    function getAvailableQuantity(record) {
        if (
            record.availableQuantity !== undefined &&
            record.availableQuantity !== null
        ) {
            return Math.max(
                0,
                number(record.availableQuantity)
            );
        }

        const quantity =
            number(record.quantity, 0);

        const reserved =
            number(
                record.reservedQuantity,
                0
            );

        return Math.max(
            0,
            quantity - reserved
        );
    }

    function getQuantityDisplay() {
        const config = getInventoryConfig();

        return config.quantityDisplay === true;
    }

    /**
     * ---------------------------------------------------------
     * Verified Stock
     *
     * AI / public website must never treat
     * unverified data as confirmed stock.
     * ---------------------------------------------------------
     */

    function isVerifiedRecord(record) {
        const config = getInventoryConfig();

        if (
            config.requireVerifiedStock !== true
        ) {
            return true;
        }

        if (
            record.verified === true ||
            record.stockVerified === true ||
            record.verifiedStock === true
        ) {
            return true;
        }

        /*
         * Existing inventory records may not yet have
         * an explicit verified flag.
         *
         * They remain unverified until Admin/backend
         * marks them as verified.
         */
        return false;
    }

    /**
     * ---------------------------------------------------------
     * Normalize Inventory Record
     * ---------------------------------------------------------
     */

    function normalizeRecord(record) {
        const part =
            getPartById(record.partId);

        const location =
            getLocationById(
                record.locationId ||
                record.branchId
            );

        const available =
            getAvailableQuantity(record);

        const status =
            getEffectiveStatus(record);

        return {
            id: record.id || "",
            partId: record.partId || "",
            oemNumber:
                record.oemNumber ||
                part?.oemNumber ||
                "",

            partName:
                record.partName ||
                part?.partName ||
                "",

            brand:
                record.brand ||
                part?.brand ||
                "",

            category:
                record.category ||
                part?.category ||
                "",

            model:
                record.model ||
                part?.model ||
                [],

            locationId:
                record.locationId ||
                record.branchId ||
                "",

            locationName:
                location?.name ||
                "",

            locationType:
                location?.type ||
                "",

            quantity:
                number(record.quantity, 0),

            reservedQuantity:
                number(
                    record.reservedQuantity,
                    0
                ),

            availableQuantity:
                available,

            status,

            controlMode:
                getRecordControlMode(record),

            lastUpdated:
                record.lastUpdated ||
                null,

            active:
                record.active !== false,

            verified:
                isVerifiedRecord(record)
        };
    }

    /**
     * ---------------------------------------------------------
     * Get Active Records
     * ---------------------------------------------------------
     */

    function getActiveRecords() {
        return inventoryRecords
            .filter((record) => {
                return record.active !== false;
            })
            .map(normalizeRecord);
    }

    /**
     * ---------------------------------------------------------
     * Search Inventory
     * ---------------------------------------------------------
     */

    function search(query = {}) {
        const records =
            getActiveRecords();

        const q =
            normalize(query.query);

        const oem =
            normalize(query.oemNumber);

        const partId =
            normalize(query.partId);

        const brand =
            normalize(query.brand);

        const category =
            normalize(query.category);

        const model =
            normalize(query.model);

        const status =
            normalize(query.status);

        return records.filter((record) => {

            if (
                q &&
                ![
                    record.oemNumber,
                    record.partName,
                    record.partId,
                    record.brand,
                    record.category,
                    ...(Array.isArray(record.model)
                        ? record.model
                        : [record.model])
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(q)
            ) {
                return false;
            }

            if (
                oem &&
                normalize(record.oemNumber) !== oem
            ) {
                return false;
            }

            if (
                partId &&
                normalize(record.partId) !== partId
            ) {
                return false;
            }

            if (
                brand &&
                normalize(record.brand) !== brand
            ) {
                return false;
            }

            if (
                category &&
                normalize(record.category) !== category
            ) {
                return false;
            }

            if (
                model &&
                !(
                    Array.isArray(record.model)
                        ? record.model
                        : [record.model]
                )
                    .map(normalize)
                    .includes(model)
            ) {
                return false;
            }

            if (
                status &&
                record.status !== status
            ) {
                return false;
            }

            return true;
        });
    }

    /**
     * ---------------------------------------------------------
     * OEM Stock
     * ---------------------------------------------------------
     */

    function getOEMStock(oemNumber) {
        const records =
            search({
                oemNumber
            });

        return {
            oemNumber,
            records,
            verified:
                records.some(
                    (record) =>
                        record.verified === true
                ),
            totalRecords:
                records.length
        };
    }

    /**
     * ---------------------------------------------------------
     * Part Stock
     * ---------------------------------------------------------
     */

    function getPartStock(partId) {
        const records =
            search({
                partId
            });

        return {
            partId,
            records,
            verified:
                records.some(
                    (record) =>
                        record.verified === true
                ),
            totalRecords:
                records.length
        };
    }

    /**
     * ---------------------------------------------------------
     * Verified Availability
     *
     * Important:
     * No verified record = UNKNOWN
     *
     * Never convert unknown into OUT OF STOCK.
     * ---------------------------------------------------------
     */

    function getVerifiedAvailability(identifier) {
        let records = [];

        if (
            identifier &&
            typeof identifier === "object"
        ) {
            records =
                search(identifier);
        } else {
            records =
                search({
                    oemNumber: identifier
                });
        }

        const verifiedRecords =
            records.filter(
                (record) =>
                    record.verified === true
            );

        if (
            verifiedRecords.length === 0
        ) {
            return {
                status: "unknown",
                verified: false,
                records: [],
                message:
                    "Stock availability is not verified."
            };
        }

        const statuses =
            verifiedRecords.map(
                (record) =>
                    record.status
            );

        if (
            statuses.includes("in_stock")
        ) {
            return {
                status: "in_stock",
                verified: true,
                records: verifiedRecords,
                message:
                    "Verified stock is available."
            };
        }

        if (
            statuses.includes("low_stock")
        ) {
            return {
                status: "low_stock",
                verified: true,
                records: verifiedRecords,
                message:
                    "Verified stock is available in limited quantity."
            };
        }

        if (
            statuses.includes("on_request")
        ) {
            return {
                status: "on_request",
                verified: true,
                records: verifiedRecords,
                message:
                    "Part is available on request."
            };
        }

        if (
            verifiedRecords.every(
                (record) =>
                    record.status ===
                    "out_of_stock"
            )
        ) {
            return {
                status: "out_of_stock",
                verified: true,
                records: verifiedRecords,
                message:
                    "Verified records show no available stock."
            };
        }

        return {
            status: "unknown",
            verified: true,
            records: verifiedRecords,
            message:
                "Availability requires confirmation."
        };
    }

    /**
     * ---------------------------------------------------------
     * Customer-safe Stock Result
     *
     * Exact quantity is hidden unless Admin enables it.
     * Branch details are not proactively exposed here.
     * ---------------------------------------------------------
     */

    function getCustomerStock(identifier) {
        const result =
            getVerifiedAvailability(
                identifier
            );

        const showQuantity =
            getQuantityDisplay();

        const records =
            result.records.map(
                (record) => ({
                    id: record.id,
                    partId: record.partId,
                    oemNumber:
                        record.oemNumber,
                    partName:
                        record.partName,
                    brand:
                        record.brand,
                    status:
                        record.status,
                    quantity:
                        showQuantity
                            ? record.availableQuantity
                            : null,
                    lastUpdated:
                        record.lastUpdated
                })
            );

        return {
            status:
                result.status,

            verified:
                result.verified,

            records,

            message:
                result.message
        };
    }

    /**
     * ---------------------------------------------------------
     * Statistics
     * ---------------------------------------------------------
     */

    function getStats() {
        const records =
            getActiveRecords();

        return {
            total:
                records.length,

            inStock:
                records.filter(
                    (record) =>
                        record.status ===
                        "in_stock"
                ).length,

            lowStock:
                records.filter(
                    (record) =>
                        record.status ===
                        "low_stock"
                ).length,

            outOfStock:
                records.filter(
                    (record) =>
                        record.status ===
                        "out_of_stock"
                ).length,

            onRequest:
                records.filter(
                    (record) =>
                        record.status ===
                        "on_request"
                ).length,

            unknown:
                records.filter(
                    (record) =>
                        record.status ===
                        "unknown"
                ).length,

            verified:
                records.filter(
                    (record) =>
                        record.verified === true
                ).length,

            unverified:
                records.filter(
                    (record) =>
                        record.verified !== true
                ).length
        };
    }

    /**
     * ---------------------------------------------------------
     * Inventory Event
     * ---------------------------------------------------------
     */

    function dispatchInventoryReady() {
        document.dispatchEvent(
            new CustomEvent(
                "alDahayanInventoryReady",
                {
                    detail: {
                        stats:
                            getStats()
                    }
                }
            )
        );
    }

    /**
     * ---------------------------------------------------------
     * Refresh
     * ---------------------------------------------------------
     */

    async function refresh() {
        await loadInventoryData();

        dispatchInventoryReady();

        return getStats();
    }

    /**
     * ---------------------------------------------------------
     * Initialize
     * ---------------------------------------------------------
     */

    async function init() {
        if (initialized) {
            return getStats();
        }

        initialized = true;

        await loadInventoryData();

        dispatchInventoryReady();

        return getStats();
    }

    /**
     * ---------------------------------------------------------
     * Public API
     * ---------------------------------------------------------
     */

    window.AlDahayanInventory = {

        init,

        refresh,

        search,

        getStats,

        getPartById,

        getPartByOEM,

        getLocationById,

        getPartStock,

        getOEMStock,

        getVerifiedAvailability,

        getCustomerStock,

        getActiveRecords,

        calculateAutomaticStatus,

        getEffectiveStatus,

        getAvailableQuantity,

        isVerifiedRecord,

        getQuantityDisplay,

        getInventoryConfig: function () {
            return {
                ...getInventoryConfig()
            };
        },

        getRawInventory: function () {
            return [...inventoryRecords];
        },

        getRawParts: function () {
            return [...partsRecords];
        },

        getRawLocations: function () {
            return [...locationRecords];
        }
    };

})();
