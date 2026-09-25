/**
 * Al-Dahayan Trading Company
 * Global Application Configuration
 *
 * Central configuration for:
 * - Public website
 * - Admin Panel
 * - OEM / Parts
 * - Vehicle
 * - VIN
 * - Inventory
 * - Inquiry
 * - AI Assistant
 * - Contact
 * - Future Payment
 */

const APP_CONFIG = {

    /* =========================
       COMPANY
    ========================== */

    company: {
        name: "Al-Dahayan Trading Company",
        arabicName: "شركة الضحيان التجارية",
        country: "Saudi Arabia"
    },


    /* =========================
       SITE
    ========================== */

    site: {

        name: "Al-Dahayan Trading Company",

        defaultLanguage: "en",

        supportedLanguages: [
            "en",
            "ar"
        ],

        direction: {
            en: "ltr",
            ar: "rtl"
        }

    },


    /* =========================
       PATHS
    ========================== */

    paths: {

        root: "../",

        data: "../data/",

        pages: "./",

        components: "../components/",

        api: "../api/",

        css: "../css/",

        js: "../js/"

    },


    /* =========================
       DATA FILES
    ========================== */

    dataFiles: {

        company: "company.json",

        vehicles: "vehicles.json",

        models: "models.json",

        oemParts: "oem-parts.json",

        partCategories: "part-categories.json",

        compatibility: "compatibility.json",

        locations: "locations.json",

        inventory: "inventory.json",

        partPrices: "part-prices.json",

        inquiries: "inquiries.json",

        services: "services.json"

    },


    /* =========================
       CONTACT
    ========================== */

    contact: {

        country: "Saudi Arabia",

        phone: "",

        whatsapp: "",

        email: "",

        preferredContact: "whatsapp"

    },


    /* =========================
       FEATURES
    ========================== */

    features: {

        oemSearch: true,

        vehicleSearch: true,

        vinSearch: true,

        inventory: true,

        inquiry: true,

        bilingual: true,

        aiAssistant: true

    },


    /* =========================
       INVENTORY
    ========================== */

    inventory: {

        enabled: true,

        lowStockThreshold: 5,

        quantityDisplay: false,

        allowManualOverride: true,

        allowOnRequest: true,

        requireVerifiedStock: true,

        defaultStatus: "unknown"

    },


    /* =========================
       AI ASSISTANT
    ========================== */

    ai: {

        enabled: true,

        salesMode: true,

        inventoryVerificationRequired: true,

        whatsappConnection: true,

        languages: [
            "en",
            "ar"
        ],

        customerLocationCollection: false,

        proactiveBranchRecommendation: false,

        allowUnverifiedStock: false,

        allowUnverifiedPrice: false,

        allowUnverifiedCompanyFacts: false,

        handoverToHuman: true

    },


    /* =========================
       CUSTOMER INQUIRY
    ========================== */

    inquiry: {

        enabled: true,

        collectCustomerName: true,

        collectContact: true,

        collectPart: true,

        collectOEM: true,

        collectVehicle: true,

        collectModelYear: true,

        collectQuantity: true,

        collectMessage: true,

        collectCustomerLocation: false,

        defaultStatus: "new",

        defaultCommunicationStatus:
            "not_contacted"

    },


    /* =========================
       BRANCHES / LOCATIONS
    ========================== */

    locations: {

        enabled: true,

        adminManaged: true,

        customerLocationCollection: false,

        aiProactiveRecommendation: false

    },


    /* =========================
       SOCIAL / ONLINE CHANNELS
    ========================== */

    social: {

        adminManaged: true,

        platforms: [

            "Facebook",

            "YouTube",

            "TikTok",

            "X",

            "Instagram",

            "LinkedIn",

            "WhatsApp",

            "Google Maps",

            "Website",

            "Other"

        ]

    },


    /* =========================
       PAYMENT
    ========================== */

    payment: {

        enabled: false,

        onlinePayment: false,

        orderPayment: false,

        gatewayConnected: false,

        gateway: "",

        currency: "SAR"

    },


    /* =========================
       ADMIN PANEL
    ========================== */

    admin: {

        enabled: true,

        dashboard: true,

        inventory: true,

        parts: true,

        inquiries: true,

        branches: true,

        vehicles: true,

        ai: true,

        social: true,

        settings: true

    },


    /* =========================
       API
    ========================== */

    api: {

        version: "v1",

        publicBasePath: "/api/v1",

        adminBasePath: "/api/v1/admin",

        enabled: false,

        backendConnected: false

    },


    /* =========================
       ENVIRONMENT
    ========================== */

    environment: {

        mode: "development",

        production: false

    }

};


/* =========================================================
   PATH HELPERS
========================================================= */

function getAppPath(type, file = "") {

    const base =
        APP_CONFIG.paths[type] || "";

    return `${base}${file}`;

}


function getDataPath(file) {

    return getAppPath(
        "data",
        file
    );

}


function getComponentPath(file) {

    return getAppPath(
        "components",
        file
    );

}


function getPagePath(file) {

    return getAppPath(
        "pages",
        file
    );

}


function getApiPath(path = "") {

    const base =
        APP_CONFIG.api.publicBasePath;

    return `${base}${path}`;

}


function getAdminApiPath(path = "") {

    const base =
        APP_CONFIG.api.adminBasePath;

    return `${base}${path}`;

}


/* =========================================================
   ADMIN SETTINGS STORAGE
========================================================= */

const ADMIN_SETTINGS_STORAGE_KEY =
    "alDahayanWebsiteSettings";


const ADMIN_AI_STORAGE_KEY =
    "alDahayanAISettings";


const ADMIN_SOCIAL_STORAGE_KEY =
    "alDahayanSocialChannels";


/* =========================================================
   SAFE JSON STORAGE
========================================================= */

function readLocalSettings(
    storageKey,
    fallback = null
) {

    try {

        const raw =
            localStorage.getItem(
                storageKey
            );

        if (!raw) {
            return fallback;
        }

        return JSON.parse(raw);

    } catch (error) {

        console.warn(
            "Unable to read local settings:",
            storageKey,
            error
        );

        return fallback;

    }

}


/* =========================================================
   ADMIN WEBSITE SETTINGS
========================================================= */

function getAdminWebsiteSettings() {

    return readLocalSettings(
        ADMIN_SETTINGS_STORAGE_KEY,
        null
    );

}


/* =========================================================
   ADMIN AI SETTINGS
========================================================= */

function getAdminAISettings() {

    return readLocalSettings(
        ADMIN_AI_STORAGE_KEY,
        null
    );

}


/* =========================================================
   ADMIN SOCIAL CHANNELS
========================================================= */

function getAdminSocialChannels() {

    return readLocalSettings(
        ADMIN_SOCIAL_STORAGE_KEY,
        []
    );

}


/* =========================================================
   EFFECTIVE WEBSITE SETTINGS
========================================================= */

function getEffectiveAppConfig() {

    const settings =
        getAdminWebsiteSettings();

    const aiSettings =
        getAdminAISettings();


    const config =
        JSON.parse(
            JSON.stringify(
                APP_CONFIG
            )
        );


    /* -------------------------
       Company
    -------------------------- */

    if (settings?.company) {

        config.company.name =
            settings.company.name ||
            config.company.name;

        config.company.arabicName =
            settings.company.arabicName ||
            config.company.arabicName;

        config.company.country =
            settings.company.country ||
            config.company.country;

    }


    /* -------------------------
       Contact
    -------------------------- */

    if (settings?.contact) {

        config.contact.phone =
            settings.contact.phone || "";

        config.contact.whatsapp =
            settings.contact.whatsapp || "";

        config.contact.email =
            settings.contact.email || "";

        config.contact.preferredContact =
            settings.contact.preferredContact ||
            "whatsapp";

    }


    /* -------------------------
       Website Features
    -------------------------- */

    if (settings?.features) {

        config.features.oemSearch =
            settings.features.oemSearch !== false;

        config.features.vehicleSearch =
            settings.features.vehicleSearch !== false;

        config.features.vinSearch =
            settings.features.vinSearch !== false;

        config.features.inventory =
            settings.features.inventory !== false;

        config.features.inquiry =
            settings.features.inquiry !== false;

        config.features.aiAssistant =
            settings.features.aiAssistant !== false;

    }


    /* -------------------------
       Inventory
    -------------------------- */

    if (settings?.inventoryDisplay) {

        config.inventory.lowStockThreshold =
            Number(
                settings.inventoryDisplay.lowStockThreshold
            ) || 5;

        config.inventory.quantityDisplay =
            settings.inventoryDisplay.quantityDisplay ===
            "show";

    }


    /* -------------------------
       AI
    -------------------------- */

    if (aiSettings) {

        config.ai.enabled =
            aiSettings.aiEnabled !== false;

        config.ai.salesMode =
            aiSettings.salesMode !== false;

        config.ai.inventoryVerificationRequired =
            aiSettings.inventoryVerification !== false;

        config.ai.whatsappConnection =
            aiSettings.whatsappConnection !== false;

    }


    return config;

}


/* =========================================================
   FEATURE CHECK
========================================================= */

function isFeatureEnabled(
    featureName
) {

    const config =
        getEffectiveAppConfig();

    return (
        config.features &&
        config.features[featureName] === true
    );

}


/* =========================================================
   AI CHECK
========================================================= */

function isAIEnabled() {

    const config =
        getEffectiveAppConfig();

    return (
        config.ai.enabled === true
    );

}


/* =========================================================
   INVENTORY CHECK
========================================================= */

function isInventoryEnabled() {

    const config =
        getEffectiveAppConfig();

    return (
        config.inventory.enabled === true &&
        config.features.inventory === true
    );

}


/* =========================================================
   INQUIRY CHECK
========================================================= */

function isInquiryEnabled() {

    const config =
        getEffectiveAppConfig();

    return (
        config.inquiry.enabled === true &&
        config.features.inquiry === true
    );

}


/* =========================================================
   PUBLIC API
========================================================= */

window.AlDahayanConfig = {

    config: APP_CONFIG,

    getDataPath,

    getComponentPath,

    getPagePath,

    getApiPath,

    getAdminApiPath,

    getAdminWebsiteSettings,

    getAdminAISettings,

    getAdminSocialChannels,

    getEffectiveAppConfig,

    isFeatureEnabled,

    isAIEnabled,

    isInventoryEnabled,

    isInquiryEnabled

};


/* =========================================================
   COMMONJS / MODULE SUPPORT
========================================================= */

if (
    typeof module !== "undefined" &&
    module.exports
) {

    module.exports =
        APP_CONFIG;

}
