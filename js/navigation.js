(function () {
  "use strict";

  function initializeNavigation() {
    setupActiveNavigation();
    setupNavigationLinks();
    setupBackNavigation();
  }

  function setupActiveNavigation() {
    const currentPath = window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();

    const navigationLinks = document.querySelectorAll(
      "header nav a, .site-nav a, .main-nav a"
    );

    navigationLinks.forEach((link) => {
      const linkPath = link.getAttribute("href");

      if (!linkPath) {
        return;
      }

      const normalizedPath = linkPath
        .split("/")
        .pop()
        .toLowerCase();

      link.classList.remove("active");

      if (
        normalizedPath === currentPath ||
        (currentPath === "" && normalizedPath === "index.html")
      ) {
        link.classList.add("active");
      }
    });
  }

  function setupNavigationLinks() {
    const links = document.querySelectorAll("[data-navigation]");

    links.forEach((link) => {
      link.addEventListener("click", function (event) {
        const target = this.getAttribute("data-navigation");

        if (!target) {
          return;
        }

        event.preventDefault();

        navigateTo(target);
      });
    });
  }

  function setupBackNavigation() {
    const backButtons = document.querySelectorAll(
      "[data-action='back'], .back-button"
    );

    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          navigateTo("../index.html");
        }
      });
    });
  }

  function navigateTo(path) {
    if (!path) {
      return;
    }

    window.location.href = path;
  }

  function getCurrentPage() {
    const path = window.location.pathname.split("/").pop();

    return path || "index.html";
  }

  window.AlDahayanNavigation = {
    initialize: initializeNavigation,
    navigateTo,
    getCurrentPage
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeNavigation
    );
  } else {
    initializeNavigation();
  }
})();
