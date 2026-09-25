/* =========================================
   AL-DAHAYAN SHARED UTILITIES
   Centralized, Safe & Config-Aware
========================================= */

(function () {
  "use strict";

  /* =========================================
     CONFIG
  ========================================= */

  function getConfig() {
    return window.AlDahayanConfig || null;
  }

  function getEffectiveConfig() {
    const config = getConfig();

    if (
      config &&
      typeof config.getEffectiveAppConfig ===
        "function"
    ) {
      return config.getEffectiveAppConfig();
    }

    return config || {};
  }

  function getRootPath() {
    const config =
      getEffectiveConfig();

    if (
      config.paths &&
      typeof config.paths.root ===
        "string"
    ) {
      return config.paths.root;
    }

    if (
      typeof window.getProjectRoot ===
      "function"
    ) {
      return window.getProjectRoot();
    }

    const path =
      window.location.pathname || "";

    if (
      path.includes("/pages/") ||
      path.includes("/admin/")
    ) {
      return "../";
    }

    return "./";
  }

  function getDataPath(
    file
  ) {
    if (!file) {
      return null;
    }

    const config =
      getEffectiveConfig();

    if (
      config.paths &&
      typeof config.paths.data ===
        "string"
    ) {
      return (
        config.paths.data +
        String(file).replace(
          /^\/+/,
          ""
        )
      );
    }

    return (
      getRootPath() +
      "data/" +
      String(file).replace(
        /^\/+/,
        ""
      )
    );
  }

  function getPagePath(
    file
  ) {
    if (!file) {
      return null;
    }

    const config =
      getEffectiveConfig();

    if (
      config.paths &&
      typeof config.paths.pages ===
        "string"
    ) {
      return (
        config.paths.pages +
        String(file).replace(
          /^\/+/,
          ""
        )
      );
    }

    return (
      getRootPath() +
      "pages/" +
      String(file).replace(
        /^\/+/,
        ""
      )
    );
  }

  function getComponentPath(
    file
  ) {
    if (!file) {
      return null;
    }

    const config =
      getEffectiveConfig();

    if (
      config.paths &&
      typeof config.paths.components ===
        "string"
    ) {
      return (
        config.paths.components +
        String(file).replace(
          /^\/+/,
          ""
        )
      );
    }

    return (
      getRootPath() +
      "components/" +
      String(file).replace(
        /^\/+/,
        ""
      )
    );
  }

  /* =========================================
     DOM
  ========================================= */

  function qs(
    selector,
    parent = document
  ) {
    if (
      !selector ||
      !parent ||
      typeof parent.querySelector !==
        "function"
    ) {
      return null;
    }

    return parent.querySelector(
      selector
    );
  }

  function qsa(
    selector,
    parent = document
  ) {
    if (
      !selector ||
      !parent ||
      typeof parent.querySelectorAll !==
        "function"
    ) {
      return [];
    }

    return Array.from(
      parent.querySelectorAll(
        selector
      )
    );
  }

  function getElement(
    selectorOrElement,
    parent = document
  ) {
    if (
      typeof Element !==
      "undefined" &&
      selectorOrElement instanceof
        Element
    ) {
      return selectorOrElement;
    }

    if (
      typeof selectorOrElement !==
      "string"
    ) {
      return null;
    }

    return qs(
      selectorOrElement,
      parent
    );
  }

  function createElement(
    tagName,
    options = {}
  ) {
    if (
      !tagName ||
      typeof document.createElement !==
        "function"
    ) {
      return null;
    }

    const element =
      document.createElement(
        tagName
      );

    if (options.className) {
      element.className =
        options.className;
    }

    if (options.id) {
      element.id =
        options.id;
    }

    if (
      options.textContent !==
      undefined
    ) {
      element.textContent =
        options.textContent;
    }

    if (
      options.html !==
      undefined
    ) {
      element.innerHTML =
        String(options.html);
    }

    if (options.attributes) {
      Object.entries(
        options.attributes
      ).forEach(
        ([name, value]) => {
          if (
            value !==
              undefined &&
            value !== null
          ) {
            element.setAttribute(
              name,
              String(value)
            );
          }
        }
      );
    }

    if (options.dataset) {
      Object.entries(
        options.dataset
      ).forEach(
        ([key, value]) => {
          if (
            value !==
              undefined &&
            value !== null
          ) {
            element.dataset[key] =
              String(value);
          }
        }
      );
    }

    return element;
  }

  /* =========================================
     TEXT / NORMALIZATION
  ========================================= */

  function normalizeText(
    value
  ) {
    return String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizeOEM(
    value
  ) {
    return String(value ?? "")
      .toUpperCase()
      .replace(
        /[\s\-_.]/g,
        ""
      );
  }

  function isValidOEM(
    value
  ) {
    const normalized =
      normalizeOEM(value);

    if (!normalized) {
      return false;
    }

    /*
     * OEM values may contain
     * letters and numbers.
     */
    return /^[A-Z0-9]+$/.test(
      normalized
    );
  }

  function normalizeVIN(
    value
  ) {
    return String(value ?? "")
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        ""
      )
      .replace(
        /[IOQ]/g,
        ""
      )
      .slice(0, 17);
  }

  function isValidVIN(
    value
  ) {
    const vin =
      normalizeVIN(value);

    return (
      vin.length === 17 &&
      !/[IOQ]/.test(vin)
    );
  }

  function normalizePhone(
    value
  ) {
    return String(value ?? "")
      .replace(
        /[^0-9+]/g,
        ""
      )
      .replace(
        /^\+/,
        ""
      );
  }

  function isValidPhone(
    value
  ) {
    const phone =
      normalizePhone(value);

    return (
      /^\d{7,15}$/.test(
        phone
      )
    );
  }

  function escapeHTML(
    value
  ) {
    if (
      typeof document ===
      "undefined"
    ) {
      return String(value ?? "");
    }

    const div =
      document.createElement(
        "div"
      );

    div.textContent =
      String(value ?? "");

    return div.innerHTML;
  }

  function isEmpty(
    value
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      return true;
    }

    if (
      typeof value ===
      "string"
    ) {
      return (
        value.trim() === ""
      );
    }

    if (
      Array.isArray(value)
    ) {
      return value.length === 0;
    }

    if (
      typeof value ===
      "object"
    ) {
      return (
        Object.keys(value).length ===
        0
      );
    }

    return false;
  }

  function getUniqueValues(
    values
  ) {
    return [
      ...new Set(
        (
          Array.isArray(values)
            ? values
            : []
        )
          .filter(
            (value) =>
              value !==
                undefined &&
              value !== null
          )
          .map(
            (value) =>
              String(value).trim()
          )
          .filter(Boolean)
      )
    ];
  }

  /* =========================================
     OBJECT / ARRAY
  ========================================= */

  function getNestedValue(
    object,
    path
  ) {
    if (
      object === null ||
      object === undefined ||
      !path
    ) {
      return undefined;
    }

    return String(path)
      .split(".")
      .reduce(
        (
          current,
          key
        ) =>
          current !==
              null &&
          current !==
              undefined
            ? current[key]
            : undefined,
        object
      );
  }

  function setNestedValue(
    object,
    path,
    value
  ) {
    if (
      !object ||
      !path
    ) {
      return object;
    }

    const keys =
      String(path).split(
        "."
      );

    let current =
      object;

    keys.forEach(
      (key, index) => {
        if (
          index ===
          keys.length - 1
        ) {
          current[key] =
            value;
          return;
        }

        if (
          typeof current[key] !==
            "object" ||
          current[key] === null ||
          Array.isArray(
            current[key]
          )
        ) {
          current[key] = {};
        }

        current =
          current[key];
      }
    );

    return object;
  }

  function sortBy(
    array,
    key,
    direction = "asc"
  ) {
    if (!Array.isArray(array)) {
      return [];
    }

    const multiplier =
      direction === "desc"
        ? -1
        : 1;

    return [...array].sort(
      (a, b) => {
        const aValue =
          getNestedValue(
            a,
            key
          );

        const bValue =
          getNestedValue(
            b,
            key
          );

        if (
          aValue ===
          bValue
        ) {
          return 0;
        }

        if (
          aValue ===
            undefined ||
          aValue === null
        ) {
          return 1;
        }

        if (
          bValue ===
            undefined ||
          bValue === null
        ) {
          return -1;
        }

        return (
          String(aValue)
            .localeCompare(
              String(bValue),
              undefined,
              {
                numeric: true,
                sensitivity:
                  "base"
              }
            ) *
          multiplier
        );
      }
    );
  }

  function filterBy(
    array,
    filters = {}
  ) {
    if (!Array.isArray(array)) {
      return [];
    }

    return array.filter(
      (item) =>
        Object.entries(
          filters
        ).every(
          ([key, expected]) => {
            if (
              expected ===
                undefined ||
              expected ===
                null ||
              expected === ""
            ) {
              return true;
            }

            const actual =
              getNestedValue(
                item,
                key
              );

            if (
              typeof expected ===
              "function"
            ) {
              return expected(
                actual,
                item
              );
            }

            if (
              Array.isArray(
                expected
              )
            ) {
              return expected.some(
                (value) =>
                  normalizeText(
                    actual
                  ) ===
                  normalizeText(
                    value
                  )
              );
            }

            return (
              normalizeText(
                actual
              ) ===
              normalizeText(
                expected
              )
            );
          }
        )
    );
  }

  /* =========================================
     NUMBER / CURRENCY / DATE
  ========================================= */

  function getCurrentLocale() {
    const language =
      document.documentElement.getAttribute(
        "lang"
      ) ||
      window.AlDahayanLanguage?.getCurrent?.() ||
      getEffectiveConfig().site
        ?.defaultLanguage ||
      "en";

    return language === "ar"
      ? "ar-SA"
      : "en-SA";
  }

  function formatNumber(
    value,
    options = {}
  ) {
    const number =
      Number(value);

    if (
      !Number.isFinite(
        number
      )
    ) {
      return "0";
    }

    try {
      const {
        locale,
        ...formatOptions
      } = options;

      return new Intl.NumberFormat(
        locale ||
          getCurrentLocale(),
        formatOptions
      ).format(number);
    } catch {
      return String(number);
    }
  }

  function formatCurrency(
    value,
    currency = "SAR",
    options = {}
  ) {
    const number =
      Number(value);

    if (
      !Number.isFinite(
        number
      )
    ) {
      return "-";
    }

    try {
      const {
        locale,
        ...formatOptions
      } = options;

      return new Intl.NumberFormat(
        locale ||
          getCurrentLocale(),
        {
          style: "currency",
          currency,
          ...formatOptions
        }
      ).format(number);
    } catch {
      return `${currency} ${number}`;
    }
  }

  function formatDate(
    value,
    options = {}
  ) {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    try {
      const {
        locale,
        ...formatOptions
      } = options;

      return new Intl.DateTimeFormat(
        locale ||
          getCurrentLocale(),
        formatOptions
      ).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }

  /* =========================================
     URL
  ========================================= */

  function getURLParams() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const result = {};

    params.forEach(
      (value, key) => {
        result[key] = value;
      }
    );

    return result;
  }

  function getURLParam(
    name
  ) {
    if (!name) {
      return null;
    }

    return new URLSearchParams(
      window.location.search
    ).get(name);
  }

  function setURLParam(
    name,
    value,
    options = {}
  ) {
    if (!name) {
      return null;
    }

    const url =
      new URL(
        window.location.href
      );

    if (
      value ===
        null ||
      value ===
        undefined ||
      value === ""
    ) {
      url.searchParams.delete(
        name
      );
    } else {
      url.searchParams.set(
        name,
        value
      );
    }

    if (
      options.replace !==
      false
    ) {
      window.history.replaceState(
        {},
        "",
        url.toString()
      );
    } else {
      window.history.pushState(
        {},
        "",
        url.toString()
      );
    }

    return url;
  }

  function isSafeExternalURL(
    value,
    options = {}
  ) {
    if (!value) {
      return false;
    }

    try {
      const url =
        new URL(
          value,
          window.location.origin
        );

      if (
        url.protocol !==
          "http:" &&
        url.protocol !==
          "https:"
      ) {
        return false;
      }

      if (
        options.sameOriginOnly ===
        true
      ) {
        return (
          url.origin ===
          window.location.origin
        );
      }

      return true;
    } catch {
      return false;
    }
  }

  function isSafeWhatsAppURL(
    value
  ) {
    if (!value) {
      return false;
    }

    try {
      const url =
        new URL(
          value,
          window.location.origin
        );

      return (
        url.protocol ===
          "https:" &&
        (
          url.hostname ===
            "wa.me" ||
          url.hostname ===
            "api.whatsapp.com" ||
          url.hostname.endsWith(
            ".whatsapp.com"
          )
        )
      );
    } catch {
      return false;
    }
  }

  function buildWhatsAppURL(
    phone,
    message = ""
  ) {
    const normalized =
      normalizePhone(phone);

    if (
      !normalized
    ) {
      return "";
    }

    const url =
      new URL(
        `https://wa.me/${normalized}`
      );

    if (message) {
      url.searchParams.set(
        "text",
        String(message)
      );
    }

    return url.toString();
  }

  /* =========================================
     TIMING
  ========================================= */

  function debounce(
    callback,
    delay = 300
  ) {
    let timeoutId =
      null;

    const debounced =
      function (...args) {
        clearTimeout(
          timeoutId
        );

        timeoutId =
          setTimeout(
            () => {
              callback.apply(
                this,
                args
              );
            },
            delay
          );
      };

    debounced.cancel =
      function () {
        clearTimeout(
          timeoutId
        );
        timeoutId = null;
      };

    return debounced;
  }

  function throttle(
    callback,
    delay = 300
  ) {
    let waiting = false;
    let lastArgs = null;
    let lastThis = null;

    return function (...args) {
      if (waiting) {
        lastArgs = args;
        lastThis = this;
        return;
      }

      callback.apply(
        this,
        args
      );

      waiting = true;

      setTimeout(
        () => {
          waiting = false;

          if (lastArgs) {
            const argsToUse =
              lastArgs;
            const thisToUse =
              lastThis;

            lastArgs = null;
            lastThis = null;

            callback.apply(
              thisToUse,
              argsToUse
            );
          }
        },
        delay
      );
    };
  }

  /* =========================================
     NETWORK / JSON
  ========================================= */

  async function fetchJSON(
    url,
    options = {}
  ) {
    if (!url) {
      throw new Error(
        "A JSON URL is required."
      );
    }

    const response =
      await fetch(
        url,
        {
          ...options,
          headers: {
            Accept:
              "application/json",
            ...(options.headers ||
              {})
          }
        }
      );

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`
      );
    }

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType.includes(
        "application/json"
      )
    ) {
      throw new Error(
        "Expected a JSON response."
      );
    }

    return response.json();
  }

  async function fetchText(
    url,
    options = {}
  ) {
    if (!url) {
      throw new Error(
        "A URL is required."
      );
    }

    const response =
      await fetch(
        url,
        options
      );

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.text();
  }

  /* =========================================
     LOCAL STORAGE
  ========================================= */

  function readLocalStorage(
    key,
    fallback = null
  ) {
    if (!key) {
      return fallback;
    }

    try {
      const value =
        localStorage.getItem(
          key
        );

      if (
        value === null
      ) {
        return fallback;
      }

      return JSON.parse(
        value
      );
    } catch {
      return fallback;
    }
  }

  function writeLocalStorage(
    key,
    value
  ) {
    if (!key) {
      return false;
    }

    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch {
      return false;
    }
  }

  function removeLocalStorage(
    key
  ) {
    if (!key) {
      return false;
    }

    try {
      localStorage.removeItem(
        key
      );

      return true;
    } catch {
      return false;
    }
  }

  /* =========================================
     ID / TIMESTAMP
  ========================================= */

  function generateID(
    prefix = "ID"
  ) {
    const timestamp =
      Date.now().toString(
        36
      );

    const random =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return `${String(
      prefix
    ).toUpperCase()}-${timestamp}-${random}`;
  }

  function getTimestamp() {
    return new Date().toISOString();
  }

  /* =========================================
     UI
  ========================================= */

  function scrollToElement(
    element,
    options = {}
  ) {
    const target =
      getElement(element);

    if (!target) {
      return false;
    }

    target.scrollIntoView({
      behavior:
        options.behavior ||
        "smooth",
      block:
        options.block ||
        "start",
      inline:
        options.inline ||
        "nearest"
    });

    return true;
  }

  async function copyToClipboard(
    value
  ) {
    if (
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !==
        "function"
    ) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(
        String(value ?? "")
      );

      return true;
    } catch {
      return false;
    }
  }

  function isRTL() {
    return (
      document.documentElement.getAttribute(
        "dir"
      ) === "rtl" ||
      document.documentElement.getAttribute(
        "lang"
      ) === "ar"
    );
  }

  function isMobile() {
    return window.matchMedia(
      "(max-width: 768px)"
    ).matches;
  }

  function isTablet() {
    return window.matchMedia(
      "(min-width: 769px) and (max-width: 1024px)"
    ).matches;
  }

  function isDesktop() {
    return window.matchMedia(
      "(min-width: 1025px)"
    ).matches;
  }

  /* =========================================
     CLASS / EVENTS
  ========================================= */

  function addClass(
    element,
    className
  ) {
    const target =
      getElement(element);

    if (
      !target ||
      !className
    ) {
      return false;
    }

    target.classList.add(
      className
    );

    return true;
  }

  function removeClass(
    element,
    className
  ) {
    const target =
      getElement(element);

    if (
      !target ||
      !className
    ) {
      return false;
    }

    target.classList.remove(
      className
    );

    return true;
  }

  function toggleClass(
    element,
    className,
    force
  ) {
    const target =
      getElement(element);

    if (
      !target ||
      !className
    ) {
      return false;
    }

    return target.classList.toggle(
      className,
      force
    );
  }

  function on(
    element,
    event,
    handler,
    options
  ) {
    const target =
      getElement(element);

    if (
      !target ||
      !event ||
      typeof handler !==
        "function"
    ) {
      return false;
    }

    target.addEventListener(
      event,
      handler,
      options
    );

    return true;
  }

  function off(
    element,
    event,
    handler,
    options
  ) {
    const target =
      getElement(element);

    if (
      !target ||
      !event ||
      typeof handler !==
        "function"
    ) {
      return false;
    }

    target.removeEventListener(
      event,
      handler,
      options
    );

    return true;
  }

  function dispatch(
    eventName,
    detail = {},
    target = document
  ) {
    if (
      !eventName ||
      !target ||
      typeof target.dispatchEvent !==
        "function"
    ) {
      return false;
    }

    target.dispatchEvent(
      new CustomEvent(
        eventName,
        {
          detail
        }
      )
    );

    return true;
  }

  /* =========================================
     PUBLIC API
  ========================================= */

  window.AlDahayanUtils = {

    /* Config / paths */
    getConfig,
    getEffectiveConfig,
    getRootPath,
    getDataPath,
    getPagePath,
    getComponentPath,

    /* DOM */
    qs,
    qsa,
    getElement,
    createElement,

    /* Normalization */
    normalizeText,
    normalizeOEM,
    isValidOEM,
    normalizeVIN,
    isValidVIN,
    normalizePhone,
    isValidPhone,

    /* Safety */
    escapeHTML,
    isSafeExternalURL,
    isSafeWhatsAppURL,
    buildWhatsAppURL,

    /* Values */
    isEmpty,
    getUniqueValues,

    /* Objects / arrays */
    sortBy,
    filterBy,
    getNestedValue,
    setNestedValue,

    /* Formatting */
    formatNumber,
    formatCurrency,
    formatDate,
    getCurrentLocale,

    /* URL */
    getURLParams,
    getURLParam,
    setURLParam,

    /* Timing */
    debounce,
    throttle,

    /* Network */
    fetchJSON,
    fetchText,

    /* Storage */
    readLocalStorage,
    writeLocalStorage,
    removeLocalStorage,

    /* IDs */
    generateID,
    getTimestamp,

    /* UI */
    scrollToElement,
    copyToClipboard,

    /* Responsive / RTL */
    isRTL,
    isMobile,
    isTablet,
    isDesktop,

    /* Classes */
    addClass,
    removeClass,
    toggleClass,

    /* Events */
    on,
    off,
    dispatch
  };

  /* =========================================
     LEGACY GLOBAL SUPPORT
  ========================================= */

  window.AlDahayanUtilsReady =
    true;

})();
