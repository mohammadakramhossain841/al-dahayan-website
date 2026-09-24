/* =========================================
   AL-DAHAYAN COMPONENT LOADER
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let loadingPromise = null;

  /**
   * Get the correct project root.
   */
  function getRootPath() {
    if (
      typeof window.getProjectRoot === "function"
    ) {
      return window.getProjectRoot();
    }

    const path =
      window.location.pathname;

    if (
      path.includes("/pages/") ||
      path.includes("/admin/")
    ) {
      return "../";
    }

    return "./";
  }

  /**
   * Build component file path.
   */
  function getComponentPath(
    componentName
  ) {
    const root =
      getRootPath();

    return (
      `${root}components/${componentName}.html`
    );
  }

  /**
   * Load one component.
   */
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

    const componentPath =
      getComponentPath(fileName);

    element.setAttribute(
      "data-component-loading",
      "true"
    );

    try {
      const response =
        await fetch(
          componentPath,
          {
            cache: "no-cache"
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

  /**
   * Find component elements.
   */
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
          "[data-component]"
        )
        .forEach(
          (element) => {
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

  /**
   * Load all components.
   */
  async function loadComponents(
    root = document
  ) {
    const elements =
      findComponents(root);

    const results = [];

    /*
     * Load current-level components
     * in parallel.
     */
    const loaded =
      await Promise.all(
        elements.map(
          (element) =>
            loadComponent(
              element
            )
        )
      );

    results.push(
      ...loaded
    );

    /*
     * Check for nested components
     * added by loaded HTML.
     */
    const nestedElements =
      findComponents(root).filter(
        (element) =>
          element.getAttribute(
            "data-component-loaded"
          ) !== "true"
      );

    if (
      nestedElements.length
    ) {
      const nestedResults =
        await Promise.all(
          nestedElements.map(
            (element) =>
              loadComponent(
                element
              )
          )
        );

      results.push(
        ...nestedResults
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanComponentsLoaded",
        {
          detail: {
            results:
              results,
            total:
              results.length,
            successful:
              results.filter(
                (item) =>
                  item.success
              ).length,
            failed:
              results.filter(
                (item) =>
                  !item.success
              ).length
          }
        }
      )
    );

    return results;
  }

  /**
   * Reload all components.
   */
  async function reloadComponents(
    root = document
  ) {
    const elements =
      findComponents(root);

    elements.forEach(
      (element) => {
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

  /**
   * Initialize component loader.
   */
  function initializeComponents() {
    if (initialized) {
      return loadingPromise;
    }

    initialized = true;

    loadingPromise =
      loadComponents();

    window.AlDahayanComponents.ready =
      loadingPromise;

    return loadingPromise;
  }

  /**
   * Public API.
   */
  window.AlDahayanComponents = {
    load:
      loadComponents,

    loadOne:
      loadComponent,

    reload:
      reloadComponents,

    getPath:
      getComponentPath,

    ready:
      null,

    isInitialized:
      function () {
        return initialized;
      }
  };

  window.initializeComponents =
    initializeComponents;

  /**
   * Start after DOM is ready.
   */
  document.addEventListener(
    "DOMContentLoaded",
    initializeComponents
  );

})();
