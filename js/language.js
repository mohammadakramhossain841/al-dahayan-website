(function () {
  "use strict";

  const DEFAULT_LANGUAGE = "en";
  const LANGUAGE_KEY = "alDahayanLanguage";

  const TRANSLATIONS = {
    en: {
      home: "Home",
      about: "About Us",
      parts: "Parts",
      vehicles: "Vehicles",
      vinSearch: "VIN Search",
      inventory: "Inventory",
      services: "Services",
      contact: "Contact",
      inquiry: "Inquiry",

      search: "Search",
      searchParts: "Search Parts",
      searchByVehicle: "Search by Vehicle",
      searchByVIN: "Search by VIN",

      findRightPart: "Find the Right Part.",
      connectWithUs: "Connect With Al-Dahayan.",

      companyTitle: "Al-Dahayan Trading Company",
      saudiArabia: "Saudi Arabia",

      available: "Available",
      outOfStock: "Out of Stock",
      inStock: "In Stock",

      submit: "Submit",
      submitInquiry: "Submit Inquiry",
      learnMore: "Learn More",
      contactUs: "Contact Us",

      loading: "Loading...",
      noResults: "No results found.",
      error: "Something went wrong. Please try again.",

      english: "English",
      arabic: "العربية"
    },

    ar: {
      home: "الرئيسية",
      about: "من نحن",
      parts: "قطع الغيار",
      vehicles: "المركبات",
      vinSearch: "البحث برقم VIN",
      inventory: "المخزون",
      services: "الخدمات",
      contact: "اتصل بنا",
      inquiry: "استفسار",

      search: "بحث",
      searchParts: "البحث عن قطع الغيار",
      searchByVehicle: "البحث حسب المركبة",
      searchByVIN: "البحث برقم VIN",

      findRightPart: "اعثر على القطعة المناسبة.",
      connectWithUs: "تواصل مع الضحيان.",

      companyTitle: "شركة الضحيان التجارية",
      saudiArabia: "المملكة العربية السعودية",

      available: "متوفر",
      outOfStock: "غير متوفر",
      inStock: "متوفر في المخزون",

      submit: "إرسال",
      submitInquiry: "إرسال الاستفسار",
      learnMore: "اعرف المزيد",
      contactUs: "اتصل بنا",

      loading: "جارٍ التحميل...",
      noResults: "لم يتم العثور على نتائج.",
      error: "حدث خطأ. يرجى المحاولة مرة أخرى.",

      english: "English",
      arabic: "العربية"
    }
  };

  function initializeLanguage() {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);

    const language =
      savedLanguage && TRANSLATIONS[savedLanguage]
        ? savedLanguage
        : DEFAULT_LANGUAGE;

    applyLanguage(language);
    setupLanguageSwitcher();
  }

  function applyLanguage(language) {
    if (!TRANSLATIONS[language]) {
      language = DEFAULT_LANGUAGE;
    }

    const direction =
      window.APP_CONFIG?.site?.direction?.[language] ||
      (language === "ar" ? "rtl" : "ltr");

    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", direction);

    localStorage.setItem(LANGUAGE_KEY, language);

    translatePage(language);

    updateLanguageSwitcher(language);

    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: {
          language: language,
          direction: direction
        }
      })
    );
  }

  function translatePage(language) {
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");

      if (!key) {
        return;
      }

      const translation = getTranslation(key, language);

      if (translation !== null) {
        element.textContent = translation;
      }
    });

    const placeholders = document.querySelectorAll(
      "[data-i18n-placeholder]"
    );

    placeholders.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");

      const translation = getTranslation(key, language);

      if (translation !== null) {
        element.setAttribute("placeholder", translation);
      }
    });

    const titles = document.querySelectorAll(
      "[data-i18n-title]"
    );

    titles.forEach((element) => {
      const key = element.getAttribute("data-i18n-title");

      const translation = getTranslation(key, language);

      if (translation !== null) {
        element.setAttribute("title", translation);
      }
    });
  }

  function getTranslation(key, language) {
    const translations = TRANSLATIONS[language];

    if (!translations) {
      return null;
    }

    return Object.prototype.hasOwnProperty.call(
      translations,
      key
    )
      ? translations[key]
      : null;
  }

  function setupLanguageSwitcher() {
    const switchers = document.querySelectorAll(
      "[data-language]"
    );

    switchers.forEach((switcher) => {
      switcher.addEventListener("click", function (event) {
        event.preventDefault();

        const language = this.getAttribute("data-language");

        if (language) {
          changeLanguage(language);
        }
      });
    });
  }

  function updateLanguageSwitcher(currentLanguage) {
    const switchers = document.querySelectorAll(
      "[data-language]"
    );

    switchers.forEach((switcher) => {
      const language =
        switcher.getAttribute("data-language");

      switcher.classList.toggle(
        "active",
        language === currentLanguage
      );

      switcher.setAttribute(
        "aria-current",
        language === currentLanguage
          ? "true"
          : "false"
      );
    });
  }

  function changeLanguage(language) {
    if (!TRANSLATIONS[language]) {
      return;
    }

    applyLanguage(language);
  }

  function getCurrentLanguage() {
    return (
      localStorage.getItem(LANGUAGE_KEY) ||
      DEFAULT_LANGUAGE
    );
  }

  function getDirection() {
    return getCurrentLanguage() === "ar"
      ? "rtl"
      : "ltr";
  }

  window.AlDahayanLanguage = {
    initialize: initializeLanguage,
    change: changeLanguage,
    apply: applyLanguage,
    translate: translatePage,
    getCurrentLanguage,
    getDirection,
    getTranslation
  };

  window.initializeLanguage = initializeLanguage;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLanguage
    );
  } else {
    initializeLanguage();
  }
})();
