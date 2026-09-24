(function () {
  "use strict";

  const STORAGE_KEY =
    "alDahayanCustomerInquiries";

  let inquiriesData = [];

  function initializeInquiry() {
    loadStoredInquiries();
    setupInquiryForms();
  }

  function setupInquiryForms() {
    const forms = document.querySelectorAll(
      "[data-inquiry-form], #inquiryForm, .inquiry-form"
    );

    forms.forEach((form) => {
      if (
        form.dataset.inquiryInitialized ===
        "true"
      ) {
        return;
      }

      form.dataset.inquiryInitialized =
        "true";

      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const inquiry =
            collectInquiryFromForm(form);

          const validation =
            validateInquiry(inquiry);

          if (!validation.valid) {
            displayInquiryMessage(
              validation.message,
              "error"
            );

            return;
          }

          const savedInquiry =
            saveInquiry(inquiry);

          displayInquiryMessage(
            getCurrentLanguage() === "ar"
              ? "تم إرسال طلب الاستفسار بنجاح."
              : "Your inquiry has been submitted successfully.",
            "success"
          );

          form.reset();

          document.dispatchEvent(
            new CustomEvent(
              "alDahayanInquirySubmitted",
              {
                detail: savedInquiry
              }
            )
          );
        }
      );
    });
  }

  function collectInquiryFromForm(
    form
  ) {
    return {
      id: generateInquiryId(),

      oemNumber: getFieldValue(
        form,
        "oemNumber",
        "oemNumber"
      ),

      partNumber: getFieldValue(
        form,
        "partNumber",
        "partNumber"
      ),

      partName: getFieldValue(
        form,
        "partName",
        "partName"
      ),

      make: getFieldValue(
        form,
        "make",
        "vehicleMake"
      ),

      model: getFieldValue(
        form,
        "model",
        "vehicleModel"
      ),

      year: getFieldValue(
        form,
        "year",
        "vehicleYear"
      ),

      engine: getFieldValue(
        form,
        "engine",
        "vehicleEngine"
      ),

      vin: normalizeVIN(
        getFieldValue(
          form,
          "vin",
          "vin"
        )
      ),

      quantity:
        getQuantity(form),

      customer: {
        name: getFieldValue(
          form,
          "name",
          "customerName"
        ),

        phone: getFieldValue(
          form,
          "phone",
          "customerPhone"
        ),

        whatsapp: getFieldValue(
          form,
          "whatsapp",
          "customerWhatsapp"
        ),

        email: getFieldValue(
          form,
          "email",
          "customerEmail"
        ),

        city: getFieldValue(
          form,
          "city",
          "customerCity"
        ),

        country: getFieldValue(
          form,
          "country",
          "customerCountry"
        )
      },

      message: getFieldValue(
        form,
        "message",
        "inquiryMessage"
      ),

      preferredContact:
        getFieldValue(
          form,
          "preferredContact",
          "preferredContact"
        ) || "whatsapp",

      source: "website",

      status: "new",

      priority: "normal",

      assignedTo: "",

      notes: "",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    };
  }

  function getFieldValue(
    form,
    name,
    id
  ) {
    const element =
      form.querySelector(
        `[name="${name}"]`
      ) ||
      form.querySelector(
        `#${id}`
      );

    return element
      ? String(
          element.value || ""
        ).trim()
      : "";
  }

  function getQuantity(form) {
    const value =
      getFieldValue(
        form,
        "quantity",
        "quantity"
      );

    const quantity =
      Number(value);

    if (
      !Number.isFinite(
        quantity
      ) ||
      quantity < 1
    ) {
      return 1;
    }

    return Math.floor(
      quantity
    );
  }

  function validateInquiry(
    inquiry
  ) {
    if (
      !inquiry.oemNumber &&
      !inquiry.partNumber &&
      !inquiry.partName
    ) {
      return {
        valid: false,
        message:
          getCurrentLanguage() === "ar"
            ? "يرجى إدخال رقم القطعة أو اسم القطعة."
            : "Please enter an OEM number, part number, or part name."
      };
    }

    if (
      !inquiry.customer.name
    ) {
      return {
        valid: false,
        message:
          getCurrentLanguage() === "ar"
            ? "يرجى إدخال الاسم."
            : "Please enter your name."
      };
    }

    if (
      !inquiry.customer.phone &&
      !inquiry.customer.whatsapp &&
      !inquiry.customer.email
    ) {
      return {
        valid: false,
        message:
          getCurrentLanguage() === "ar"
            ? "يرجى إدخال رقم الهاتف أو واتساب أو البريد الإلكتروني."
            : "Please provide a phone number, WhatsApp number, or email."
      };
    }

    if (
      inquiry.vin &&
      inquiry.vin.length !== 17
    ) {
      return {
        valid: false,
        message:
          getCurrentLanguage() === "ar"
            ? "يجب أن يتكون رقم VIN من 17 خانة."
            : "VIN must contain 17 characters."
      };
    }

    return {
      valid: true,
      message: ""
    };
  }

  function saveInquiry(
    inquiry
  ) {
    inquiriesData.push(
      inquiry
    );

    saveStoredInquiries();

    return inquiry;
  }

  function loadStoredInquiries() {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!stored) {
        inquiriesData = [];
        return inquiriesData;
      }

      const parsed =
        JSON.parse(stored);

      inquiriesData =
        Array.isArray(parsed)
          ? parsed
          : [];

      return inquiriesData;
    } catch (error) {
      console.error(
        "Al-Dahayan Inquiry: Unable to load stored inquiries.",
        error
      );

      inquiriesData = [];

      return inquiriesData;
    }
  }

  function saveStoredInquiries() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          inquiriesData
        )
      );

      return true;
    } catch (error) {
      console.error(
        "Al-Dahayan Inquiry: Unable to save inquiry data.",
        error
      );

      return false;
    }
  }

  function getInquiries() {
    return [
      ...inquiriesData
    ];
  }

  function getInquiryById(
    id
  ) {
    if (!id) {
      return null;
    }

    return (
      inquiriesData.find(
        (inquiry) =>
          String(
            inquiry.id
          ) === String(id)
      ) || null
    );
  }

  function updateInquiry(
    id,
    updates = {}
  ) {
    const index =
      inquiriesData.findIndex(
        (inquiry) =>
          String(
            inquiry.id
          ) === String(id)
      );

    if (index === -1) {
      return null;
    }

    inquiriesData[index] = {
      ...inquiriesData[index],
      ...updates,
      updatedAt:
        new Date().toISOString()
    };

    saveStoredInquiries();

    return inquiriesData[index];
  }

  function deleteInquiry(
    id
  ) {
    const originalLength =
      inquiriesData.length;

    inquiriesData =
      inquiriesData.filter(
        (inquiry) =>
          String(
            inquiry.id
          ) !== String(id)
      );

    const deleted =
      inquiriesData.length !==
      originalLength;

    if (deleted) {
      saveStoredInquiries();
    }

    return deleted;
  }

  function clearInquiries() {
    inquiriesData = [];

    localStorage.removeItem(
      STORAGE_KEY
    );

    return true;
  }

  function createWhatsAppMessage(
    inquiry
  ) {
    if (!inquiry) {
      return "";
    }

    const language =
      getCurrentLanguage();

    const lines =
      language === "ar"
        ? [
            "السلام عليكم،",
            "",
            "أرغب في الاستفسار عن قطعة غيار:",
            `رقم OEM: ${
              inquiry.oemNumber || "-"
            }`,
            `رقم القطعة: ${
              inquiry.partNumber || "-"
            }`,
            `اسم القطعة: ${
              inquiry.partName || "-"
            }`,
            `الماركة: ${
              inquiry.make || "-"
            }`,
            `الموديل: ${
              inquiry.model || "-"
            }`,
            `السنة: ${
              inquiry.year || "-"
            }`,
            `المحرك: ${
              inquiry.engine || "-"
            }`,
            `VIN: ${
              inquiry.vin || "-"
            }`,
            `الكمية: ${
              inquiry.quantity || 1
            }`,
            "",
            `الاسم: ${
              inquiry.customer
                ?.name || "-"
            }`,
            `الهاتف: ${
              inquiry.customer
                ?.phone || "-"
            }`,
            `واتساب: ${
              inquiry.customer
                ?.whatsapp || "-"
            }`,
            `البريد: ${
              inquiry.customer
                ?.email || "-"
            }`,
            `المدينة: ${
              inquiry.customer
                ?.city || "-"
            }`,
            "",
            `ملاحظات: ${
              inquiry.message || "-"
            }`
          ]
        : [
            "Assalamu Alaikum,",
            "",
            "I would like to inquire about an automotive spare part:",
            `OEM Number: ${
              inquiry.oemNumber || "-"
            }`,
            `Part Number: ${
              inquiry.partNumber || "-"
            }`,
            `Part Name: ${
              inquiry.partName || "-"
            }`,
            `Make: ${
              inquiry.make || "-"
            }`,
            `Model: ${
              inquiry.model || "-"
            }`,
            `Year: ${
              inquiry.year || "-"
            }`,
            `Engine: ${
              inquiry.engine || "-"
            }`,
            `VIN: ${
              inquiry.vin || "-"
            }`,
            `Quantity: ${
              inquiry.quantity || 1
            }`,
            "",
            `Name: ${
              inquiry.customer
                ?.name || "-"
            }`,
            `Phone: ${
              inquiry.customer
                ?.phone || "-"
            }`,
            `WhatsApp: ${
              inquiry.customer
                ?.whatsapp || "-"
            }`,
            `Email: ${
              inquiry.customer
                ?.email || "-"
            }`,
            `City: ${
              inquiry.customer
                ?.city || "-"
            }`,
            "",
            `Message: ${
              inquiry.message || "-"
            }`
          ];

    return lines.join(
      "\n"
    );
  }

  function createWhatsAppURL(
    whatsappNumber,
    inquiry
  ) {
    const number =
      normalizePhone(
        whatsappNumber
      );

    if (!number || !inquiry) {
      return "";
    }

    const message =
      createWhatsAppMessage(
        inquiry
      );

    return (
      "https://wa.me/" +
      number +
      "?text=" +
      encodeURIComponent(
        message
      )
    );
  }

  function openWhatsAppInquiry(
    whatsappNumber,
    inquiry
  ) {
    const url =
      createWhatsAppURL(
        whatsappNumber,
        inquiry
      );

    if (!url) {
      return false;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    return true;
  }

  function displayInquiryMessage(
    message,
    type = "info",
    container = null
  ) {
    const target =
      container ||
      document.querySelector(
        "[data-inquiry-message], #inquiryMessage, .inquiry-message"
      );

    if (!target) {
      return;
    }

    target.textContent =
      message;

    target.className =
      `inquiry-message inquiry-message-${type}`;
  }

  function normalizeVIN(
    vin
  ) {
    return String(vin || "")
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        ""
      )
      .slice(0, 17);
  }

  function normalizePhone(
    phone
  ) {
    return String(phone || "")
      .replace(
        /[^0-9+]/g,
        ""
      )
      .replace(
        /^\+/,
        ""
      );
  }

  function generateInquiryId() {
    return (
      "INQ-" +
      Date.now().toString(
        36
      ).toUpperCase()
    );
  }

  function getCurrentLanguage() {
    return (
      document.documentElement.getAttribute(
        "lang"
      ) ||
      window.APP_CONFIG?.site
        ?.defaultLanguage ||
      "en"
    );
  }

  window.AlDahayanInquiry = {
    initialize:
      initializeInquiry,

    collectInquiryFromForm,

    validateInquiry,

    saveInquiry,

    getInquiries,

    getInquiryById,

    updateInquiry,

    deleteInquiry,

    clearInquiries,

    createWhatsAppMessage,

    createWhatsAppURL,

    openWhatsAppInquiry,

    loadStoredInquiries,

    isLocalStorageAvailable:
      () => {
        try {
          const key =
            "__alDahayanTest__";

          localStorage.setItem(
            key,
            "1"
          );

          localStorage.removeItem(
            key
          );

          return true;
        } catch {
          return false;
        }
      }
  };

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
