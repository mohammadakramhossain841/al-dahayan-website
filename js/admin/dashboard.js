/* =========================================================
   AL-DAHAYAN ADMIN DASHBOARD CONTROLLER
   Unified Admin Panel
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEYS = {
        TOKEN: "dahayan_admin_token",
        ADMIN: "dahayan_admin_user"
    };

    const MODULE_ROUTES = {
        dashboard: "dashboard.html",
        parts: "parts.html",
        vehicles: "vehicles.html",
        vin: "vin-search.html",
        inventory: "inventory.html",
        images: "image-management.html",
        branches: "branches.html",
        inquiries: "inquiries.html",
        ai: "ai.html",
        social: "social.html",
        settings: "settings.html"
    };

    function getToken() {
        return (
            sessionStorage.getItem(STORAGE_KEYS.TOKEN) ||
            localStorage.getItem(STORAGE_KEYS.TOKEN) ||
            ""
        );
    }

    function getAdmin() {
        const raw =
            sessionStorage.getItem(STORAGE_KEYS.ADMIN) ||
            localStorage.getItem(STORAGE_KEYS.ADMIN);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.warn("Unable to parse admin session:", error);
            return null;
        }
    }

    function requireAuthentication() {
        const token = getToken();

        if (!token) {
            window.location.href = "login.html";
            return false;
        }

        return true;
    }

    function displayAdminInformation() {
        const admin = getAdmin();

        if (!admin) {
            return;
        }

        const name =
            admin.name ||
            admin.username ||
            admin.email ||
            "Administrator";

        const role =
            admin.role ||
            "admin";

        document
            .querySelectorAll("[data-admin-name]")
            .forEach(function (element) {
                element.textContent = name;
            });

        document
            .querySelectorAll("[data-admin-role]")
            .forEach(function (element) {
                element.textContent = role;
            });
    }

    function initializeStatistics() {
        const statisticIds = [
            "dashboard-total-parts",
            "dashboard-in-stock",
            "dashboard-low-stock",
            "dashboard-out-of-stock",
            "dashboard-new-inquiries"
        ];

        statisticIds.forEach(function (id) {
            const element = document.getElementById(id);

            if (element && !element.textContent.trim()) {
                element.textContent = "0";
            }
        });
    }

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

    async function authenticatedRequest(endpoint, options) {
        const token = getToken();

        if (!token) {
            window.location.href = "login.html";
            return null;
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

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            logout();
            return null;
        }

        return response;
    }

    async function loadDashboardData() {
        /*
         * Dashboard statistics will be connected to the
         * verified Admin APIs during module integration.
         *
         * Existing inventory authentication/API work is
         * already verified and must not be recreated here.
         */
        return null;
    }

    function logout() {
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN);

        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN);

        window.location.href = "login.html";
    }

    function setupNavigation() {
        document
            .querySelectorAll("[data-admin-nav]")
            .forEach(function (element) {
                element.addEventListener(
                    "click",
                    function (event) {
                        const module =
                            this.getAttribute("data-admin-nav");

                        if (
                            !module ||
                            !MODULE_ROUTES[module]
                        ) {
                            return;
                        }

                        event.preventDefault();

                        window.location.href =
                            MODULE_ROUTES[module];
                    }
                );
            });

        document
            .querySelectorAll("[data-admin-logout]")
            .forEach(function (element) {
                element.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();
                        logout();
                    }
                );
            });
    }

    function markCurrentNavigation() {
        const currentFile =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();

        document
            .querySelectorAll("[data-admin-nav]")
            .forEach(function (element) {
                const module =
                    element.getAttribute("data-admin-nav");

                const route =
                    MODULE_ROUTES[module];

                if (
                    route &&
                    route.toLowerCase() === currentFile
                ) {
                    element.classList.add("is-active");

                    element.setAttribute(
                        "aria-current",
                        "page"
                    );
                } else {
                    element.classList.remove("is-active");
                    element.removeAttribute("aria-current");
                }
            });
    }

    async function initializeDashboard() {
        if (!requireAuthentication()) {
            return;
        }

        displayAdminInformation();
        initializeStatistics();
        setupNavigation();
        markCurrentNavigation();

        try {
            await loadDashboardData();
        } catch (error) {
            console.error(
                "Admin Dashboard:",
                error
            );
        }
    }

    window.DahayanAdminDashboard = {
        getToken,
        getAdmin,
        requireAuthentication,
        getApiBaseUrl,
        authenticatedRequest,
        loadDashboardData,
        displayAdminInformation,
        initializeStatistics,
        setupNavigation,
        markCurrentNavigation,
        initializeDashboard,
        logout
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeDashboard
        );
    } else {
        initializeDashboard();
    }
})();
