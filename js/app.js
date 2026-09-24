/* =========================================
   AL-DAHAYAN APPLICATION CORE
========================================= */

(function () {
  "use strict";

  let applicationInitialized = false;
  let pageInitialized = false;

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      startApplication();
    }
  );

  async function startApplication() {
    if (applicationInitialized) {
      return;
    }

    applicationInitialized = true;

    /*
     * Component loader handles reusable HTML components.
     * Wait for components before final page initialization.
     */
    if (window.AlDahayanComponents) {
      try {
        await window.AlDahayanComponents.load();
      } catch (error) {
        console.error(
          "Al-Dahayan Component Loader:",
          error
        );
      }
    }

    initializeCore();
    initializePage();
  }

  function initializeCore() {
    /*
     * These modules may already self-initialize.
     * Only call them here when they are explicitly exposed.
     */

    if (
      typeof window.AlDahayanLanguage?.initialize ===
      "function"
    ) {
      window.AlDahayanLanguage.initialize();
    }

    if (
      typeof window.AlDahayanNavigation?.initialize ===
      "function"
    ) {
      window.AlDahayanNavigation.initialize();
    }

    if (
      typeof window.AlDahayanSearch?.initialize ===
      "function"
    ) {
      window.AlDahayanSearch.initialize();
    }
  }

  function initializePage() {
    if (pageInitialized) {
      return;
    }

    pageInitialized = true;

    const page =
      document.body?.dataset?.page || "";

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanPageReady",
        {
          detail: {
            page: page,
            config:
              window.APP_CONFIG || {},
            language:
              getCurrentLanguage(),
            direction:
              document.documentElement.getAttribute(
                "dir"
              ) || "ltr"
          }
        }
      )
    );
  }

  function getCurrentLanguage() {
    return (
      document.documentElement.getAttribute(
        "lang"
      ) ||
      window.APP_CONFIG?.site?.defaultLanguage ||
      "en"
    );
  }

  function setPageLanguage(language) {
    if (
      !window.APP_CONFIG?.site?.supportedLanguages?.includes(
        language
      )
    ) {
      return false;
    }

    document.documentElement.setAttribute(
      "lang",
      language
    );

    const direction =
      window.APP_CONFIG.site.direction?.[
        language
      ] || "ltr";

    document.documentElement.setAttribute(
      "dir",
      direction
    );

    localStorage.setItem(
      "alDahayanLanguage",
      language
    );

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanLanguageChanged",
        {
          detail: {
            language: language,
            direction: direction
          }
        }
      )
    );

    return true;
  }

  function getStoredLanguage() {
    return localStorage.getItem(
      "alDahayanLanguage"
    );
  }

  function isRTL() {
    return getCurrentLanguage() === "ar";
  }

  function getCurrentPage() {
    return (
      document.body?.dataset?.page || ""
    );
  }

  window.AlDahayanApp = {
    initialize: startApplication,
    getCurrentLanguage,
    setPageLanguage,
    getStoredLanguage,
    isRTL,
    getCurrentPage
  };

})();
