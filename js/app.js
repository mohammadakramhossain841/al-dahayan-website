/* =========================================
   AL-DAHAYAN APPLICATION CORE
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let initializationPromise = null;

  /**
   * Wait for component loader.
   */
  async function waitForComponents() {
    if (
      window.AlDahayanComponents &&
      window.AlDahayanComponents.ready
    ) {
      try {
        await window.AlDahayanComponents.ready;
      } catch (error) {
        console.error(
          "Al-Dahayan Component Loader:",
          error
        );
      }

      return;
    }

    if (
      window.AlDahayanComponents &&
      typeof window.AlDahayanComponents.load ===
        "function"
    ) {
      try {
        await window.AlDahayanComponents.load();
      } catch (error) {
        console.error(
          "Al-Dahayan Component Loader:",
          error
        );
      }
    }
  }

  /**
   * Initialize language system.
   */
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

  /**
   * Initialize navigation system.
   */
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

  /**
   * Initialize search system.
   */
  function initializeSearch() {
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

  /**
   * Initialize application.
   */
  async function initializeApp() {
    if (initialized) {
      return initializationPromise;
    }

    initialized = true;

    initializationPromise =
      (async function () {
        /*
         * Components must load first.
         */
        await waitForComponents();

        /*
         * Initialize shared systems.
         */
        initializeLanguage();
        initializeNavigation();
        initializeSearch();

        /*
         * Notify the rest of the application.
         */
        document.dispatchEvent(
          new CustomEvent(
            "alDahayanPageReady",
            {
              detail: {
                initialized: true
              }
            }
          )
        );

        return true;
      })();

    return initializationPromise;
  }

  /**
   * Current language.
   */
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

    return (
      window.APP_CONFIG?.site
        ?.defaultLanguage ||
      "en"
    );
  }

  /**
   * Set language.
   */
  function setLanguage(language) {
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

  /**
   * Get stored language.
   */
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

  /**
   * Get current page.
   */
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
      window.location.pathname;

    if (
      path.includes(
        "/pages/"
      )
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

    return "home";
  }

  /**
   * Public application API.
   */
  window.AlDahayanApp = {
    init:
      initializeApp,

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

    isInitialized:
      function () {
        return initialized;
      }
  };

  window.initializeApp =
    initializeApp;

  /*
   * Initialize only after DOM is ready.
   */
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

})();
