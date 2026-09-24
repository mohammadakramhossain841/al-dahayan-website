(function () {
  "use strict";

  function initializeContact() {
    setupContactActions();
    loadCompanyContactData();
  }

  function setupContactActions() {
    const whatsappButtons =
      document.querySelectorAll(
        "[data-contact='whatsapp'], [data-whatsapp]"
      );

    whatsappButtons.forEach((button) => {
      button.addEventListener(
        "click",
        handleWhatsAppClick
      );
    });

    const phoneButtons =
      document.querySelectorAll(
        "[data-contact='phone'], [data-phone]"
      );

    phoneButtons.forEach((button) => {
      button.addEventListener(
        "click",
        handlePhoneClick
      );
    });

    const emailButtons =
      document.querySelectorAll(
        "[data-contact='email'], [data-email]"
      );

    emailButtons.forEach((button) => {
      button.addEventListener(
        "click",
        handleEmailClick
      );
    });

    const locationButtons =
      document.querySelectorAll(
        "[data-contact='location'], [data-map]"
      );

    locationButtons.forEach((button) => {
      button.addEventListener(
        "click",
        handleLocationClick
      );
    });
  }

  async function loadCompanyContactData() {
    try {
      const fileName =
        window.APP_CONFIG?.dataFiles?.company ||
        "company.json";

      const path =
        window.getDataPath?.(fileName) ||
        `./data/${fileName}`;

      const response =
        await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Unable to load company data: ${response.status}`
        );
      }

      const data =
        await response.json();

      applyContactData(data);

      return data;
    } catch (error) {
      console.error(
        "Company contact data loading error:",
        error
      );

      return null;
    }
  }

  function applyContactData(company) {
    if (!company) {
      return;
    }

    const contact =
      company.contact || {};

    const phone =
      contact.phone ||
      company.phone ||
      window.APP_CONFIG?.contact?.phone ||
      "";

    const whatsapp =
      contact.whatsapp ||
      company.whatsapp ||
      window.APP_CONFIG?.contact?.whatsapp ||
      "";

    const email =
      contact.email ||
      company.email ||
      window.APP_CONFIG?.contact?.email ||
      "";

    const address =
      contact.address ||
      company.address ||
      "";

    updateContactElements(
      "phone",
      phone
    );

    updateContactElements(
      "whatsapp",
      whatsapp
    );

    updateContactElements(
      "email",
      email
    );

    updateContactElements(
      "address",
      address
    );

    setupDynamicContactLinks({
      phone,
      whatsapp,
      email,
      address
    });
  }

  function updateContactElements(
    type,
    value
  ) {
    if (!value) {
      return;
    }

    const elements =
      document.querySelectorAll(
        `[data-company-${type}]`
      );

    elements.forEach((element) => {
      element.textContent =
        value;
    });
  }

  function setupDynamicContactLinks(
    contact
  ) {
    const phoneLinks =
      document.querySelectorAll(
        "[data-company-phone-link]"
      );

    phoneLinks.forEach((link) => {
      if (contact.phone) {
        link.href =
          `tel:${contact.phone}`;
      }
    });

    const whatsappLinks =
      document.querySelectorAll(
        "[data-company-whatsapp-link]"
      );

    whatsappLinks.forEach((link) => {
      const url =
        buildWhatsAppURL(
          contact.whatsapp
        );

      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel =
          "noopener noreferrer";
      }
    });

    const emailLinks =
      document.querySelectorAll(
        "[data-company-email-link]"
      );

    emailLinks.forEach((link) => {
      if (contact.email) {
        link.href =
          `mailto:${contact.email}`;
      }
    });

    const mapLinks =
      document.querySelectorAll(
        "[data-company-map-link]"
      );

    mapLinks.forEach((link) => {
      const mapURL =
        buildMapURL(
          contact.address
        );

      if (mapURL) {
        link.href = mapURL;
        link.target = "_blank";
        link.rel =
          "noopener noreferrer";
      }
    });
  }

  function handleWhatsAppClick(event) {
    const button =
      event.currentTarget;

    const phone =
      button.getAttribute(
        "data-whatsapp"
      ) ||
      button.getAttribute(
        "data-phone"
      ) ||
      window.APP_CONFIG?.contact?.whatsapp ||
      "";

    const url =
      buildWhatsAppURL(phone);

    if (!url) {
      return;
    }

    event.preventDefault();

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handlePhoneClick(event) {
    const button =
      event.currentTarget;

    const phone =
      button.getAttribute(
        "data-phone"
      ) ||
      window.APP_CONFIG?.contact?.phone ||
      "";

    if (!phone) {
      return;
    }

    event.preventDefault();

    window.location.href =
      `tel:${phone}`;
  }

  function handleEmailClick(event) {
    const button =
      event.currentTarget;

    const email =
      button.getAttribute(
        "data-email"
      ) ||
      window.APP_CONFIG?.contact?.email ||
      "";

    if (!email) {
      return;
    }

    event.preventDefault();

    window.location.href =
      `mailto:${email}`;
  }

  function handleLocationClick(event) {
    const button =
      event.currentTarget;

    const address =
      button.getAttribute(
        "data-map"
      ) ||
      button.getAttribute(
        "data-address"
      ) ||
      "";

    const url =
      buildMapURL(address);

    if (!url) {
      return;
    }

    event.preventDefault();

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function buildWhatsAppURL(
    phone,
    message = ""
  ) {
    const cleanPhone =
      String(phone || "")
        .replace(/[^\d]/g, "");

    if (!cleanPhone) {
      return "";
    }

    let url =
      `https://wa.me/${cleanPhone}`;

    if (message) {
      url +=
        `?text=${encodeURIComponent(
          message
        )}`;
    }

    return url;
  }

  function buildMapURL(address) {
    const cleanAddress =
      String(address || "").trim();

    if (!cleanAddress) {
      return "";
    }

    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(
        cleanAddress
      )
    );
  }

  function getContactInfo() {
    return {
      phone:
        window.APP_CONFIG?.contact?.phone ||
        "",

      whatsapp:
        window.APP_CONFIG?.contact?.whatsapp ||
        "",

      email:
        window.APP_CONFIG?.contact?.email ||
        "",

      country:
        window.APP_CONFIG?.contact?.country ||
        "Saudi Arabia"
    };
  }

  window.AlDahayanContact = {
    initialize:
      initializeContact,

    loadCompanyContactData,

    getContactInfo,

    buildWhatsAppURL,

    buildMapURL
  };

  window.initializeContact =
    initializeContact;

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
