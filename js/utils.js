(function () {
  "use strict";

  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function qsa(selector, parent = document) {
    return Array.from(
      parent.querySelectorAll(selector)
    );
  }

  function getElement(id) {
    return document.getElementById(id);
  }

  function isObject(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }

  function isArray(value) {
    return Array.isArray(value);
  }

  function isEmpty(value) {
    return (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    );
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizeSearchText(value) {
    return normalizeText(value)
      .toLowerCase();
  }

  function normalizeOEM(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[\s-]/g, "");
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatNumber(
    value,
    locale = "en-US"
  ) {
    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return new Intl.NumberFormat(
      locale
    ).format(number);
  }

  function formatCurrency(
    value,
    currency = "SAR",
    locale = "en-SA"
  ) {
    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return new Intl.NumberFormat(
      locale,
      {
        style: "currency",
        currency
      }
    ).format(number);
  }

  function formatDate(
    value,
    locale = "en-US"
  ) {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    ).format(date);
  }

  function formatDateTime(
    value,
    locale = "en-US"
  ) {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);
  }

  function getURLParameter(
    name
  ) {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return params.get(name);
  }

  function getAllURLParameters() {
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

  function setURLParameter(
    name,
    value
  ) {
    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      name,
      value
    );

    window.history.replaceState(
      {},
      "",
      url
    );
  }

  function removeURLParameter(
    name
  ) {
    const url =
      new URL(
        window.location.href
      );

    url.searchParams.delete(
      name
    );

    window.history.replaceState(
      {},
      "",
      url
    );
  }

  function debounce(
    callback,
    delay = 300
  ) {
    let timeout;

    return function (...args) {
      clearTimeout(timeout);

      timeout = setTimeout(
        () => {
          callback.apply(
            this,
            args
          );
        },
        delay
      );
    };
  }

  function throttle(
    callback,
    delay = 300
  ) {
    let waiting = false;

    return function (...args) {
      if (waiting) {
        return;
      }

      callback.apply(
        this,
        args
      );

      waiting = true;

      setTimeout(() => {
        waiting = false;
      }, delay);
    };
  }

  function generateId(
    prefix = "ID"
  ) {
    const timestamp =
      Date.now();

    const random =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return `${prefix}-${timestamp}-${random}`;
  }

  function getUniqueValues(
    values
  ) {
    return [
      ...new Set(
        values
          .filter(
            (value) =>
              value !== undefined &&
              value !== null &&
              String(value).trim() !== ""
          )
          .map((value) =>
            String(value).trim()
          )
      )
    ];
  }

  function sortBy(
    array,
    key,
    direction = "asc"
  ) {
    if (!Array.isArray(array)) {
      return [];
    }

    return [...array].sort(
      (a, b) => {
        const first =
          String(
            a?.[key] ?? ""
          ).toLowerCase();

        const second =
          String(
            b?.[key] ?? ""
          ).toLowerCase();

        const comparison =
          first.localeCompare(
            second,
            undefined,
            {
              numeric: true
            }
          );

        return direction === "desc"
          ? -comparison
          : comparison;
      }
    );
  }

  function filterByValue(
    array,
    key,
    value
  ) {
    if (!Array.isArray(array)) {
      return [];
    }

    const target =
      normalizeSearchText(
        value
      );

    return array.filter(
      (item) =>
        normalizeSearchText(
          item?.[key]
        ).includes(target)
    );
  }

  function safeJSONParse(
    value,
    fallback = null
  ) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function safeJSONStringify(
    value,
    fallback = "{}"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch (error) {
      return fallback;
    }
  }

  function saveLocalData(
    key,
    value
  ) {
    try {
      localStorage.setItem(
        key,
        safeJSONStringify(
          value
        )
      );

      return true;
    } catch (error) {
      console.warn(
        "Local storage save failed:",
        error
      );

      return false;
    }
  }

  function getLocalData(
    key,
    fallback = null
  ) {
    try {
      const value =
        localStorage.getItem(
          key
        );

      if (value === null) {
        return fallback;
      }

      return safeJSONParse(
        value,
        fallback
      );
    } catch (error) {
      return fallback;
    }
  }

  function removeLocalData(
    key
  ) {
    try {
      localStorage.removeItem(
        key
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  async function fetchJSON(
    url,
    options = {}
  ) {
    const response =
      await fetch(
        url,
        options
      );

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status}`
      );
    }

    return response.json();
  }

  function createElement(
    tag,
    options = {}
  ) {
    const element =
      document.createElement(
        tag
      );

    if (options.className) {
      element.className =
        options.className;
    }

    if (options.id) {
      element.id =
        options.id;
    }

    if (options.text) {
      element.textContent =
        options.text;
    }

    if (options.html) {
      element.innerHTML =
        options.html;
    }

    if (options.attributes) {
      Object.entries(
        options.attributes
      ).forEach(
        ([name, value]) => {
          element.setAttribute(
            name,
            value
          );
        }
      );
    }

    return element;
  }

  function scrollToElement(
    element,
    behavior = "smooth"
  ) {
    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior,
      block: "start"
    });
  }

  function copyToClipboard(
    value
  ) {
    if (
      !navigator.clipboard
    ) {
      return Promise.reject(
        new Error(
          "Clipboard API unavailable."
        )
      );
    }

    return navigator.clipboard.writeText(
      String(value || "")
    );
  }

  function isMobileDevice() {
    return window.matchMedia(
      "(max-width: 768px)"
    ).matches;
  }

  function isRTL() {
    return (
      document.documentElement
        .getAttribute("dir") ===
      "rtl"
    );
  }

  window.AlDahayanUtils = {
    qs,
    qsa,
    getElement,

    isObject,
    isArray,
    isEmpty,

    normalizeText,
    normalizeSearchText,
    normalizeOEM,
    escapeHTML,

    formatNumber,
    formatCurrency,
    formatDate,
    formatDateTime,

    getURLParameter,
    getAllURLParameters,
    setURLParameter,
    removeURLParameter,

    debounce,
    throttle,
    generateId,

    getUniqueValues,
    sortBy,
    filterByValue,

    safeJSONParse,
    safeJSONStringify,

    saveLocalData,
    getLocalData,
    removeLocalData,

    fetchJSON,
    createElement,
    scrollToElement,
    copyToClipboard,

    isMobileDevice,
    isRTL
  };
})();
