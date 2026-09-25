/* =========================================
   AL-DAHAYAN MODAL SYSTEM
   Centralized, Accessible & Config-Aware
   Dynamic Component Compatible
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let activeModal = null;
  let previousFocusedElement = null;

  const DEFAULT_SELECTOR = "[data-modal]";

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

    return {};
  }

  function isModalEnabled() {
    const config =
      getEffectiveConfig();

    if (
      config &&
      config.features &&
      config.features.modal === false
    ) {
      return false;
    }

    return true;
  }

  /* =========================================
     LANGUAGE
  ========================================= */

  function translate(
    key,
    fallback = key
  ) {
    if (
      window.AlDahayanLanguage &&
      typeof window.AlDahayanLanguage.translate ===
        "function"
    ) {
      const translated =
        window.AlDahayanLanguage.translate(
          key
        );

      if (
        translated &&
        translated !== key
      ) {
        return translated;
      }
    }

    if (
      typeof window.translate ===
      "function"
    ) {
      const translated =
        window.translate(key);

      if (
        translated &&
        translated !== key
      ) {
        return translated;
      }
    }

    return fallback;
  }

  /* =========================================
     MODAL HELPERS
  ========================================= */

  function getModal(
    selector = DEFAULT_SELECTOR
  ) {
    if (!selector) {
      selector =
        DEFAULT_SELECTOR;
    }

    if (
      selector instanceof
      HTMLElement
    ) {
      return selector;
    }

    try {
      return document.querySelector(
        selector
      );
    } catch (error) {
      console.warn(
        "Al-Dahayan Modal: invalid selector.",
        selector
      );

      return null;
    }
  }

  function getAllModals() {
    return Array.from(
      document.querySelectorAll(
        DEFAULT_SELECTOR
      )
    );
  }

  function getElements(modal) {
    if (!modal) {
      return {};
    }

    return {
      overlay:
        modal.querySelector(
          "[data-modal-overlay]"
        ),

      container:
        modal.querySelector(
          "[data-modal-container]"
        ),

      title:
        modal.querySelector(
          "[data-modal-title]"
        ),

      body:
        modal.querySelector(
          "[data-modal-body]"
        ),

      footer:
        modal.querySelector(
          "[data-modal-footer]"
        ),

      close:
        modal.querySelector(
          "[data-modal-close]"
        ),

      cancel:
        modal.querySelector(
          "[data-modal-cancel]"
        )
    };
  }

  function getFocusableElements(
    modal
  ) {
    if (!modal) {
      return [];
    }

    return Array.from(
      modal.querySelectorAll(
        [
          "button:not([disabled])",
          "[href]:not([aria-disabled='true'])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ).filter(function (
      element
    ) {
      return (
        !element.hidden &&
        element.getAttribute(
          "aria-hidden"
        ) !== "true" &&
        element.offsetParent !== null
      );
    });
  }

  /* =========================================
     ACCESSIBILITY PREPARATION
  ========================================= */

  function createStableId(
    modal,
    prefix
  ) {
    const modalId =
      modal.getAttribute(
        "data-modal-id"
      );

    if (modalId) {
      return (
        prefix +
        "-" +
        String(modalId)
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "-"
          )
      );
    }

    return (
      prefix +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 10)
    );
  }

  function prepareModal(
    modal
  ) {
    if (!modal) {
      return;
    }

    if (
      !modal.hasAttribute("role")
    ) {
      modal.setAttribute(
        "role",
        "dialog"
      );
    }

    modal.setAttribute(
      "aria-modal",
      "true"
    );

    if (
      !modal.hasAttribute(
        "aria-hidden"
      )
    ) {
      modal.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    if (
      !modal.hasAttribute(
        "tabindex"
      )
    ) {
      modal.setAttribute(
        "tabindex",
        "-1"
      );
    }

    const elements =
      getElements(modal);

    if (
      elements.container &&
      !elements.container.hasAttribute(
        "tabindex"
      )
    ) {
      elements.container.setAttribute(
        "tabindex",
        "-1"
      );
    }

    if (
      elements.title &&
      !elements.title.id
    ) {
      elements.title.id =
        createStableId(
          modal,
          "al-dahayan-modal-title"
        );
    }

    if (
      elements.title
    ) {
      modal.setAttribute(
        "aria-labelledby",
        elements.title.id
      );
    }

    if (
      elements.body &&
      !elements.body.id
    ) {
      elements.body.id =
        createStableId(
          modal,
          "al-dahayan-modal-body"
        );
    }

    if (
      elements.body
    ) {
      modal.setAttribute(
        "aria-describedby",
        elements.body.id
      );
    }
  }

  function prepareAllModals() {
    getAllModals().forEach(
      function (modal) {
        prepareModal(modal);

        if (
          modal !== activeModal
        ) {
          modal.hidden = true;

          modal.classList.remove(
            "is-open"
          );

          modal.setAttribute(
            "aria-hidden",
            "true"
          );

          modal.setAttribute(
            "data-modal-open",
            "false"
          );
        }
      }
    );
  }

  /* =========================================
     CONTENT
  ========================================= */

  function setContent(
    modal,
    options = {}
  ) {
    if (!modal) {
      return false;
    }

    prepareModal(modal);

    const elements =
      getElements(modal);

    const titleKey =
      options.titleKey ||
      "";

    const title =
      options.title !== undefined
        ? options.title
        : titleKey
          ? translate(
              titleKey,
              translate(
                "information",
                "Information"
              )
            )
          : translate(
              "information",
              "Information"
            );

    if (elements.title) {
      elements.title.textContent =
        title;
    }

    if (elements.body) {
      if (
        options.html !== undefined
      ) {
        elements.body.innerHTML =
          String(options.html);
      } else if (
        options.content !== undefined
      ) {
        elements.body.textContent =
          String(options.content);
      }
    }

    if (
      elements.footer &&
      options.footerHTML !== undefined
    ) {
      elements.footer.innerHTML =
        String(options.footerHTML);
    }

    return true;
  }

  /* =========================================
     OPEN
  ========================================= */

  function openModal(
    options = {}
  ) {
    if (!isModalEnabled()) {
      return false;
    }

    const modal =
      options.modal ||
      getModal(
        options.selector ||
          DEFAULT_SELECTOR
      );

    if (!modal) {
      console.warn(
        "Al-Dahayan Modal: modal element not found."
      );

      return false;
    }

    if (activeModal) {
      closeModal();
    }

    prepareModal(modal);

    previousFocusedElement =
      document.activeElement;

    setContent(
      modal,
      options
    );

    modal.hidden = false;

    modal.classList.add(
      "is-open"
    );

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    modal.setAttribute(
      "data-modal-open",
      "true"
    );

    if (document.body) {
      document.body.classList.add(
        "modal-open"
      );

      document.body.setAttribute(
        "data-modal-active",
        "true"
      );
    }

    activeModal = modal;

    const elements =
      getElements(modal);

    const focusable =
      getFocusableElements(
        modal
      );

    const focusTarget =
      elements.close ||
      focusable[0] ||
      elements.container ||
      modal;

    if (
      focusTarget &&
      typeof focusTarget.focus ===
        "function"
    ) {
      window.requestAnimationFrame(
        function () {
          focusTarget.focus();
        }
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanModalOpened",
        {
          detail: {
            modal,
            options
          }
        }
      )
    );

    return true;
  }

  /* =========================================
     CLOSE
  ========================================= */

  function closeModal(
    options = {}
  ) {
    if (!activeModal) {
      return false;
    }

    const modal =
      activeModal;

    modal.classList.remove(
      "is-open"
    );

    modal.hidden = true;

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    modal.setAttribute(
      "data-modal-open",
      "false"
    );

    if (document.body) {
      document.body.classList.remove(
        "modal-open"
      );

      document.body.setAttribute(
        "data-modal-active",
        "false"
      );
    }

    activeModal = null;

    const restoreFocus =
      options.restoreFocus !==
      false;

    const focusTarget =
      previousFocusedElement;

    previousFocusedElement =
      null;

    if (
      restoreFocus &&
      focusTarget &&
      document.contains(
        focusTarget
      ) &&
      typeof focusTarget.focus ===
        "function"
    ) {
      window.requestAnimationFrame(
        function () {
          focusTarget.focus();
        }
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanModalClosed",
        {
          detail: {
            modal
          }
        }
      )
    );

    return true;
  }

  /* =========================================
     TOGGLE
  ========================================= */

  function toggleModal(
    options = {}
  ) {
    if (activeModal) {
      return closeModal();
    }

    return openModal(
      options
    );
  }

  /* =========================================
     BUTTON OPTIONS
  ========================================= */

  function getButtonOptions(
    button
  ) {
    if (!button) {
      return {};
    }

    const title =
      button.dataset
        .modalTitle || "";

    const titleKey =
      button.dataset
        .modalTitleKey || "";

    const content =
      button.dataset
        .modalContent || "";

    const html =
      button.dataset
        .modalHtml;

    const footerHTML =
      button.dataset
        .modalFooter || "";

    const target =
      button.dataset
        .modalTarget;

    const options = {
      title,
      titleKey,
      selector:
        target ||
        DEFAULT_SELECTOR
    };

    if (
      html !== undefined
    ) {
      options.html = html;
    } else {
      options.content =
        content;
    }

    if (
      footerHTML
    ) {
      options.footerHTML =
        footerHTML;
    }

    return options;
  }

  /* =========================================
     CLICK HANDLER
  ========================================= */

  function handleClick(
    event
  ) {
    const target =
      event.target;

    if (
      !target ||
      typeof target.closest !==
        "function"
    ) {
      return;
    }

    const openButton =
      target.closest(
        "[data-modal-open]"
      );

    if (openButton) {
      event.preventDefault();

      openModal(
        getButtonOptions(
          openButton
        )
      );

      return;
    }

    if (!activeModal) {
      return;
    }

    const elements =
      getElements(
        activeModal
      );

    if (
      elements.overlay &&
      target ===
        elements.overlay
    ) {
      if (
        activeModal.getAttribute(
          "data-modal-static"
        ) !== "true"
      ) {
        closeModal();
      }

      return;
    }

    if (
      target.closest(
        "[data-modal-close]"
      ) ||
      target.closest(
        "[data-modal-cancel]"
      )
    ) {
      event.preventDefault();

      closeModal();
    }
  }

  /* =========================================
     KEYBOARD
  ========================================= */

  function handleKeydown(
    event
  ) {
    if (!activeModal) {
      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      if (
        activeModal.getAttribute(
          "data-modal-static"
        ) === "true"
      ) {
        return;
      }

      event.preventDefault();

      closeModal();

      return;
    }

    if (
      event.key !==
      "Tab"
    ) {
      return;
    }

    const focusable =
      getFocusableElements(
        activeModal
      );

    if (!focusable.length) {
      event.preventDefault();

      const elements =
        getElements(
          activeModal
        );

      const fallback =
        elements.container ||
        activeModal;

      if (
        fallback &&
        typeof fallback.focus ===
          "function"
      ) {
        fallback.focus();
      }

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
      document.activeElement ===
        first
    ) {
      event.preventDefault();

      last.focus();

      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement ===
        last
    ) {
      event.preventDefault();

      first.focus();
    }
  }

  /* =========================================
     DYNAMIC COMPONENT SYNC
  ========================================= */

  function handleComponentsLoaded() {
    prepareAllModals();

    if (
      activeModal &&
      document.contains(
        activeModal
      )
    ) {
      prepareModal(
        activeModal
      );
    }
  }

  /* =========================================
     LANGUAGE SYNC
  ========================================= */

  function handleLanguageChange() {
    prepareAllModals();

    if (
      activeModal &&
      document.contains(
        activeModal
      )
    ) {
      prepareModal(
        activeModal
      );
    }
  }

  /* =========================================
     CONFIG SYNC
  ========================================= */

  function handleConfigUpdate() {
    if (!isModalEnabled()) {
      if (activeModal) {
        closeModal({
          restoreFocus: false
        });
      }
    }

    prepareAllModals();
  }

  /* =========================================
     INITIALIZATION
  ========================================= */

  function initializeModal() {
    if (initialized) {
      return;
    }

    initialized = true;

    document.addEventListener(
      "click",
      handleClick
    );

    document.addEventListener(
      "keydown",
      handleKeydown
    );

    document.addEventListener(
      "alDahayanComponentsLoaded",
      handleComponentsLoaded
    );

    document.addEventListener(
      "alDahayanLanguageChanged",
      handleLanguageChange
    );

    document.addEventListener(
      "alDahayanLanguageApplied",
      handleLanguageChange
    );

    document.addEventListener(
      "alDahayanConfigUpdated",
      handleConfigUpdate
    );

    document.addEventListener(
      "alDahayanSettingsUpdated",
      handleConfigUpdate
    );

    prepareAllModals();

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanModalReady"
      )
    );
  }

  /* =========================================
     PUBLIC API
  ========================================= */

  window.AlDahayanModal = {

    init:
      initializeModal,

    initialize:
      initializeModal,

    open:
      openModal,

    close:
      closeModal,

    toggle:
      toggleModal,

    setContent:
      setContent,

    get:
      getModal,

    getAll:
      getAllModals,

    getElements:
      getElements,

    getFocusableElements:
      getFocusableElements,

    prepare:
      prepareModal,

    prepareAll:
      prepareAllModals,

    getActive:
      function () {
        return activeModal;
      },

    isOpen:
      function () {
        return !!activeModal;
      },

    isEnabled:
      isModalEnabled,

    isInitialized:
      function () {
        return initialized;
      }
  };

  /* =========================================
     LEGACY GLOBAL SUPPORT
  ========================================= */

  window.initializeModal =
    initializeModal;

  /* =========================================
     DOM READY
  ========================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeModal,
      {
        once: true
      }
    );
  } else {
    initializeModal();
  }

})();
