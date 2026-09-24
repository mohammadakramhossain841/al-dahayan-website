/* =========================================
   AL-DAHAYAN MODAL SYSTEM
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let activeModal = null;
  let previousFocusedElement = null;

  function getModal(
    selector = "[data-modal]"
  ) {
    return document.querySelector(selector);
  }

  function getElements(modal) {
    if (!modal) {
      return {};
    }

    return {
      overlay: modal.querySelector(
        "[data-modal-overlay]"
      ),

      container: modal.querySelector(
        "[data-modal-container]"
      ),

      title: modal.querySelector(
        "[data-modal-title]"
      ),

      body: modal.querySelector(
        "[data-modal-body]"
      ),

      footer: modal.querySelector(
        "[data-modal-footer]"
      ),

      close: modal.querySelector(
        "[data-modal-close]"
      ),

      cancel: modal.querySelector(
        "[data-modal-cancel]"
      )
    };
  }

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

  function openModal(
    options = {}
  ) {
    const modal =
      options.modal ||
      getModal(
        options.selector ||
          "[data-modal]"
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

    document.body.classList.add(
      "modal-open"
    );

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    activeModal =
      modal;

    const elements =
      getElements(modal);

    if (elements.close) {
      elements.close.focus();
    } else if (
      elements.container
    ) {
      elements.container.focus();
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

    document.body.classList.remove(
      "modal-open"
    );

    activeModal =
      null;

    if (
      previousFocusedElement &&
      typeof previousFocusedElement.focus ===
        "function"
    ) {
      previousFocusedElement.focus();
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

  function handleClick(
    event
  ) {
    const openButton =
      event.target.closest(
        "[data-modal-open]"
      );

    if (openButton) {
      event.preventDefault();

      const title =
        openButton.dataset
          .modalTitle || "";

      const content =
        openButton.dataset
          .modalContent || "";

      const target =
        openButton.dataset
          .modalTarget;

      openModal({
        title,
        content,
        selector:
          target ||
          "[data-modal]"
      });

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
      event.target ===
      elements.overlay
    ) {
      closeModal();
      return;
    }

    if (
      event.target.closest(
        "[data-modal-close]"
      ) ||
      event.target.closest(
        "[data-modal-cancel]"
      )
    ) {
      event.preventDefault();
      closeModal();
    }
  }

  function handleKeydown(
    event
  ) {
    if (!activeModal) {
      return;
    }

    if (
      event.key === "Escape"
    ) {
      event.preventDefault();
      closeModal();
      return;
    }

    if (
      event.key !== "Tab"
    ) {
      return;
    }

    const focusable =
      activeModal.querySelectorAll(
        [
          "button:not([disabled])",
          "[href]",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      );

    if (!focusable.length) {
      event.preventDefault();
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
    } else if (
      !event.shiftKey &&
      document.activeElement ===
        last
    ) {
      event.preventDefault();
      first.focus();
    }
  }

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
        "[data-modal]"
      )
      .forEach((modal) => {
        modal.hidden = true;

        modal.setAttribute(
          "aria-hidden",
          "true"
        );
      });

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanModalReady"
      )
    );
  }

  window.AlDahayanModal = {
    init:
      initializeModal,

    open:
      openModal,

    close:
      closeModal,

    toggle:
      toggleModal,

    get:
      getModal,

    getActive:
      function () {
        return activeModal;
      }
  };

  window.initializeModal =
    initializeModal;

  document.addEventListener(
    "DOMContentLoaded",
    initializeModal
  );

})();
