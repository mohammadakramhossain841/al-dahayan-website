/* =========================================
   AL-DAHAYAN ADMIN INVENTORY CONTROLLER
   Live Inventory + Verified Backend API
   ========================================= */

(function () {
    "use strict";

    const TOKEN_KEY = "dahayan_admin_token";

    const LOCAL_INVENTORY_URL = "../data/inventory.json";
    const LOCAL_PARTS_URL = "../data/oem-parts.json";
    const LOCAL_LOCATIONS_URL = "../data/locations.json";

    const ADMIN_INVENTORY_ENDPOINT =
        "/api/v1/inventory/admin";

    let inventoryRecords = [];
    let parts = [];
    let locations = [];

    let backendInventoryLoaded = false;

    /* =========================================
       Authentication
       ========================================= */

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function requireAuthentication() {
        if (!getToken()) {
            window.location.href = "login.html";
            return false;
        }

        return true;
    }

    /* =========================================
       API Configuration
       ========================================= */

    function getApiBaseUrl() {
        if (
            window.DAHAYAN_CONFIG &&
            window.DAHAYAN_CONFIG.API_BASE_URL
        ) {
            return window.DAHAYAN_CONFIG.API_BASE_URL;
        }

        if (
            window.CONFIG &&
            window.CONFIG.API_BASE_URL
        ) {
            return window.CONFIG.API_BASE_URL;
        }

        return "";
    }

    /* =========================================
       Authenticated Request
       ========================================= */

    async function authenticatedRequest(
        endpoint,
        options
    ) {
        const token = getToken();

        if (!token) {
            window.location.href = "login.html";
            throw new Error("Authentication required");
        }

        const requestOptions = options || {};
        const headers = new Headers(
            requestOptions.headers || {}
        );

        headers.set(
            "Authorization",
            "Bearer " + token
        );

        if (
            requestOptions.body &&
            !headers.has("Content-Type")
        ) {
            headers.set(
                "Content-Type",
                "application/json"
            );
        }

        const response = await fetch(
            getApiBaseUrl() + endpoint,
            {
                ...requestOptions,
                headers
            }
        );

        if (response.status === 401) {
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(
                "dahayan_admin_user"
            );

            window.location.href = "login.html";

            throw new Error(
                "Authentication expired"
            );
        }

        if (response.status === 403) {
            throw new Error(
                "You do not have permission to access inventory"
            );
        }

        if (!response.ok) {
            throw new Error(
                "Inventory API request failed: " +
                response.status
            );
        }

        return response.json();
    }

    /* =========================================
       Helpers
       ========================================= */

    function toArray(value) {
        if (Array.isArray(value)) {
            return value;
        }

        if (
            value &&
            Array.isArray(value.inventory)
        ) {
            return value.inventory;
        }

        if (
            value &&
            Array.isArray(value.parts)
        ) {
            return value.parts;
        }

        if (
            value &&
            Array.isArray(value.locations)
        ) {
            return value.locations;
        }

        return [];
    }

    function normalizeText(value) {
        return String(value ?? "")
            .trim()
            .toLowerCase();
    }

    function normalizeNumber(value) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : 0;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =========================================
       Inventory Fields
       ========================================= */

    function getInventoryId(record) {
        return (
            record.id ??
            record.inventoryId ??
            record.inventory_id ??
            ""
        );
    }

    function getOEM(record) {
        return (
            record.oemNumber ??
            record.oem_number ??
            record.oem ??
            ""
        );
    }

    function getQuantity(record) {
        return normalizeNumber(
            record.quantity ??
            record.stockQuantity ??
            record.stock_quantity ??
            record.stock ??
            0
        );
    }

    function getReservedQuantity(record) {
        return normalizeNumber(
            record.reservedQuantity ??
            record.reserved_quantity ??
            record.reserved ??
            0
        );
    }

    function getAvailableQuantity(record) {
        if (
            record.availableQuantity !== undefined ||
            record.available_quantity !== undefined
        ) {
            return normalizeNumber(
                record.availableQuantity ??
                record.available_quantity
            );
        }

        return Math.max(
            0,
            getQuantity(record) -
            getReservedQuantity(record)
        );
    }

    function getControlMode(record) {
        return normalizeText(
            record.controlMode ??
            record.control_mode ??
            record.stockControlMode ??
            record.stock_control_mode ??
            "automatic"
        );
    }

    function getUpdatedAt(record) {
        return (
            record.updatedAt ??
            record.updated_at ??
            record.lastUpdated ??
            record.last_updated ??
            ""
        );
    }

    function isActive(record) {
        if (record.active !== undefined) {
            return Boolean(record.active);
        }

        if (record.isActive !== undefined) {
            return Boolean(record.isActive);
        }

        return record.status !== "inactive";
    }

    /* =========================================
       Part Mapping
       ========================================= */

    function findPartByOEM(oemNumber) {
        const target = normalizeText(oemNumber);

        if (!target) {
            return null;
        }

        return (
            parts.find(function (part) {
                return (
                    normalizeText(
                        part.oemNumber
                    ) === target
                );
            }) || null
        );
    }

    function getPart(record) {
        return findPartByOEM(
            getOEM(record)
        );
    }

    function getPartName(record) {
        const part = getPart(record);

        return (
            part?.partName ||
            record.partName ||
            record.part_name ||
            record.name ||
            "—"
        );
    }

    function getBrand(record) {
        const part = getPart(record);

        return (
            part?.brand ||
            record.brand ||
            "—"
        );
    }

    function getModels(record) {
        const part = getPart(record);

        if (
            part &&
            Array.isArray(part.model)
        ) {
            return part.model.join(", ");
        }

        return (
            record.model ||
            record.models ||
            "—"
        );
    }

    function getCategory(record) {
        const part = getPart(record);

        return (
            part?.category ||
            record.category ||
            "—"
        );
    }

    /* =========================================
       Location Mapping
       ========================================= */

    function findLocationById(locationId) {
        const target =
            normalizeText(locationId);

        if (!target) {
            return null;
        }

        return (
            locations.find(function (location) {
                return (
                    normalizeText(
                        location.id
                    ) === target
                );
            }) || null
        );
    }

    function getLocation(record) {
        const locationId =
            record.locationId ??
            record.location_id ??
            record.branchId ??
            record.branch_id ??
            "";

        return findLocationById(locationId);
    }

    function getBranch(record) {
        const location =
            getLocation(record);

        return (
            location?.name ||
            record.branchName ||
            record.branch_name ||
            record.locationName ||
            record.location_name ||
            "—"
        );
    }

    /* =========================================
       Stock Status
       ========================================= */

    function getStockStatus(record) {
        const explicitStatus =
            normalizeText(
                record.status
            );

        /*
         * Backend explicitly says stock
         * information is not yet verified.
         * Do not convert this to Out of Stock.
         */
        if (explicitStatus === "unknown") {
            return "unknown";
        }

        const controlMode =
            getControlMode(record);

        if (
            controlMode === "manual" ||
            controlMode === "override" ||
            controlMode === "manual_override"
        ) {
            if (
                explicitStatus === "on_request" ||
                explicitStatus === "on request"
            ) {
                return "on_request";
            }

            if (
                explicitStatus === "out_of_stock" ||
                explicitStatus === "out of stock"
            ) {
                return "out_of_stock";
            }

            if (
                explicitStatus === "low_stock" ||
                explicitStatus === "low stock"
            ) {
                return "low_stock";
            }

            if (explicitStatus === "in_stock") {
                return "in_stock";
            }
        }

        const availableQuantity =
            getAvailableQuantity(record);

        if (availableQuantity <= 0) {
            return "out_of_stock";
        }

        if (availableQuantity <= 5) {
            return "low_stock";
        }

        return "in_stock";
    }

    function getStockStatusLabel(status) {
        switch (status) {
            case "in_stock":
                return "In Stock";

            case "low_stock":
                return "Low Stock";

            case "out_of_stock":
                return "Out of Stock";

            case "on_request":
                return "On Request";

            case "unknown":
                return "Not Verified";

            default:
                return "Unknown";
        }
    }

    function getStockStatusClass(status) {
        switch (status) {
            case "in_stock":
                return "status-success";

            case "low_stock":
                return "status-warning";

            case "out_of_stock":
                return "status-danger";

            case "on_request":
            case "unknown":
                return "status-info";

            default:
                return "";
        }
    }

    /* =========================================
       Local JSON
       ========================================= */

    async function loadJson(url) {
        const response = await fetch(
            url,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load " + url
            );
        }

        return response.json();
    }

    /* =========================================
       Backend Inventory
       ========================================= */

    async function loadBackendInventory() {
        const data =
            await authenticatedRequest(
                ADMIN_INVENTORY_ENDPOINT,
                {
                    method: "GET"
                }
            );

        if (
            !data ||
            data.success !== true ||
            !Array.isArray(data.inventory)
        ) {
            throw new Error(
                "Invalid inventory API response"
            );
        }

        inventoryRecords =
            data.inventory;

        backendInventoryLoaded = true;

        return inventoryRecords;
    }

    /* =========================================
       Complete Data Loading
       ========================================= */

    async function loadInventoryData() {
        if (!requireAuthentication()) {
            return;
        }

        try {
            await loadBackendInventory();

            /*
             * Reference data is currently local.
             * Inventory itself comes from verified API.
             */
            const [
                partsData,
                locationsData
            ] = await Promise.all([
                loadJson(LOCAL_PARTS_URL),
                loadJson(LOCAL_LOCATIONS_URL)
            ]);

            parts = toArray(partsData);
            locations = toArray(locationsData);

            renderInventory();

        } catch (error) {
            console.warn(
                "Backend inventory unavailable. Using local inventory fallback.",
                error
            );

            try {
                const [
                    inventoryData,
                    partsData,
                    locationsData
                ] = await Promise.all([
                    loadJson(
                        LOCAL_INVENTORY_URL
                    ),
                    loadJson(
                        LOCAL_PARTS_URL
                    ),
                    loadJson(
                        LOCAL_LOCATIONS_URL
                    )
                ]);

                inventoryRecords =
                    toArray(inventoryData);

                parts =
                    toArray(partsData);

                locations =
                    toArray(locationsData);

                backendInventoryLoaded =
                    false;

                renderInventory();

                showInventoryMessage(
                    "Live inventory API unavailable. Showing local inventory data.",
                    "warning"
                );

            } catch (fallbackError) {
                console.error(
                    "Inventory loading failed:",
                    fallbackError
                );

                inventoryRecords = [];
                parts = [];
                locations = [];

                renderInventory();

                showInventoryMessage(
                    "Unable to load inventory data.",
                    "error"
                );
            }
        }
    }

    /* =========================================
       Message
       ========================================= */

    function showInventoryMessage(
        message,
        type
    ) {
        const tableBody =
            document.getElementById(
                "inventoryTableBody"
            );

        if (!tableBody) {
            return;
        }

        const className =
            type === "error"
                ? "status-danger"
                : "status-warning";

        tableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    <div class="admin-empty-state">
                        <span class="${className}">
                            ${escapeHtml(message)}
                        </span>
                    </div>
                </td>
            </tr>
        `;
    }

    /* =========================================
       Summary
       ========================================= */

    function updateSummary(records) {
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        let onRequest = 0;

        records.forEach(function (record) {
            const status =
                getStockStatus(record);

            if (status === "in_stock") {
                inStock++;
            } else if (status === "low_stock") {
                lowStock++;
            } else if (
                status === "out_of_stock"
            ) {
                outOfStock++;
            } else if (
                status === "on_request"
            ) {
                onRequest++;
            }
        });

        setText(
            "totalRecords",
            records.length
        );

        setText(
            "inStockRecords",
            inStock
        );

        setText(
            "lowStockRecords",
            lowStock
        );

        setText(
            "outOfStockRecords",
            outOfStock
        );

        setText(
            "onRequestRecords",
            onRequest
        );
    }

    function setText(id, value) {
        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    /* =========================================
       Filtering
       ========================================= */

    function getFilteredRecords() {
        const searchElement =
            document.getElementById(
                "inventorySearch"
            );

        const brandElement =
            document.getElementById(
                "brandFilter"
            );

        const statusElement =
            document.getElementById(
                "statusFilter"
            );

        const controlModeElement =
            document.getElementById(
                "controlModeFilter"
            );

        const activeElement =
            document.getElementById(
                "activeFilter"
            );

        const search =
            normalizeText(
                searchElement
                    ? searchElement.value
                    : ""
            );

        const brand =
            normalizeText(
                brandElement
                    ? brandElement.value
                    : ""
            );

        const status =
            normalizeText(
                statusElement
                    ? statusElement.value
                    : ""
            );

        const controlMode =
            normalizeText(
                controlModeElement
                    ? controlModeElement.value
                    : ""
            );

        const activeFilter =
            normalizeText(
                activeElement
                    ? activeElement.value
                    : ""
            );

        return inventoryRecords.filter(
            function (record) {
                const inventoryId =
                    normalizeText(
                        getInventoryId(record)
                    );

                const oem =
                    normalizeText(
                        getOEM(record)
                    );

                const partName =
                    normalizeText(
                        getPartName(record)
                    );

                const recordBrand =
                    normalizeText(
                        getBrand(record)
                    );

                const branch =
                    normalizeText(
                        getBranch(record)
                    );

                const models =
                    normalizeText(
                        getModels(record)
                    );

                const category =
                    normalizeText(
                        getCategory(record)
                    );

                const recordStatus =
                    getStockStatus(record);

                const recordControlMode =
                    getControlMode(record);

                const recordActive =
                    isActive(record);

                const searchableText =
                    [
                        inventoryId,
                        oem,
                        partName,
                        recordBrand,
                        branch,
                        models,
                        category
                    ].join(" ");

                if (
                    search &&
                    !searchableText.includes(
                        search
                    )
                ) {
                    return false;
                }

                if (
                    brand &&
                    recordBrand !== brand
                ) {
                    return false;
                }

                if (
                    status &&
                    recordStatus !== status
                ) {
                    return false;
                }

                if (
                    controlMode &&
                    recordControlMode !==
                        controlMode
                ) {
                    return false;
                }

                if (
                    activeFilter === "active" &&
                    !recordActive
                ) {
                    return false;
                }

                if (
                    activeFilter === "inactive" &&
                    recordActive
                ) {
                    return false;
                }

                return true;
            }
        );
    }

    /* =========================================
       Render Inventory
       ========================================= */

    function renderInventory() {
        const tableBody =
            document.getElementById(
                "inventoryTableBody"
            );

        const records =
            getFilteredRecords();

        updateSummary(records);

        if (!tableBody) {
            return;
        }

        if (!records.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10">
                        <div class="admin-empty-state">
                            No inventory records found.
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML =
            records.map(function (record) {
                const inventoryId =
                    getInventoryId(record);

                const oem =
                    getOEM(record);

                const partName =
                    getPartName(record);

                const brand =
                    getBrand(record);

                const branch =
                    getBranch(record);

                const quantity =
                    getAvailableQuantity(record);

                const status =
                    getStockStatus(record);

                const controlMode =
                    getControlMode(record);

                const updatedAt =
                    getUpdatedAt(record);

                return `
                    <tr>
                        <td>
                            ${escapeHtml(
                                inventoryId
                            )}
                        </td>

                        <td>
                            ${escapeHtml(oem)}
                        </td>

                        <td>
                            ${escapeHtml(
                                partName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                brand
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                branch
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                quantity
                            )}
                        </td>

                        <td>
                            <span class="${getStockStatusClass(
                                status
                            )}">
                                ${getStockStatusLabel(
                                    status
                                )}
                            </span>
                        </td>

                        <td>
                            ${escapeHtml(
                                controlMode ||
                                "automatic"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                updatedAt || "—"
                            )}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="admin-table-action"
                                data-action="edit-inventory"
                                data-id="${escapeHtml(
                                    inventoryId
                                )}"
                            >
                                Edit
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
    }

    /* =========================================
       Events
       ========================================= */

    function setupFilters() {
        [
            "inventorySearch",
            "brandFilter",
            "statusFilter",
            "controlModeFilter",
            "activeFilter"
        ].forEach(function (id) {
            const element =
                document.getElementById(id);

            if (!element) {
                return;
            }

            element.addEventListener(
                "input",
                renderInventory
            );

            element.addEventListener(
                "change",
                renderInventory
            );
        });
    }

    function setupActions() {
        const addButton =
            document.getElementById(
                "addInventoryButton"
            );

        if (addButton) {
            addButton.addEventListener(
                "click",
                function () {
                    document.dispatchEvent(
                        new CustomEvent(
                            "dahayan:inventory-add-request"
                        )
                    );
                }
            );
        }

        const tableBody =
            document.getElementById(
                "inventoryTableBody"
            );

        if (tableBody) {
            tableBody.addEventListener(
                "click",
                function (event) {
                    const button =
                        event.target.closest(
                            "[data-action='edit-inventory']"
                        );

                    if (!button) {
                        return;
                    }

                    document.dispatchEvent(
                        new CustomEvent(
                            "dahayan:inventory-edit-request",
                            {
                                detail: {
                                    id:
                                        button.dataset.id ||
                                        ""
                                }
                            }
                        )
                    );
                }
            );
        }
    }

    /* =========================================
       Initialize
       ========================================= */

    async function init() {
        if (!requireAuthentication()) {
            return;
        }

        setupFilters();
        setupActions();

        await loadInventoryData();
    }

    /* =========================================
       Public API
       ========================================= */

    window.DahayanAdminInventory = {
        init,
        loadInventoryData,
        loadBackendInventory,
        renderInventory,
        getFilteredRecords,

        getRecords: function () {
            return inventoryRecords;
        },

        getParts: function () {
            return parts;
        },

        getLocations: function () {
            return locations;
        },

        getToken,

        getApiBaseUrl,

        authenticatedRequest,

        isBackendInventoryLoaded:
            function () {
                return backendInventoryLoaded;
            },

        findPartByOEM,

        findLocationById
    };

    /* =========================================
       Start
       ========================================= */

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

})();
