/* =========================================
   AL-DAHAYAN MODAL SYSTEM
   Centralized, Accessible & Config-Aware
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

  /* =========================================
     MODAL HELPERS
  ========================================= */

  function getModal(
    selector = DEFAULT_SELECTOR
  ) {
    if (!selector) {
      selector = DEFAULT_SELECTOR;
    }

    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn(
        "Al-Dahayan Modal: invalid selector.",
        selector
      );

      return null;
    }
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

  function getFocusableElements(modal) {
    if (!modal) {
      return [];
    }

    return Array.from(
      modal.querySelectorAll(
        [
          "button:not([disabled])",
          "[href]",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ).filter(function (element) {
      return (
        !element.hidden &&
        element.getAttribute(
          "aria-hidden"
        ) !== "true"
      );
    });
  }

  /* =========================================
     CONTENT
  ========================================= */

  function setContent(
    modal,
    options = {}
  ) {
    const elements =
      getElements(modal);

    if (elements.title) {
      elements.title.textContent =
        options.title ||
        "Information";
    }

    if (elements.body) {
      if (
        options.html !== undefined
      ) {
        elements.body.innerHTML =
          options.html;
      } else if (
        options.content !== undefined
      ) {
        elements.body.textContent =
          options.content;
      }
    }

    if (
      elements.footer &&
      options.footerHTML !== undefined
    ) {
      elements.footer.innerHTML =
        options.footerHTML;
    }
  }

  /* =========================================
     ACCESSIBILITY
  ========================================= */

  function prepareModal(modal) {
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

    if (
      !modal.hasAttribute(
        "aria-modal"
      )
    ) {
      modal.setAttribute(
        "aria-modal",
        "true"
      );
    }

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

    if (!modal.hasAttribute("tabindex")) {
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
        "al-dahayan-modal-title-" +
        Math.random()
          .toString(36)
          .slice(2, 9);
    }

    if (
      elements.title &&
      !modal.hasAttribute(
        "aria-labelledby"
      )
    ) {
      modal.setAttribute(
        "aria-labelledby",
        elements.title.id
      );
    }
  }

  /* =========================================
     OPEN
  ========================================= */

  function openModal(
    options = {}
  ) {
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

    const config =
      getEffectiveConfig();

    if (
      config &&
      config.features &&
      config.features.modal === false
    ) {
      return false;
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

    document.body.classList.add(
      "modal-open"
    );

    activeModal = modal;

    const elements =
      getElements(modal);

    const focusTarget =
      elements.close ||
      getFocusableElements(modal)[0] ||
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

  function closeModal() {
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

    document.body.classList.remove(
      "modal-open"
    );

    activeModal = null;

    if (
      previousFocusedElement &&
      document.contains(
        previousFocusedElement
      ) &&
      typeof previousFocusedElement.focus ===
        "function"
    ) {
      window.requestAnimationFrame(
        function () {
          previousFocusedElement.focus();
        }
      );
    }

    previousFocusedElement =
      null;

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
     BUTTON DATA
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
      closeModal();
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

    document
      .querySelectorAll(
        DEFAULT_SELECTOR
      )
      .forEach(function (
        modal
      ) {
        prepareModal(
          modal
        );

        modal.hidden =
          true;

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
      });

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

    getElements:
      getElements,

    getFocusableElements:
      getFocusableElements,

    getActive:
      function () {
        return activeModal;
      },

    isOpen:
      function () {
        return !!activeModal;
      },

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
