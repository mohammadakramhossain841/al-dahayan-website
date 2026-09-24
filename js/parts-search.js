(function () {
  "use strict";

  let parts = [];

  async function initializePartsSearch() {
    await loadPartsData();
    setupPartsSearchForms();
    setupPartsFilters();
  }

  async function loadPartsData() {
    try {
      const fileName =
        window.APP_CONFIG?.dataFiles?.oemParts ||
        "oem-parts.json";

      const path =
        window.getDataPath?.(fileName) ||
        `./data/${fileName}`;

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Unable to load parts data: ${response.status}`
        );
      }

      const data = await response.json();

      parts = Array.isArray(data)
        ? data
        : Array.isArray(data.parts)
        ? data.parts
        : [];

      return parts;
    } catch (error) {
      console.error(
        "Parts search data loading error:",
        error
      );

      parts = [];
      return [];
    }
  }

  function setupPartsSearchForms() {
    const forms = document.querySelectorAll(
      "[data-parts-search-form], .parts-search-form"
    );

    forms.forEach((form) => {
      form.addEventListener(
        "submit",
        handlePartsSearchSubmit
      );
    });
  }

  function setupPartsFilters() {
    const filters = document.querySelectorAll(
      "[data-parts-filter]"
    );

    filters.forEach((filter) => {
      filter.addEventListener(
        "change",
        handlePartsFilterChange
      );
    });
  }

  function handlePartsSearchSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const query =
      getFieldValue(form, "search") ||
      getFieldValue(form, "query") ||
      getFieldValue(form, "oem") ||
      getFieldValue(form, "partNumber");

    const category =
      getFieldValue(form, "category");

    const brand =
      getFieldValue(form, "brand") ||
      getFieldValue(form, "make");

    const model =
      getFieldValue(form, "model");

    const results = searchParts({
      query,
      category,
      brand,
      model
    });

    displayPartsResults(results);

    document.dispatchEvent(
      new CustomEvent("partsSearchCompleted", {
        detail: {
          filters: {
            query,
            category,
            brand,
            model
          },
          results
        }
      })
    );
  }

  function getFieldValue(form, name) {
    const field = form.querySelector(
      `[name="${name}"]`
    );

    return field
      ? field.value.trim()
      : "";
  }

  function handlePartsFilterChange(event) {
    const filter = event.currentTarget;

    document.dispatchEvent(
      new CustomEvent("partsFilterChanged", {
        detail: {
          name: filter.name,
          value: filter.value
        }
      })
    );
  }

  function searchParts(filters = {}) {
    const query =
      normalizeValue(filters.query);

    const category =
      normalizeValue(filters.category);

    const brand =
      normalizeValue(filters.brand);

    const model =
      normalizeValue(filters.model);

    return parts.filter((part) => {
      const searchableText =
        getPartSearchText(part);

      const matchesQuery =
        !query ||
        searchableText.includes(query);

      const matchesCategory =
        !category ||
        normalizeValue(
          part.category ||
            part.categoryName
        ).includes(category);

      const matchesBrand =
        !brand ||
        normalizeValue(
          part.brand ||
            part.make ||
            part.manufacturer
        ).includes(brand);

      const matchesModel =
        !model ||
        normalizeValue(
          part.model ||
            part.models
        ).includes(model);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesBrand &&
        matchesModel
      );
    });
  }

  function getPartSearchText(part) {
    const values = [
      part.id,
      part.partId,
      part.oemNumber,
      part.partNumber,
      part.partNo,
      part.oem,
      part.name,
      part.partName,
      part.description,
      part.category,
      part.categoryName,
      part.brand,
      part.make,
      part.manufacturer,
      part.model,
      part.models
    ];

    return values
      .filter(Boolean)
      .map(normalizeValue)
      .join(" ");
  }

  function normalizeValue(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function getCategories() {
    return getUniqueValues(
      parts.map(
        (part) =>
          part.category ||
          part.categoryName
      )
    );
  }

  function getBrands() {
    return getUniqueValues(
      parts.map(
        (part) =>
          part.brand ||
          part.make ||
          part.manufacturer
      )
    );
  }

  function getModels() {
    const models = [];

    parts.forEach((part) => {
      const value =
        part.model ||
        part.models;

      if (Array.isArray(value)) {
        models.push(...value);
      } else if (value) {
        models.push(value);
      }
    });

    return getUniqueValues(models);
  }

  function getUniqueValues(values) {
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

  function getPartByOEM(oemNumber) {
    const normalizedOEM =
      normalizeOEM(oemNumber);

    if (!normalizedOEM) {
      return null;
    }

    return (
      parts.find((part) => {
        const numbers = [
          part.oemNumber,
          part.partNumber,
          part.partNo,
          part.oem
        ];

        return numbers.some(
          (number) =>
            normalizeOEM(number) ===
            normalizedOEM
        );
      }) || null
    );
  }

  function normalizeOEM(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[\s-]/g, "");
  }

  function displayPartsResults(results) {
    const containers =
      document.querySelectorAll(
        "[data-parts-results]"
      );

    containers.forEach(
      (container) => {
        container.innerHTML = "";

        if (!results.length) {
          container.innerHTML = `
            <div class="search-message">
              No matching parts found.
            </div>
          `;

          return;
        }

        results.forEach((part) => {
          container.appendChild(
            createPartCard(part)
          );
        });
      }
    );
  }

  function createPartCard(part) {
    const card =
      document.createElement("article");

    card.className =
      "part-search-result";

    const oem =
      part.oemNumber ||
      part.partNumber ||
      part.partNo ||
      "N/A";

    const name =
      part.name ||
      part.partName ||
      "Automotive Spare Part";

    const category =
      part.category ||
      part.categoryName ||
      "Automotive Parts";

    const brand =
      part.brand ||
      part.make ||
      part.manufacturer ||
      "";

    card.innerHTML = `
      <div class="part-search-result-content">

        <span class="part-search-result-category">
          ${escapeHTML(category)}
        </span>

        <h3>
          ${escapeHTML(name)}
        </h3>

        <p>
          <strong>OEM:</strong>
          ${escapeHTML(oem)}
        </p>

        ${
          brand
            ? `
              <p>
                <strong>Brand:</strong>
                ${escapeHTML(brand)}
              </p>
            `
            : ""
        }

        <button
          type="button"
          class="btn btn-primary"
          data-part-oem="${escapeHTML(oem)}"
        >
          View Part
        </button>

      </div>
    `;

    const button =
      card.querySelector(
        "[data-part-oem]"
      );

    if (button) {
      button.addEventListener(
        "click",
        () => {
          selectPart(part);
        }
      );
    }

    return card;
  }

  function selectPart(part) {
    document.dispatchEvent(
      new CustomEvent("partSelected", {
        detail: {
          part
        }
      })
    );

    const oem =
      part.oemNumber ||
      part.partNumber ||
      part.partNo;

    if (oem) {
      const encodedOEM =
        encodeURIComponent(oem);

      window.location.href =
        `./pages/parts.html?oem=${encodedOEM}`;
    }
  }

  function getParts() {
    return [...parts];
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.AlDahayanPartsSearch = {
    initialize:
      initializePartsSearch,

    search: searchParts,

    getParts,

    getCategories,

    getBrands,

    getModels,

    getPartByOEM,

    selectPart
  };

  window.initializePartsSearch =
    initializePartsSearch;

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
