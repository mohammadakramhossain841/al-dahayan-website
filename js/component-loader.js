/* =========================================
   AL-DAHAYAN COMPONENT LOADER
   Centralized, Reliable & Dynamic
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let loadingPromise = null;

  const COMPONENT_SELECTOR =
    "[data-component]";

  /* =========================================
     CONFIG / PATH
  ========================================= */

  function getConfig() {
    return window.AlDahayanConfig || null;
  }

  function getRootPath() {
    if (
      typeof window.getProjectRoot ===
      "function"
    ) {
      return window.getProjectRoot();
    }

    const config =
      getConfig();

    if (
      config &&
      config.paths &&
      typeof config.paths.root ===
        "string"
    ) {
      /*
       * Admin/pages paths in the current
       * project use ../ as their root.
       */
      return config.paths.root;
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

  function getComponentPath(
    componentName
  ) {
    if (!componentName) {
      return "";
    }

    const config =
      getConfig();

    let componentsPath =
      "components/";

    if (
      config &&
      config.paths &&
      typeof config.paths.components ===
        "string"
    ) {
      componentsPath =
        config.paths.components;
    }

    /*
     * When config paths already contain
     * ../components/, do not duplicate
     * the project root.
     */
    if (
      componentsPath.startsWith("../") ||
      componentsPath.startsWith("./") ||
      componentsPath.startsWith("/")
    ) {
      return (
        componentsPath +
        `${componentName}.html`
      );
    }

    return (
      `${getRootPath()}${componentsPath}` +
      `${componentName}.html`
    );
  }

  /* =========================================
     COMPONENT NAME SAFETY
  ========================================= */

  function isValidComponentName(
    name
  ) {
    if (!name) {
      return false;
    }

    /*
     * Prevent accidental path traversal.
     */
    return !(
      name.includes("..") ||
      name.includes("\\") ||
      name.startsWith("/")
    );
  }

  /* =========================================
     LOAD ONE COMPONENT
  ========================================= */

  async function loadComponent(
    element
  ) {
    if (!element) {
      return {
        success: false,
        error:
          "Component element is missing."
      };
    }

    const componentName =
      element.getAttribute(
        "data-component"
      );

    if (!componentName) {
      return {
        success: false,
        error:
          "Component name is missing."
      };
    }

    if (
      !isValidComponentName(
        componentName
      )
    ) {
      const error =
        "Invalid component name.";

      element.setAttribute(
        "data-component-error",
        "true"
      );

      return {
        success: false,
        component:
          componentName,
        error
      };
    }

    if (
      element.getAttribute(
        "data-component-loaded"
      ) === "true"
    ) {
      return {
        success: true,
        component:
          componentName,
        skipped: true
      };
    }

    if (
      element.getAttribute(
        "data-component-loading"
      ) === "true"
    ) {
      return {
        success: false,
        component:
          componentName,
        skipped: true,
        error:
          "Component is already loading."
      };
    }

    const fileName =
      element.getAttribute(
        "data-component-file"
      ) ||
      componentName;

    if (
      !isValidComponentName(
        fileName
      )
    ) {
      const error =
        "Invalid component file name.";

      element.setAttribute(
        "data-component-error",
        "true"
      );

      return {
        success: false,
        component:
          componentName,
        error
      };
    }

    const componentPath =
      getComponentPath(
        fileName
      );

    if (!componentPath) {
      return {
        success: false,
        component:
          componentName,
        error:
          "Component path could not be created."
      };
    }

    element.setAttribute(
      "data-component-loading",
      "true"
    );

    try {
      const response =
        await fetch(
          componentPath,
          {
            method: "GET",
            cache: "no-cache",
            credentials: "same-origin"
          }
        );

      if (!response.ok) {
        throw new Error(
          `Failed to load component: ${componentPath} (${response.status})`
        );
      }

      const html =
        await response.text();

      if (!html.trim()) {
        throw new Error(
          `Component is empty: ${componentPath}`
        );
      }

      element.innerHTML =
        html;

      element.setAttribute(
        "data-component-loaded",
        "true"
      );

      element.removeAttribute(
        "data-component-error"
      );

      return {
        success: true,
        component:
          componentName,
        file:
          fileName,
        path:
          componentPath
      };

    } catch (error) {
      console.error(
        "Al-Dahayan Component Loader:",
        error
      );

      element.setAttribute(
        "data-component-error",
        "true"
      );

      return {
        success: false,
        component:
          componentName,
        file:
          fileName,
        path:
          componentPath,
        error:
          error.message
      };

    } finally {
      element.removeAttribute(
        "data-component-loading"
      );
    }
  }

  /* =========================================
     FIND COMPONENTS
  ========================================= */

  function findComponents(
    root = document
  ) {
    const elements = [];

    if (
      root &&
      root.nodeType === 1 &&
      root.hasAttribute(
        "data-component"
      )
    ) {
      elements.push(root);
    }

    if (
      root &&
      typeof root.querySelectorAll ===
        "function"
    ) {
      root
        .querySelectorAll(
          COMPONENT_SELECTOR
        )
        .forEach(
          function (element) {
            if (
              !elements.includes(
                element
              )
            ) {
              elements.push(
                element
              );
            }
          }
        );
    }

    return elements;
  }

  /* =========================================
     LOAD ALL COMPONENTS
  ========================================= */

  async function loadComponents(
    root = document
  ) {
    const processed =
      new Set();

    const results = [];

    /*
     * Continue loading until no new
     * unloaded components remain.
     *
     * This supports components that
     * themselves contain components.
     */
    let safetyPasses = 0;

    const MAX_PASSES = 20;

    while (
      safetyPasses <
      MAX_PASSES
    ) {
      safetyPasses += 1;

      const elements =
        findComponents(root).filter(
          function (element) {
            return (
              element.getAttribute(
                "data-component-loaded"
              ) !== "true" &&
              !processed.has(
                element
              )
            );
          }
        );

      if (!elements.length) {
        break;
      }

      elements.forEach(
        function (element) {
          processed.add(
            element
          );
        }
      );

      const loaded =
        await Promise.all(
          elements.map(
            function (element) {
              return loadComponent(
                element
              );
            }
          )
        );

      results.push(
        ...loaded
      );
    }

    if (
      safetyPasses >=
        MAX_PASSES &&
      findComponents(root).some(
        function (element) {
          return (
            element.getAttribute(
              "data-component-loaded"
            ) !== "true"
          );
        }
      )
    ) {
      console.warn(
        "Al-Dahayan Component Loader: maximum nested component passes reached."
      );
    }

    const detail = {
      results:
        results,
      total:
        results.length,
      successful:
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
    };

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanComponentsLoaded",
        {
          detail
        }
      )
    );

    return results;
  }

  /* =========================================
     RELOAD
  ========================================= */

  async function reloadComponents(
    root = document
  ) {
    const elements =
      findComponents(root);

    elements.forEach(
      function (element) {
        element.removeAttribute(
          "data-component-loaded"
        );

        element.removeAttribute(
          "data-component-error"
        );

        element.removeAttribute(
          "data-component-loading"
        );
      }
    );

    return loadComponents(
      root
    );
  }

  /* =========================================
     LOAD WITH RETRY
  ========================================= */

  async function loadWithRetry(
    element,
    attempts = 2
  ) {
    const maxAttempts =
      Math.max(
        1,
        Number(attempts) || 1
      );

    let lastResult = null;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt += 1
    ) {
      if (
        attempt > 1
      ) {
        element.removeAttribute(
          "data-component-loaded"
        );

        element.removeAttribute(
          "data-component-error"
        );

        await new Promise(
          function (resolve) {
            setTimeout(
              resolve,
              250
            );
          }
        );
      }

      lastResult =
        await loadComponent(
          element
        );

      if (
        lastResult.success
      ) {
        return lastResult;
      }
    }

    return lastResult;
  }

  /* =========================================
     INITIALIZATION
  ========================================= */

  function initializeComponents() {
    if (initialized) {
      return loadingPromise;
    }

    initialized = true;

    loadingPromise =
      loadComponents();

    if (
      window.AlDahayanComponents
    ) {
      window.AlDahayanComponents.ready =
        loadingPromise;
    }

    return loadingPromise;
  }

  /* =========================================
     PUBLIC API
  ========================================= */

  window.AlDahayanComponents = {
    load:
      loadComponents,

    loadOne:
      loadComponent,

    loadWithRetry:
      loadWithRetry,

    reload:
      reloadComponents,

    find:
      findComponents,

    getPath:
      getComponentPath,

    getRoot:
      getRootPath,

    ready:
      null,

    isInitialized:
      function () {
        return initialized;
      }
  };

  window.initializeComponents =
    initializeComponents;

  /* =========================================
     DOM READY
  ========================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeComponents,
      {
        once: true
      }
    );
  } else {
    initializeComponents();
  }

})();
