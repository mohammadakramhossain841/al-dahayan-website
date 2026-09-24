/* =========================================
   AL-DAHAYAN CONTACT SYSTEM
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let companyData = null;

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
      companyName: document.querySelector(
        "[data-company-name]"
      ),

      companyArabicName: document.querySelector(
        "[data-company-arabic-name]"
      ),

      description: document.querySelector(
        "[data-company-description]"
      ),

      phone: document.querySelectorAll(
        "[data-contact-phone]"
      ),

      whatsapp: document.querySelectorAll(
        "[data-contact-whatsapp]"
      ),

      email: document.querySelectorAll(
        "[data-contact-email]"
      ),

      address: document.querySelectorAll(
        "[data-company-address]"
      ),

      city: document.querySelectorAll(
        "[data-company-city]"
      ),

      country: document.querySelectorAll(
        "[data-company-country]"
      ),

      website: document.querySelectorAll(
        "[data-company-website]"
      ),

      map: document.querySelectorAll(
        "[data-contact-map]"
      ),

      facebook: document.querySelectorAll(
        "[data-contact-facebook]"
      ),

      instagram: document.querySelectorAll(
        "[data-contact-instagram]"
      ),

      linkedin: document.querySelectorAll(
        "[data-contact-linkedin]"
      ),

      twitter: document.querySelectorAll(
        "[data-contact-twitter]"
      )
    };
  }

  async function loadCompanyData() {
    if (companyData) {
      return companyData;
    }

    if (
      typeof window.getDataPath !==
      "function"
    ) {
      throw new Error(
        "getDataPath() is not available."
      );
    }

    const response = await fetch(
      window.getDataPath("company.json"),
      {
        cache: "no-cache"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load company.json: ${response.status}`
      );
    }

    const data =
      await response.json();

    companyData =
      data.company ||
      data.data ||
      data;

    return companyData;
  }

  function getNested(
    object,
    paths
  ) {
    for (const path of paths) {
      const parts =
        path.split(".");

      let value =
        object;

      for (const part of parts) {
        if (
          value === null ||
          value === undefined
        ) {
          break;
        }

        value =
          value[part];
      }

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return "";
  }

  function getCompanyInfo() {
    const data =
      companyData || {};

    return {
      name:
        getNested(data, [
          "name",
          "companyName",
          "company.name"
        ]),

      arabicName:
        getNested(data, [
          "arabicName",
          "companyArabicName",
          "company.arabicName"
        ]),

      description:
        getNested(data, [
          "description",
          "company.description"
        ]),

      phone:
        getNested(data, [
          "phone",
          "contact.phone",
          "contact.phoneNumber"
        ]),

      whatsapp:
        getNested(data, [
          "whatsapp",
          "contact.whatsapp",
          "contact.whatsappNumber"
        ]),

      email:
        getNested(data, [
          "email",
          "contact.email"
        ]),

      address:
        getNested(data, [
          "address",
          "location.address",
          "contact.address"
        ]),

      city:
        getNested(data, [
          "city",
          "location.city",
          "contact.city"
        ]),

      country:
        getNested(data, [
          "country",
          "location.country",
          "contact.country"
        ]),

      website:
        getNested(data, [
          "website",
          "contact.website"
        ]),

      map:
        getNested(data, [
          "map",
          "mapUrl",
          "mapURL",
          "location.map",
          "location.mapUrl"
        ]),

      facebook:
        getNested(data, [
          "social.facebook",
          "facebook"
        ]),

      instagram:
        getNested(data, [
          "social.instagram",
          "instagram"
        ]),

      linkedin:
        getNested(data, [
          "social.linkedin",
          "linkedin"
        ]),

      twitter:
        getNested(data, [
          "social.twitter",
          "twitter",
          "x"
        ])
    };
  }

  function setText(
    elements,
    value
  ) {
    if (!elements) {
      return;
    }

    elements.forEach((element) => {
      if (!value) {
        element.hidden = true;
        return;
      }

      element.textContent =
        value;

      element.hidden = false;
    });
  }

  function setLink(
    elements,
    href,
    options = {}
  ) {
    if (!elements) {
      return;
    }

    elements.forEach((element) => {
      if (!href) {
        element.hidden = true;
        return;
      }

      element.hidden = false;

      element.href = href;

      if (options.target) {
        element.target =
          options.target;
      }

      if (options.rel) {
        element.rel =
          options.rel;
      }
    });
  }

  function normalizePhone(
    phone
  ) {
    return normalize(phone)
      .replace(
        /[^\d+]/g,
        ""
      );
  }

  function normalizeWhatsApp(
    whatsapp
  ) {
    return normalize(whatsapp)
      .replace(
        /[^\d]/g,
        ""
      );
  }

  function createMapURL(
    info
  ) {
    if (info.map) {
      return info.map;
    }

    const query = [
      info.address,
      info.city,
      info.country
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

  function applyCompanyData() {
    const elements =
      getElements();

    const info =
      getCompanyInfo();

    setText(
      elements.companyName,
      info.name
    );

    setText(
      elements.companyArabicName,
      info.arabicName
    );

    setText(
      elements.description,
      info.description
    );

    setText(
      elements.address,
      info.address
    );

    setText(
      elements.city,
      info.city
    );

    setText(
      elements.country,
      info.country
    );

    setText(
      elements.website,
      info.website
    );

    const phone =
      normalizePhone(
        info.phone
      );

    const whatsapp =
      normalizeWhatsApp(
        info.whatsapp
      );

    if (phone) {
      setLink(
        elements.phone,
        `tel:${phone}`
      );

      setText(
        elements.phone,
        info.phone
      );
    } else {
      setLink(
        elements.phone,
        ""
      );
    }

    if (whatsapp) {
      setLink(
        elements.whatsapp,
        `https://wa.me/${whatsapp}`,
        {
          target: "_blank",
          rel:
            "noopener noreferrer"
        }
      );

      setText(
        elements.whatsapp,
        info.whatsapp
      );
    } else {
      setLink(
        elements.whatsapp,
        ""
      );
    }

    if (info.email) {
      setLink(
        elements.email,
        `mailto:${info.email}`
      );

      setText(
        elements.email,
        info.email
      );
    } else {
      setLink(
        elements.email,
        ""
      );
    }

    const mapURL =
      createMapURL(info);

    setLink(
      elements.map,
      mapURL,
      {
        target: "_blank",
        rel:
          "noopener noreferrer"
      }
    );

    if (info.website) {
      let websiteURL =
        info.website;

      if (
        !/^https?:\/\//i.test(
          websiteURL
        )
      ) {
        websiteURL =
          `https://${websiteURL}`;
      }

      setLink(
        elements.website,
        websiteURL,
        {
          target: "_blank",
          rel:
            "noopener noreferrer"
        }
      );
    } else {
      setLink(
        elements.website,
        ""
      );
    }

    applySocialLink(
      elements.facebook,
      info.facebook
    );

    applySocialLink(
      elements.instagram,
      info.instagram
    );

    applySocialLink(
      elements.linkedin,
      info.linkedin
    );

    applySocialLink(
      elements.twitter,
      info.twitter
    );
  }

  function applySocialLink(
    elements,
    url
  ) {
    if (!url) {
      setLink(
        elements,
        ""
      );

      return;
    }

    let finalURL =
      normalize(url);

    if (
      !/^https?:\/\//i.test(
        finalURL
      )
    ) {
      finalURL =
        `https://${finalURL}`;
    }

    setLink(
      elements,
      finalURL,
      {
        target: "_blank",
        rel:
          "noopener noreferrer"
      }
    );
  }

  function initializeContact() {
    if (initialized) {
      return;
    }

    initialized = true;

    loadCompanyData()
      .then(() => {
        applyCompanyData();

        document.dispatchEvent(
          new CustomEvent(
            "alDahayanContactReady",
            {
              detail: {
                company:
                  getCompanyInfo()
              }
            }
          )
        );
      })
      .catch((error) => {
        console.error(
          "Al-Dahayan Contact:",
          error
        );

        document.dispatchEvent(
          new CustomEvent(
            "alDahayanContactError",
            {
              detail: {
                error
              }
            }
          )
        );
      });
  }

  window.AlDahayanContact = {
    init:
      initializeContact,

    load:
      loadCompanyData,

    getCompany:
      getCompanyInfo,

    refresh:
      applyCompanyData
  };

  window.initializeContact =
    initializeContact;

  document.addEventListener(
    "DOMContentLoaded",
    initializeContact
  );

})();
