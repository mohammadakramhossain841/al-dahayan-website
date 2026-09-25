/* =========================================
   AL-DAHAYAN APPLICATION CORE
   Centralized Application Orchestrator
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let initializationPromise = null;

  /* =========================================
     CONFIG
  ========================================= */

  function getConfig() {
    return window.AlDahayanConfig || null;
  }

  function getEffectiveConfig() {
    const config = getConfig();

    if (
      config &&
      typeof config.getEffectiveAppConfig ===
        "function"
    ) {
      return config.getEffectiveAppConfig();
    }

    return config || {};
  }

  function getFeatureConfig() {
    const config =
      getEffectiveConfig();

    return config.features || {};
  }

  function isFeatureEnabled(
    featureName,
    defaultValue = true
  ) {
    const features =
      getFeatureConfig();

    if (
      Object.prototype.hasOwnProperty.call(
        features,
        featureName
      )
    ) {
      return features[featureName] !== false;
    }

    return defaultValue;
  }

  /* =========================================
     COMPONENT LOADER
  ========================================= */

  async function waitForComponents() {
    const components =
      window.AlDahayanComponents;

    if (!components) {
      return [];
    }

    try {
      /*
       * The component loader exposes
       * initialize/init, not ready.
       */
      if (
        typeof components.initialize ===
        "function"
      ) {
        return await components.initialize();
      }

      if (
        typeof components.init ===
        "function"
      ) {
        return await components.init();
      }

      /*
       * Legacy fallback.
       */
      if (
        typeof window.initializeComponents ===
        "function"
      ) {
        return await window.initializeComponents();
      }
    } catch (error) {
      console.error(
        "Al-Dahayan Component Loader:",
        error
      );
    }

    return [];
  }

  /* =========================================
     LANGUAGE
  ========================================= */

  function initializeLanguage() {
    if (
      typeof window.initializeLanguage ===
      "function"
    ) {
      return window.initializeLanguage();
    }

    if (
      window.AlDahayanLanguage &&
      typeof window.AlDahayanLanguage.init ===
        "function"
    ) {
      return window.AlDahayanLanguage.init();
    }

    return null;
  }

  /* =========================================
     NAVIGATION
  ========================================= */

  function initializeNavigation() {
    if (
      typeof window.initializeNavigation ===
      "function"
    ) {
      return window.initializeNavigation();
    }

    if (
      window.AlDahayanNavigation &&
      typeof window.AlDahayanNavigation.init ===
        "function"
    ) {
      return window.AlDahayanNavigation.init();
    }

    return null;
  }

  /* =========================================
     SEARCH
  ========================================= */

  function initializeSearch() {
    if (
      !isFeatureEnabled(
        "oemSearch",
        true
      ) &&
      !isFeatureEnabled(
        "vehicleSearch",
        true
      )
    ) {
      return null;
    }

    if (
      typeof window.initializeSearch ===
      "function"
    ) {
      return window.initializeSearch();
    }

    if (
      window.AlDahayanSearch &&
      typeof window.AlDahayanSearch.init ===
        "function"
    ) {
      return window.AlDahayanSearch.init();
    }

    return null;
  }

  /* =========================================
     INVENTORY
  ========================================= */

  function initializeInventory() {
    if (
      !isFeatureEnabled(
        "inventory",
        true
      )
    ) {
      return null;
    }

    const inventory =
      window.AlDahayanInventory;

    if (!inventory) {
      return null;
    }

    try {
      if (
        typeof inventory.initialize ===
        "function"
      ) {
        return inventory.initialize();
      }

      if (
        typeof inventory.init ===
        "function"
      ) {
        return inventory.init();
      }
    } catch (error) {
      console.error(
        "Al-Dahayan Inventory:",
        error
      );
    }

    return null;
  }

  /* =========================================
     INQUIRY
  ========================================= */

  function initializeInquiry() {
    if (
      !isFeatureEnabled(
        "inquiry",
        true
      )
    ) {
      return null;
    }

    const inquiry =
      window.AlDahayanInquiry;

    if (!inquiry) {
      return null;
    }

    try {
      if (
        typeof inquiry.initialize ===
        "function"
      ) {
        return inquiry.initialize();
      }

      if (
        typeof inquiry.init ===
        "function"
      ) {
        return inquiry.init();
      }
    } catch (error) {
      console.error(
        "Al-Dahayan Inquiry:",
        error
      );
    }

    return null;
  }

  /* =========================================
     CONTACT
  ========================================= */

  function initializeContact() {
    const contact =
      window.AlDahayanContact;

    if (!contact) {
      return null;
    }

    try {
      if (
        typeof contact.initialize ===
        "function"
      ) {
        return contact.initialize();
      }

      if (
        typeof contact.init ===
        "function"
      ) {
        return contact.init();
      }
    } catch (error) {
      console.error(
        "Al-Dahayan Contact:",
        error
      );
    }

    return null;
  }

  /* =========================================
     MODAL
  ========================================= */

  function initializeModal() {
    if (
      !isFeatureEnabled(
        "modal",
        true
      )
    ) {
      return null;
    }

    const modal =
      window.AlDahayanModal;

    if (!modal) {
      return null;
    }

    try {
      if (
        typeof modal.initialize ===
        "function"
      ) {
        return modal.initialize();
      }

      if (
        typeof modal.init ===
        "function"
      ) {
        return modal.init();
      }
    } catch (error) {
      console.error(
        "Al-Dahayan Modal:",
        error
      );
    }

    return null;
  }

  /* =========================================
     VIN SEARCH
  ========================================= */

  function initializeVINSearch() {
    if (
      !isFeatureEnabled(
        "vinSearch",
        true
      )
    ) {
      return null;
    }

    const vin =
      window.AlDahayanVINSearch;

    if (!vin) {
      return null;
    }

    try {
      if (
        typeof vin.initialize ===
        "function"
      ) {
        return vin.initialize();
      }

      if (
        typeof vin.init ===
        "function"
      ) {
        return vin.init();
      }
    } catch (error) {
      console.error(
        "Al-Dahayan VIN Search:",
        error
      );
    }

    return null;
  }

  /* =========================================
     APPLICATION STATE
  ========================================= */

  function applyApplicationState() {
    const config =
      getEffectiveConfig();

    const features =
      config.features || {};

    const body =
      document.body;

    if (!body) {
      return;
    }

    /*
     * Website feature state.
     */
    Object.keys(features).forEach(
      function (feature) {
        body.dataset[
          "feature" +
          feature.charAt(0).toUpperCase() +
          feature.slice(1)
        ] =
          features[feature] === false
            ? "disabled"
            : "enabled";
      }
    );

    /*
     * Payment is intentionally
     * disabled until enabled
     * from Admin/production backend.
     */
    if (
      config.payment &&
      config.payment.enabled === false
    ) {
      body.dataset.payment =
        "disabled";
    } else {
      body.dataset.payment =
        "enabled";
    }

    /*
     * Customer location collection
     * remains disabled.
     */
    body.dataset.customerLocation =
      "disabled";
  }

  /* =========================================
     AI STATE
  ========================================= */

  function applyAIState() {
    const config =
      getEffectiveConfig();

    const ai =
      config.ai || {};

    const body =
      document.body;

    if (!body) {
      return;
    }

    body.dataset.ai =
      ai.enabled === false
        ? "disabled"
        : "enabled";

    /*
     * AI must never collect customer
     * location or proactively
     * recommend branches.
     */
    body.dataset.aiLocationCollection =
      "disabled";

    body.dataset.aiBranchRecommendation =
      "disabled";

    /*
     * AI stock information must be
     * verified through Inventory.
     */
    body.dataset.aiStockVerification =
      "required";

    /*
     * AI communication channel.
     */
    body.dataset.aiWhatsApp =
      ai.whatsappConnect === false
        ? "disabled"
        : "enabled";
  }

  /* =========================================
     INVENTORY STATE
  ========================================= */

  function applyInventoryState() {
    const config =
      getEffectiveConfig();

    const inventory =
      config.inventory || {};

    const body =
      document.body;

    if (!body) {
      return;
    }

    body.dataset.inventory =
      inventory.enabled === false
        ? "disabled"
        : "enabled";

    body.dataset.inventoryVerification =
      inventory.requireVerifiedStock === false
        ? "optional"
        : "required";

    body.dataset.inventoryQuantityDisplay =
      inventory.quantityDisplay === true
        ? "enabled"
        : "disabled";
  }

  /* =========================================
     INQUIRY STATE
  ========================================= */

  function applyInquiryState() {
    const config =
      getEffectiveConfig();

    const inquiry =
      config.inquiry || {};

    const body =
      document.body;

    if (!body) {
      return;
    }

    body.dataset.inquiry =
      inquiry.enabled === false
        ? "disabled"
        : "enabled";

    /*
     * Customer location is never
     * part of the inquiry form.
     */
    body.dataset.inquiryLocation =
      "disabled";
  }

  /* =========================================
     LANGUAGE
  ========================================= */

  function getCurrentLanguage() {
    if (
      window.AlDahayanLanguage &&
      typeof window.AlDahayanLanguage.getCurrent ===
        "function"
    ) {
      return window.AlDahayanLanguage.getCurrent();
    }

    if (
      typeof window.getCurrentLanguage ===
      "function"
    ) {
      return window.getCurrentLanguage();
    }

    const config =
      getEffectiveConfig();

    return (
      config.site?.defaultLanguage ||
      "en"
    );
  }

  function setLanguage(
    language
  ) {
    if (
      window.AlDahayanLanguage &&
      typeof window.AlDahayanLanguage.set ===
        "function"
    ) {
      return window.AlDahayanLanguage.set(
        language
      );
    }

    if (
      typeof window.setLanguage ===
      "function"
    ) {
      return window.setLanguage(
        language
      );
    }

    return false;
  }

  function getStoredLanguage() {
    if (
      window.AlDahayanLanguage &&
      typeof window.AlDahayanLanguage.getStored ===
        "function"
    ) {
      return window.AlDahayanLanguage.getStored();
    }

    if (
      typeof window.getStoredLanguage ===
      "function"
    ) {
      return window.getStoredLanguage();
    }

    return null;
  }

  /* =========================================
     CURRENT PAGE
  ========================================= */

  function getCurrentPage() {
    const body =
      document.body;

    if (
      body &&
      body.dataset &&
      body.dataset.page
    ) {
      return body.dataset.page;
    }

    const path =
      window.location.pathname ||
      "";

    if (
      path.includes("/pages/")
    ) {
      const file =
        path.split("/").pop();

      return file
        ? file.replace(
            /\.html$/i,
            ""
          )
        : "home";
    }

    if (
      path.includes("/admin/")
    ) {
      const file =
        path.split("/").pop();

      return file
        ? file.replace(
            /\.html$/i,
            ""
          )
        : "admin";
    }

    return "home";
  }

  /* =========================================
     PAGE READY EVENT
  ========================================= */

  function dispatchPageReady() {
    document.dispatchEvent(
      new CustomEvent(
        "alDahayanPageReady",
        {
          detail: {
            initialized: true,
            page:
              getCurrentPage(),
            language:
              getCurrentLanguage(),
            timestamp:
              new Date().toISOString()
          }
        }
      )
    );
  }

  /* =========================================
     APPLICATION INITIALIZATION
  ========================================= */

  async function initializeApp(
    options = {}
  ) {
    if (
      initialized &&
      !options.force
    ) {
      return (
        initializationPromise ||
        Promise.resolve(true)
      );
    }

    initialized = true;

    initializationPromise =
      (async function () {
        /*
         * 1. Load dynamic components.
         */
        await waitForComponents();

        /*
         * 2. Initialize shared language
         * system first.
         */
        initializeLanguage();

        /*
         * 3. Apply global application state.
         */
        applyApplicationState();
        applyAIState();
        applyInventoryState();
        applyInquiryState();

        /*
         * 4. Initialize UI systems.
         */
        initializeNavigation();
        initializeModal();

        /*
         * 5. Initialize data/search systems.
         */
        initializeInventory();
        initializeSearch();
        initializeVINSearch();

        /*
         * 6. Initialize customer connection.
         */
        initializeInquiry();
        initializeContact();

        /*
         * 7. Notify the application.
         */
        dispatchPageReady();

        return true;
      })();

    return initializationPromise;
  }

  /* =========================================
     REFRESH APPLICATION
  ========================================= */

  async function refreshApp() {
    initialized = false;
    initializationPromise = null;

    return initializeApp({
      force: true
    });
  }

  /* =========================================
     EVENT SYNCHRONIZATION
  ========================================= */

  function handleConfigUpdated() {
    applyApplicationState();
    applyAIState();
    applyInventoryState();
    applyInquiryState();

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanAppRefreshed",
        {
          detail: {
            reason:
              "config-updated"
          }
        }
      )
    );
  }

  function handleSettingsUpdated() {
    applyApplicationState();
    applyAIState();
    applyInventoryState();
    applyInquiryState();

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanAppRefreshed",
        {
          detail: {
            reason:
              "settings-updated"
          }
        }
      )
    );
  }

  function handleLanguageChanged() {
    applyApplicationState();
  }

  /* =========================================
     PUBLIC APPLICATION API
  ========================================= */

  window.AlDahayanApp = {

    init:
      initializeApp,

    initialize:
      initializeApp,

    refresh:
      refreshApp,

    ready:
      null,

    getCurrentLanguage:
      getCurrentLanguage,

    setLanguage:
      setLanguage,

    getStoredLanguage:
      getStoredLanguage,

    getCurrentPage:
      getCurrentPage,

    getConfig:
      getEffectiveConfig,

    isFeatureEnabled:
      isFeatureEnabled,

    isInitialized:
      function () {
        return initialized;
      },

    getState:
      function () {
        return {
          initialized,
          page:
            getCurrentPage(),
          language:
            getCurrentLanguage(),
          config:
            getEffectiveConfig()
        };
      }
  };

  /* =========================================
     LEGACY GLOBAL SUPPORT
  ========================================= */

  window.initializeApp =
    initializeApp;

  /* =========================================
     EVENTS
  ========================================= */

  document.addEventListener(
    "alDahayanConfigUpdated",
    handleConfigUpdated
  );

  document.addEventListener(
    "alDahayanSettingsUpdated",
    handleSettingsUpdated
  );

  document.addEventListener(
    "alDahayanLanguageChanged",
    handleLanguageChanged
  );

  document.addEventListener(
    "alDahayanLanguageApplied",
    handleLanguageChanged
  );

  /*
   * Components are loaded dynamically.
   * Re-apply application state when
   * component loading finishes.
   */
  document.addEventListener(
    "alDahayanComponentsLoaded",
    function () {
      applyApplicationState();
      applyAIState();
      applyInventoryState();
      applyInquiryState();
    }
  );

  /* =========================================
     DOM READY
  ========================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        initializeApp();
      },
      {
        once: true
      }
    );
  } else {
    initializeApp();
  }

})();
