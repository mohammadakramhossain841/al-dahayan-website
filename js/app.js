(function () {
    "use strict";

    const CONFIG = window.AlDahayanConfig || {};
    const UTILS = window.AlDahayanUtils || {};

    let appInitialized = false;
    let componentLoadCompleted = false;

    /**
     * ---------------------------------------------------------
     * Helpers
     * ---------------------------------------------------------
     */

    function $(selector, parent = document) {
        return parent.querySelector(selector);
    }

    function $all(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }

    function safeCall(callback, fallback = null) {
        try {
            if (typeof callback === "function") {
                return callback();
            }
        } catch (error) {
            console.warn("Al-Dahayan app operation failed:", error);
        }

        return fallback;
    }

    function dispatch(name, detail = {}) {
        document.dispatchEvent(
            new CustomEvent(name, {
                detail
            })
        );
    }

    /**
     * ---------------------------------------------------------
     * Configuration
     * ---------------------------------------------------------
     */

    function getConfig() {
        if (
            CONFIG &&
            typeof CONFIG.getEffectiveAppConfig === "function"
        ) {
            return CONFIG.getEffectiveAppConfig();
        }

        return CONFIG.config || {};
    }

    function isFeatureEnabled(featureName) {
        if (
            CONFIG &&
            typeof CONFIG.isFeatureEnabled === "function"
        ) {
            return CONFIG.isFeatureEnabled(featureName);
        }

        const config = getConfig();

        return (
            config.features &&
            config.features[featureName] === true
        );
    }

    function isAIEnabled() {
        if (
            CONFIG &&
            typeof CONFIG.isAIEnabled === "function"
        ) {
            return CONFIG.isAIEnabled();
        }

        const config = getConfig();

        return config.ai?.enabled === true;
    }

    function isInventoryEnabled() {
        if (
            CONFIG &&
            typeof CONFIG.isInventoryEnabled === "function"
        ) {
            return CONFIG.isInventoryEnabled();
        }

        const config = getConfig();

        return (
            config.inventory?.enabled === true &&
            config.features?.inventory === true
        );
    }

    function isInquiryEnabled() {
        if (
            CONFIG &&
            typeof CONFIG.isInquiryEnabled === "function"
        ) {
            return CONFIG.isInquiryEnabled();
        }

        const config = getConfig();

        return (
            config.inquiry?.enabled === true &&
            config.features?.inquiry === true
        );
    }

    /**
     * ---------------------------------------------------------
     * Feature Attribute Support
     *
     * Example:
     *
     * <div data-feature="vinSearch">
     * <div data-feature="inventory">
     * <div data-feature="aiAssistant">
     * ---------------------------------------------------------
     */

    function applyFeatureVisibility() {
        const featureElements = $all("[data-feature]");

        featureElements.forEach((element) => {
            const featureName =
                element.getAttribute("data-feature");

            if (!featureName) return;

            const enabled =
                isFeatureEnabled(featureName);

            element.hidden = !enabled;

            element.setAttribute(
                "aria-hidden",
                enabled ? "false" : "true"
            );
        });
    }

    /**
     * ---------------------------------------------------------
     * Navigation Feature Visibility
     *
     * Useful for:
     * OEM Search
     * Vehicle Search
     * VIN Search
     * Inventory
     * Inquiry
     * AI Assistant
     * ---------------------------------------------------------
     */

    function applyNavigationFeatureVisibility() {
        const featureMap = {
            oemSearch: [
                '[data-feature-link="oemSearch"]',
                'a[href*="parts"]'
            ],

            vehicleSearch: [
                '[data-feature-link="vehicleSearch"]',
                'a[href*="vehicles"]'
            ],

            vinSearch: [
                '[data-feature-link="vinSearch"]',
                'a[href*="vin"]'
            ],

            inventory: [
                '[data-feature-link="inventory"]',
                'a[href*="inventory"]'
            ],

            inquiry: [
                '[data-feature-link="inquiry"]',
                'a[href*="inquiry"]'
            ],

            aiAssistant: [
                '[data-feature-link="aiAssistant"]'
            ]
        };

        Object.keys(featureMap).forEach((featureName) => {
            const enabled =
                featureName === "aiAssistant"
                    ? isAIEnabled()
                    : isFeatureEnabled(featureName);

            featureMap[featureName].forEach((selector) => {
                $all(selector).forEach((element) => {
                    if (
                        element.hasAttribute("data-feature-link") ||
                        element.closest("[data-feature]")
                    ) {
                        element.hidden = !enabled;
                    }
                });
            });
        });
    }

    /**
     * ---------------------------------------------------------
     * Inventory Configuration
     * ---------------------------------------------------------
     */

    function applyInventorySettings() {
        const config = getConfig();
        const inventoryConfig =
            config.inventory || {};

        const threshold =
            Number(inventoryConfig.lowStockThreshold);

        const quantityDisplay =
            inventoryConfig.quantityDisplay === true;

        document.documentElement.dataset.inventoryEnabled =
            isInventoryEnabled() ? "true" : "false";

        document.documentElement.dataset.quantityDisplay =
            quantityDisplay ? "true" : "false";

        document.documentElement.dataset.lowStockThreshold =
            Number.isFinite(threshold) && threshold > 0
                ? String(threshold)
                : "5";

        dispatch(
            "alDahayanInventorySettingsApplied",
            {
                enabled: isInventoryEnabled(),
                lowStockThreshold:
                    Number.isFinite(threshold) && threshold > 0
                        ? threshold
                        : 5,
                quantityDisplay
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * Inquiry Configuration
     * ---------------------------------------------------------
     */

    function applyInquirySettings() {
        const config = getConfig();
        const inquiryConfig =
            config.inquiry || {};

        const enabled =
            isInquiryEnabled();

        document.documentElement.dataset.inquiryEnabled =
            enabled ? "true" : "false";

        document.documentElement.dataset.customerLocationCollection =
            inquiryConfig.collectCustomerLocation === true
                ? "true"
                : "false";

        $all("[data-inquiry-form]").forEach((form) => {
            form.hidden = !enabled;

            form.setAttribute(
                "aria-hidden",
                enabled ? "false" : "true"
            );
        });

        dispatch(
            "alDahayanInquirySettingsApplied",
            {
                enabled,
                customerLocationCollection:
                    inquiryConfig.collectCustomerLocation === true
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * AI Configuration
     * ---------------------------------------------------------
     */

    function applyAISettings() {
        const config = getConfig();
        const aiConfig =
            config.ai || {};

        const enabled =
            isAIEnabled();

        document.documentElement.dataset.aiEnabled =
            enabled ? "true" : "false";

        document.documentElement.dataset.aiSalesMode =
            aiConfig.salesMode === true
                ? "true"
                : "false";

        document.documentElement.dataset.aiInventoryVerification =
            aiConfig.inventoryVerificationRequired !== false
                ? "true"
                : "false";

        document.documentElement.dataset.aiWhatsAppConnection =
            aiConfig.whatsappConnection !== false
                ? "true"
                : "false";

        document.documentElement.dataset.aiCustomerLocation =
            aiConfig.customerLocationCollection === true
                ? "true"
                : "false";

        document.documentElement.dataset.aiBranchRecommendation =
            aiConfig.proactiveBranchRecommendation === true
                ? "true"
                : "false";

        $all("[data-ai-assistant]").forEach((element) => {
            element.hidden = !enabled;

            element.setAttribute(
                "aria-hidden",
                enabled ? "false" : "true"
            );
        });

        dispatch(
            "alDahayanAISettingsApplied",
            {
                enabled,
                salesMode:
                    aiConfig.salesMode === true,
                inventoryVerification:
                    aiConfig.inventoryVerificationRequired !== false,
                whatsappConnection:
                    aiConfig.whatsappConnection !== false,
                customerLocationCollection:
                    aiConfig.customerLocationCollection === true,
                proactiveBranchRecommendation:
                    aiConfig.proactiveBranchRecommendation === true
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * Payment Configuration
     *
     * Payment remains OFF.
     * ---------------------------------------------------------
     */

    function applyPaymentSettings() {
        const config = getConfig();
        const payment =
            config.payment || {};

        const enabled =
            payment.enabled === true &&
            payment.onlinePayment === true;

        document.documentElement.dataset.paymentEnabled =
            enabled ? "true" : "false";

        document.documentElement.dataset.paymentCurrency =
            payment.currency || "SAR";

        $all("[data-payment-feature]").forEach((element) => {
            element.hidden = !enabled;
        });

        dispatch(
            "alDahayanPaymentSettingsApplied",
            {
                enabled,
                currency:
                    payment.currency || "SAR"
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * Language / Direction
     * ---------------------------------------------------------
     */

    function applyInitialLanguage() {
        const config = getConfig();
        const defaultLanguage =
            config.site?.defaultLanguage || "en";

        const supportedLanguages =
            Array.isArray(config.site?.supportedLanguages)
                ? config.site.supportedLanguages
                : ["en", "ar"];

        let language = defaultLanguage;

        try {
            const stored =
                localStorage.getItem(
                    "alDahayanLanguage"
                );

            if (
                stored &&
                supportedLanguages.includes(stored)
            ) {
                language = stored;
            }
        } catch (error) {
            console.warn(
                "Unable to read saved language:",
                error
            );
        }

        document.documentElement.lang =
            language;

        const direction =
            config.site?.direction?.[language] ||
            (language === "ar" ? "rtl" : "ltr");

        document.documentElement.dir =
            direction;

        dispatch(
            "alDahayanInitialLanguageApplied",
            {
                language,
                direction
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * Body / Website State
     * ---------------------------------------------------------
     */

    function applyWebsiteState() {
        const config = getConfig();

        document.body.dataset.environment =
            config.environment?.mode ||
            "development";

        document.body.dataset.production =
            config.environment?.production
                ? "true"
                : "false";

        document.body.dataset.company =
            config.company?.name ||
            "Al-Dahayan Trading Company";

        document.body.dataset.country =
            config.company?.country ||
            "Saudi Arabia";
    }

    /**
     * ---------------------------------------------------------
     * Public Website Feature Status
     * ---------------------------------------------------------
     */

    function getFeatureStatus() {
        return {
            oemSearch:
                isFeatureEnabled("oemSearch"),

            vehicleSearch:
                isFeatureEnabled("vehicleSearch"),

            vinSearch:
                isFeatureEnabled("vinSearch"),

            inventory:
                isInventoryEnabled(),

            inquiry:
                isInquiryEnabled(),

            aiAssistant:
                isAIEnabled(),

            bilingual:
                isFeatureEnabled("bilingual")
        };
    }

    /**
     * ---------------------------------------------------------
     * Apply All Admin-Controlled Settings
     * ---------------------------------------------------------
     */

    function applyAdminControlledSettings() {
        applyWebsiteState();
        applyInitialLanguage();

        applyFeatureVisibility();
        applyNavigationFeatureVisibility();

        applyInventorySettings();
        applyInquirySettings();
        applyAISettings();
        applyPaymentSettings();

        dispatch(
            "alDahayanAdminSettingsApplied",
            {
                config: getConfig(),
                features:
                    getFeatureStatus()
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * Component Loader Integration
     * ---------------------------------------------------------
     */

    function detectComponentLoader() {
        if (
            window.AlDahayanComponentLoader &&
            typeof window.AlDahayanComponentLoader === "object"
        ) {
            componentLoadCompleted = true;
            return true;
        }

        return false;
    }

    function waitForComponents() {
        return new Promise((resolve) => {
            if (detectComponentLoader()) {
                resolve();
                return;
            }

            let resolved = false;

            const finish = () => {
                if (resolved) return;

                resolved = true;
                componentLoadCompleted = true;

                resolve();
            };

            document.addEventListener(
                "alDahayanComponentsReady",
                finish,
                { once: true }
            );

            setTimeout(finish, 1500);
        });
    }

    /**
     * ---------------------------------------------------------
     * Initialize Existing Modules
     * ---------------------------------------------------------
     */

    function initializeModule(
        objectName,
        methodName = "init"
    ) {
        const module =
            window[objectName];

        if (
            !module ||
            typeof module[methodName] !== "function"
        ) {
            return false;
        }

        safeCall(() => {
            module[methodName]();
        });

        return true;
    }

    function initializeModules() {
        /*
         * Language and navigation are initialized
         * only if their modules exist.
         */

        initializeModule(
            "AlDahayanLanguage"
        );

        initializeModule(
            "AlDahayanNavigation"
        );

        /*
         * Contact is responsible for:
         * company information
         * phone
         * WhatsApp
         * email
         * social channels
         */

        initializeModule(
            "AlDahayanContact"
        );

        /*
         * Search modules
         */

        if (isFeatureEnabled("oemSearch")) {
            initializeModule(
                "AlDahayanSearch"
            );

            initializeModule(
                "AlDahayanPartsSearch"
            );
        }

        if (isFeatureEnabled("vehicleSearch")) {
            initializeModule(
                "AlDahayanVehicleSearch"
            );
        }

        if (isFeatureEnabled("vinSearch")) {
            initializeModule(
                "AlDahayanVINSearch"
            );
        }

        /*
         * Inventory should initialize only
         * when Admin has enabled it.
         */

        if (isInventoryEnabled()) {
            initializeModule(
                "AlDahayanInventory"
            );
        }

        /*
         * Inquiry should initialize only
         * when Admin has enabled it.
         */

        if (isInquiryEnabled()) {
            initializeModule(
                "AlDahayanInquiry"
            );
        }

        /*
         * AI module may be added later.
         * The app layer already exposes its state.
         */

        if (isAIEnabled()) {
            initializeModule(
                "AlDahayanAI"
            );
        }
    }

    /**
     * ---------------------------------------------------------
     * Page Ready Event
     * ---------------------------------------------------------
     */

    function dispatchPageReady() {
        dispatch(
            "alDahayanPageReady",
            {
                config: getConfig(),
                features:
                    getFeatureStatus(),
                componentsReady:
                    componentLoadCompleted
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * Application Initialization
     * ---------------------------------------------------------
     */

    async function init() {
        if (appInitialized) {
            return;
        }

        appInitialized = true;

        /*
         * Apply Admin settings BEFORE initializing
         * feature-dependent modules.
         */

        applyAdminControlledSettings();

        /*
         * Wait briefly for dynamically loaded components.
         */

        await waitForComponents();

        /*
         * Re-apply visibility after components load.
         */

        applyAdminControlledSettings();

        /*
         * Initialize existing public modules.
         */

        initializeModules();

        /*
         * Re-apply contact settings after Contact module.
         */

        if (
            window.AlDahayanContact &&
            typeof window.AlDahayanContact.refresh === "function"
        ) {
            safeCall(() => {
                window.AlDahayanContact.refresh();
            });
        }

        dispatchPageReady();
    }

    /**
     * ---------------------------------------------------------
     * Refresh
     * ---------------------------------------------------------
     */

    function refresh() {
        applyAdminControlledSettings();

        if (
            window.AlDahayanContact &&
            typeof window.AlDahayanContact.refresh === "function"
        ) {
            safeCall(() => {
                window.AlDahayanContact.refresh();
            });
        }

        dispatch(
            "alDahayanAppRefreshed",
            {
                config: getConfig(),
                features:
                    getFeatureStatus()
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * Public API
     * ---------------------------------------------------------
     */

    window.AlDahayanApp = {
        init,
        refresh,

        getConfig,
        getFeatureStatus,

        isFeatureEnabled,
        isAIEnabled,
        isInventoryEnabled,
        isInquiryEnabled,

        get componentLoadCompleted() {
            return componentLoadCompleted;
        },

        get initialized() {
            return appInitialized;
        }
    };

    /**
     * ---------------------------------------------------------
     * Auto Start
     * ---------------------------------------------------------
     */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
