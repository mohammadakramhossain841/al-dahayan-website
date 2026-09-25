/* =========================================
   AL-DAHAYAN SPARE PARTS SEARCH
   OEM / PART SEARCH + VERIFIED INVENTORY
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let parts = [];
  let filteredParts = [];

  const state = {
    query: "",
    oem: "",
    brand: "",
    model: "",
    category: ""
  };

  /* =========================================
     Helpers
  ========================================= */

  function normalize(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[\s\-_.\/]+/g, "");
  }

  function getValue(object, keys) {
    for (const key of keys) {
      if (
        object &&
        key &&
        object[key] !== undefined &&
        object[key] !== null
      ) {
        return object[key];
      }
    }

    return "";
  }

  function getDataPath(file) {
    if (
      window.AlDahayanConfig &&
      typeof window.AlDahayanConfig.getDataPath ===
        "function"
    ) {
      return window.AlDahayanConfig.getDataPath(
        file
      );
    }

    if (
      typeof window.getDataPath ===
      "function"
    ) {
      return window.getDataPath(file);
    }

    return `../data/${file}`;
  }

  function getPartOEM(part) {
    return getValue(part, [
      "oem",
      "oemNumber",
      "oem_number",
      "partNumber",
      "part_number"
    ]);
  }

  function getPartName(part) {
    return getValue(part, [
      "name",
      "partName",
      "part_name",
      "title"
    ]);
  }

  function getPartBrand(part) {
    return getValue(part, [
      "brand",
      "make",
      "manufacturer"
    ]);
  }

  function getPartModel(part) {
    return getValue(part, [
      "model",
      "vehicleModel",
      "vehicle_model"
    ]);
  }

  function getPartCategory(part) {
    return getValue(part, [
      "category",
      "partCategory",
      "part_category"
    ]);
  }

  function getPartID(part) {
    return getValue(part, [
      "id",
      "partId",
      "part_id"
    ]);
  }

  /* =========================================
     Data Loading
  ========================================= */

  async function loadParts() {
    try {
      const path =
        getDataPath(
          "oem-parts.json"
        );

      const response =
        await fetch(path, {
          cache: "no-cache"
        });

      if (!response.ok) {
        throw new Error(
          `Unable to load parts data: ${response.status}`
        );
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        parts = data;
      } else if (
        Array.isArray(data.parts)
      ) {
        parts = data.parts;
      } else if (
        Array.isArray(data.items)
      ) {
        parts = data.items;
      } else {
        parts = [];
      }

      /*
       * Do not expose inactive OEM records
       * on the public website.
       */
      parts = parts.filter(
        (part) =>
          part.active !== false
      );

      filteredParts = [...parts];

      return parts;
    } catch (error) {
      console.error(
        "Al-Dahayan Search:",
        error
      );

      parts = [];
      filteredParts = [];

      return [];
    }
  }

  /* =========================================
     Search Matching
  ========================================= */

  function matchesQuery(
    part,
    query
  ) {
    if (!query) {
      return true;
    }

    const normalizedQuery =
      normalize(query);

    const searchable = [
      getPartOEM(part),
      getPartName(part),
      getPartBrand(part),
      getPartModel(part),
      getPartCategory(part),
      getPartID(part)
    ]
      .map(normalize)
      .filter(Boolean);

    return searchable.some(
      (value) =>
        value.includes(
          normalizedQuery
        )
    );
  }

  function matchesFilter(
    part,
    key,
    value
  ) {
    if (!value) {
      return true;
    }

    const partValue =
      getValue(
        part,
        [
          key,
          key === "brand"
            ? "make"
            : "",
          key === "category"
            ? "partCategory"
            : "",
          key === "model"
            ? "vehicleModel"
            : ""
        ].filter(Boolean)
      );

    /*
     * Model may be an array.
     */
    if (Array.isArray(partValue)) {
      return partValue.some(
        (item) =>
          normalize(item) ===
          normalize(value)
      );
    }

    return (
      normalize(partValue) ===
      normalize(value)
    );
  }

  /* =========================================
     Apply Search
  ========================================= */

  function searchParts(options = {}) {
    const query =
      options.query !== undefined
        ? String(options.query)
        : state.query;

    const oem =
      options.oem !== undefined
        ? String(options.oem)
        : state.oem;

    const brand =
      options.brand !== undefined
        ? String(options.brand)
        : state.brand;

    const model =
      options.model !== undefined
        ? String(options.model)
        : state.model;

    const category =
      options.category !== undefined
        ? String(options.category)
        : state.category;

    state.query =
      query.trim();

    state.oem =
      oem.trim();

    state.brand =
      brand.trim();

    state.model =
      model.trim();

    state.category =
      category.trim();

    filteredParts =
      parts.filter((part) => {

        const queryMatch =
          matchesQuery(
            part,
            state.query
          );

        const oemMatch =
          !state.oem ||
          normalize(
            getPartOEM(part)
          ).includes(
            normalize(state.oem)
          );

        const brandMatch =
          matchesFilter(
            part,
            "brand",
            state.brand
          );

        const modelMatch =
          matchesFilter(
            part,
            "model",
            state.model
          );

        const categoryMatch =
          matchesFilter(
            part,
            "category",
            state.category
          );

        return (
          queryMatch &&
          oemMatch &&
          brandMatch &&
          modelMatch &&
          categoryMatch
        );
      });

    renderResults(
      filteredParts
    );

    updateResultSummary(
      filteredParts.length
    );

    dispatchSearchEvent();

    return [
      ...filteredParts
    ];
  }

  /* =========================================
     Exact OEM Lookup
  ========================================= */

  function getPartByOEM(
    oem
  ) {
    const normalizedOEM =
      normalize(oem);

    if (!normalizedOEM) {
      return null;
    }

    return (
      parts.find(
        (part) =>
          normalize(
            getPartOEM(part)
          ) === normalizedOEM
      ) || null
    );
  }

  /* =========================================
     Part ID Lookup
  ========================================= */

  function getPartByID(
    id
  ) {
    const normalizedID =
      normalize(id);

    if (!normalizedID) {
      return null;
    }

    return (
      parts.find(
        (part) =>
          normalize(
            getPartID(part)
          ) === normalizedID
      ) || null
    );
  }

  /* =========================================
     Suggestions
  ========================================= */

  function getSuggestions(
    query,
    limit = 8
  ) {
    const normalizedQuery =
      normalize(query);

    if (!normalizedQuery) {
      return [];
    }

    const results = [];

    for (const part of parts) {
      const oem =
        getPartOEM(part);

      const name =
        getPartName(part);

      const brand =
        getPartBrand(part);

      const model =
        getPartModel(part);

      const candidates = [
        oem,
        name,
        brand
      ];

      if (Array.isArray(model)) {
        candidates.push(
          ...model
        );
      } else {
        candidates.push(model);
      }

      const matched =
        candidates.some(
          (value) =>
            normalize(value).includes(
              normalizedQuery
            )
        );

      if (!matched) {
        continue;
      }

      results.push({
        id: getPartID(part),
        oem: oem,
        name: name,
        brand: brand,
        model: model
      });

      if (
        results.length >= limit
      ) {
        break;
      }
    }

    return results;
  }

  /* =========================================
     Unique Filters
  ========================================= */

  function getUniqueValues(
    key
  ) {
    const values = new Set();

    parts.forEach((part) => {
      let value = "";

      if (key === "brand") {
        value =
          getPartBrand(part);
      }

      if (key === "model") {
        value =
          getPartModel(part);
      }

      if (key === "category") {
        value =
          getPartCategory(part);
      }

      if (Array.isArray(value)) {
        value.forEach(
          (item) => {
            if (item) {
              values.add(
                String(item).trim()
              );
            }
          }
        );
      } else if (value) {
        values.add(
          String(value).trim()
        );
      }
    });

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(
          b,
          undefined,
          {
            numeric: true,
            sensitivity: "base"
          }
        )
    );
  }

  function getBrands() {
    return getUniqueValues(
      "brand"
    );
  }

  function getModels() {
    return getUniqueValues(
      "model"
    );
  }

  function getCategories() {
    return getUniqueValues(
      "category"
    );
  }

  /* =========================================
     DOM Helpers
  ========================================= */

  function escapeHTML(
    value
  ) {
    if (
      window.AlDahayanUtils &&
      typeof window.AlDahayanUtils
        .escapeHTML === "function"
    ) {
      return window.AlDahayanUtils
        .escapeHTML(value);
    }

    return String(value ?? "")
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  /* =========================================
     Inventory Integration
  ========================================= */

  function getInventoryModule() {
    return (
      window.AlDahayanInventory ||
      null
    );
  }

  function getInventoryResult(
    part
  ) {
    const inventory =
      getInventoryModule();

    if (
      !inventory ||
      typeof inventory
        .getVerifiedAvailability !==
        "function"
    ) {
      return {
        status: "unknown",
        verified: false,
        records: [],
        message:
          "Stock availability requires confirmation."
      };
    }

    const oem =
      getPartOEM(part);

    if (!oem) {
      return {
        status: "unknown",
        verified: false,
        records: [],
        message:
          "Stock availability requires confirmation."
      };
    }

    return inventory
      .getVerifiedAvailability({
        oemNumber: oem
      });
  }

  function getStockLabel(
    status
  ) {
    const labels = {
      in_stock:
        "IN STOCK",

      low_stock:
        "LOW STOCK",

      out_of_stock:
        "OUT OF STOCK",

      on_request:
        "ON REQUEST",

      unknown:
        "AVAILABILITY TO BE CONFIRMED"
    };

    return (
      labels[status] ||
      labels.unknown
    );
  }

  function getStockClass(
    status
  ) {
    const classes = {
      in_stock:
        "stock-in",

      low_stock:
        "stock-low",

      out_of_stock:
        "stock-out",

      on_request:
        "stock-request",

      unknown:
        "stock-unknown"
    };

    return (
      classes[status] ||
      classes.unknown
    );
  }

  function createStockHTML(
    part
  ) {
    const result =
      getInventoryResult(part);

    /*
     * IMPORTANT:
     * Unverified inventory is never
     * presented as confirmed stock.
     */

    const label =
      getStockLabel(
        result.status
      );

    const stockClass =
      getStockClass(
        result.status
      );

    const verified =
      result.verified === true;

    let quantityHTML = "";

    const config =
      window.AlDahayanConfig;

    let showQuantity = false;

    if (
      config &&
      typeof config.getEffectiveAppConfig ===
        "function"
    ) {
      const effectiveConfig =
        config.getEffectiveAppConfig();

      showQuantity =
        effectiveConfig
          ?.inventory
          ?.quantityDisplay === true;
    }

    if (
      showQuantity &&
      verified &&
      Array.isArray(result.records)
    ) {
      const quantity =
        result.records.reduce(
          (total, record) =>
            total +
            Number(
              record.availableQuantity ||
              0
            ),
          0
        );

      if (quantity > 0) {
        quantityHTML = `
          <span class="stock-quantity">
            ${quantity} available
          </span>
        `;
      }
    }

    return `
      <div
        class="part-stock-summary ${stockClass}"
        data-stock-status="${escapeHTML(
          result.status
        )}"
      >
        <span class="stock-badge">
          ${escapeHTML(label)}
        </span>

        ${
          quantityHTML
            ? quantityHTML
            : ""
        }

        ${
          !verified
            ? `
              <small class="stock-verification-note">
                Final availability will be confirmed
                by Al-Dahayan.
              </small>
            `
            : ""
        }
      </div>
    `;
  }

  /* =========================================
     Result Rendering
  ========================================= */

  function renderResults(
    results
  ) {
    const containers =
      document.querySelectorAll(
        "[data-search-results]"
      );

    containers.forEach(
      (container) => {

        if (!results.length) {
          container.innerHTML = `
            <div class="search-empty">
              <h3 data-i18n="noResults">
                No results found.
              </h3>

              <p>
                Try another OEM number,
                part name or filter.
              </p>
            </div>
          `;

          return;
        }

        container.innerHTML =
          results
            .map(
              (part) =>
                createPartResultHTML(
                  part
                )
            )
            .join("");
      }
    );
  }

  function createPartResultHTML(
    part
  ) {
    const id =
      escapeHTML(
        getPartID(part)
      );

    const oem =
      escapeHTML(
        getPartOEM(part)
      );

    const name =
      escapeHTML(
        getPartName(part)
      );

    const brand =
      escapeHTML(
        getPartBrand(part)
      );

    const rawModel =
      getPartModel(part);

    const model =
      escapeHTML(
        Array.isArray(rawModel)
          ? rawModel.join(", ")
          : rawModel
      );

    const category =
      escapeHTML(
        getPartCategory(part)
      );

    return `
      <article
        class="search-result-card part-card"
        data-part-id="${id}"
        data-oem="${oem}"
      >

        <div class="part-card-content">

          <div class="part-card-header">

            <span class="part-card-oem">
              ${oem || "—"}
            </span>

            ${
              category
                ? `
                  <span class="part-card-category">
                    ${category}
                  </span>
                `
                : ""
            }

          </div>

          <h3 class="part-card-title">
            ${name || "Spare Part"}
          </h3>

          ${
            brand
              ? `
                <p class="part-card-brand">
                  <strong>Brand:</strong>
                  ${brand}
                </p>
              `
              : ""
          }

          ${
            model
              ? `
                <p class="part-card-model">
                  <strong>Model:</strong>
                  ${model}
                </p>
              `
              : ""
          }

          ${createStockHTML(part)}

          <div class="part-card-actions">

            <button
              type="button"
              class="button secondary"
              data-search-view-part="${id}"
            >
              View Details
            </button>

            <button
              type="button"
              class="button primary"
              data-search-inquire-part="${id}"
            >
              Inquiry
            </button>

          </div>

        </div>

      </article>
    `;
  }

  /* =========================================
     Result Summary
  ========================================= */

  function updateResultSummary(
    count
  ) {
    document
      .querySelectorAll(
        "[data-search-result-summary]"
      )
      .forEach((element) => {
        element.textContent =
          `${count} result${
            count === 1
              ? ""
              : "s"
          }`;
      });
  }

  /* =========================================
     Suggestions Rendering
  ========================================= */

  function renderSuggestions(
    suggestions
  ) {
    document
      .querySelectorAll(
        "[data-search-suggestions]"
      )
      .forEach((container) => {

        if (!suggestions.length) {
          container.innerHTML = "";
          container.hidden = true;
          return;
        }

        container.innerHTML =
          suggestions
            .map(
              (item) => `
                <button
                  type="button"
                  class="search-suggestion"
                  data-search-suggestion="${
                    escapeHTML(
                      item.oem ||
                      item.name
                    )
                  }"
                >

                  <strong>
                    ${
                      escapeHTML(
                        item.oem ||
                        "—"
                      )
                    }
                  </strong>

                  <span>
                    ${
                      escapeHTML(
                        item.name ||
                        ""
                      )
                    }
                  </span>

                </button>
              `
            )
            .join("");

        container.hidden = false;
      });
  }

  /* =========================================
     Form Handling
  ========================================= */

  function getSearchInput() {
    return document.querySelector(
      "[data-search-input], #searchInput"
    );
  }

  function getSearchForm() {
    return document.querySelector(
      "[data-search-form], #searchForm"
    );
  }

  function initializeSearchForm() {
    const form =
      getSearchForm();

    const input =
      getSearchInput();

    if (input) {
      input.addEventListener(
        "input",
        () => {
          const value =
            input.value.trim();

          state.query = value;

          renderSuggestions(
            getSuggestions(value)
          );
        }
      );

      input.addEventListener(
        "focus",
        () => {
          if (
            input.value.trim()
          ) {
            renderSuggestions(
              getSuggestions(
                input.value
              )
            );
          }
        }
      );
    }

    if (form) {
      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const query =
            input
              ? input.value.trim()
              : "";

          searchParts({
            query
          });

          const suggestions =
            document.querySelector(
              "[data-search-suggestions]"
            );

          if (suggestions) {
            suggestions.hidden = true;
          }
        }
      );
    }
  }

  /* =========================================
     Filter Events
  ========================================= */

  function initializeFilters() {
    const filterSelectors = [
      "[data-search-brand]",
      "[data-search-model]",
      "[data-search-category]"
    ];

    filterSelectors.forEach(
      (selector) => {

        document
          .querySelectorAll(
            selector
          )
          .forEach(
            (element) => {

              element.addEventListener(
                "change",
                () => {

                  const brand =
                    document.querySelector(
                      "[data-search-brand]"
                    )?.value || "";

                  const model =
                    document.querySelector(
                      "[data-search-model]"
                    )?.value || "";

                  const category =
                    document.querySelector(
                      "[data-search-category]"
                    )?.value || "";

                  searchParts({
                    brand,
                    model,
                    category
                  });
                }
              );
            }
          );
      }
    );
  }

  /* =========================================
     Reset Search
  ========================================= */

  function resetSearch() {
    state.query = "";
    state.oem = "";
    state.brand = "";
    state.model = "";
    state.category = "";

    const form =
      getSearchForm();

    if (form) {
      form.reset();
    }

    const input =
      getSearchInput();

    if (input) {
      input.value = "";
    }

    document
      .querySelectorAll(
        "[data-search-suggestions]"
      )
      .forEach((element) => {
        element.innerHTML = "";
        element.hidden = true;
      });

    filteredParts = [
      ...parts
    ];

    renderResults(
      filteredParts
    );

    updateResultSummary(
      filteredParts.length
    );

    return [
      ...filteredParts
    ];
  }

  /* =========================================
     Events
  ========================================= */

  function dispatchSearchEvent() {
    document.dispatchEvent(
      new CustomEvent(
        "alDahayanSearchCompleted",
        {
          detail: {
            query: {
              ...state
            },
            results:
              [...filteredParts]
          }
        }
      )
    );
  }

  function initializeComponentEvents() {
    document.addEventListener(
      "click",
      (event) => {

        const suggestion =
          event.target.closest(
            "[data-search-suggestion]"
          );

        if (suggestion) {
          const value =
            suggestion.getAttribute(
              "data-search-suggestion"
            );

          const input =
            getSearchInput();

          if (input) {
            input.value = value;
          }

          searchParts({
            query: value
          });

          document
            .querySelectorAll(
              "[data-search-suggestions]"
            )
            .forEach(
              (container) => {
                container.hidden =
                  true;
              }
            );

          return;
        }

        const reset =
          event.target.closest(
            "[data-search-reset]"
          );

        if (reset) {
          event.preventDefault();
          resetSearch();
          return;
        }

        const viewButton =
          event.target.closest(
            "[data-search-view-part]"
          );

        if (viewButton) {
          const id =
            viewButton.getAttribute(
              "data-search-view-part"
            );

          const part =
            getPartByID(id);

          if (part) {
            document.dispatchEvent(
              new CustomEvent(
                "alDahayanPartSelected",
                {
                  detail: {
                    part
                  }
                }
              )
            );
          }

          return;
        }

        const inquiryButton =
          event.target.closest(
            "[data-search-inquire-part]"
          );

        if (inquiryButton) {
          const id =
            inquiryButton.getAttribute(
              "data-search-inquire-part"
            );

          const part =
            getPartByID(id);

          if (part) {
            document.dispatchEvent(
              new CustomEvent(
                "alDahayanPartInquiry",
                {
                  detail: {
                    part
                  }
                }
              )
            );
          }
        }
      }
    );
  }

  /* =========================================
     Initialize
  ========================================= */

  async function initializeSearch() {
    if (initialized) {
      return;
    }

    initialized = true;

    await loadParts();

    initializeSearchForm();

    initializeFilters();

    initializeComponentEvents();

    renderResults(
      filteredParts
    );

    updateResultSummary(
      filteredParts.length
    );

    /*
     * Inventory may initialize after Search.
     * Re-render results when verified
     * inventory becomes available.
     */
    document.addEventListener(
      "alDahayanInventoryReady",
      () => {
        renderResults(
          filteredParts
        );
      }
    );

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanSearchReady",
        {
          detail: {
            totalParts:
              parts.length
          }
        }
      )
    );
  }

  /* =========================================
     Public API
  ========================================= */

  window.AlDahayanSearch = {

    initialize:
      initializeSearch,

    search:
      searchParts,

    reset:
      resetSearch,

    getAll:
      () => [
        ...parts
      ],

    getResults:
      () => [
        ...filteredParts
      ],

    getPartByOEM:
      getPartByOEM,

    getPartByID:
      getPartByID,

    getSuggestions:
      getSuggestions,

    getBrands:
      getBrands,

    getModels:
      getModels,

    getCategories:
      getCategories,

    getInventoryResult:
      getInventoryResult,

    getStockLabel:
      getStockLabel,

    getState:
      () => ({
        ...state
      })
  };

  window.initializeSearch =
    initializeSearch;

  /* =========================================
     DOM Ready
  ========================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      initializeSearch();
    }
  );

})();
