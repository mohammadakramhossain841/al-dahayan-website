 /* =========================================
    AL-DAHAYAN COMPONENT LOADER
 ========================================= */

(function () {
  "use strict";

  /**
   * Get the correct project root.
   */
  function getRootPath() {
    if (typeof window.getProjectRoot === "function") {
      return window.getProjectRoot();
    }

    const path = window.location.pathname;

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
  function getComponentPath(componentName) {
    const root = getRootPath();

    return `${root}components/${componentName}.html`;
  }


  /**
   * Load one component into an element.
   */
  async function loadComponent(element) {
    const componentName =
      element.getAttribute("data-component");

    if (!componentName) {
      return {
        success: false,
        error: "Component name is missing."
      };
    }

    const fileName =
      element.getAttribute("data-component-file") ||
      componentName;

    const componentPath =
      getComponentPath(fileName);

    try {
      const response = await fetch(componentPath);

      if (!response.ok) {
        throw new Error(
          `Failed to load component: ${componentPath}`
        );
      }

      const html = await response.text();

      element.innerHTML = html;

      element.setAttribute(
        "data-component-loaded",
        "true"
      );

      return {
        success: true,
        component: componentName,
        path: componentPath
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
        component: componentName,
        path: componentPath,
        error: error.message
      };
    }
  }


  /**
   * Load all components on the current page.
   */
  async function loadComponents(root = document) {

    const elements = root.querySelectorAll(
      "[data-component]"
    );

    const results = [];

    for (const element of elements) {

      if (
        element.getAttribute(
          "data-component-loaded"
        ) === "true"
      ) {
        continue;
      }

      const result =
        await loadComponent(element);

      results.push(result);
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanComponentsLoaded",
        {
          detail: {
            results: results
          }
        }
      )
    );

    return results;
  }


  /**
   * Refresh component loading.
   */
  async function reloadComponents(root = document) {

    const elements = root.querySelectorAll(
      "[data-component]"
    );

    elements.forEach((element) => {

      element.removeAttribute(
        "data-component-loaded"
      );

      element.removeAttribute(
        "data-component-error"
      );

    });

    return loadComponents(root);
  }


  /**
   * Public component loader API.
   */
  window.AlDahayanComponents = {

    load: loadComponents,

    loadOne: loadComponent,

    reload: reloadComponents,

    getPath: getComponentPath
  };


  /**
   * Automatically initialize components
   * after the HTML document is ready.
   */
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      loadComponents();
    }
  );

})();
