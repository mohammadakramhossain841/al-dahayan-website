/* =========================================
   AL-DAHAYAN PARTS SEARCH
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let parts = [];
  let categories = [];
  let filteredParts = [];

  const state = {
    query: "",
    oem: "",
    brand: "",
    model: "",
    category: ""
  };

  function normalize(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase();
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getPartId(part) {
    return (
      part.id ||
      part.partId ||
      part.part_id ||
      ""
    );
  }

  function getOEM(part) {
    return (
      part.oem ||
      part.oemNumber ||
      part.oem_number ||
      part.partNumber ||
      part.part_number ||
      ""
    );
  }

  function getPartName(part) {
    return (
      part.name ||
      part.partName ||
      part.part_name ||
      part.description ||
      ""
    );
  }

  function getBrand(part) {
    return (
      part.brand ||
      part.make ||
      part.manufacturer ||
      ""
    );
  }

  function getModel(part) {
    return (
      part.model ||
      part.vehicleModel ||
      part.vehicle_model ||
      ""
    );
  }

  function getCategory(part) {
    return (
      part.category ||
      part.categoryName ||
      part.category_name ||
      ""
    );
  }

  function getYear(part) {
    return (
      part.year ||
      part.modelYear ||
      part.model_year ||
      ""
    );
  }

  function getImage(part) {
    return (
      part.image ||
      part.imageUrl ||
      part.image_url ||
      ""
    );
  }

  function uniqueSorted(values) {
    return [
      ...new Set(
        values
          .filter(Boolean)
          .map((value) => String(value).trim())
      )
    ].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );
  }

  async function loadParts() {
    if (parts.length) {
      return parts;
    }

    if (typeof window.getDataPath !== "function") {
      throw new Error(
        "getDataPath() is not available."
      );
    }

    const response = await fetch(
      window.getDataPath("oem-parts.json"),
      {
        cache: "no-cache"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load oem-parts.json: ${response.status}`
      );
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      parts = data;
    } else if (Array.isArray(data.parts)) {
      parts = data.parts;
    } else if (Array.isArray(data.oemParts)) {
      parts = data.oemParts;
    } else if (Array.isArray(data.data)) {
      parts = data.data;
    } else {
      parts = [];
    }

    filteredParts = [...parts];

    return parts;
  }

  async function loadCategories() {
    if (categories.length) {
      return categories;
    }

    if (typeof window.getDataPath !== "function") {
      return [];
    }

    try {
      const response = await fetch(
        window.getDataPath(
          "part-categories.json"
        ),
        {
          cache: "no-cache"
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        categories = data;
      } else if (Array.isArray(data.categories)) {
        categories = data.categories;
      } else if (Array.isArray(data.data)) {
        categories = data.data;
      } else {
        categories = [];
      }

    } catch (error) {
      console.warn(
        "Al-Dahayan Parts Search: categories unavailable.",
        error
      );

      categories = [];
    }

    return categories;
  }

  function getElements() {
    return {
      form: document.querySelector(
        "[data-parts-search-form]"
      ),

      query: document.querySelector(
        "[data-parts-query]"
      ),

      oem: document.querySelector(
        "[data-part-oem]"
      ),

      brand: document.querySelector(
        "[data-part-brand]"
      ),

      model: document.querySelector(
        "[data-part-model]"
      ),

      category: document.querySelector(
        "[data-part-category]"
      ),

      reset: document.querySelector(
        "[data-parts-reset], [data-part-reset]"
      ),

      suggestions: document.querySelector(
        "[data-parts-suggestions]"
      ),

      summary: document.querySelector(
        "[data-parts-result-summary]"
      ),

      results: document.querySelector(
        "[data-parts-results]"
      )
    };
  }

  function setSelectOptions(
    select,
    values,
    placeholder
  ) {
    if (!select) {
      return;
    }

    const currentValue = select.value;

    select.innerHTML = "";

    const option =
      document.createElement("option");

    option.value = "";
    option.textContent = placeholder;

    select.appendChild(option);

    values.forEach((value) => {
      const item =
        document.createElement("option");

      item.value = value;
      item.textContent = value;

      select.appendChild(item);
    });

    if (values.includes(currentValue)) {
      select.value = currentValue;
    }
  }

  function updateFilterOptions() {
    const elements = getElements();

    const brands = uniqueSorted(
      parts.map(getBrand)
    );

    const models = uniqueSorted(
      parts.map(getModel)
    );

    const partCategories = uniqueSorted(
      parts.map(getCategory)
    );

    setSelectOptions(
      elements.brand,
      brands,
      "All Brands"
    );

    setSelectOptions(
      elements.model,
      models,
      "All Models"
    );

    setSelectOptions(
      elements.category,
      partCategories,
      "All Categories"
    );
  }

  function applyFilters() {
    const query = normalize(state.query);
    const oem = normalize(state.oem);
    const brand = normalize(state.brand);
    const model = normalize(state.model);
    const category = normalize(state.category);

    filteredParts = parts.filter((part) => {
      const partOEM = normalize(
        getOEM(part)
      );

      const partName = normalize(
        getPartName(part)
      );

      const partBrand = normalize(
        getBrand(part)
      );

      const partModel = normalize(
        getModel(part)
      );

      const partCategory = normalize(
        getCategory(part)
      );

      const searchableText = [
        partOEM,
        partName,
        partBrand,
        partModel,
        partCategory,
        normalize(getYear(part)),
        normalize(part.description),
        normalize(part.engine)
      ].join(" ");

      const matchesQuery =
        !query ||
        searchableText.includes(query);

      const matchesOEM =
        !oem ||
        partOEM.includes(oem);

      const matchesBrand =
        !brand ||
        partBrand === brand;

      const matchesModel =
        !model ||
        partModel === model;

      const matchesCategory =
        !category ||
        partCategory === category;

      return (
        matchesQuery &&
        matchesOEM &&
        matchesBrand &&
        matchesModel &&
        matchesCategory
      );
    });

    renderResults();
  }

  function renderSummary() {
    const elements = getElements();

    if (!elements.summary) {
      return;
    }

    const count =
      filteredParts.length;

    elements.summary.textContent =
      `${count} part${count === 1 ? "" : "s"} found`;
  }

  function renderPartCard(part) {
    const id = getPartId(part);
    const oem = getOEM(part);
    const name = getPartName(part);
    const brand = getBrand(part);
    const model = getModel(part);
    const category = getCategory(part);
    const year = getYear(part);
    const image = getImage(part);

    const imageHTML = image
      ? `
        <div class="part-card-image">
          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(name)}"
            loading="lazy"
          >
        </div>
      `
      : "";

    return `
      <article
        class="part-card"
        data-part-id="${escapeHTML(id)}"
      >

        ${imageHTML}

        <div class="part-card-content">

          <div class="part-card-header">
            ${
              oem
                ? `
                  <span class="part-card-oem">
                    ${escapeHTML(oem)}
                  </span>
                `
                : ""
            }

            ${
              category
                ? `
                  <span class="part-card-category">
                    ${escapeHTML(category)}
                  </span>
                `
                : ""
            }
          </div>

          <h3 class="part-card-title">
            ${escapeHTML(name)}
          </h3>

          ${
            brand || model
              ? `
                <p class="part-card-vehicle">
                  ${
                    brand
                      ? `<strong>${escapeHTML(brand)}</strong>`
                      : ""
                  }
                  ${
                    model
                      ? ` ${escapeHTML(model)}`
                      : ""
                  }
                  ${
                    year
                      ? ` (${escapeHTML(year)})`
                      : ""
                  }
                </p>
              `
              : ""
          }

          <div class="part-card-actions">

            <button
              type="button"
              class="part-card-button"
              data-view-part
              data-part-id="${escapeHTML(id)}"
            >
              View Details
            </button>

            <button
              type="button"
              class="part-card-button secondary"
              data-inquire-part
              data-part-id="${escapeHTML(id)}"
            >
              Inquiry
            </button>

          </div>

        </div>

      </article>
    `;
  }

  function renderResults() {
    const elements = getElements();

    renderSummary();

    if (!elements.results) {
      return;
    }

    if (!filteredParts.length) {
      elements.results.innerHTML = `
        <div class="search-empty">
          <h3>No parts found</h3>
          <p>
            Try another OEM number, part name,
            brand, model, or category.
          </p>
        </div>
      `;

      return;
    }

    elements.results.innerHTML =
      filteredParts
        .map(renderPartCard)
        .join("");
  }

  function findPartById(id) {
    const target = normalize(id);

    return (
      parts.find(
        (part) =>
          normalize(getPartId(part)) ===
          target
      ) || null
    );
  }

  function findByOEM(oem) {
    const target = normalize(oem);

    if (!target) {
      return null;
    }

    return (
      parts.find(
        (part) =>
          normalize(getOEM(part)) ===
          target
      ) || null
    );
  }

  function searchByOEM(oem) {
    const target = normalize(oem);

    if (!target) {
      return [];
    }

    return parts.filter(
      (part) =>
        normalize(getOEM(part)).includes(target)
    );
  }

  function getPartDetails(id) {
    return findPartById(id);
  }

  function showSuggestions() {
    const elements = getElements();

    if (!elements.suggestions) {
      return;
    }

    const query =
      normalize(state.query);

    if (query.length < 2) {
      elements.suggestions.innerHTML = "";
      elements.suggestions.hidden = true;
      return;
    }

    const matches = parts
      .filter((part) => {
        const text = [
          getOEM(part),
          getPartName(part),
          getBrand(part),
          getModel(part)
        ]
          .map(normalize)
          .join(" ");

        return text.includes(query);
      })
      .slice(0, 8);

    if (!matches.length) {
      elements.suggestions.innerHTML = "";
      elements.suggestions.hidden = true;
      return;
    }

    elements.suggestions.innerHTML =
      matches
        .map((part) => {
          const id = getPartId(part);
          const oem = getOEM(part);
          const name = getPartName(part);

          return `
            <button
              type="button"
              class="search-suggestion"
              data-part-suggestion
              data-part-id="${escapeHTML(id)}"
            >
              <strong>
                ${escapeHTML(oem || name)}
              </strong>

              ${
                oem && name
                  ? `
                    <span>
                      ${escapeHTML(name)}
                    </span>
                  `
                  : ""
              }
            </button>
          `;
        })
        .join("");

    elements.suggestions.hidden = false;
  }

  function hideSuggestions() {
    const elements = getElements();

    if (!elements.suggestions) {
      return;
    }

    elements.suggestions.hidden = true;
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const elements = getElements();

    state.query =
      elements.query?.value || "";

    state.oem =
      elements.oem?.value || "";

    state.brand =
      elements.brand?.value || "";

    state.model =
      elements.model?.value || "";

    state.category =
      elements.category?.value || "";

    hideSuggestions();

    applyFilters();
  }

  function handleQueryInput() {
    const elements = getElements();

    state.query =
      elements.query?.value || "";

    showSuggestions();

    applyFilters();
  }

  function handleFilterChange() {
    const elements = getElements();

    state.oem =
      elements.oem?.value || "";

    state.brand =
      elements.brand?.value || "";

    state.model =
      elements.model?.value || "";

    state.category =
      elements.category?.value || "";

    applyFilters();
  }

  function resetSearch() {
    const elements = getElements();

    state.query = "";
    state.oem = "";
    state.brand = "";
    state.model = "";
    state.category = "";

    if (elements.form) {
      elements.form.reset();
    }

    updateFilterOptions();
    hideSuggestions();

    filteredParts = [...parts];

    renderResults();
  }

  function handleViewPart(id) {
    const part =
      findPartById(id);

    if (!part) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanPartSelected",
        {
          detail: {
            part,
            id
          }
        }
      )
    );
  }

  function handleInquiry(part) {
    if (!part) {
      return;
    }

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

    const inquiryPage =
      typeof window.getPagePath === "function"
        ? window.getPagePath("inquiry.html")
        : "../pages/inquiry.html";

    const id = getPartId(part);

    if (id) {
      window.location.href =
        `${inquiryPage}?part=${encodeURIComponent(id)}`;
    } else {
      window.location.href =
        inquiryPage;
    }
  }

  function bindEvents() {
    const elements = getElements();

    elements.form?.addEventListener(
      "submit",
      handleFormSubmit
    );

    elements.query?.addEventListener(
      "input",
      handleQueryInput
    );

    elements.oem?.addEventListener(
      "input",
      handleFilterChange
    );

    elements.brand?.addEventListener(
      "change",
      handleFilterChange
    );

    elements.model?.addEventListener(
      "change",
      handleFilterChange
    );

    elements.category?.addEventListener(
      "change",
      handleFilterChange
    );

    elements.reset?.addEventListener(
      "click",
      resetSearch
    );

    elements.results?.addEventListener(
      "click",
      (event) => {
        const viewButton =
          event.target.closest(
            "[data-view-part]"
          );

        if (viewButton) {
          handleViewPart(
            viewButton.getAttribute(
              "data-part-id"
            )
          );

          return;
        }

        const inquiryButton =
          event.target.closest(
            "[data-inquire-part]"
          );

        if (inquiryButton) {
          const part =
            findPartById(
              inquiryButton.getAttribute(
                "data-part-id"
              )
            );

          handleInquiry(part);
        }
      }
    );

    elements.suggestions?.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            "[data-part-suggestion]"
          );

        if (!button) {
          return;
        }

        const part =
          findPartById(
            button.getAttribute(
              "data-part-id"
            )
          );

        if (!part) {
          return;
        }

        if (elements.query) {
          elements.query.value =
            getOEM(part) ||
            getPartName(part);
        }

        state.query =
          elements.query?.value || "";

        hideSuggestions();

        applyFilters();
      }
    );

    document.addEventListener(
      "click",
      (event) => {
        if (
          !event.target.closest(
            "[data-parts-search-form]"
          )
        ) {
          hideSuggestions();
        }
      }
    );
  }

  async function initializePartsSearch() {
    if (initialized) {
      return;
    }

    initialized = true;

    try {
      await Promise.all([
        loadParts(),
        loadCategories()
      ]);

      updateFilterOptions();
      bindEvents();
      renderResults();

      document.dispatchEvent(
        new CustomEvent(
          "alDahayanPartsSearchReady",
          {
            detail: {
              count: parts.length
            }
          }
        )
      );

    } catch (error) {
      console.error(
        "Al-Dahayan Parts Search:",
        error
      );

      const elements = getElements();

      if (elements.results) {
        elements.results.innerHTML = `
          <div class="search-error">
            <h3>Unable to load parts</h3>
            <p>
              Please try again later.
            </p>
          </div>
        `;
      }

      if (elements.summary) {
        elements.summary.textContent =
          "Parts data unavailable";
      }
    }
  }

  window.AlDahayanPartsSearch = {
    init: initializePartsSearch,

    load: loadParts,

    search: function (filters = {}) {
      state.query =
        filters.query || "";

      state.oem =
        filters.oem || "";

      state.brand =
        filters.brand || "";

      state.model =
        filters.model || "";

      state.category =
        filters.category || "";

      applyFilters();

      return [...filteredParts];
    },

    reset: resetSearch,

    getAll: function () {
      return [...parts];
    },

    getResults: function () {
      return [...filteredParts];
    },

    findById: findPartById,

    findByOEM: findByOEM,

    searchByOEM: searchByOEM,

    getDetails: getPartDetails,

    getCategories: function () {
      return [...categories];
    },

    getBrands: function () {
      return uniqueSorted(
        parts.map(getBrand)
      );
    },

    getModels: function () {
      return uniqueSorted(
        parts.map(getModel)
      );
    },

    getState: function () {
      return {
        ...state
      };
    }
  };

  window.initializePartsSearch =
    initializePartsSearch;

  document.addEventListener(
    "DOMContentLoaded",
    initializePartsSearch
  );

})();
