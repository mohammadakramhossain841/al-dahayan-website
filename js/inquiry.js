/* =========================================
   AL-DAHAYAN CUSTOMER INQUIRY SYSTEM
   STEP 14 — CUSTOMER INQUIRY & LEAD MANAGEMENT
========================================= */

(function () {
  "use strict";

  let initialized = false;

  const STORAGE_KEY =
    "alDahayanInquiries";

  const state = {
    submitting: false
  };

  /* =========================================
     CONFIG
  ========================================= */

  function getConfig() {
    return (
      window.AlDahayanConfig ||
      window.APP_CONFIG ||
      {}
    );
  }

  function getInquiryConfig() {
    return (
      getConfig().inquiry || {
        enabled: true,
        collectCustomerName: true,
        collectContact: true,
        collectPart: true,
        collectOEM: true,
        collectVehicle: true,
        collectModelYear: true,
        collectQuantity: true,
        collectMessage: true,
        collectCustomerLocation: false,
        defaultStatus: "new",
        defaultCommunicationStatus:
          "not_contacted"
      }
    );
  }

  function isEnabled() {
    return (
      getInquiryConfig().enabled !== false
    );
  }

  /* =========================================
     HELPERS
  ========================================= */

  function normalize(value) {
    return String(value ?? "").trim();
  }

  function normalizeLower(value) {
    return normalize(value).toLowerCase();
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

  function getNowISO() {
    return new Date().toISOString();
  }

  /* =========================================
     DOM ELEMENTS
  ========================================= */

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

      partId: document.querySelector(
        "[data-inquiry-part-id]"
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

  /* =========================================
     STORAGE
  ========================================= */

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

  /* =========================================
     URL PREFILL
  ========================================= */

  function getURLParams() {
    return new URLSearchParams(
      window.location.search
    );
  }

  function prefillFromURL() {
    const elements =
      getElements();

    if (!elements.form) {
      return;
    }

    const params =
      getURLParams();

    const oem =
      params.get("oem") ||
      params.get("oemNumber");

    const part =
      params.get("part") ||
      params.get("partName");

    const partId =
      params.get("partId");

    const vehicle =
      params.get("vehicle");

    const make =
      params.get("make");

    const model =
      params.get("model");

    const year =
      params.get("year") ||
      params.get("modelYear");

    const quantity =
      params.get("quantity") ||
      params.get("qty");

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
      partId &&
      elements.partId
    ) {
      elements.partId.value =
        partId;
    }

    if (
      make &&
      elements.make
    ) {
      elements.make.value =
        make;
    }

    if (
      model &&
      elements.model
    ) {
      elements.model.value =
        model;
    }

    if (
      vehicle &&
      elements.model &&
      !elements.model.value
    ) {
      elements.model.value =
        vehicle;
    }

    if (
      year &&
      elements.year
    ) {
      elements.year.value =
        year;
    }

    if (
      quantity &&
      elements.quantity
    ) {
      elements.quantity.value =
        quantity;
    }

    /*
      If the part came from Inventory/Search,
      automatically load its verified details.
    */
    if (partId) {
      applyPartFromInventory(
        partId
      );
    }
  }

  /* =========================================
     INVENTORY CONNECTION
  ========================================= */

  function getInventoryModule() {
    return (
      window.AlDahayanInventory ||
      null
    );
  }

  function getInventoryAvailability(
    partId,
    oem
  ) {
    const inventory =
      getInventoryModule();

    if (
      !inventory ||
      typeof inventory.getVerifiedAvailability !==
        "function"
    ) {
      return {
        verified: false,
        status: "unknown",
        statusLabel:
          "Availability To Be Confirmed",
        message:
          "Final availability will be confirmed by Al-Dahayan."
      };
    }

    return inventory.getVerifiedAvailability(
      {
        partId,
        oemNumber: oem
      }
    );
  }

  function findPartFromInventory(
    partId
  ) {
    const inventory =
      getInventoryModule();

    if (
      !inventory ||
      typeof inventory.getParts !==
        "function"
    ) {
      return null;
    }

    const parts =
      inventory.getParts();

    return (
      parts.find(
        (part) =>
          normalizeLower(
            part?.id ||
            part?.partId ||
            part?.part_id ||
            ""
          ) ===
          normalizeLower(partId)
      ) || null
    );
  }

  function applyPartFromInventory(
    partId
  ) {
    const part =
      findPartFromInventory(
        partId
      );

    if (!part) {
      return;
    }

    const elements =
      getElements();

    const partName =
      part.partName ||
      part.name ||
      "";

    const oem =
      part.oemNumber ||
      part.oem ||
      part.partNumber ||
      "";

    const brand =
      part.brand ||
      "";

    const model =
      Array.isArray(part.model)
        ? part.model.join(", ")
        : part.model || "";

    if (
      elements.partName &&
      !elements.partName.value
    ) {
      elements.partName.value =
        partName;
    }

    if (
      elements.oem &&
      !elements.oem.value
    ) {
      elements.oem.value =
        oem;
    }

    if (
      elements.make &&
      !elements.make.value &&
      brand
    ) {
      elements.make.value =
        brand;
    }

    if (
      elements.model &&
      !elements.model.value &&
      model
    ) {
      elements.model.value =
        model;
    }
  }

  /* =========================================
     COLLECT FORM DATA
  ========================================= */

  function collectFormData() {
    const elements =
      getElements();

    const config =
      getInquiryConfig();

    const partId =
      normalize(
        elements.partId?.value
      );

    const partName =
      normalize(
        elements.partName?.value
      );

    const oem =
      normalize(
        elements.oem?.value
      );

    const quantityValue =
      Number(
        elements.quantity?.value ||
          1
      );

    const inventory =
      getInventoryAvailability(
        partId,
        oem
      );

    const data = {
      id: generateId(),

      createdAt:
        getNowISO(),

      updatedAt:
        getNowISO(),

      status:
        config.defaultStatus ||
        "new",

      communicationStatus:
        config.defaultCommunicationStatus ||
        "not_contacted",

      priority:
        "normal",

      assignedTo:
        "",

      followUpDate:
        "",

      quotationStatus:
        "not_quoted",

      source:
        "website",

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
        id:
          partId,

        oem:
          oem,

        name:
          partName,

        quantity:
          quantityValue
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

      inventory: {
        verified:
          inventory.verified === true,

        status:
          inventory.status ||
          "unknown",

        statusLabel:
          inventory.statusLabel ||
          "Availability To Be Confirmed",

        message:
          inventory.message ||
          "Final availability will be confirmed by Al-Dahayan."
      },

      notes:
        "",

      consent:
        Boolean(
          elements.consent?.checked
        )
    };

    /*
      Customer location is intentionally
      NOT collected or stored.
    */

    return data;
  }

  /* =========================================
     VALIDATION
  ========================================= */

  function validatePhone(
    phone
  ) {
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

  function validateVIN(
    vin
  ) {
    const value =
      normalize(vin).toUpperCase();

    if (!value) {
      return true;
    }

    if (
      value.length !== 17
    ) {
      return false;
    }

    return /^[A-HJ-NPR-Z0-9]{17}$/.test(
      value
    );
  }

  function validateInquiry(
    data
  ) {
    const errors = [];

    const config =
      getInquiryConfig();

    if (
      config.collectCustomerName !==
        false &&
      !data.customer.name
    ) {
      errors.push(
        "Customer name is required."
      );
    }

    if (
      config.collectContact !==
        false &&
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
      config.collectOEM !== false &&
      !data.part.oem &&
      !data.part.name
    ) {
      errors.push(
        "Please provide an OEM number or part name."
      );
    }

    if (
      config.collectQuantity !==
        false &&
      (
        !Number.isFinite(
          data.part.quantity
        ) ||
        data.part.quantity < 1
      )
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

    if (
      !data.consent
    ) {
      errors.push(
        "Please accept the inquiry consent."
      );
    }

    return errors;
  }

  /* =========================================
     STATUS UI
  ========================================= */

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

    elements.status.hidden =
      false;
  }

  function clearStatus() {
    const elements =
      getElements();

    if (!elements.status) {
      return;
    }

    elements.status.textContent =
      "";

    elements.status.className =
      "inquiry-status";

    elements.status.hidden =
      true;
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

  /* =========================================
     SAVE INQUIRY
  ========================================= */

  function saveInquiry(
    data
  ) {
    const inquiries =
      getStoredInquiries();

    inquiries.push(data);

    return saveStoredInquiries(
      inquiries
    );
  }

  /* =========================================
     COMPANY CONTACT
  ========================================= */

  function getCompanyContact() {
    const config =
      getConfig();

    const contact =
      config.contact || {};

    return {
      whatsapp:
        contact.whatsapp ||
        "",

      phone:
        contact.phone ||
        "",

      email:
        contact.email ||
        ""
    };
  }

  /* =========================================
     WHATSAPP MESSAGE
  ========================================= */

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

    if (
      data.customer.email
    ) {
      lines.push(
        `Email: ${data.customer.email}`
      );
    }

    lines.push(
      "",
      "Part Information",
      `OEM: ${
        data.part.oem ||
        "N/A"
      }`,
      `Part Name: ${
        data.part.name ||
        "N/A"
      }`,
      `Quantity: ${
        data.part.quantity
      }`
    );

    if (
      data.part.id
    ) {
      lines.push(
        `Part ID: ${data.part.id}`
      );
    }

    lines.push(
      "",
      "Vehicle Information",
      `Make: ${
        data.vehicle.make ||
        "N/A"
      }`,
      `Model: ${
        data.vehicle.model ||
        "N/A"
      }`,
      `Year: ${
        data.vehicle.year ||
        "N/A"
      }`,
      `Engine: ${
        data.vehicle.engine ||
        "N/A"
      }`,
      `VIN: ${
        data.vehicle.vin ||
        "N/A"
      }`,
      "",
      "Inventory Verification",
      `Availability: ${
        data.inventory?.statusLabel ||
        "To Be Confirmed"
      }`
    );

    if (
      data.message
    ) {
      lines.push(
        "",
        "Customer Message",
        data.message
      );
    }

    return lines.join(
      "\n"
    );
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

  /* =========================================
     EVENTS
  ========================================= */

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

    if (
      state.submitting
    ) {
      return;
    }

    if (!isEnabled()) {
      showStatus(
        "Customer inquiry is currently unavailable.",
        "error"
      );

      return;
    }

    clearStatus();

    const data =
      collectFormData();

    const errors =
      validateInquiry(
        data
      );

    if (
      errors.length
    ) {
      showStatus(
        errors.join(" "),
        "error"
      );

      return;
    }

    setSubmitting(
      true
    );

    try {
      const saved =
        saveInquiry(
          data
        );

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

      if (
        whatsappURL
      ) {
        showStatus(
          "Inquiry saved. Opening WhatsApp...",
          "success"
        );

        window.setTimeout(
          function () {
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
              inquiry:
                data,

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
      setSubmitting(
        false
      );
    }
  }

  function resetForm() {
    const elements =
      getElements();

    if (
      elements.form
    ) {
      elements.form.reset();
    }

    clearStatus();
  }

  /* =========================================
     ADMIN / LEAD MANAGEMENT API
  ========================================= */

  function findById(
    inquiryId
  ) {
    const target =
      normalizeLower(
        inquiryId
      );

    return (
      getStoredInquiries()
        .find(
          (item) =>
            normalizeLower(
              item.id
            ) === target
        ) || null
    );
  }

  function updateInquiry(
    inquiryId,
    changes = {}
  ) {
    const inquiries =
      getStoredInquiries();

    const index =
      inquiries.findIndex(
        (item) =>
          normalizeLower(
            item.id
          ) ===
          normalizeLower(
            inquiryId
          )
      );

    if (
      index === -1
    ) {
      return null;
    }

    /*
      Customer location is never accepted
      into the inquiry record.
    */
    const safeChanges = {
      ...changes
    };

    delete safeChanges.location;
    delete safeChanges.customerLocation;
    delete safeChanges.city;
    delete safeChanges.country;

    inquiries[index] = {
      ...inquiries[index],
      ...safeChanges,
      updatedAt:
        getNowISO()
    };

    const saved =
      saveStoredInquiries(
        inquiries
      );

    return saved
      ? inquiries[index]
      : null;
  }

  function updateStatus(
    inquiryId,
    status
  ) {
    return updateInquiry(
      inquiryId,
      {
        status
      }
    );
  }

  function updateCommunicationStatus(
    inquiryId,
    communicationStatus
  ) {
    return updateInquiry(
      inquiryId,
      {
        communicationStatus
      }
    );
  }

  function assignStaff(
    inquiryId,
    assignedTo
  ) {
    return updateInquiry(
      inquiryId,
      {
        assignedTo
      }
    );
  }

  function setFollowUp(
    inquiryId,
    followUpDate
  ) {
    return updateInquiry(
      inquiryId,
      {
        followUpDate
      }
    );
  }

  function setQuotationStatus(
    inquiryId,
    quotationStatus
  ) {
    return updateInquiry(
      inquiryId,
      {
        quotationStatus
      }
    );
  }

  /* =========================================
     INITIALIZE
  ========================================= */

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
    if (
      initialized
    ) {
      return;
    }

    initialized =
      true;

    if (!isEnabled()) {
      return;
    }

    bindEvents();
    prefillFromURL();

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanInquiryReady"
      )
    );
  }

  /* =========================================
     PUBLIC API
  ========================================= */

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

    findById:
      findById,

    update:
      updateInquiry,

    updateStatus:
      updateStatus,

    updateCommunicationStatus:
      updateCommunicationStatus,

    assignStaff:
      assignStaff,

    setFollowUp:
      setFollowUp,

    setQuotationStatus:
      setQuotationStatus,

    getInventoryAvailability:
      getInventoryAvailability,

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
