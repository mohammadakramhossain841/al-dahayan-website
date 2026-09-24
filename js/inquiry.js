(function () {
  "use strict";

  let inquiries = [];

  function initializeInquiry() {
    setupInquiryForms();
    setupInquiryButtons();
  }

  function setupInquiryForms() {
    const forms = document.querySelectorAll(
      "[data-inquiry-form], .inquiry-form"
    );

    forms.forEach((form) => {
      form.addEventListener(
        "submit",
        handleInquirySubmit
      );
    });
  }

  function setupInquiryButtons() {
    const buttons = document.querySelectorAll(
      "[data-inquiry-oem]"
    );

    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const oem =
            button.getAttribute(
              "data-inquiry-oem"
            );

          openInquiryForm({
            oemNumber: oem || ""
          });
        }
      );
    });
  }

  function handleInquirySubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const inquiry =
      collectInquiryData(form);

    const validation =
      validateInquiry(inquiry);

    if (!validation.valid) {
      showInquiryMessage(
        form,
        validation.message,
        "error"
      );

      return;
    }

    const savedInquiry =
      saveInquiry(inquiry);

    showInquiryMessage(
      form,
      "Your inquiry has been prepared successfully.",
      "success"
    );

    document.dispatchEvent(
      new CustomEvent(
        "inquirySubmitted",
        {
          detail: {
            inquiry: savedInquiry
          }
        }
      )
    );

    form.reset();
  }

  function collectInquiryData(form) {
    return {
      id: generateInquiryId(),

      oemNumber:
        getFieldValue(
          form,
          "oemNumber"
        ) ||
        getFieldValue(
          form,
          "oem"
        ) ||
        getFieldValue(
          form,
          "partNumber"
        ),

      partName:
        getFieldValue(
          form,
          "partName"
        ) ||
        getFieldValue(
          form,
          "partName"
        ),

      vehicleMake:
        getFieldValue(
          form,
          "vehicleMake"
        ) ||
        getFieldValue(
          form,
          "make"
        ),

      vehicleModel:
        getFieldValue(
          form,
          "vehicleModel"
        ) ||
        getFieldValue(
          form,
          "model"
        ),

      vehicleYear:
        getFieldValue(
          form,
          "vehicleYear"
        ) ||
        getFieldValue(
          form,
          "year"
        ),

      engine:
        getFieldValue(
          form,
          "engine"
        ),

      vin:
        getFieldValue(
          form,
          "vin"
        ),

      quantity:
        getFieldValue(
          form,
          "quantity"
        ),

      customerName:
        getFieldValue(
          form,
          "customerName"
        ) ||
        getFieldValue(
          form,
          "name"
        ),

      phone:
        getFieldValue(
          form,
          "phone"
        ) ||
        getFieldValue(
          form,
          "mobile"
        ),

      whatsapp:
        getFieldValue(
          form,
          "whatsapp"
        ),

      email:
        getFieldValue(
          form,
          "email"
        ),

      message:
        getFieldValue(
          form,
          "message"
        ) ||
        getFieldValue(
          form,
          "notes"
        ),

      createdAt:
        new Date().toISOString(),

      status: "new"
    };
  }

  function getFieldValue(form, name) {
    const field =
      form.querySelector(
        `[name="${name}"]`
      );

    return field
      ? field.value.trim()
      : "";
  }

  function validateInquiry(inquiry) {
    if (
      !inquiry.oemNumber &&
      !inquiry.partName &&
      !inquiry.vin
    ) {
      return {
        valid: false,
        message:
          "Please provide an OEM part number, part name, or VIN."
      };
    }

    if (!inquiry.customerName) {
      return {
        valid: false,
        message:
          "Please enter your name."
      };
    }

    if (!inquiry.phone && !inquiry.whatsapp && !inquiry.email) {
      return {
        valid: false,
        message:
          "Please provide a phone, WhatsApp number, or email."
      };
    }

    if (
      inquiry.vin &&
      !isValidVIN(inquiry.vin)
    ) {
      return {
        valid: false,
        message:
          "Please enter a valid 17-character VIN."
      };
    }

    return {
      valid: true,
      message: ""
    };
  }

  function isValidVIN(vin) {
    const normalizedVIN =
      String(vin || "")
        .toUpperCase()
        .trim();

    return /^[A-HJ-NPR-Z0-9]{17}$/.test(
      normalizedVIN
    );
  }

  function saveInquiry(inquiry) {
    inquiries.push(inquiry);

    try {
      const stored =
        localStorage.getItem(
          "alDahayanInquiries"
        );

      const existing =
        stored
          ? JSON.parse(stored)
          : [];

      const updated = [
        ...existing,
        inquiry
      ];

      localStorage.setItem(
        "alDahayanInquiries",
        JSON.stringify(updated)
      );
    } catch (error) {
      console.warn(
        "Inquiry local storage unavailable:",
        error
      );
    }

    return inquiry;
  }

  function getInquiries() {
    return [...inquiries];
  }

  function getStoredInquiries() {
    try {
      const stored =
        localStorage.getItem(
          "alDahayanInquiries"
        );

      if (!stored) {
        return [];
      }

      const data =
        JSON.parse(stored);

      return Array.isArray(data)
        ? data
        : [];
    } catch (error) {
      console.warn(
        "Unable to read stored inquiries:",
        error
      );

      return [];
    }
  }

  function clearStoredInquiries() {
    try {
      localStorage.removeItem(
        "alDahayanInquiries"
      );

      return true;
    } catch (error) {
      console.warn(
        "Unable to clear stored inquiries:",
        error
      );

      return false;
    }
  }

  function getInquiryById(id) {
    const allInquiries =
      getStoredInquiries();

    return (
      allInquiries.find(
        (inquiry) =>
          inquiry.id === id
      ) || null
    );
  }

  function updateInquiryStatus(
    id,
    status
  ) {
    const allInquiries =
      getStoredInquiries();

    const index =
      allInquiries.findIndex(
        (inquiry) =>
          inquiry.id === id
      );

    if (index === -1) {
      return null;
    }

    allInquiries[index].status =
      status;

    try {
      localStorage.setItem(
        "alDahayanInquiries",
        JSON.stringify(
          allInquiries
        )
      );

      return allInquiries[index];
    } catch (error) {
      console.warn(
        "Unable to update inquiry:",
        error
      );

      return null;
    }
  }

  function openInquiryForm(data = {}) {
    const form =
      document.querySelector(
        "[data-inquiry-form], .inquiry-form"
      );

    if (!form) {
      return;
    }

    Object.keys(data).forEach(
      (key) => {
        const field =
          form.querySelector(
            `[name="${key}"]`
          );

        if (field) {
          field.value =
            data[key] ?? "";
        }
      }
    );

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function showInquiryMessage(
    form,
    message,
    type
  ) {
    let messageBox =
      form.querySelector(
        "[data-inquiry-message]"
      );

    if (!messageBox) {
      messageBox =
        document.createElement(
          "div"
        );

      messageBox.setAttribute(
        "data-inquiry-message",
        ""
      );

      form.prepend(
        messageBox
      );
    }

    messageBox.className =
      `inquiry-message ${type}`;

    messageBox.textContent =
      message;
  }

  function generateInquiryId() {
    const timestamp =
      Date.now();

    const random =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return `INQ-${timestamp}-${random}`;
  }

  function createWhatsAppMessage(
    inquiry
  ) {
    const lines = [
      "Al-Dahayan Spare Parts Inquiry",
      "",
      `OEM Part Number: ${
        inquiry.oemNumber || "N/A"
      }`,
      `Part Name: ${
        inquiry.partName || "N/A"
      }`,
      `Vehicle: ${
        inquiry.vehicleMake || ""
      } ${
        inquiry.vehicleModel || ""
      } ${
        inquiry.vehicleYear || ""
      }`.trim(),
      `Engine: ${
        inquiry.engine || "N/A"
      }`,
      `VIN: ${
        inquiry.vin || "N/A"
      }`,
      `Quantity: ${
        inquiry.quantity || "N/A"
      }`,
      "",
      `Customer: ${
        inquiry.customerName || "N/A"
      }`,
      `Phone: ${
        inquiry.phone || "N/A"
      }`,
      `WhatsApp: ${
        inquiry.whatsapp || "N/A"
      }`,
      `Email: ${
        inquiry.email || "N/A"
      }`,
      "",
      `Message: ${
        inquiry.message || "N/A"
      }`
    ];

    return lines.join("\n");
  }

  function buildWhatsAppURL(
    phone,
    inquiry
  ) {
    const message =
      createWhatsAppMessage(
        inquiry
      );

    const cleanPhone =
      String(phone || "")
        .replace(/[^\d]/g, "");

    if (!cleanPhone) {
      return "";
    }

    return (
      "https://wa.me/" +
      cleanPhone +
      "?text=" +
      encodeURIComponent(
        message
      )
    );
  }

  window.AlDahayanInquiry = {
    initialize:
      initializeInquiry,

    collect:
      collectInquiryData,

    validate:
      validateInquiry,

    submit:
      saveInquiry,

    getInquiries,

    getStoredInquiries,

    getInquiryById,

    updateInquiryStatus,

    clearStoredInquiries,

    openInquiryForm,

    createWhatsAppMessage,

    buildWhatsAppURL,

    isValidVIN
  };

  window.initializeInquiry =
    initializeInquiry;

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeInquiry
    );
  } else {
    initializeInquiry();
  }
})();
