/* =========================================
   AL-DAHAYAN CUSTOMER INQUIRY SYSTEM
========================================= */

(function () {
  "use strict";

  let initialized = false;

  const STORAGE_KEY =
    "alDahayanInquiries";

  const state = {
    submitting: false
  };

  function normalize(value) {
    return String(value ?? "").trim();
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getElements() {
    return {
      form: document.querySelector(
        "[data-inquiry-form]"
      ),

      name: document.querySelector(
        "[data-inquiry-name]"
      ),

      phone: document.querySelector(
        "[data-inquiry-phone]"
      ),

      email: document.querySelector(
        "[data-inquiry-email]"
      ),

      oem: document.querySelector(
        "[data-inquiry-oem]"
      ),

      partName: document.querySelector(
        "[data-inquiry-part-name]"
      ),

      quantity: document.querySelector(
        "[data-inquiry-quantity]"
      ),

      make: document.querySelector(
        "[data-inquiry-make]"
      ),

      model: document.querySelector(
        "[data-inquiry-model]"
      ),

      year: document.querySelector(
        "[data-inquiry-year]"
      ),

      engine: document.querySelector(
        "[data-inquiry-engine]"
      ),

      vin: document.querySelector(
        "[data-inquiry-vin]"
      ),

      message: document.querySelector(
        "[data-inquiry-message]"
      ),

      consent: document.querySelector(
        "[data-inquiry-consent]"
      ),

      submit: document.querySelector(
        "[data-inquiry-submit]"
      ),

      reset: document.querySelector(
        "[data-inquiry-reset]"
      ),

      status: document.querySelector(
        "[data-inquiry-status]"
      )
    };
  }

  function generateId() {
    return (
      "INQ-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()
    );
  }

  function getStoredInquiries() {
    try {
      const data =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!data) {
        return [];
      }

      const parsed =
        JSON.parse(data);

      return Array.isArray(parsed)
        ? parsed
        : [];

    } catch (error) {
      console.error(
        "Al-Dahayan Inquiry:",
        error
      );

      return [];
    }
  }

  function saveStoredInquiries(
    inquiries
  ) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(inquiries)
      );

      return true;

    } catch (error) {
      console.error(
        "Al-Dahayan Inquiry:",
        error
      );

      return false;
    }
  }

  function collectFormData() {
    const elements =
      getElements();

    return {
      id: generateId(),

      createdAt:
        new Date().toISOString(),

      status: "new",

      customer: {
        name:
          normalize(
            elements.name?.value
          ),

        phone:
          normalize(
            elements.phone?.value
          ),

        email:
          normalize(
            elements.email?.value
          )
      },

      part: {
        oem:
          normalize(
            elements.oem?.value
          ),

        name:
          normalize(
            elements.partName?.value
          ),

        quantity:
          Number(
            elements.quantity?.value ||
              1
          )
      },

      vehicle: {
        make:
          normalize(
            elements.make?.value
          ),

        model:
          normalize(
            elements.model?.value
          ),

        year:
          normalize(
            elements.year?.value
          ),

        engine:
          normalize(
            elements.engine?.value
          ),

        vin:
          normalize(
            elements.vin?.value
          )
      },

      message:
        normalize(
          elements.message?.value
        ),

      consent:
        Boolean(
          elements.consent?.checked
        )
    };
  }

  function validatePhone(phone) {
    const value =
      normalize(phone);

    if (!value) {
      return false;
    }

    const digits =
      value.replace(
        /[^\d+]/g,
        ""
      );

    return (
      digits.length >= 7 &&
      digits.length <= 20
    );
  }

  function validateVIN(vin) {
    const value =
      normalize(vin).toUpperCase();

    if (!value) {
      return true;
    }

    if (value.length !== 17) {
      return false;
    }

    return /^[A-HJ-NPR-Z0-9]{17}$/.test(
      value
    );
  }

  function validateInquiry(data) {
    const errors = [];

    if (!data.customer.name) {
      errors.push(
        "Customer name is required."
      );
    }

    if (
      !validatePhone(
        data.customer.phone
      )
    ) {
      errors.push(
        "A valid phone number is required."
      );
    }

    if (
      data.customer.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        data.customer.email
      )
    ) {
      errors.push(
        "Please enter a valid email address."
      );
    }

    if (
      !data.part.oem &&
      !data.part.name
    ) {
      errors.push(
        "Please provide an OEM number or part name."
      );
    }

    if (
      !Number.isFinite(
        data.part.quantity
      ) ||
      data.part.quantity < 1
    ) {
      errors.push(
        "Quantity must be at least 1."
      );
    }

    if (
      !validateVIN(
        data.vehicle.vin
      )
    ) {
      errors.push(
        "VIN must contain 17 valid characters."
      );
    }

    if (!data.consent) {
      errors.push(
        "Please accept the inquiry consent."
      );
    }

    return errors;
  }

  function showStatus(
    message,
    type = "info"
  ) {
    const elements =
      getElements();

    if (!elements.status) {
      return;
    }

    elements.status.textContent =
      message;

    elements.status.className =
      `inquiry-status ${type}`;

    elements.status.hidden = false;
  }

  function clearStatus() {
    const elements =
      getElements();

    if (!elements.status) {
      return;
    }

    elements.status.textContent = "";
    elements.status.className =
      "inquiry-status";
    elements.status.hidden = true;
  }

  function setSubmitting(
    submitting
  ) {
    state.submitting =
      submitting;

    const elements =
      getElements();

    if (
      elements.submit
    ) {
      elements.submit.disabled =
        submitting;

      elements.submit.textContent =
        submitting
          ? "Submitting..."
          : "Submit Inquiry";
    }
  }

  function saveInquiry(data) {
    const inquiries =
      getStoredInquiries();

    inquiries.push(data);

    return saveStoredInquiries(
      inquiries
    );
  }

  function getCompanyContact() {
    const config =
      window.APP_CONFIG;

    return {
      whatsapp:
        config?.contact?.whatsapp ||
        "",

      phone:
        config?.contact?.phone ||
        "",

      email:
        config?.contact?.email ||
        ""
    };
  }

  function buildWhatsAppMessage(
    data
  ) {
    const lines = [
      "Al-Dahayan Trading Company - Spare Parts Inquiry",
      "",
      `Inquiry ID: ${data.id}`,
      "",
      "Customer Information",
      `Name: ${data.customer.name}`,
      `Phone: ${data.customer.phone}`
    ];

    if (data.customer.email) {
      lines.push(
        `Email: ${data.customer.email}`
      );
    }

    lines.push(
      "",
      "Part Information",
      `OEM: ${data.part.oem || "N/A"}`,
      `Part Name: ${data.part.name || "N/A"}`,
      `Quantity: ${data.part.quantity}`,
      "",
      "Vehicle Information",
      `Make: ${data.vehicle.make || "N/A"}`,
      `Model: ${data.vehicle.model || "N/A"}`,
      `Year: ${data.vehicle.year || "N/A"}`,
      `Engine: ${data.vehicle.engine || "N/A"}`,
      `VIN: ${data.vehicle.vin || "N/A"}`
    );

    if (data.message) {
      lines.push(
        "",
        "Customer Message",
        data.message
      );
    }

    return lines.join("\n");
  }

  function getWhatsAppURL(
    data
  ) {
    const contact =
      getCompanyContact();

    const whatsapp =
      normalize(
        contact.whatsapp
      ).replace(
        /[^\d]/g,
        ""
      );

    if (!whatsapp) {
      return "";
    }

    const message =
      buildWhatsAppMessage(
        data
      );

    return (
      "https://wa.me/" +
      whatsapp +
      "?text=" +
      encodeURIComponent(
        message
      )
    );
  }

  function emitInquiryEvent(
    data
  ) {
    document.dispatchEvent(
      new CustomEvent(
        "alDahayanInquirySubmitted",
        {
          detail: {
            inquiry: data
          }
        }
      )
    );
  }

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (state.submitting) {
      return;
    }

    clearStatus();

    const data =
      collectFormData();

    const errors =
      validateInquiry(data);

    if (errors.length) {
      showStatus(
        errors.join(" "),
        "error"
      );

      return;
    }

    setSubmitting(true);

    try {
      const saved =
        saveInquiry(data);

      if (!saved) {
        showStatus(
          "Unable to save your inquiry on this device.",
          "error"
        );

        return;
      }

      emitInquiryEvent(
        data
      );

      const whatsappURL =
        getWhatsAppURL(
          data
        );

      if (whatsappURL) {
        showStatus(
          "Inquiry saved. Opening WhatsApp...",
          "success"
        );

        window.setTimeout(
          () => {
            window.open(
              whatsappURL,
              "_blank",
              "noopener,noreferrer"
            );
          },
          250
        );
      } else {
        showStatus(
          "Inquiry submitted successfully.",
          "success"
        );
      }

      document.dispatchEvent(
        new CustomEvent(
          "alDahayanInquirySuccess",
          {
            detail: {
              inquiry: data,
              whatsappURL
            }
          }
        )
      );

    } catch (error) {
      console.error(
        "Al-Dahayan Inquiry:",
        error
      );

      showStatus(
        "Something went wrong. Please try again.",
        "error"
      );

    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    const elements =
      getElements();

    if (elements.form) {
      elements.form.reset();
    }

    clearStatus();
  }

  function prefillFromURL() {
    const elements =
      getElements();

    if (!elements.form) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const oem =
      params.get("oem");

    const part =
      params.get("part");

    const vehicle =
      params.get("vehicle");

    if (
      oem &&
      elements.oem
    ) {
      elements.oem.value =
        oem;
    }

    if (
      part &&
      elements.partName
    ) {
      elements.partName.value =
        part;
    }

    if (
      vehicle &&
      elements.model
    ) {
      elements.model.value =
        vehicle;
    }
  }

  function bindEvents() {
    const elements =
      getElements();

    elements.form?.addEventListener(
      "submit",
      handleSubmit
    );

    elements.reset?.addEventListener(
      "click",
      resetForm
    );
  }

  function initializeInquiry() {
    if (initialized) {
      return;
    }

    initialized = true;

    bindEvents();
    prefillFromURL();

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanInquiryReady"
      )
    );
  }

  window.AlDahayanInquiry = {
    init:
      initializeInquiry,

    collect:
      collectFormData,

    validate:
      validateInquiry,

    save:
      saveInquiry,

    getAll:
      getStoredInquiries,

    clear: function () {
      try {
        localStorage.removeItem(
          STORAGE_KEY
        );

        return true;
      } catch (error) {
        console.error(
          "Al-Dahayan Inquiry:",
          error
        );

        return false;
      }
    },

    buildWhatsAppMessage:
      buildWhatsAppMessage,

    getWhatsAppURL:
      getWhatsAppURL,

    reset:
      resetForm
  };

  window.initializeInquiry =
    initializeInquiry;

  document.addEventListener(
    "DOMContentLoaded",
    initializeInquiry
  );

})();
