/* =========================================================
   AL-DAHAYAN ADMIN INVENTORY CONTROLLER
   File: js/admin/admin-inventory.js

   Purpose:
   - Admin authentication
   - Load inventory data
   - Load OEM part data
   - Load branch/location data
   - Calculate stock status
   - Search inventory
   - Filter inventory
   - Render inventory table
   - Update inventory summary
   - Prepare safe future API integration
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const TOKEN_KEY = "dahayan_admin_token";

    const DATA_FILES = {
        inventory: "../data/inventory.json",
        parts: "../data/oem-parts.json",
        locations: "../data/locations.json"
    };


    /* =====================================================
       STATE
       ===================================================== */

    let inventoryRecords = [];
    let parts = [];
    let locations = [];


    /* =====================================================
       DOM HELPERS
       ===================================================== */

    function getElement(id) {
        return document.getElementById(id);
    }


    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }


    function requireAuthentication() {

        const token = getToken();

        if (!token) {

            window.location.href = "login.html";

            return false;
        }

        return true;
    }


    /* =====================================================
       CONFIGURATION HELPER
       ===================================================== */

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


    /* =====================================================
       AUTHENTICATED API HELPER
       -----------------------------------------------------
       No unverified inventory endpoint is called here.
       This helper is reserved for the verified API layer.
       ===================================================== */

    async function authenticatedRequest(
        endpoint,
        options = {}
    ) {

        const token = getToken();

        if (!token) {

            window.location.href = "login.html";

            throw new Error(
                "Admin authentication required."
            );
        }


        const apiBaseUrl = getApiBaseUrl();

        if (!apiBaseUrl) {

            throw new Error(
                "API base URL is not configured."
            );
        }


        const requestOptions = {
            ...options,

            headers: {
                ...(options.headers || {}),

                Authorization:
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"
            }
        };


        const response = await fetch(
            `${apiBaseUrl}${endpoint}`,
            requestOptions
        );


        if (response.status === 401) {

            sessionStorage.removeItem(
                TOKEN_KEY
            );

            sessionStorage.removeItem(
                "dahayan_admin_user"
            );

            window.location.href =
                "login.html";

            throw new Error(
                "Authentication expired."
            );
        }


        return response;
    }


    /* =====================================================
       JSON LOADER
       ===================================================== */

    async function loadJson(url) {

        const response = await fetch(
            url,
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                `Unable to load ${url}. HTTP ${response.status}`
            );
        }


        return response.json();
    }


    /* =====================================================
       ARRAY NORMALIZER
       ===================================================== */

    function toArray(
        data,
        possibleKeys = []
    ) {

        if (Array.isArray(data)) {

            return data;
        }


        if (
            data &&
            typeof data === "object"
        ) {

            for (
                const key of possibleKeys
            ) {

                if (
                    Array.isArray(
                        data[key]
                    )
                ) {

                    return data[key];
                }
            }
        }


        return [];
    }


    /* =====================================================
       GENERAL HELPERS
       ===================================================== */

    function normalizeText(value) {

        return String(
            value ?? ""
        )
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

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =====================================================
       PART LOOKUP
       ===================================================== */

    function findPart(record) {

        const partReference =
            record.partId ??
            record.part_id ??
            record.partID ??
            record.oemNumber ??
            record.oem_number;


        if (!partReference) {

            return null;
        }


        const reference =
            normalizeText(
                partReference
            );


        return (
            parts.find(
                function (part) {

                    const values = [

                        part.id,

                        part.partId,

                        part.part_id,

                        part.oemNumber,

                        part.oem_number,

                        part.partNumber,

                        part.part_number

                    ];


                    return values.some(
                        function (value) {

                            return (
                                normalizeText(
                                    value
                                ) === reference
                            );
                        }
                    );
                }
            ) || null
        );
    }


    /* =====================================================
       LOCATION / BRANCH LOOKUP
       ===================================================== */

    function findLocation(record) {

        const locationReference =
            record.locationId ??
            record.location_id ??
            record.branchId ??
            record.branch_id ??
            record.location;


        if (!locationReference) {

            return null;
        }


        const reference =
            normalizeText(
                locationReference
            );


        return (
            locations.find(
                function (location) {

                    const values = [

                        location.id,

                        location.locationId,

                        location.location_id,

                        location.branchId,

                        location.branch_id,

                        location.name,

                        location.branchName,

                        location.branch_name

                    ];


                    return values.some(
                        function (value) {

                            return (
                                normalizeText(
                                    value
                                ) === reference
                            );
                        }
                    );
                }
            ) || null
        );
    }


    /* =====================================================
       FIELD HELPERS
       ===================================================== */

    function getInventoryId(
        record,
        index
    ) {

        return (
            record.inventoryId ??
            record.inventory_id ??
            record.id ??
            `INV-${String(
                index + 1
            ).padStart(4, "0")}`
        );
    }


    function getOemNumber(
        record,
        part
    ) {

        return (
            record.oemNumber ??
            record.oem_number ??
            part?.oemNumber ??
            part?.oem_number ??
            part?.partNumber ??
            part?.part_number ??
            "—"
        );
    }


    function getPartName(
        record,
        part
    ) {

        return (
            record.partName ??
            record.part_name ??
            record.name ??
            part?.partName ??
            part?.part_name ??
            part?.name ??
            "Unknown Part"
        );
    }


    function getBrand(
        record,
        part
    ) {

        return (
            record.brand ??
            part?.brand ??
            "—"
        );
    }


    function getBranchName(
        record,
        location
    ) {

        return (
            record.branchName ??
            record.branch_name ??
            record.locationName ??
            record.location_name ??
            location?.branchName ??
            location?.branch_name ??
            location?.name ??
            "—"
        );
    }


    function getQuantity(record) {

        return normalizeNumber(
            record.quantity ??
            record.stockQuantity ??
            record.stock_quantity ??
            0
        );
    }


    function getReservedQuantity(record) {

        return normalizeNumber(
            record.reservedQuantity ??
            record.reserved_quantity ??
            0
        );
    }


    function getAvailableQuantity(record) {

        const quantity =
            getQuantity(record);

        const reserved =
            getReservedQuantity(record);


        return Math.max(
            quantity - reserved,
            0
        );
    }


    function getControlMode(record) {

        return normalizeText(
            record.controlMode ??
            record.control_mode ??
            record.mode ??
            "automatic"
        );
    }


    function getActive(record) {

        if (
            typeof record.active ===
            "boolean"
        ) {

            return record.active;
        }


        if (
            typeof record.isActive ===
            "boolean"
        ) {

            return record.isActive;
        }


        if (
            typeof record.is_active ===
            "boolean"
        ) {

            return record.is_active;
        }


        const value =
            normalizeText(
                record.active ??
                record.status ??
                "active"
            );


        return ![
            "inactive",
            "disabled",
            "false",
            "0"
        ].includes(value);
    }


    function getUpdatedAt(record) {

        return (
            record.updatedAt ??
            record.updated_at ??
            record.lastUpdated ??
            record.last_updated ??
            record.updated ??
            ""
        );
    }


    /* =====================================================
       STOCK STATUS
       ===================================================== */

    function calculateStatus(record) {

        const controlMode =
            getControlMode(record);


        /*
         * Manual mode:
         * Respect an explicitly supplied status.
         */

        if (
            controlMode === "manual" ||
            controlMode === "override" ||
            controlMode ===
                "manual_override"
        ) {

            const explicitStatus =
                normalizeText(
                    record.status ??
                    record.stockStatus ??
                    record.stock_status
                );


            if (
                explicitStatus.includes(
                    "request"
                ) ||
                explicitStatus ===
                    "on_request"
            ) {

                return "on_request";
            }


            if (
                explicitStatus.includes(
                    "out"
                ) ||
                explicitStatus === "0"
            ) {

                return "out_of_stock";
            }


            if (
                explicitStatus.includes(
                    "low"
                )
            ) {

                return "low_stock";
            }


            if (
                explicitStatus.includes(
                    "in_stock"
                ) ||
                explicitStatus.includes(
                    "instock"
                ) ||
                explicitStatus ===
                    "available"
            ) {

                return "in_stock";
            }
        }


        /*
         * Automatic mode:
         * Calculate status from available quantity.
         */

        const availableQuantity =
            getAvailableQuantity(
                record
            );


        if (
            availableQuantity <= 0
        ) {

            return "out_of_stock";
        }


        if (
            availableQuantity <= 5
        ) {

            return "low_stock";
        }


        return "in_stock";
    }


    function getStatusLabel(status) {

        const labels = {

            in_stock:
                "In Stock",

            low_stock:
                "Low Stock",

            out_of_stock:
                "Out of Stock",

            on_request:
                "On Request"
        };


        return (
            labels[status] ||
            "Unknown"
        );
    }


    function getStatusClass(status) {

        const classes = {

            in_stock:
                "status-success",

            low_stock:
                "status-warning",

            out_of_stock:
                "status-danger",

            on_request:
                "status-info"
        };


        return (
            classes[status] ||
            "status-neutral"
        );
    }


    /* =====================================================
       PREPARE DISPLAY RECORD
       ===================================================== */

    function prepareRecord(
        record,
        index
    ) {

        const part =
            findPart(record);

        const location =
            findLocation(record);


        return {

            original:
                record,

            index,

            inventoryId:
                getInventoryId(
                    record,
                    index
                ),

            oemNumber:
                getOemNumber(
                    record,
                    part
                ),

            partName:
                getPartName(
                    record,
                    part
                ),

            brand:
                getBrand(
                    record,
                    part
                ),

            branchName:
                getBranchName(
                    record,
                    location
                ),

            quantity:
                getQuantity(
                    record
                ),

            reservedQuantity:
                getReservedQuantity(
                    record
                ),

            availableQuantity:
                getAvailableQuantity(
                    record
                ),

            status:
                calculateStatus(
                    record
                ),

            controlMode:
                getControlMode(
                    record
                ),

            active:
                getActive(
                    record
                ),

            updatedAt:
                getUpdatedAt(
                    record
                )
        };
    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function updateSummary() {

        const preparedRecords =
            inventoryRecords.map(
                prepareRecord
            );


        const total =
            preparedRecords.length;


        const inStock =
            preparedRecords.filter(
                record =>
                    record.status ===
                    "in_stock"
            ).length;


        const lowStock =
            preparedRecords.filter(
                record =>
                    record.status ===
                    "low_stock"
            ).length;


        const outOfStock =
            preparedRecords.filter(
                record =>
                    record.status ===
                    "out_of_stock"
            ).length;


        const onRequest =
            preparedRecords.filter(
                record =>
                    record.status ===
                    "on_request"
            ).length;


        const totalElement =
            getElement(
                "totalRecords"
            );

        const inStockElement =
            getElement(
                "inStockRecords"
            );

        const lowStockElement =
            getElement(
                "lowStockRecords"
            );

        const outOfStockElement =
            getElement(
                "outOfStockRecords"
            );

        const onRequestElement =
            getElement(
                "onRequestRecords"
            );


        if (totalElement) {

            totalElement.textContent =
                total;
        }


        if (inStockElement) {

            inStockElement.textContent =
                inStock;
        }


        if (lowStockElement) {

            lowStockElement.textContent =
                lowStock;
        }


        if (outOfStockElement) {

            outOfStockElement.textContent =
                outOfStock;
        }


        if (onRequestElement) {

            onRequestElement.textContent =
                onRequest;
        }
    }


    /* =====================================================
       FILTER
       ===================================================== */

    function getFilteredRecords() {

        const search =
            normalizeText(
                getElement(
                    "inventorySearch"
                )?.value
            );


        const brand =
            normalizeText(
                getElement(
                    "brandFilter"
                )?.value
            );


        const status =
            normalizeText(
                getElement(
                    "statusFilter"
                )?.value
            );


        const controlMode =
            normalizeText(
                getElement(
                    "controlModeFilter"
                )?.value
            );


        const active =
            normalizeText(
                getElement(
                    "activeFilter"
                )?.value
            );


        return inventoryRecords
            .map(
                function (
                    record,
                    index
                ) {

                    return prepareRecord(
                        record,
                        index
                    );
                }
            )
            .filter(
                function (record) {

                    /*
                     * Search
                     */

                    if (search) {

                        const searchableText = [

                            record.inventoryId,

                            record.oemNumber,

                            record.partName,

                            record.brand,

                            record.branchName,

                            record.status,

                            record.controlMode

                        ]
                            .map(
                                normalizeText
                            )
                            .join(" ");


                        if (
                            !searchableText.includes(
                                search
                            )
                        ) {

                            return false;
                        }
                    }


                    /*
                     * Brand
                     */

                    if (
                        brand &&
                        brand !== "all" &&
                        normalizeText(
                            record.brand
                        ) !== brand
                    ) {

                        return false;
                    }


                    /*
                     * Status
                     */

                    if (
                        status &&
                        status !== "all" &&
                        record.status !==
                            status
                    ) {

                        return false;
                    }


                    /*
                     * Control Mode
                     */

                    if (
                        controlMode &&
                        controlMode !== "all" &&
                        record.controlMode !==
                            controlMode
                    ) {

                        return false;
                    }


                    /*
                     * Active / Inactive
                     */

                    if (
                        active ===
                        "active" &&
                        !record.active
                    ) {

                        return false;
                    }


                    if (
                        active ===
                        "inactive" &&
                        record.active
                    ) {

                        return false;
                    }


                    return true;
                }
            );
    }


    /* =====================================================
       TABLE EMPTY STATE
       ===================================================== */

    function renderEmptyState(
        message
    ) {

        const tableBody =
            getElement(
                "inventoryTableBody"
            );


        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="
                        padding:40px;
                        text-align:center;
                        color:#666666;
                    "
                >

                    ${escapeHtml(message)}

                </td>

            </tr>

        `;
    }


    /* =====================================================
       TABLE RENDER
       ===================================================== */

    function renderInventory() {

        const tableBody =
            getElement(
                "inventoryTableBody"
            );


        if (!tableBody) {
            return;
        }


        const records =
            getFilteredRecords();


        if (!records.length) {

            renderEmptyState(
                "No inventory records found."
            );

            return;
        }


        tableBody.innerHTML =
            records
                .map(
                    function (record) {

                        const statusLabel =
                            getStatusLabel(
                                record.status
                            );


                        const statusClass =
                            getStatusClass(
                                record.status
                            );


                        const modeLabel =
                            record.controlMode
                                ? record
                                    .controlMode
                                    .replace(
                                        /_/g,
                                        " "
                                    )
                                    .replace(
                                        /\b\w/g,
                                        function (
                                            letter
                                        ) {

                                            return letter
                                                .toUpperCase();
                                        }
                                    )
                                : "Automatic";


                        const updated =
                            record.updatedAt
                                ? escapeHtml(
                                    record.updatedAt
                                )
                                : "—";


                        return `

                            <tr
                                data-inventory-id="${escapeHtml(
                                    record.inventoryId
                                )}"
                            >

                                <td>
                                    ${escapeHtml(
                                        record.inventoryId
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        record.oemNumber
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        record.partName
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        record.brand
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        record.branchName
                                    )}
                                </td>

                                <td>
                                    ${record.availableQuantity}
                                </td>

                                <td>

                                    <span
                                        class="${escapeHtml(
                                            statusClass
                                        )}"
                                    >
                                        ${escapeHtml(
                                            statusLabel
                                        )}
                                    </span>

                                </td>

                                <td>
                                    ${escapeHtml(
                                        modeLabel
                                    )}
                                </td>

                                <td>
                                    ${updated}
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        class="btn btn-secondary"
                                        data-action="edit-inventory"
                                        data-inventory-id="${escapeHtml(
                                            record.inventoryId
                                        )}"
                                    >
                                        Edit
                                    </button>

                                </td>

                            </tr>

                        `;
                    }
                )
                .join("");
    }


    /* =====================================================
       LOAD DATA
       ===================================================== */

    async function loadInventoryData() {

        try {

            const [
                inventoryData,
                partsData,
                locationsData
            ] = await Promise.all([

                loadJson(
                    DATA_FILES.inventory
                ),

                loadJson(
                    DATA_FILES.parts
                ),

                loadJson(
                    DATA_FILES.locations
                )

            ]);


            inventoryRecords =
                toArray(
                    inventoryData,
                    [
                        "inventory",
                        "records",
                        "items",
                        "data"
                    ]
                );


            parts =
                toArray(
                    partsData,
                    [
                        "parts",
                        "items",
                        "data"
                    ]
                );


            locations =
                toArray(
                    locationsData,
                    [
                        "locations",
                        "branches",
                        "items",
                        "data"
                    ]
                );


            updateSummary();

            renderInventory();


            return inventoryRecords;

        } catch (error) {

            console.error(
                "Inventory loading failed:",
                error
            );


            inventoryRecords = [];

            parts = [];

            locations = [];


            updateSummary();


            renderEmptyState(
                "Unable to load inventory data."
            );


            return [];
        }
    }


    /* =====================================================
       EVENT HANDLERS
       ===================================================== */

    function handleFilters() {

        renderInventory();
    }


    function handleAddInventory() {

        /*
         * Add page/API is intentionally not guessed.
         * This event keeps the button ready for the next
         * verified Admin Inventory architecture.
         */

        window.dispatchEvent(
            new CustomEvent(
                "dahayan:inventory-add-request"
            )
        );


        console.info(
            "Add Inventory requested."
        );
    }


    function handleTableClick(event) {

        const button =
            event.target.closest(
                '[data-action="edit-inventory"]'
            );


        if (!button) {
            return;
        }


        const inventoryId =
            button.getAttribute(
                "data-inventory-id"
            );


        if (!inventoryId) {
            return;
        }


        window.dispatchEvent(
            new CustomEvent(
                "dahayan:inventory-edit-request",
                {
                    detail: {
                        inventoryId
                    }
                }
            )
        );


        console.info(
            "Edit Inventory requested:",
            inventoryId
        );
    }


    /* =====================================================
       EVENT BINDING
       ===================================================== */

    function bindEvents() {

        const search =
            getElement(
                "inventorySearch"
            );


        const brand =
            getElement(
                "brandFilter"
            );


        const status =
            getElement(
                "statusFilter"
            );


        const controlMode =
            getElement(
                "controlModeFilter"
            );


        const active =
            getElement(
                "activeFilter"
            );


        const tableBody =
            getElement(
                "inventoryTableBody"
            );


        const addButton =
            getElement(
                "addInventoryButton"
            );


        if (search) {

            search.addEventListener(
                "input",
                handleFilters
            );
        }


        if (brand) {

            brand.addEventListener(
                "change",
                handleFilters
            );
        }


        if (status) {

            status.addEventListener(
                "change",
                handleFilters
            );
        }


        if (controlMode) {

            controlMode.addEventListener(
                "change",
                handleFilters
            );
        }


        if (active) {

            active.addEventListener(
                "change",
                handleFilters
            );
        }


        if (tableBody) {

            tableBody.addEventListener(
                "click",
                handleTableClick
            );
        }


        if (addButton) {

            addButton.addEventListener(
                "click",
                handleAddInventory
            );
        }
    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    async function init() {

        if (
            !requireAuthentication()
        ) {

            return;
        }


        bindEvents();


        await loadInventoryData();
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.DahayanAdminInventory = {

        init,

        loadInventoryData,

        renderInventory,

        getFilteredRecords,

        getRecords:
            function () {
                return [
                    ...inventoryRecords
                ];
            },

        getParts:
            function () {
                return [
                    ...parts
                ];
            },

        getLocations:
            function () {
                return [
                    ...locations
                ];
            },

        getToken,

        getApiBaseUrl,

        authenticatedRequest

    };


    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();
