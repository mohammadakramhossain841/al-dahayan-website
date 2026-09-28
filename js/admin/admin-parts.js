/* =========================================
   AL-DAHAYAN ADMIN
   PARTS MANAGEMENT CONTROLLER
   ========================================= */

(function () {
    "use strict";


    /* =========================================
       STORAGE
       ========================================= */

    const TOKEN_KEY =
        "dahayan_admin_token";


    /* =========================================
       DOM
       ========================================= */

    const searchInput =
        document.getElementById("partSearch");

    const brandFilter =
        document.getElementById("brandFilter");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const tableBody =
        document.getElementById("partsTableBody");

    const addPartButton =
        document.getElementById("addPartButton");

    const currentYear =
        document.getElementById("currentYear");


    /* =========================================
       STATE
       ========================================= */

    let parts = [];


    /* =========================================
       AUTHENTICATION
       ========================================= */

    function getToken() {

        return sessionStorage.getItem(
            TOKEN_KEY
        );

    }


    function requireAuthentication() {

        const token =
            getToken();


        if (!token) {

            window.location.href =
                "login.html";

            return false;
        }


        return true;
    }


    /* =========================================
       HTML ESCAPE
       ========================================= */

    function escapeHTML(value) {

        const div =
            document.createElement("div");


        div.textContent =
            value == null
                ? ""
                : String(value);


        return div.innerHTML;
    }


    /* =========================================
       VEHICLE DISPLAY
       ========================================= */

    function getVehicleText(part) {

        if (
            Array.isArray(part.model)
            && part.model.length
        ) {

            return part.model.join(", ");

        }


        if (part.model) {

            return String(
                part.model
            );

        }


        if (
            Array.isArray(part.models)
            && part.models.length
        ) {

            return part.models.join(", ");

        }


        if (part.vehicle) {

            return String(
                part.vehicle
            );

        }


        return "—";
    }


    /* =========================================
       STATUS
       ========================================= */

    function getStatus(part) {

        return part.active === false
            ? "inactive"
            : "active";
    }


    /* =========================================
       FILTERING
       ========================================= */

    function getFilteredParts() {

        const query =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const brand =
            brandFilter
                ? brandFilter.value
                    .trim()
                    .toLowerCase()
                : "";


        const category =
            categoryFilter
                ? categoryFilter.value
                    .trim()
                    .toLowerCase()
                : "";


        const status =
            statusFilter
                ? statusFilter.value
                    .trim()
                    .toLowerCase()
                : "";


        return parts.filter(
            function (part) {

                const searchable = [

                    part.id,
                    part.partId,
                    part.oemNumber,
                    part.oem,
                    part.partNumber,
                    part.partName,
                    part.name,
                    part.description,
                    part.brand,
                    part.category,
                    getVehicleText(part)

                ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


                const matchesSearch =
                    !query
                    || searchable.includes(
                        query
                    );


                const matchesBrand =
                    !brand
                    || String(
                        part.brand || ""
                    ).toLowerCase()
                    === brand;


                const matchesCategory =
                    !category
                    || String(
                        part.category || ""
                    ).toLowerCase()
                    === category;


                const matchesStatus =
                    !status
                    || getStatus(part)
                    === status;


                return (
                    matchesSearch
                    && matchesBrand
                    && matchesCategory
                    && matchesStatus
                );

            }
        );

    }


    /* =========================================
       STATUS HTML
       ========================================= */

    function getStatusHTML(part) {

        const active =
            getStatus(part)
            === "active";


        if (active) {

            return `
                <span
                    style="
                        display:inline-block;
                        padding:5px 9px;
                        border-radius:20px;
                        background:#e9f7ef;
                        color:#16834a;
                        font-size:12px;
                        font-weight:700;
                    "
                >
                    Active
                </span>
            `;

        }


        return `
            <span
                style="
                    display:inline-block;
                    padding:5px 9px;
                    border-radius:20px;
                    background:#f1f1f1;
                    color:#666666;
                    font-size:12px;
                    font-weight:700;
                "
            >
                Inactive
            </span>
        `;

    }


    /* =========================================
       EMPTY TABLE
       ========================================= */

    function renderEmpty(message) {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="
                        padding:40px;
                        text-align:center;
                        color:#666666;
                    "
                >
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;

    }


    /* =========================================
       TABLE RENDER
       ========================================= */

    function renderParts() {

        if (!tableBody) {
            return;
        }


        const filtered =
            getFilteredParts();


        if (!filtered.length) {

            renderEmpty(
                "No parts found."
            );

            return;
        }


        tableBody.innerHTML =
            filtered.map(
                function (part) {

                    const partId =
                        part.id ||
                        part.partId ||
                        "—";


                    const oemNumber =
                        part.oemNumber ||
                        part.oem ||
                        part.partNumber ||
                        "—";


                    const partName =
                        part.partName ||
                        part.name ||
                        "—";


                    return `
                        <tr
                            style="
                                border-bottom:
                                1px solid #e4e4e4;
                            "
                        >

                            <td
                                style="padding:14px;"
                            >
                                ${escapeHTML(
                                    partId
                                )}
                            </td>

                            <td
                                style="
                                    padding:14px;
                                    font-weight:700;
                                "
                            >
                                ${escapeHTML(
                                    oemNumber
                                )}
                            </td>

                            <td
                                style="padding:14px;"
                            >
                                ${escapeHTML(
                                    partName
                                )}
                            </td>

                            <td
                                style="padding:14px;"
                            >
                                ${escapeHTML(
                                    part.brand ||
                                    "—"
                                )}
                            </td>

                            <td
                                style="padding:14px;"
                            >
                                ${escapeHTML(
                                    part.category ||
                                    "—"
                                )}
                            </td>

                            <td
                                style="padding:14px;"
                            >
                                ${escapeHTML(
                                    getVehicleText(
                                        part
                                    )
                                )}
                            </td>

                            <td
                                style="padding:14px;"
                            >
                                ${getStatusHTML(
                                    part
                                )}
                            </td>

                            <td
                                style="padding:14px;"
                            >

                                <button
                                    type="button"
                                    class="btn btn-secondary"
                                    data-edit-part="${escapeHTML(
                                        partId
                                    )}"
                                >
                                    Edit
                                </button>

                            </td>

                        </tr>
                    `;

                }
            ).join("");


        setupEditButtons();

    }


    /* =========================================
       EDIT BUTTONS
       ========================================= */

    function setupEditButtons() {

        document
            .querySelectorAll(
                "[data-edit-part]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const partId =
                                this.dataset
                                    .editPart;


                            handleEditPart(
                                partId
                            );

                        }
                    );

                }
            );

    }


    /* =========================================
       EDIT PART
       ========================================= */

    function handleEditPart(partId) {

        /*
         * The edit page will be connected
         * after the Admin Part Editor is created.
         */

        if (!partId) {
            return;
        }


        window.location.href =
            "part-edit.html?id="
            + encodeURIComponent(
                partId
            );

    }


    /* =========================================
       ADD PART
       ========================================= */

    function handleAddPart() {

        window.location.href =
            "part-add.html";

    }


    /* =========================================
       CATEGORY FILTER
       ========================================= */

    function populateCategories() {

        if (!categoryFilter) {
            return;
        }


        const currentValue =
            categoryFilter.value;


        const categories =
            new Set();


        parts.forEach(
            function (part) {

                if (part.category) {

                    categories.add(
                        String(
                            part.category
                        )
                    );

                }

            }
        );


        categoryFilter
            .querySelectorAll(
                "option:not(:first-child)"
            )
            .forEach(
                function (option) {

                    option.remove();

                }
            );


        Array
            .from(categories)
            .sort(
                function (a, b) {

                    return a.localeCompare(
                        b
                    );

                }
            )
            .forEach(
                function (category) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        category;


                    option.textContent =
                        category;


                    categoryFilter.appendChild(
                        option
                    );

                }
            );


        if (
            Array.from(
                categoryFilter.options
            ).some(
                function (option) {
                    return (
                        option.value
                        === currentValue
                    );
                }
            )
        ) {

            categoryFilter.value =
                currentValue;

        }

    }


    /* =========================================
       LOAD CURRENT CATALOG
       ========================================= */

    async function loadParts() {

        renderEmpty(
            "Loading parts..."
        );


        try {

            const response =
                await fetch(
                    "../data/oem-parts.json",
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to load OEM catalog."
                );

            }


            const data =
                await response.json();


            if (Array.isArray(data)) {

                parts = data;

            } else if (
                data
                && Array.isArray(
                    data.parts
                )
            ) {

                parts =
                    data.parts;

            } else {

                parts = [];

            }


            populateCategories();

            renderParts();

        } catch (error) {

            console.error(
                "Al-Dahayan Admin Parts:",
                error
            );


            renderEmpty(
                "Unable to load parts catalog."
            );

        }

    }


    /* =========================================
       EVENTS
       ========================================= */

    function setupEvents() {

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                renderParts
            );

        }


        if (brandFilter) {

            brandFilter.addEventListener(
                "change",
                renderParts
            );

        }


        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                renderParts
            );

        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                renderParts
            );

        }


        if (addPartButton) {

            addPartButton.addEventListener(
                "click",
                handleAddPart
            );

        }


        if (currentYear) {

            currentYear.textContent =
                new Date()
                    .getFullYear();

        }

    }


    /* =========================================
       PUBLIC API
       ========================================= */

    window.DahayanAdminParts = {

        loadParts:
            loadParts,

        renderParts:
            renderParts,

        getParts:
            function () {
                return parts;
            },

        getFilteredParts:
            getFilteredParts

    };


    /* =========================================
       INITIALIZE
       ========================================= */

    function initialize() {

        if (
            !requireAuthentication()
        ) {
            return;
        }


        setupEvents();

        loadParts();

    }


    if (
        document.readyState
        === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();
