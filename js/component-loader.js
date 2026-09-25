/* =========================================
   AL-DAHAYAN COMPONENT LOADER
   Centralized, Dynamic & Config-Aware
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let loadingPromise = null;

  const COMPONENT_SELECTOR =
    "[data-component]";

  /* =========================================
     ROOT PATH
  ========================================= */

  function getRootPath() {
    if (
      typeof window.getProjectRoot ===
      "function"
    ) {
      return window.getProjectRoot();
    }

    const path =
      window.location.pathname || "";

    if (
      path.includes("/pages/") ||
      path.includes("/admin/")
    ) {
      return "../";
    }

    return "./";
  }

  /* =========================================
     COMPONENT PATH
  ========================================= */

  function getComponentPath(
    name
  ) {
    if (!name) {
      return null;
    }

    const cleanName =
      String(name)
        .trim()
        .replace(/^\/+|\/+$/g, "");

    if (!cleanName) {
      return null;
    }

    /*
     * Prevent path traversal.
     */
    if (
      cleanName.includes("..") ||
      cleanName.includes("\\")
    ) {
      console.warn(
        "Al-Dahayan Component Loader: invalid component name.",
        name
      );

      return null;
    }

    return (
      getRootPath() +
      "components/" +
      cleanName +
      ".html"
    );
  }

  /* =========================================
     COMPONENT STATE
  ========================================= */

  function isLoaded(element) {
    return (
      element &&
      element.getAttribute(
        "data-component-loaded"
      ) === "true"
    );
  }

  function isLoading(element) {
    return (
      element &&
      element.getAttribute(
        "data-component-loading"
      ) === "true"
    );
  }

  function setState(
    element,
    state
  ) {
    if (!element) {
      return;
    }

    element.setAttribute(
      "data-component-state",
      state
    );

    element.setAttribute(
      "data-component-loaded",
      state === "loaded"
        ? "true"
        : "false"
    );

    element.setAttribute(
      "data-component-loading",
      state === "loading"
        ? "true"
        : "false"
    );

    if (state === "error") {
      element.setAttribute(
        "data-component-error",
        "true"
      );
    } else {
      element.removeAttribute(
        "data-component-error"
      );
    }
  }

  /* =========================================
     LOAD SINGLE COMPONENT
  ========================================= */

  async function loadComponent(
    element,
    options = {}
  ) {
    if (!element) {
      return {
        success: false,
        element: null,
        reason: "missing-element"
      };
    }

    if (
      isLoaded(element) &&
      options.force !== true
    ) {
      return {
        success: true,
        element,
        skipped: true
      };
    }

    if (
      isLoading(element) &&
      options.force !== true
    ) {
      return {
        success: false,
        element,
        reason: "already-loading"
      };
    }

    const name =
      element.getAttribute(
        "data-component"
      );

    const path =
      getComponentPath(name);

    if (!path) {
      setState(
        element,
        "error"
      );

      return {
        success: false,
        element,
        reason: "invalid-component"
      };
    }

    setState(
      element,
      "loading"
    );

    try {
      const response =
        await fetch(
          path,
          {
            method: "GET",
            cache: "no-cache",
            headers: {
              Accept:
                "text/html"
            }
          }
        );

      if (!response.ok) {
        throw new Error(
          "HTTP " +
            response.status +
            " while loading " +
            name
        );
      }

      const html =
        await response.text();

      if (
        !html ||
        !html.trim()
      ) {
        throw new Error(
          "Component returned empty content."
        );
      }

      element.innerHTML =
        html;

      element.setAttribute(
        "data-component-source",
        path
      );

      setState(
        element,
        "loaded"
      );

      return {
        success: true,
        element,
        name,
        path
      };
    } catch (error) {
      console.error(
        "Al-Dahayan Component Loader:",
        error
      );

      setState(
        element,
        "error"
      );

      element.setAttribute(
        "data-component-error-message",
        error.message ||
          "Unable to load component."
      );

      return {
        success: false,
        element,
        name,
        path,
        reason:
          error.message ||
          "load-error"
      };
    }
  }

  /* =========================================
     FIND COMPONENTS
  ========================================= */

  function findComponents(
    root = document
  ) {
    if (!root) {
      return [];
    }

    if (
      root.matches &&
      root.matches(
        COMPONENT_SELECTOR
      )
    ) {
      return [
        root,
        ...Array.from(
          root.querySelectorAll(
            COMPONENT_SELECTOR
          )
        )
      ];
    }

    return Array.from(
      root.querySelectorAll(
        COMPONENT_SELECTOR
      )
    );
  }

  /* =========================================
     LOAD ALL COMPONENTS
  ========================================= */

  async function loadComponents(
    root = document,
    options = {}
  ) {
    const components =
      findComponents(root);

    if (!components.length) {
      return [];
    }

    const results =
      await Promise.all(
        components.map(
          function (element) {
            return loadComponent(
              element,
              options
            );
          }
        )
      );

    /*
     * Components may themselves contain
     * additional components.
     *
     * Continue loading until no new
     * unloaded component remains.
     */
    let safetyCounter = 0;
    const maxPasses = 5;

    while (
      safetyCounter <
      maxPasses
    ) {
      safetyCounter++;

      const nested =
        findComponents(root).filter(
          function (element) {
            return !isLoaded(
              element
            );
          }
        );

      if (!nested.length) {
        break;
      }

      const nestedResults =
        await Promise.all(
          nested.map(
            function (element) {
              return loadComponent(
                element,
                options
              );
            }
          )
        );

      results.push(
        ...nestedResults
      );
    }

    return results;
  }

  /* =========================================
     LANGUAGE SYNC
  ========================================= */

  function refreshLanguage() {
    if (
      window.AlDahayanLanguage &&
      typeof window.AlDahayanLanguage.apply ===
        "function"
    ) {
      window.AlDahayanLanguage.apply();
    } else if (
      typeof window.applyLanguage ===
      "function"
    ) {
      window.applyLanguage();
    }
  }

  /* =========================================
     COMPONENT READY EVENT
  ========================================= */

  function dispatchLoadedEvent(
    results
  ) {
    document.dispatchEvent(
      new CustomEvent(
        "alDahayanComponentsLoaded",
        {
          detail: {
            results,
            count:
              results.length,
            loaded:
              results.filter(
                function (item) {
                  return item.success;
                }
              ).length,
            failed:
              results.filter(
                function (item) {
                  return !item.success;
                }
              ).length
          }
        }
      )
    );
  }

  /* =========================================
     INITIALIZATION
  ========================================= */

  function initializeComponents(
    options = {}
  ) {
    if (
      initialized &&
      !options.force
    ) {
      return (
        loadingPromise ||
        Promise.resolve([])
      );
    }

    initialized = true;

    loadingPromise =
      loadComponents(
        document,
        options
      ).then(
        function (results) {
          /*
           * Apply language after components
           * have entered the DOM.
           */
          refreshLanguage();

          dispatchLoadedEvent(
            results
          );

          return results;
        }
      );

    return loadingPromise;
  }

  /* =========================================
     RELOAD
  ========================================= */

  async function reloadComponents(
    root = document
  ) {
    const components =
      findComponents(root);

    components.forEach(
      function (element) {
        setState(
          element,
          "idle"
        );

        element.removeAttribute(
          "data-component-source"
        );

        element.removeAttribute(
          "data-component-error-message"
        );
      }
    );

    initialized = false;
    loadingPromise = null;

    return initializeComponents({
      force: true
    });
  }

  /* =========================================
     REFRESH
  ========================================= */

  async function refreshComponents(
    root = document
  ) {
    const results =
      await loadComponents(
        root
      );

    refreshLanguage();

    dispatchLoadedEvent(
      results
    );

    return results;
  }

  /* =========================================
     CONFIG / LANGUAGE EVENTS
  ========================================= */

  function handleLanguageChanged() {
    refreshLanguage();
  }

  function handleConfigUpdated() {
    /*
     * Config changes do not require
     * re-fetching HTML components.
     *
     * Re-apply language and notify
     * dependent systems instead.
     */
    refreshLanguage();

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanComponentsRefreshed",
        {
          detail: {
            reason:
              "config-updated"
          }
        }
      )
    );
  }

  /* =========================================
     PUBLIC API
  ========================================= */

  window.AlDahayanComponents = {

    init:
      initializeComponents,

    initialize:
      initializeComponents,

    load:
      loadComponent,

    loadAll:
      loadComponents,

    find:
      findComponents,

    reload:
      reloadComponents,

    refresh:
      refreshComponents,

    getComponentPath:
      getComponentPath,

    getRootPath:
      getRootPath,

    isLoaded:
      isLoaded,

    isLoading:
      isLoading,

    isInitialized:
      function () {
        return initialized;
      },

    getState:
      function () {
        return {
          initialized,
          loading:
            !!loadingPromise
        };
      }
  };

  /* =========================================
     LEGACY GLOBAL SUPPORT
  ========================================= */

  window.initializeComponents =
    initializeComponents;

  /* =========================================
     EVENT LISTENERS
  ========================================= */

  document.addEventListener(
    "alDahayanLanguageChanged",
    handleLanguageChanged
  );

  document.addEventListener(
    "alDahayanLanguageApplied",
    handleLanguageChanged
  );

  document.addEventListener(
    "alDahayanConfigUpdated",
    handleConfigUpdated
  );

  document.addEventListener(
    "alDahayanSettingsUpdated",
    handleConfigUpdated
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
        initializeComponents();
      },
      {
        once: true
      }
    );
  } else {
    initializeComponents();
  }

})();
