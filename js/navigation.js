/* =========================================
   AL-DAHAYAN NAVIGATION SYSTEM
========================================= */

(function () {
  "use strict";

  let initialized = false;

  const SELECTORS = {
    menuToggle:
      "[data-menu-toggle], [data-nav-toggle]",

    menu:
      "[data-mobile-menu], [data-navigation-menu]",

    close:
      "[data-menu-close], [data-nav-close]",

    links:
      "[data-nav-link], nav a[href]"
  };

  /* =========================================
     Helpers
  ========================================= */

  function getMenuToggle() {
    return document.querySelector(
      SELECTORS.menuToggle
    );
  }

  function getMenu() {
    return document.querySelector(
      SELECTORS.menu
    );
  }

  function getCloseButton() {
    return document.querySelector(
      SELECTORS.close
    );
  }

  function getNavigationLinks() {
    return Array.from(
      document.querySelectorAll(
        SELECTORS.links
      )
    );
  }

  function isMobileMenuOpen() {
    const menu = getMenu();

    if (!menu) {
      return false;
    }

    return (
      menu.classList.contains("is-open") ||
      menu.getAttribute("aria-hidden") ===
        "false"
    );
  }

  /* =========================================
     Open Menu
  ========================================= */

  function openMenu() {
    const menu = getMenu();
    const toggle = getMenuToggle();

    if (!menu) {
      return false;
    }

    menu.classList.add("is-open");

    menu.removeAttribute("hidden");

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "menu-open"
    );

    if (toggle) {
      toggle.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanMenuOpened"
      )
    );

    return true;
  }

  /* =========================================
     Close Menu
  ========================================= */

  function closeMenu() {
    const menu = getMenu();
    const toggle = getMenuToggle();

    if (!menu) {
      return false;
    }

    menu.classList.remove("is-open");

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "menu-open"
    );

    if (toggle) {
      toggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanMenuClosed"
      )
    );

    return true;
  }

  /* =========================================
     Toggle Menu
  ========================================= */

  function toggleMenu() {
    if (isMobileMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* =========================================
     Active Page
  ========================================= */

  function normalizePath(path) {
    if (!path) {
      return "/";
    }

    return path
      .split("?")[0]
      .split("#")[0]
      .replace(/\/+$/, "") || "/";
  }

  function getCurrentPage() {
    const bodyPage =
      document.body?.dataset?.page;

    if (bodyPage) {
      return bodyPage;
    }

    const pathname =
      normalizePath(
        window.location.pathname
      );

    if (
      pathname === "/" ||
      pathname.endsWith("/index.html")
    ) {
      return "home";
    }

    const fileName =
      pathname.split("/").pop();

    return fileName
      ? fileName.replace(".html", "")
      : "";
  }

  function getLinkPage(link) {
    const explicitPage =
      link.getAttribute(
        "data-page"
      );

    if (explicitPage) {
      return explicitPage;
    }

    const href =
      link.getAttribute("href");

    if (!href || href === "#") {
      return "";
    }

    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return "";
    }

    const cleanHref =
      href
        .split("?")[0]
        .split("#")[0];

    if (
      cleanHref === "/" ||
      cleanHref.endsWith("index.html")
    ) {
      return "home";
    }

    const fileName =
      cleanHref.split("/").pop();

    return fileName
      ? fileName.replace(".html", "")
      : "";
  }

  function setActiveNavigation() {
    const currentPage =
      getCurrentPage();

    const links =
      getNavigationLinks();

    links.forEach((link) => {
      const linkPage =
        getLinkPage(link);

      const active =
        linkPage &&
        linkPage === currentPage;

      link.classList.toggle(
        "active",
        Boolean(active)
      );

      if (active) {
        link.setAttribute(
          "aria-current",
          "page"
        );
      } else {
        link.removeAttribute(
          "aria-current"
        );
      }
    });
  }

  /* =========================================
     Close On Navigation
  ========================================= */

  function handleNavigationClick(event) {
    const link =
      event.target.closest(
        SELECTORS.links
      );

    if (!link) {
      return;
    }

    const href =
      link.getAttribute("href");

    if (
      href &&
      href !== "#" &&
      !href.startsWith(
        "javascript:"
      )
    ) {
      closeMenu();
    }
  }

  /* =========================================
     Outside Click
  ========================================= */

  function handleOutsideClick(event) {
    if (!isMobileMenuOpen()) {
      return;
    }

    const menu = getMenu();
    const toggle = getMenuToggle();

    if (
      menu &&
      menu.contains(event.target)
    ) {
      return;
    }

    if (
      toggle &&
      toggle.contains(event.target)
    ) {
      return;
    }

    closeMenu();
  }

  /* =========================================
     Keyboard
  ========================================= */

  function handleKeyboard(event) {
    if (event.key === "Escape") {
      if (isMobileMenuOpen()) {
        closeMenu();

        const toggle =
          getMenuToggle();

        if (toggle) {
          toggle.focus();
        }
      }
    }
  }

  /* =========================================
     Resize
  ========================================= */

  function handleResize() {
    /*
     * Remove mobile-menu state when returning
     * to desktop layout.
     */

    if (
      window.innerWidth > 900 &&
      isMobileMenuOpen()
    ) {
      closeMenu();
    }
  }

  /* =========================================
     Accessibility Setup
  ========================================= */

  function setupAccessibility() {
    const menu = getMenu();
    const toggle = getMenuToggle();

    if (!menu) {
      return;
    }

    if (
      !menu.hasAttribute("aria-hidden")
    ) {
      menu.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    if (toggle) {
      if (
        !toggle.hasAttribute(
          "aria-expanded"
        )
      ) {
        toggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }

      if (
        !toggle.hasAttribute(
          "aria-controls"
        ) &&
        menu.id
      ) {
        toggle.setAttribute(
          "aria-controls",
          menu.id
        );
      }
    }
  }

  /* =========================================
     Event Binding
  ========================================= */

  function bindEvents() {
    document.addEventListener(
      "click",
      (event) => {
        const toggle =
          event.target.closest(
            SELECTORS.menuToggle
          );

        if (toggle) {
          event.preventDefault();
          toggleMenu();
          return;
        }

        const close =
          event.target.closest(
            SELECTORS.close
          );

        if (close) {
          event.preventDefault();
          closeMenu();
          return;
        }

        handleNavigationClick(event);
      }
    );

    document.addEventListener(
      "click",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyboard
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "popstate",
      setActiveNavigation
    );

    document.addEventListener(
      "alDahayanComponentsLoaded",
      () => {
        setupAccessibility();
        setActiveNavigation();
      }
    );

    document.addEventListener(
      "alDahayanLanguageChanged",
      () => {
        setupAccessibility();
        setActiveNavigation();
      }
    );
  }

  /* =========================================
     Initialize
  ========================================= */

  function initializeNavigation() {
    if (initialized) {
      return;
    }

    initialized = true;

    setupAccessibility();

    setActiveNavigation();

    bindEvents();
  }

  /* =========================================
     Public API
  ========================================= */

  window.AlDahayanNavigation = {
    initialize:
      initializeNavigation,

    open:
      openMenu,

    close:
      closeMenu,

    toggle:
      toggleMenu,

    isOpen:
      isMobileMenuOpen,

    setActive:
      setActiveNavigation,

    getCurrentPage:
      getCurrentPage
  };

  window.initializeNavigation =
    initializeNavigation;

  /* =========================================
     DOM Ready
  ========================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      initializeNavigation();
    }
  );

})();
