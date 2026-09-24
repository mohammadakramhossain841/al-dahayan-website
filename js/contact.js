(function () {
  "use strict";

  let companyData = null;
  let isLoaded = false;

  async function initializeContact() {
    await loadCompanyData();
    setupContactInterface();
  }

  async function loadCompanyData() {
    try {
      const filePath = getDataPath(
        APP_CONFIG.dataFiles.company
      );

      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(
          `Failed to load company data: ${response.status}`
        );
      }

      const data = await response.json();

      companyData = normalizeCompanyData(data);
      isLoaded = true;

      applyCompanyData();

      return companyData;
    } catch (error) {
      console.error(
        "Al-Dahayan Contact: Unable to load company data.",
        error
      );

      companyData = null;
      isLoaded = false;

      return null;
    }
  }

  function normalizeCompanyData(data) {
    if (!data) {
      return null;
    }

    if (data.company) {
      return data.company;
    }

    return data;
  }

  function setupContactInterface() {
    setupContactLinks();
    setupSocialLinks();
    setupMapLinks();
    setupCustomerConnection();
  }

  function applyCompanyData() {
    if (!companyData) {
      return;
    }

    applyText(
      "[data-company-name]",
      getCompanyName()
    );

    applyText(
      "[data-company-arabic-name]",
      getCompanyArabicName()
    );

    applyText(
      "[data-company-about]",
      getCompanyAbout()
    );

    applyText(
      "[data-company-phone]",
      getContactValue("phone")
    );

    applyText(
      "[data-company-whatsapp]",
      getContactValue("whatsapp")
    );

    applyText(
      "[data-company-email]",
      getContactValue("email")
    );

    applyAddressData();
    applyWorkingHours();
  }

  function setupContactLinks() {
    const phoneLinks =
      document.querySelectorAll(
        "[data-contact-phone], .contact-phone-link"
      );

    phoneLinks.forEach((link) => {
      const phone =
        getContactValue("phone");

      if (!phone) {
        disableLink(link);
        return;
      }

      link.href =
        createPhoneURL(phone);

      link.target = "_self";
    });

    const whatsappLinks =
      document.querySelectorAll(
        "[data-contact-whatsapp], .contact-whatsapp-link"
      );

    whatsappLinks.forEach((link) => {
      const whatsapp =
        getContactValue("whatsapp");

      if (!whatsapp) {
        disableLink(link);
        return;
      }

      link.href =
        createWhatsAppURL(
          whatsapp
        );

      link.target = "_blank";
      link.rel =
        "noopener noreferrer";
    });

    const emailLinks =
      document.querySelectorAll(
        "[data-contact-email], .contact-email-link"
      );

    emailLinks.forEach((link) => {
      const email =
        getContactValue("email");

      if (!email) {
        disableLink(link);
        return;
      }

      link.href =
        createEmailURL(email);

      link.target = "_self";
    });
  }

  function setupSocialLinks() {
    const socialMedia =
      getSocialMedia();

    const mappings = {
      facebook:
        "[data-social-facebook], .social-facebook",

      instagram:
        "[data-social-instagram], .social-instagram",

      tiktok:
        "[data-social-tiktok], .social-tiktok",

      youtube:
        "[data-social-youtube], .social-youtube",

      x:
        "[data-social-x], .social-x"
    };

    Object.entries(
      mappings
    ).forEach(
      ([platform, selector]) => {
        const links =
          document.querySelectorAll(
            selector
          );

        links.forEach((link) => {
          const url =
            socialMedia[platform];

          if (!isValidURL(url)) {
            disableLink(link);
            return;
          }

          link.href = url;
          link.target = "_blank";
          link.rel =
            "noopener noreferrer";
        });
      }
    );
  }

  function setupMapLinks() {
    const mapLinks =
      document.querySelectorAll(
        "[data-company-map], .company-map-link"
      );

    mapLinks.forEach((link) => {
      const mapURL =
        getMapURL();

      if (!mapURL) {
        disableLink(link);
        return;
      }

      link.href = mapURL;
      link.target = "_blank";
      link.rel =
        "noopener noreferrer";
    });
  }

  function setupCustomerConnection() {
    const connection =
      companyData?.customerConnection ||
      {};

    const inquiryLinks =
      document.querySelectorAll(
        "[data-customer-inquiry], .customer-inquiry-link"
      );

    inquiryLinks.forEach((link) => {
      if (
        connection.inquiry ===
        false
      ) {
        disableLink(link);
        return;
      }

      link.href =
        getPagePath(
          "inquiry.html"
        );
    });

    const whatsappLinks =
      document.querySelectorAll(
        "[data-customer-whatsapp]"
      );

    whatsappLinks.forEach((link) => {
      const whatsapp =
        getContactValue(
          "whatsapp"
        );

      if (
        connection.whatsapp ===
          false ||
        !whatsapp
      ) {
        disableLink(link);
        return;
      }

      link.href =
        createWhatsAppURL(
          whatsapp
        );

      link.target = "_blank";
      link.rel =
        "noopener noreferrer";
    });

    const phoneLinks =
      document.querySelectorAll(
        "[data-customer-phone]"
      );

    phoneLinks.forEach((link) => {
      const phone =
        getContactValue(
          "phone"
        );

      if (
        connection.phone ===
          false ||
        !phone
      ) {
        disableLink(link);
        return;
      }

      link.href =
        createPhoneURL(phone);
    });

    const emailLinks =
      document.querySelectorAll(
        "[data-customer-email]"
      );

    emailLinks.forEach((link) => {
      const email =
        getContactValue(
          "email"
        );

      if (
        connection.email ===
          false ||
        !email
      ) {
        disableLink(link);
        return;
      }

      link.href =
        createEmailURL(email);
    });
  }

  function getCompanyName() {
    return (
      companyData?.name?.en ||
      companyData?.name ||
      APP_CONFIG?.company?.name ||
      ""
    );
  }

  function getCompanyArabicName() {
    return (
      companyData?.name?.ar ||
      companyData?.arabicName ||
      APP_CONFIG?.company
        ?.arabicName ||
      ""
    );
  }

  function getCompanyAbout() {
    const about =
      companyData?.about;

    if (
      typeof about ===
      "string"
    ) {
      return about;
    }

    if (
      getCurrentLanguage() ===
      "ar"
    ) {
      return (
        about?.ar ||
        ""
      );
    }

    return (
      about?.en ||
      ""
    );
  }

  function getContactValue(
    key
  ) {
    return (
      companyData?.contact?.[
        key
      ] ||
      APP_CONFIG?.contact?.[
        key
      ] ||
      ""
    );
  }

  function getSocialMedia() {
    return (
      companyData?.socialMedia ||
      {}
    );
  }

  function getLocations() {
    return Array.isArray(
      companyData?.locations
    )
      ? companyData.locations
      : [];
  }

  function getBranches() {
    return Array.isArray(
      companyData?.branches
    )
      ? companyData.branches
      : [];
  }

  function getPrimaryLocation() {
    const locations =
      getLocations();

    if (!locations.length) {
      return null;
    }

    return (
      locations.find(
        (location) =>
          location.primary ===
          true
      ) ||
      locations[0]
    );
  }

  function applyAddressData() {
    const location =
      getPrimaryLocation();

    if (!location) {
      return;
    }

    const address =
      getLocationAddress(
        location
      );

    applyText(
      "[data-company-address]",
      address
    );

    applyText(
      "[data-company-city]",
      location.city ||
        ""
    );

    applyText(
      "[data-company-country]",
      location.country ||
        companyData?.country ||
        ""
    );
  }

  function applyWorkingHours() {
    const hours =
      companyData?.workingHours;

    if (!hours) {
      return;
    }

    const elements =
      document.querySelectorAll(
        "[data-company-hours]"
      );

    elements.forEach(
      (element) => {
        if (
          typeof hours ===
          "string"
        ) {
          element.textContent =
            hours;

          return;
        }

        const language =
          getCurrentLanguage();

        element.textContent =
          hours[language] ||
          hours.en ||
          "";
      }
    );
  }

  function getLocationAddress(
    location
  ) {
    if (!location) {
      return "";
    }

    if (
      typeof location.address ===
      "string"
    ) {
      return location.address;
    }

    const language =
      getCurrentLanguage();

    return (
      location.address?.[
        language
      ] ||
      location.address?.en ||
      ""
    );
  }

  function getMapURL() {
    const location =
      getPrimaryLocation();

    if (!location) {
      return "";
    }

    if (
      isValidURL(
        location.mapUrl
      )
    ) {
      return location.mapUrl;
    }

    if (
      isValidURL(
        location.maps
      )
    ) {
      return location.maps;
    }

    const address =
      getLocationAddress(
        location
      );

    if (
      !address &&
      !location.city
    ) {
      return "";
    }

    const query = [
      address,
      location.city,
      location.country ||
        companyData?.country
    ]
      .filter(Boolean)
      .join(", ");

    if (!query) {
      return "";
    }

    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(query)
    );
  }

  function createPhoneURL(
    phone
  ) {
    const normalized =
      normalizePhone(phone);

    if (!normalized) {
      return "";
    }

    return (
      "tel:+" +
      normalized
    );
  }

  function createWhatsAppURL(
    whatsapp
  ) {
    const normalized =
      normalizePhone(
        whatsapp
      );

    if (!normalized) {
      return "";
    }

    return (
      "https://wa.me/" +
      normalized
    );
  }

  function createEmailURL(
    email
  ) {
    if (
      !isValidEmail(email)
    ) {
      return "";
    }

    return (
      "mailto:" +
      String(email).trim()
    );
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

  function isValidEmail(
    email
  ) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(email || "")
    );
  }

  function isValidURL(
    url
  ) {
    if (!url) {
      return false;
    }

    try {
      const parsed =
        new URL(url);

      return (
        parsed.protocol ===
          "https:" ||
        parsed.protocol ===
          "http:"
      );
    } catch {
      return false;
    }
  }

  function applyText(
    selector,
    value
  ) {
    const elements =
      document.querySelectorAll(
        selector
      );

    elements.forEach(
      (element) => {
        element.textContent =
          value || "";
      }
    );
  }

  function disableLink(
    element
  ) {
    element.removeAttribute(
      "href"
    );

    element.setAttribute(
      "aria-disabled",
      "true"
    );

    element.classList.add(
      "is-disabled"
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

  window.AlDahayanContact = {
    initialize:
      initializeContact,

    loadCompanyData,

    getCompanyData: () =>
      companyData,

    getCompanyName,

    getCompanyArabicName,

    getCompanyAbout,

    getContactValue,

    getSocialMedia,

    getLocations,

    getBranches,

    getPrimaryLocation,

    getMapURL,

    createPhoneURL,

    createWhatsAppURL,

    createEmailURL,

    isLoaded: () =>
      isLoaded
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeContact
    );
  } else {
    initializeContact();
  }
})();
