/* =========================================
   AL-DAHAYAN NAVIGATION SYSTEM
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let eventsBound = false;
  let lastFocusedElement = null;

  const MOBILE_BREAKPOINT = 900;

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
      menu.getAttribute("aria-hidden") === "false"
    );
  }

  function isMobileViewport() {
    return (
      window.innerWidth <= MOBILE_BREAKPOINT
    );
  }

  function isModifiedClick(event) {
    return (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    );
  }

  function isExternalLink(link) {
    if (!link) {
      return false;
    }

    const href =
      link.getAttribute("href") || "";

    return (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    );
  }

  function isHashLink(link) {
    if (!link) {
      return false;
    }

    const href =
      link.getAttribute("href") || "";

    return (
      href === "#" ||
      href.startsWith("#")
    );
  }

  /* =========================================
     Navigation
  ========================================= */

  function navigateTo(path) {
    if (!path) {
      return;
    }

    window.location.href = path;
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

    lastFocusedElement =
      document.activeElement;

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

    const closeButton =
      getCloseButton();

    if (closeButton) {
      window.requestAnimationFrame(() => {
        try {
          closeButton.focus();
        } catch (error) {
          /* Ignore focus errors */
        }
      });
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

  function closeMenu(
    restoreFocus = false
  ) {
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

    /*
     * Do not use hidden immediately here.
     * CSS can control the closing animation.
     */

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

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus ===
        "function"
    ) {
      window.requestAnimationFrame(() => {
        try {
          lastFocusedElement.focus();
        } catch (error) {
          /* Ignore focus errors */
        }
      });
    }

    lastFocusedElement = null;

    return true;
  }

  /* =========================================
     Toggle Menu
  ========================================= */

  function toggleMenu() {
    if (isMobileMenuOpen()) {
      closeMenu(true);
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

    try {
      const parsed =
        new URL(path, window.location.href);

      return (
        parsed.pathname
          .split("?")[0]
          .split("#")[0]
          .replace(/\/+$/, "") || "/"
      );
    } catch (error) {
      return (
        String(path)
          .split("?")[0]
          .split("#")[0]
          .replace(/\/+$/, "") || "/"
      );
    }
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

    if (!fileName) {
      return "";
    }

    return fileName
      .replace(/\.html$/i, "")
      .toLowerCase();
  }

  function getLinkPage(link) {
    if (!link) {
      return "";
    }

    const explicitPage =
      link.getAttribute("data-page");

    if (explicitPage) {
      return explicitPage
        .trim()
        .toLowerCase();
    }

    const href =
      link.getAttribute("href");

    if (
      !href ||
      href === "#" ||
      href.startsWith("javascript:")
    ) {
      return "";
    }

    if (isExternalLink(link)) {
      return "";
    }

    let cleanHref = href;

    try {
      const url =
        new URL(
          href,
          window.location.href
        );

      cleanHref = url.pathname;
    } catch (error) {
      cleanHref = href
        .split("?")[0]
        .split("#")[0];
    }

    cleanHref =
      cleanHref
        .split("?")[0]
        .split("#")[0];

    if (
      cleanHref === "/" ||
      cleanHref.endsWith("/") ||
      cleanHref.endsWith("index.html")
    ) {
      return "home";
    }

    const fileName =
      cleanHref.split("/").pop();

    return fileName
      ? fileName
          .replace(/\.html$/i, "")
          .toLowerCase()
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
        Boolean(
          linkPage &&
          currentPage &&
          linkPage ===
            currentPage.toLowerCase()
        );

      link.classList.toggle(
        "active",
        active
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

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanNavigationUpdated",
        {
          detail: {
            currentPage,
            links
          }
        }
      )
    );
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
      link.getAttribute("href") || "";

    /*
     * Keep external links, mail and telephone
     * links working normally.
     */

    if (
      isExternalLink(link) ||
      isHashLink(link)
    ) {
      if (
        isMobileMenuOpen() &&
        href !== "#"
      ) {
        closeMenu();
      }

      return;
    }

    if (
      href &&
      href !== "#" &&
      !href.startsWith("javascript:")
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

    closeMenu(true);
  }

  /* =========================================
     Keyboard
  ========================================= */

  function getFocusableElements() {
    const menu = getMenu();

    if (!menu) {
      return [];
    }

    return Array.from(
      menu.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      const style =
        window.getComputedStyle(
          element
        );

      return (
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });
  }

  function handleKeyboard(event) {
    if (!isMobileMenuOpen()) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      closeMenu(true);

      return;
    }

    /*
     * Keep keyboard focus inside the open
     * mobile navigation.
     */

    if (event.key === "Tab") {
      const focusable =
        getFocusableElements();

      if (!focusable.length) {
        return;
      }

      const first =
        focusable[0];

      const last =
        focusable[
          focusable.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();

        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  /* =========================================
     Resize
  ========================================= */

  function handleResize() {
    /*
     * Reset mobile menu when returning
     * to desktop layout.
     */

    if (
      window.innerWidth >
        MOBILE_BREAKPOINT &&
      isMobileMenuOpen()
    ) {
      closeMenu(false);
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

    if (!menu.id) {
      menu.id = "al-dahayan-mobile-menu";
    }

    if (
      !menu.hasAttribute("aria-hidden")
    ) {
      menu.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    if (menu.hasAttribute("hidden")) {
      menu.removeAttribute("hidden");
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
        )
      ) {
        toggle.setAttribute(
          "aria-controls",
          menu.id
        );
      }

      if (
        !toggle.hasAttribute("type") &&
        toggle.tagName === "BUTTON"
      ) {
        toggle.setAttribute(
          "type",
          "button"
        );
      }
    }
  }

  /* =========================================
     Dynamic Navigation Refresh
  ========================================= */

  function refreshNavigation() {
    setupAccessibility();
    setActiveNavigation();

    if (
      !isMobileViewport() &&
      isMobileMenuOpen()
    ) {
      closeMenu(false);
    }
  }

  /* =========================================
     Event Binding
  ========================================= */

  function bindEvents() {
    if (eventsBound) {
      return;
    }

    eventsBound = true;

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

          closeMenu(true);

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

    window.addEventListener(
      "hashchange",
      setActiveNavigation
    );

    document.addEventListener(
      "alDahayanComponentsLoaded",
      refreshNavigation
    );

    document.addEventListener(
      "alDahayanLanguageChanged",
      refreshNavigation
    );

    document.addEventListener(
      "alDahayanConfigUpdated",
      refreshNavigation
    );

    document.addEventListener(
      "alDahayanNavigationRefresh",
      refreshNavigation
    );
  }

  /* =========================================
     Initialize
  ========================================= */

  function initializeNavigation() {
    if (!initialized) {
      initialized = true;
      bindEvents();
    }

    setupAccessibility();
    setActiveNavigation();

    return true;
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

    refresh:
      refreshNavigation,

    navigateTo:
      navigateTo,

    getCurrentPage:
      getCurrentPage,

    getNavigationLinks:
      getNavigationLinks,

    isMobileViewport:
      isMobileViewport,

    isInitialized:
      function () {
        return initialized;
      }
  };

  /*
   * Backward compatibility
   */
  window.initializeNavigation =
    initializeNavigation;

  /* =========================================
     DOM Ready
  ========================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeNavigation,
      {
        once: true
      }
    );
  } else {
    initializeNavigation();
  }

})();
