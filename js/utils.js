(function () {
  "use strict";

  /*
   * Al-Dahayan Shared Utilities
   *
   * Common helper functions used across
   * the website frontend.
   */

  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function qsa(selector, parent = document) {
    return Array.from(
      parent.querySelectorAll(selector)
    );
  }

  function getElement(
    selectorOrElement,
    parent = document
  ) {
    if (
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
    const element =
      document.createElement(
        tagName
      );

    if (options.className) {
      element.className =
        options.className;
    }

    if (options.id) {
      element.id = options.id;
    }

    if (
      options.textContent !==
      undefined
    ) {
      element.textContent =
        options.textContent;
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
          element.dataset[key] =
            String(value);
        }
      );
    }

    return element;
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizeOEM(value) {
    return String(value || "")
      .toUpperCase()
      .replace(
        /[\s\-_.]/g,
        ""
      );
  }

  function normalizeVIN(value) {
    return String(value || "")
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        ""
      )
      .slice(0, 17);
  }

  function normalizePhone(value) {
    return String(value || "")
      .replace(
        /[^0-9+]/g,
        ""
      )
      .replace(
        /^\+/,
        ""
      );
  }

  function escapeHTML(value) {
    const div =
      document.createElement(
        "div"
      );

    div.textContent =
      String(value ?? "");

    return div.innerHTML;
  }

  function isEmpty(value) {
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

    return false;
  }

  function getUniqueValues(
    values
  ) {
    return [
      ...new Set(
        (Array.isArray(values)
          ? values
          : []
        )
          .filter(
            (value) =>
              value !==
                undefined &&
              value !== null
          )
          .map((value) =>
            String(value).trim()
          )
          .filter(Boolean)
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
      (item) => {
        return Object.entries(
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

            return (
              normalizeText(
                actual
              ) ===
              normalizeText(
                expected
              )
            );
          }
        );
      }
    );
  }

  function getNestedValue(
    object,
    path
  ) {
    if (
      !object ||
      !path
    ) {
      return undefined;
    }

    return String(path)
      .split(".")
      .reduce(
        (current, key) =>
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

    let current = object;

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
          current[key] === null
        ) {
          current[key] = {};
        }

        current =
          current[key];
      }
    );

    return object;
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
      return new Intl.NumberFormat(
        options.locale ||
          getCurrentLocale(),
        options
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
      return new Intl.NumberFormat(
        options.locale ||
          getCurrentLocale(),
        {
          style: "currency",
          currency,
          ...options
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
      return new Intl.DateTimeFormat(
        options.locale ||
          getCurrentLocale(),
        options
      ).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }

  function getCurrentLocale() {
    const language =
      document.documentElement.getAttribute(
        "lang"
      ) ||
      window.APP_CONFIG?.site
        ?.defaultLanguage ||
      "en";

    return language === "ar"
      ? "ar-SA"
      : "en-SA";
  }

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
    return new URLSearchParams(
      window.location.search
    ).get(name);
  }

  function setURLParam(
    name,
    value,
    options = {}
  ) {
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

  function debounce(
    callback,
    delay = 300
  ) {
    let timeoutId = null;

    return function (...args) {
      clearTimeout(
        timeoutId
      );

      timeoutId =
        setTimeout(() => {
          callback.apply(
            this,
            args
          );
        }, delay);
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
        `Request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  function readLocalStorage(
    key,
    fallback = null
  ) {
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
    try {
      localStorage.removeItem(
        key
      );

      return true;
    } catch {
      return false;
    }
  }

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

    return `${prefix}-${timestamp}-${random}`;
  }

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
      !navigator.clipboard
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

  function addClass(
    element,
    className
  ) {
    const target =
      getElement(element);

    if (!target) {
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

    if (!target) {
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

    if (!target) {
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

    if (!target) {
      return false;
    }

    target.addEventListener(
      event,
      handler,
      options
    );

    return true;
  }

  function dispatch(
    eventName,
    detail = {}
  ) {
    document.dispatchEvent(
      new CustomEvent(
        eventName,
        {
          detail
        }
      )
    );
  }

  window.AlDahayanUtils = {
    qs,
    qsa,
    getElement,
    createElement,

    normalizeText,
    normalizeOEM,
    normalizeVIN,
    normalizePhone,

    escapeHTML,
    isEmpty,

    getUniqueValues,
    sortBy,
    filterBy,
    getNestedValue,
    setNestedValue,

    formatNumber,
    formatCurrency,
    formatDate,
    getCurrentLocale,

    getURLParams,
    getURLParam,
    setURLParam,

    debounce,
    throttle,

    fetchJSON,

    readLocalStorage,
    writeLocalStorage,
    removeLocalStorage,

    generateID,

    scrollToElement,
    copyToClipboard,

    isRTL,
    isMobile,
    isTablet,
    isDesktop,

    addClass,
    removeClass,
    toggleClass,

    on,
    dispatch
  };

})();
