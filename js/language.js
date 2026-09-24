/* =========================================
   AL-DAHAYAN LANGUAGE SYSTEM
========================================= */

(function () {
  "use strict";

  let initialized = false;

  const STORAGE_KEY =
    "alDahayanLanguage";

  const SUPPORTED_LANGUAGES = [
    "en",
    "ar"
  ];

  const translations = {
    en: {
      home: "Home",
      about: "About",
      parts: "Spare Parts",
      vehicles: "Vehicles",
      vinSearch: "VIN Search",
      inventory: "Inventory",
      services: "Services",
      contact: "Contact",
      inquiry: "Inquiry",
      search: "Search",
      reset: "Reset",
      submit: "Submit",
      close: "Close",
      loading: "Loading...",
      available: "Available",
      inStock: "In Stock",
      lowStock: "Low Stock",
      outOfStock: "Out of Stock",
      genuine: "Genuine",
      aftermarket: "Aftermarket",
      price: "Price",
      regularPrice: "Regular Price",
      salePrice: "Sale Price",
      discount: "Discount",
      quantity: "Quantity",
      compatibility: "Compatibility",
      model: "Model",
      year: "Year",
      engine: "Engine",
      category: "Category",
      brand: "Brand",
      oemNumber: "OEM Number",
      vehicle: "Vehicle",
      phone: "Phone",
      whatsapp: "WhatsApp",
      email: "Email",
      address: "Address",
      country: "Country",
      website: "Website",
      message: "Message",
      customerName: "Customer Name",
      consent: "I agree to be contacted regarding this inquiry.",
      noResults: "No results found.",
      error: "Something went wrong.",
      viewDetails: "View Details",
      sendInquiry: "Send Inquiry",
      contactUs: "Contact Us"
    },

    ar: {
      home: "الرئيسية",
      about: "عن الشركة",
      parts: "قطع الغيار",
      vehicles: "المركبات",
      vinSearch: "بحث VIN",
      inventory: "المخزون",
      services: "الخدمات",
      contact: "اتصل بنا",
      inquiry: "استفسار",
      search: "بحث",
      reset: "إعادة ضبط",
      submit: "إرسال",
      close: "إغلاق",
      loading: "جارٍ التحميل...",
      available: "متوفر",
      inStock: "متوفر في المخزون",
      lowStock: "مخزون منخفض",
      outOfStock: "غير متوفر",
      genuine: "أصلي",
      aftermarket: "بديل",
      price: "السعر",
      regularPrice: "السعر العادي",
      salePrice: "سعر البيع",
      discount: "الخصم",
      quantity: "الكمية",
      compatibility: "التوافق",
      model: "الموديل",
      year: "السنة",
      engine: "المحرك",
      category: "الفئة",
      brand: "العلامة التجارية",
      oemNumber: "رقم OEM",
      vehicle: "المركبة",
      phone: "الهاتف",
      whatsapp: "واتساب",
      email: "البريد الإلكتروني",
      address: "العنوان",
      country: "الدولة",
      website: "الموقع الإلكتروني",
      message: "الرسالة",
      customerName: "اسم العميل",
      consent: "أوافق على التواصل معي بخصوص هذا الاستفسار.",
      noResults: "لم يتم العثور على نتائج.",
      error: "حدث خطأ ما.",
      viewDetails: "عرض التفاصيل",
      sendInquiry: "إرسال استفسار",
      contactUs: "اتصل بنا"
    }
  };

  const pageTitles = {
    en: {
      home: "Al-Dahayan Trading Company",
      about: "About Us | Al-Dahayan Trading Company",
      parts: "Spare Parts | Al-Dahayan Trading Company",
      vehicles: "Vehicles | Al-Dahayan Trading Company",
      "vin-search":
        "VIN Search | Al-Dahayan Trading Company",
      inventory:
        "Inventory | Al-Dahayan Trading Company",
      services:
        "Services | Al-Dahayan Trading Company",
      contact:
        "Contact | Al-Dahayan Trading Company",
      inquiry:
        "Inquiry | Al-Dahayan Trading Company"
    },

    ar: {
      home: "شركة الضحيان التجارية",
      about: "عن الشركة | شركة الضحيان التجارية",
      parts: "قطع الغيار | شركة الضحيان التجارية",
      vehicles: "المركبات | شركة الضحيان التجارية",
      "vin-search":
        "بحث VIN | شركة الضحيان التجارية",
      inventory:
        "المخزون | شركة الضحيان التجارية",
      services:
        "الخدمات | شركة الضحيان التجارية",
      contact:
        "اتصل بنا | شركة الضحيان التجارية",
      inquiry:
        "استفسار | شركة الضحيان التجارية"
    }
  };

  let currentLanguage = null;

  function getStoredLanguage() {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (
        SUPPORTED_LANGUAGES.includes(
          stored
        )
      ) {
        return stored;
      }
    } catch (error) {
      console.warn(
        "Language storage unavailable:",
        error
      );
    }

    return (
      window.APP_CONFIG?.site
        ?.defaultLanguage ||
      "en"
    );
  }

  function getCurrentLanguage() {
    return (
      currentLanguage ||
      getStoredLanguage()
    );
  }

  function saveLanguage(
    language
  ) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        language
      );
    } catch (error) {
      console.warn(
        "Unable to save language:",
        error
      );
    }
  }

  function getTranslation(
    key,
    language
  ) {
    const lang =
      language ||
      getCurrentLanguage();

    return (
      translations[lang]?.[key] ??
      translations.en[key] ??
      key
    );
  }

  function applyTranslations() {
    const language =
      getCurrentLanguage();

    document
      .querySelectorAll(
        "[data-i18n]"
      )
      .forEach((element) => {
        const key =
          element.getAttribute(
            "data-i18n"
          );

        element.textContent =
          getTranslation(
            key,
            language
          );
      });

    document
      .querySelectorAll(
        "[data-i18n-placeholder]"
      )
      .forEach((element) => {
        const key =
          element.getAttribute(
            "data-i18n-placeholder"
          );

        element.placeholder =
          getTranslation(
            key,
            language
          );
      });

    document
      .querySelectorAll(
        "[data-i18n-aria-label]"
      )
      .forEach((element) => {
        const key =
          element.getAttribute(
            "data-i18n-aria-label"
          );

        element.setAttribute(
          "aria-label",
          getTranslation(
            key,
            language
          )
        );
      });

    document
      .querySelectorAll(
        "[data-i18n-title]"
      )
      .forEach((element) => {
        const key =
          element.getAttribute(
            "data-i18n-title"
          );

        element.title =
          getTranslation(
            key,
            language
          );
      });

    updatePageTitle(
      language
    );
  }

  function updatePageTitle(
    language
  ) {
    const body =
      document.body;

    const page =
      body?.dataset?.page ||
      getPageFromPath();

    const title =
      pageTitles[language]?.[page];

    if (title) {
      document.title =
        title;
    }
  }

  function getPageFromPath() {
    const path =
      window.location.pathname;

    if (
      path.includes("/pages/")
    ) {
      const file =
        path.split("/").pop();

      return file
        ? file.replace(
            /\.html$/i,
            ""
          )
        : "home";
    }

    return "home";
  }

  function updateDirection(
    language
  ) {
    const direction =
      language === "ar"
        ? "rtl"
        : "ltr";

    document.documentElement.lang =
      language;

    document.documentElement.dir =
      direction;

    document.body.classList.toggle(
      "rtl",
      direction === "rtl"
    );

    document.body.classList.toggle(
      "ltr",
      direction === "ltr"
    );
  }

  function updateLanguageControls(
    language
  ) {
    document
      .querySelectorAll(
        "[data-language-option]"
      )
      .forEach((element) => {
        const option =
          element.getAttribute(
            "data-language-option"
          );

        const active =
          option === language;

        element.classList.toggle(
          "active",
          active
        );

        element.setAttribute(
          "aria-pressed",
          String(active)
        );
      });

    document
      .querySelectorAll(
        "[data-language-switch]"
      )
      .forEach((element) => {
        element.setAttribute(
          "data-current-language",
          language
        );
      });
  }

  function setLanguage(
    language
  ) {
    if (
      !SUPPORTED_LANGUAGES.includes(
        language
      )
    ) {
      return false;
    }

    currentLanguage =
      language;

    saveLanguage(
      language
    );

    updateDirection(
      language
    );

    applyTranslations();

    updateLanguageControls(
      language
    );

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanLanguageChanged",
        {
          detail: {
            language
          }
        }
      )
    );

    return true;
  }

  function handleLanguageClick(
    event
  ) {
    const option =
      event.target.closest(
        "[data-language-option]"
      );

    if (!option) {
      return;
    }

    event.preventDefault();

    const language =
      option.getAttribute(
        "data-language-option"
      );

    setLanguage(
      language
    );
  }

  function initializeLanguage() {
    if (initialized) {
      return currentLanguage;
    }

    initialized = true;

    currentLanguage =
      getStoredLanguage();

    updateDirection(
      currentLanguage
    );

    applyTranslations();

    updateLanguageControls(
      currentLanguage
    );

    document.addEventListener(
      "click",
      handleLanguageClick
    );

    return currentLanguage;
  }

  document.addEventListener(
    "alDahayanComponentsLoaded",
    () => {
      initializeLanguage();
    }
  );

  document.addEventListener(
    "DOMContentLoaded",
    initializeLanguage
  );

  window.AlDahayanLanguage = {
    init:
      initializeLanguage,

    set:
      setLanguage,

    getCurrent:
      getCurrentLanguage,

    getStored:
      getStoredLanguage,

    translate:
      getTranslation,

    apply:
      applyTranslations,

    isInitialized:
      function () {
        return initialized;
      }
  };

  window.initializeLanguage =
    initializeLanguage;

  window.setLanguage =
    setLanguage;

  window.getCurrentLanguage =
    getCurrentLanguage;

  window.getStoredLanguage =
    getStoredLanguage;

  window.translate =
    getTranslation;

})();
