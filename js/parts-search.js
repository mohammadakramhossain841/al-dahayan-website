(function () {
  "use strict";

  let partsData = [];
  let categoriesData = [];
  let isLoaded = false;

  async function initializePartsSearch() {
    await loadPartsData();
    await loadCategoriesData();
    setupPartsSearchInterface();
  }

  async function loadPartsData() {
    try {
      const filePath = getDataPath(
        APP_CONFIG.dataFiles.oemParts
      );

      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(
          `Failed to load parts data: ${response.status}`
        );
      }

      const data = await response.json();

      partsData = normalizeArray(data);
      isLoaded = true;

      return partsData;
    } catch (error) {
      console.error(
        "Al-Dahayan Parts Search: Unable to load parts data.",
        error
      );

      partsData = [];
      isLoaded = false;

      return [];
    }
  }

  async function loadCategoriesData() {
    try {
      const filePath = getDataPath(
        APP_CONFIG.dataFiles.partCategories
      );

      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(
          `Failed to load categories data: ${response.status}`
        );
      }

      const data = await response.json();

      categoriesData = normalizeArray(data);

      return categoriesData;
    } catch (error) {
      console.error(
        "Al-Dahayan Parts Search: Unable to load category data.",
        error
      );

      categoriesData = [];

      return [];
    }
  }

  function normalizeArray(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.parts)) {
      return data.parts;
    }

    if (Array.isArray(data?.oemParts)) {
      return data.oemParts;
    }

    if (Array.isArray(data?.categories)) {
      return data.categories;
    }

    if (Array.isArray(data?.partCategories)) {
      return data.partCategories;
    }

    return [];
  }

  function setupPartsSearchInterface() {
    setupSearchForms();
    setupFilterControls();
  }

  function setupSearchForms() {
    const forms = document.querySelectorAll(
      "[data-parts-search-form], #partsSearchForm, .parts-search-form"
    );

    forms.forEach((form) => {
      if (form.dataset.partsInitialized === "true") {
        return;
      }

      form.dataset.partsInitialized = "true";

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const filters = getFiltersFromForm(form);

        performPartsSearch(filters);
      });
    });

    const inputs = document.querySelectorAll(
      "[data-parts-search-input], #partsSearch, #oemPartNumber, .parts-search-input"
    );

    inputs.forEach((input) => {
      if (input.dataset.partsInputInitialized === "true") {
        return;
      }

      input.dataset.partsInputInitialized = "true";

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          performPartsSearch({
            query: input.value
          });
        }
      });
    });
  }

  function setupFilterControls() {
    const categorySelects = document.querySelectorAll(
      "[data-part-category], #partCategory"
    );

    categorySelects.forEach((select) => {
      populateSelect(
        select,
        getCategories(),
        "Select Category"
      );
    });

    const brandSelects = document.querySelectorAll(
      "[data-part-brand], #partBrand"
    );

    brandSelects.forEach((select) => {
      populateSelect(
        select,
        getBrands(),
        "Select Brand"
      );
    });

    const modelSelects = document.querySelectorAll(
      "[data-part-model], #partModel"
    );

    modelSelects.forEach((select) => {
      populateSelect(
        select,
        getModels(),
        "Select Model"
      );
    });
  }

  function getFiltersFromForm(form) {
    return {
      query: getFieldValue(
        form,
        "query",
        "partsSearch"
      ),

      oemNumber: getFieldValue(
        form,
        "oemNumber",
        "oemPartNumber"
      ),

      category: getFieldValue(
        form,
        "category",
        "partCategory"
      ),

      brand: getFieldValue(
        form,
        "brand",
        "partBrand"
      ),

      model: getFieldValue(
        form,
        "model",
        "partModel"
      )
    };
  }

  function getFieldValue(
    form,
    name,
    id
  ) {
    const element =
      form.querySelector(`[name="${name}"]`) ||
      form.querySelector(`#${id}`);

    return element
      ? String(element.value || "").trim()
      : "";
  }

  function performPartsSearch(filters = {}) {
    const results = filterParts(filters);

    displayPartResults(results);

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanPartsSearchCompleted",
        {
          detail: {
            filters,
            results
          }
        }
      )
    );

    return results;
  }

  function filterParts(filters = {}) {
    if (!isLoaded) {
      return [];
    }

    const query =
      normalizeText(filters.query);

    const oemNumber =
      normalizeOEM(filters.oemNumber);

    const category =
      normalizeText(filters.category);

    const brand =
      normalizeText(filters.brand);

    const model =
      normalizeText(filters.model);

    return partsData.filter((part) => {
      const partOEM =
        normalizeOEM(
          part.oemNumber ||
          part.partNumber ||
          part.partNo
        );

      const partCategory =
        normalizeText(
          part.category ||
          part.categoryName
        );

      const partBrand =
        normalizeText(
          part.brand ||
          part.make ||
          part.manufacturer
        );

      const partModel =
        normalizeText(
          part.model ||
          part.modelName
        );

      const searchableText =
        normalizeText(
          [
            part.name,
            part.partName,
            part.description,
            part.oemNumber,
            part.partNumber,
            part.partNo,
            part.category,
            part.brand,
            part.make,
            part.model
          ]
            .filter(Boolean)
            .join(" ")
        );

      return (
        (!query ||
          searchableText.includes(query)) &&
        (!oemNumber ||
          partOEM.includes(oemNumber)) &&
        (!category ||
          partCategory === category) &&
        (!brand ||
          partBrand === brand) &&
        (!model ||
          partModel === model)
      );
    });
  }

  function getPartByOEM(oemNumber) {
    const normalizedOEM =
      normalizeOEM(oemNumber);

    if (!normalizedOEM) {
      return null;
    }

    return (
      partsData.find((part) => {
        const partNumber =
          normalizeOEM(
            part.oemNumber ||
            part.partNumber ||
            part.partNo
          );

        return partNumber === normalizedOEM;
      }) || null
    );
  }

  function getPartById(id) {
    if (!id) {
      return null;
    }

    return (
      partsData.find(
        (part) =>
          String(part.id) ===
          String(id)
      ) || null
    );
  }

  function getCategories() {
    const partCategories =
      partsData.map(
        (part) =>
          part.category ||
          part.categoryName
      );

    const dataCategories =
      categoriesData.map(
        (category) =>
          category.name ||
          category.categoryName ||
          category.id
      );

    return getUniqueValues([
      ...partCategories,
      ...dataCategories
    ]);
  }

  function getBrands() {
    return getUniqueValues(
      partsData.map(
        (part) =>
          part.brand ||
          part.make ||
          part.manufacturer
      )
    );
  }

  function getModels() {
    return getUniqueValues(
      partsData.map(
        (part) =>
          part.model ||
          part.modelName
      )
    );
  }

  function getSuggestions(
    query,
    limit = 8
  ) {
    if (!isLoaded) {
      return [];
    }

    const normalizedQuery =
      normalizeText(query);

    if (!normalizedQuery) {
      return [];
    }

    return partsData
      .filter((part) => {
        const searchableText =
          normalizeText(
            [
              part.name,
              part.partName,
              part.oemNumber,
              part.partNumber,
              part.partNo,
              part.category,
              part.brand,
              part.model
            ]
              .filter(Boolean)
              .join(" ")
          );

        return searchableText.includes(
          normalizedQuery
        );
      })
      .slice(0, limit);
  }

  function displayPartResults(
    results,
    container = null
  ) {
    const target =
      container ||
      document.querySelector(
        "[data-parts-results], #partsResults, .parts-results"
      );

    if (!target) {
      return;
    }

    target.innerHTML = "";

    if (!results.length) {
      const empty =
        document.createElement("div");

      empty.className =
        "parts-search-empty";

      empty.textContent =
        getCurrentLanguage() === "ar"
          ? "لم يتم العثور على قطع غيار مطابقة."
          : "No matching parts found.";

      target.appendChild(empty);

      return;
    }

    results.forEach((part) => {
      target.appendChild(
        createPartCard(part)
      );
    });
  }

  function createPartCard(part) {
    const card =
      document.createElement("article");

    card.className =
      "part-search-result";

    const name =
      part.name ||
      part.partName ||
      "Automotive Part";

    const oem =
      part.oemNumber ||
      part.partNumber ||
      part.partNo ||
      "";

    const category =
      part.category ||
      part.categoryName ||
      "";

    const brand =
      part.brand ||
      part.make ||
      "";

    const model =
      part.model ||
      part.modelName ||
      "";

    const description =
      part.description ||
      "";

    card.innerHTML = `
      <div class="part-result-content">

        <h3>
          ${escapeHTML(name)}
        </h3>

        ${
          oem
            ? `
              <p class="part-oem">
                <strong>OEM:</strong>
                ${escapeHTML(oem)}
              </p>
            `
            : ""
        }

        ${
          category
            ? `
              <p class="part-category">
                <strong>Category:</strong>
                ${escapeHTML(category)}
              </p>
            `
            : ""
        }

        ${
          brand
            ? `
              <p class="part-brand">
                <strong>Brand:</strong>
                ${escapeHTML(brand)}
              </p>
            `
            : ""
        }

        ${
          model
            ? `
              <p class="part-model">
                <strong>Model:</strong>
                ${escapeHTML(model)}
              </p>
            `
            : ""
        }

        ${
          description
            ? `
              <p class="part-description">
                ${escapeHTML(description)}
              </p>
            `
            : ""
        }

        <button
          type="button"
          class="part-select-button"
          data-part-id="${escapeHTML(
            part.id || ""
          )}"
        >
          ${
            getCurrentLanguage() === "ar"
              ? "عرض التفاصيل"
              : "View Details"
          }
        </button>

      </div>
    `;

    const button =
      card.querySelector(
        "[data-part-id]"
      );

    if (button) {
      button.addEventListener(
        "click",
        () => {
          showPartDetails(part);
        }
      );
    }

    return card;
  }

  function showPartDetails(part) {
    document.dispatchEvent(
      new CustomEvent(
        "alDahayanPartDetailsRequested",
        {
          detail: {
            part
          }
        }
      )
    );

    if (
      typeof window
        .AlDahayanPartsSearch
        ?.onPartSelected ===
      "function"
    ) {
      window.AlDahayanPartsSearch.onPartSelected(
        part
      );
    }
  }

  function populateSelect(
    select,
    values,
    placeholder
  ) {
    if (!select) {
      return;
    }

    select.innerHTML = "";

    const option =
      document.createElement("option");

    option.value = "";

    option.textContent =
      getCurrentLanguage() === "ar"
        ? getArabicPlaceholder(
            placeholder
          )
        : placeholder;

    select.appendChild(option);

    values.forEach((value) => {
      const item =
        document.createElement("option");

      item.value = value;
      item.textContent = value;

      select.appendChild(item);
    });
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
      .replace(/[\s\-_.]/g, "");
  }

  function getUniqueValues(values) {
    return [
      ...new Set(
        values
          .filter(
            (value) =>
              value !== undefined &&
              value !== null
          )
          .map((value) =>
            String(value).trim()
          )
          .filter(Boolean)
      )
    ].sort();
  }

  function getArabicPlaceholder(
    placeholder
  ) {
    const translations = {
      "Select Category": "اختر الفئة",
      "Select Brand": "اختر العلامة التجارية",
      "Select Model": "اختر الموديل"
    };

    return (
      translations[placeholder] ||
      placeholder
    );
  }

  function getCurrentLanguage() {
    return (
      document.documentElement.getAttribute(
        "lang"
      ) ||
      APP_CONFIG?.site?.defaultLanguage ||
      "en"
    );
  }

  function escapeHTML(value) {
    if (
      typeof window
        .AlDahayanUtils
        ?.escapeHTML === "function"
    ) {
      return window.AlDahayanUtils.escapeHTML(
        value
      );
    }

    const div =
      document.createElement("div");

    div.textContent =
      String(value ?? "");

    return div.innerHTML;
  }

  window.AlDahayanPartsSearch = {
    initialize:
      initializePartsSearch,

    loadPartsData,

    loadCategoriesData,

    performPartsSearch,

    filterParts,

    getPartByOEM,

    getPartById,

    getSuggestions,

    getCategories,

    getBrands,

    getModels,

    showPartDetails,

    getAllParts: () => [
      ...partsData
    ],

    getAllCategories: () => [
      ...categoriesData
    ],

    isLoaded: () => isLoaded
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializePartsSearch
    );
  } else {
    initializePartsSearch();
  }
})();
