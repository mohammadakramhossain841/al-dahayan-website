/* =========================================
   AL-DAHAYAN CENTRAL APPLICATION CONFIG
========================================= */

(function () {
  "use strict";

  /* =========================================
     APP CONFIGURATION
  ========================================= */

  const APP_CONFIG = {
    company: {
      name: "Al-Dahayan Trading Company",
      arabicName: "شركة الضحيان التجارية",
      country: "Saudi Arabia"
    },

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

    /*
     * Project paths are resolved dynamically
     * from the current HTML document.
     */
    paths: {
      root: "../",
      data: "../data/",
      pages: "../pages/",
      components: "../components/",
      api: "../api/",
      css: "../css/",
      js: "../js/"
    },

    /* =========================================
       DATA FILES
    ========================================= */

    dataFiles: {
      company: "company.json",

      vehicles: "vehicles.json",

      models: "models.json",

      oemParts: "oem-parts.json",

      partCategories:
        "part-categories.json",

      compatibility:
        "compatibility.json",

      locations:
        "locations.json",

      inventory:
        "inventory.json",

      partPrices:
        "part-prices.json",

      inquiries:
        "inquiries.json",

      services:
        "services.json"
    },

    /* =========================================
       CONTACT
    ========================================= */

    contact: {
      country: "Saudi Arabia",

      phone: "",

      whatsapp: "",

      email: "",

      preferredContact:
        "whatsapp"
    },

    /* =========================================
       FEATURES
    ========================================= */

    features: {
      oemSearch: true,

      vehicleSearch: true,

      vinSearch: true,

      inventory: true,

      inquiry: true,

      bilingual: true,

      aiAssistant: true,

      branches: true,

      socialChannels: true,

      adminPanel: true
    },

    /* =========================================
       INVENTORY
    ========================================= */

    inventory: {
      enabled: true,

      /*
       * Automatic stock calculation:
       * 0      = OUT OF STOCK
       * 1–5    = LOW STOCK
       * 6+     = IN STOCK
       */
      lowStockThreshold: 5,

      /*
       * Customer exact quantity is hidden
       * unless Admin enables it.
       */
      quantityDisplay: false,

      /*
       * Admin can manually override
       * automatic stock status.
       */
      allowManualOverride: true,

      /*
       * Admin may mark a part as
       * ON REQUEST.
       */
      allowOnRequest: true,

      /*
       * Customer/AI must only use
       * explicitly verified inventory.
       */
      requireVerifiedStock: true,

      defaultStatus: "unknown",

      /*
       * Inventory records use Branch ID
       * instead of duplicating branch data.
       */
      useBranchReference: true,

      allowInactiveRecords: true,

      changeHistory: true
    },

    /* =========================================
       AI ASSISTANT
    ========================================= */

    ai: {
      enabled: true,

      salesMode: true,

      inventoryVerificationRequired:
        true,

      whatsappConnection:
        true,

      languages: [
        "en",
        "ar"
      ],

      /*
       * Customer location must not
       * be collected by AI.
       */
      customerLocationCollection:
        false,

      /*
       * AI must not proactively
       * recommend/request branches.
       */
      proactiveBranchRecommendation:
        false,

      allowUnverifiedStock:
        false,

      allowUnverifiedPrice:
        false,

      allowUnverifiedCompanyFacts:
        false,

      handoverToHuman:
        true
    },

    /* =========================================
       CUSTOMER INQUIRY / LEAD MANAGEMENT
    ========================================= */

    inquiry: {
      enabled: true,

      collectCustomerName:
        true,

      collectContact:
        true,

      collectPart:
        true,

      collectOEM:
        true,

      collectVehicle:
        true,

      collectModelYear:
        true,

      collectQuantity:
        true,

      collectMessage:
        true,

      /*
       * Customer location is intentionally
       * excluded.
       */
      collectCustomerLocation:
        false,

      defaultStatus:
        "new",

      defaultCommunicationStatus:
        "not_contacted",

      defaultPriority:
        "normal",

      allowStaffAssignment:
        true,

      allowFollowUp:
        true,

      allowQuotationStatus:
        true
    },

    /* =========================================
       BRANCHES / LOCATIONS
    ========================================= */

    locations: {
      enabled: true,

      adminManaged: true,

      customerLocationCollection:
        false,

      aiProactiveRecommendation:
        false,

      allowDeactivate:
        true,

      allowMultipleBranches:
        true
    },

    /* =========================================
       SOCIAL CHANNELS
    ========================================= */

    social: {
      enabled: true,

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

    /* =========================================
       PAYMENT
       CURRENTLY DISABLED
    ========================================= */

    payment: {
      enabled: false,

      onlinePayment: false,

      orderPayment: false,

      gatewayConnected: false,

      gateway: "",

      currency: "SAR"
    },

    /* =========================================
       ADMIN PANEL
    ========================================= */

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

      settings: true,

      payment: true,

      audit: true
    },

    /* =========================================
       API / BACKEND
    ========================================= */

    api: {
      version: "v1",

      publicBasePath:
        "/api/v1",

      adminBasePath:
        "/api/v1/admin",

      enabled: false,

      backendConnected: false,

      useLocalJSON:
        true,

      timeout: 10000
    },

    /* =========================================
       SECURITY
    ========================================= */

    security: {
      requireVerifiedInventory:
        true,

      allowCustomerLocation:
        false,

      allowAIUnverifiedClaims:
        false,

      allowClientSideAdminWrites:
        false,

      sanitizeCustomerOutput:
        true
    },

    /* =========================================
       ENVIRONMENT
    ========================================= */

    environment: {
      mode: "development",

      production: false,

      debug: true
    }
  };


  /* =========================================
     PROJECT ROOT
  ========================================= */

  function getProjectRoot() {
    const pathname =
      window.location.pathname || "";

    /*
     * GitHub Pages / repository paths
     * and local paths are handled without
     * hard-coding a repository name.
     */

    if (
      pathname.includes("/pages/") ||
      pathname.includes("/admin/")
    ) {
      return "../";
    }

    return "./";
  }


  /* =========================================
     PROJECT PATH
  ========================================= */

  function getProjectPath(type) {
    const root =
      getProjectRoot();

    const paths = {
      root: root,

      data:
        root + "data/",

      pages:
        root + "pages/",

      components:
        root + "components/",

      api:
        root + "api/",

      css:
        root + "css/",

      js:
        root + "js/"
    };

    return (
      paths[type] || root
    );
  }


  /* =========================================
     DATA PATH
  ========================================= */

  function getDataPath(
    fileName
  ) {
    if (!fileName) {
      return getProjectPath(
        "data"
      );
    }

    return (
      getProjectPath("data") +
      String(fileName).replace(
        /^\/+/,
        ""
      )
    );
  }


  /* =========================================
     PAGE PATH
  ========================================= */

  function getPagePath(
    fileName
  ) {
    if (!fileName) {
      return getProjectPath(
        "pages"
      );
    }

    return (
      getProjectPath("pages") +
      String(fileName).replace(
        /^\/+/,
        ""
      )
    );
  }


  /* =========================================
     COMPONENT PATH
  ========================================= */

  function getComponentPath(
    fileName
  ) {
    if (!fileName) {
      return getProjectPath(
        "components"
      );
    }

    return (
      getProjectPath(
        "components"
      ) +
      String(fileName).replace(
        /^\/+/,
        ""
      )
    );
  }


  /* =========================================
     API PATH
  ========================================= */

  function getApiPath(
    path = ""
  ) {
    return (
      getProjectPath("api") +
      String(path).replace(
        /^\/+/,
        ""
      )
    );
  }


  /* =========================================
     FEATURE CHECK
  ========================================= */

  function isFeatureEnabled(
    feature
  ) {
    if (!feature) {
      return false;
    }

    return (
      APP_CONFIG.features?.[
        feature
      ] === true
    );
  }


  /* =========================================
     ADMIN FEATURE CHECK
  ========================================= */

  function isAdminFeatureEnabled(
    feature
  ) {
    if (
      !APP_CONFIG.admin.enabled
    ) {
      return false;
    }

    return (
      APP_CONFIG.admin?.[
        feature
      ] === true
    );
  }


  /* =========================================
     INVENTORY STATUS
  ========================================= */

  function calculateStockStatus(
    quantity,
    threshold =
      APP_CONFIG.inventory
        .lowStockThreshold
  ) {
    const qty =
      Number(quantity);

    const lowThreshold =
      Number(threshold);

    if (
      !Number.isFinite(qty)
    ) {
      return "unknown";
    }

    if (qty <= 0) {
      return "out_of_stock";
    }

    if (
      qty <=
      (
        Number.isFinite(
          lowThreshold
        )
          ? lowThreshold
          : 5
      )
    ) {
      return "low_stock";
    }

    return "in_stock";
  }


  /* =========================================
     STOCK CONFIG
  ========================================= */

  function getInventorySettings() {
    return {
      ...APP_CONFIG.inventory
    };
  }


  /* =========================================
     AI SETTINGS
  ========================================= */

  function getAISettings() {
    return {
      ...APP_CONFIG.ai
    };
  }


  /* =========================================
     INQUIRY SETTINGS
  ========================================= */

  function getInquirySettings() {
    return {
      ...APP_CONFIG.inquiry
    };
  }


  /* =========================================
     PAYMENT SETTINGS
  ========================================= */

  function getPaymentSettings() {
    return {
      ...APP_CONFIG.payment
    };
  }


  /* =========================================
     EFFECTIVE APPLICATION CONFIG
     Admin local settings override defaults
     where supported.
  ========================================= */

  function getEffectiveAppConfig() {
    const base =
      APP_CONFIG;

    let websiteSettings =
      {};

    let aiSettings =
      {};

    let socialChannels =
      null;

    try {
      const storedWebsite =
        localStorage.getItem(
          "alDahayanWebsiteSettings"
        );

      if (storedWebsite) {
        websiteSettings =
          JSON.parse(
            storedWebsite
          ) || {};
      }
    } catch (error) {
      websiteSettings =
        {};
    }

    try {
      const storedAI =
        localStorage.getItem(
          "alDahayanAISettings"
        );

      if (storedAI) {
        aiSettings =
          JSON.parse(
            storedAI
          ) || {};
      }
    } catch (error) {
      aiSettings =
        {};
    }

    try {
      const storedSocial =
        localStorage.getItem(
          "alDahayanSocialChannels"
        );

      if (storedSocial) {
        socialChannels =
          JSON.parse(
            storedSocial
          );
      }
    } catch (error) {
      socialChannels =
        null;
    }

    return {
      ...base,

      company: {
        ...base.company,
        ...(websiteSettings
          .company || {})
      },

      contact: {
        ...base.contact,
        ...(websiteSettings
          .contact || {})
      },

      site: {
        ...base.site,
        ...(websiteSettings
          .site || {})
      },

      features: {
        ...base.features,
        ...(websiteSettings
          .features || {})
      },

      inventory: {
        ...base.inventory,
        ...(websiteSettings
          .inventory || {})
      },

      ai: {
        ...base.ai,
        ...aiSettings
      },

      inquiry: {
        ...base.inquiry,
        ...(websiteSettings
          .inquiry || {})
      },

      locations: {
        ...base.locations,
        ...(websiteSettings
          .locations || {})
      },

      social: {
        ...base.social,

        ...(Array.isArray(
          socialChannels
        )
          ? {
              channels:
                socialChannels
            }
          : {})
      },

      payment: {
        ...base.payment,
        ...(websiteSettings
          .payment || {})
      },

      admin: {
        ...base.admin,
        ...(websiteSettings
          .admin || {})
      }
    };
  }


  /* =========================================
     CONFIG UPDATE EVENT
  ========================================= */

  function emitConfigUpdated() {
    document.dispatchEvent(
      new CustomEvent(
        "alDahayanConfigUpdated",
        {
          detail:
            getEffectiveAppConfig()
        }
      )
    );
  }


  /* =========================================
     STORAGE CHANGE
  ========================================= */

  window.addEventListener(
    "storage",
    (event) => {
      const supportedKeys = [
        "alDahayanWebsiteSettings",
        "alDahayanAISettings",
        "alDahayanSocialChannels"
      ];

      if (
        supportedKeys.includes(
          event.key
        )
      ) {
        emitConfigUpdated();
      }
    }
  );


  /* =========================================
     PUBLIC GLOBALS
  ========================================= */

  window.APP_CONFIG =
    APP_CONFIG;

  window.getProjectRoot =
    getProjectRoot;

  window.getProjectPath =
    getProjectPath;

  window.getDataPath =
    getDataPath;

  window.getPagePath =
    getPagePath;

  window.getComponentPath =
    getComponentPath;

  window.getApiPath =
    getApiPath;


  /* =========================================
     CENTRAL CONFIG API
  ========================================= */

  window.AlDahayanConfig = {

    getConfig:
      function () {
        return APP_CONFIG;
      },

    getEffectiveAppConfig:
      getEffectiveAppConfig,

    getProjectRoot:
      getProjectRoot,

    getProjectPath:
      getProjectPath,

    getDataPath:
      getDataPath,

    getPagePath:
      getPagePath,

    getComponentPath:
      getComponentPath,

    getApiPath:
      getApiPath,

    isFeatureEnabled:
      isFeatureEnabled,

    isAdminFeatureEnabled:
      isAdminFeatureEnabled,

    calculateStockStatus:
      calculateStockStatus,

    getInventorySettings:
      getInventorySettings,

    getAISettings:
      getAISettings,

    getInquirySettings:
      getInquirySettings,

    getPaymentSettings:
      getPaymentSettings,

    getEnvironment:
      function () {
        return {
          ...APP_CONFIG.environment
        };
      },

    refresh:
      function () {
        emitConfigUpdated();

        return getEffectiveAppConfig();
      }
  };


  /* =========================================
     BACKWARD COMPATIBILITY
  ========================================= */

  window.AlDahayanAppConfig =
    window.AlDahayanConfig;

})();
