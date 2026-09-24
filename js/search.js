(function () {
  "use strict";

  let partsData = [];
  let isLoaded = false;

  async function initializeSearch() {
    await loadPartsData();
    setupSearchInterface();
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

      partsData = Array.isArray(data)
        ? data
        : Array.isArray(data.parts)
          ? data.parts
          : Array.isArray(data.oemParts)
            ? data.oemParts
            : [];

      isLoaded = true;

      return partsData;
    } catch (error) {
      console.error(
        "Al-Dahayan Search: Unable to load parts data.",
        error
      );

      partsData = [];
      isLoaded = false;

      return [];
    }
  }

  function setupSearchInterface() {
    const searchInputs = document.querySelectorAll(
      "[data-search-input], #partSearch, #oemSearch, .part-search-input"
    );

    searchInputs.forEach((input) => {
      if (input.dataset.searchInitialized === "true") {
        return;
      }

      input.dataset.searchInitialized = "true";

      input.addEventListener(
        "input",
        debounceSearch(handleSearchInput)
      );

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          performSearch(input.value);
        }
      });
    });

    const searchForms = document.querySelectorAll(
      "[data-search-form], .part-search-form"
    );

    searchForms.forEach((form) => {
      if (form.dataset.searchInitialized === "true") {
        return;
      }

      form.dataset.searchInitialized = "true";

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const input = form.querySelector(
          "input[type='search'], input[type='text'], [data-search-input]"
        );

        performSearch(input ? input.value : "");
      });
    });
  }

  function handleSearchInput(event) {
    const query = event.target.value.trim();

    if (query.length < 2) {
      clearSuggestions(event.target);
      return;
    }

    const results = searchParts(query).slice(0, 8);

    showSuggestions(event.target, results);
  }

  function performSearch(query) {
    const normalizedQuery = String(query || "").trim();

    if (!normalizedQuery) {
      displayResults([]);
      return [];
    }

    const results = searchParts(normalizedQuery);

    displayResults(results);

    return results;
  }

  function searchParts(query) {
    if (!isLoaded) {
      return [];
    }

    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return [];
    }

    return partsData.filter((part) => {
      const searchableFields = [
        part.partNumber,
        part.oemNumber,
        part.partNo,
        part.name,
        part.partName,
        part.description,
        part.category,
        part.brand,
        part.make,
        part.model
      ];

      return searchableFields.some((field) =>
        normalizeText(field).includes(normalizedQuery)
      );
    });
  }

  function getPartByOEM(oemNumber) {
    const normalizedOEM = normalizeOEM(oemNumber);

    if (!normalizedOEM) {
      return null;
    }

    return (
      partsData.find((part) => {
        return (
          normalizeOEM(part.oemNumber) === normalizedOEM ||
          normalizeOEM(part.partNumber) === normalizedOEM ||
          normalizeOEM(part.partNo) === normalizedOEM
        );
      }) || null
    );
  }

  function getSuggestions(query, limit = 8) {
    return searchParts(query).slice(0, limit);
  }

  function displayResults(results, container = null) {
    const target =
      container ||
      document.querySelector(
        "[data-search-results], #searchResults, .search-results"
      );

    if (!target) {
      return;
    }

    target.innerHTML = "";

    if (!results.length) {
      const emptyMessage = document.createElement("div");

      emptyMessage.className = "search-empty";

      emptyMessage.textContent =
        getCurrentLanguage() === "ar"
          ? "لم يتم العثور على قطع مطابقة."
          : "No matching parts found.";

      target.appendChild(emptyMessage);

      return;
    }

    results.forEach((part) => {
      target.appendChild(createPartResultCard(part));
    });
  }

  function createPartResultCard(part) {
    const card = document.createElement("article");

    card.className = "part-search-result";

    const title =
      part.name ||
      part.partName ||
      part.partNumber ||
      part.oemNumber ||
      "Automotive Part";

    const oemNumber =
      part.oemNumber ||
      part.partNumber ||
      part.partNo ||
      "";

    const description =
      part.description || "";

    card.innerHTML = `
      <div class="part-search-result-content">
        <h3>${escapeHTML(title)}</h3>

        ${
          oemNumber
            ? `<p class="part-oem">
                <strong>OEM:</strong>
                ${escapeHTML(oemNumber)}
              </p>`
            : ""
        }

        ${
          part.category
            ? `<p class="part-category">
                ${escapeHTML(part.category)}
              </p>`
            : ""
        }

        ${
          description
            ? `<p class="part-description">
                ${escapeHTML(description)}
              </p>`
            : ""
        }

        <button
          type="button"
          class="part-select-button"
          data-part-select="${escapeHTML(
            oemNumber
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

    const button = card.querySelector(
      "[data-part-select]"
    );

    if (button) {
      button.addEventListener("click", () => {
        selectPart(part);
      });
    }

    return card;
  }

  function selectPart(part) {
    document.dispatchEvent(
      new CustomEvent("alDahayanPartSelected", {
        detail: {
          part: part
        }
      })
    );

    if (typeof window.AlDahayanPartsSearch?.showPartDetails === "function") {
      window.AlDahayanPartsSearch.showPartDetails(part);
    }
  }

  function showSuggestions(input, results) {
    clearSuggestions(input);

    if (!results.length) {
      return;
    }

    const wrapper = document.createElement("div");

    wrapper.className = "search-suggestions";

    results.forEach((part) => {
      const item = document.createElement("button");

      item.type = "button";
      item.className = "search-suggestion-item";

      const title =
        part.name ||
        part.partName ||
        part.partNumber ||
        part.oemNumber ||
        "Part";

      const number =
        part.oemNumber ||
        part.partNumber ||
        part.partNo ||
        "";

      item.innerHTML = `
        <span>${escapeHTML(title)}</span>
        ${
          number
            ? `<small>${escapeHTML(number)}</small>`
            : ""
        }
      `;

      item.addEventListener("click", () => {
        input.value = number || title;

        clearSuggestions(input);

        performSearch(input.value);
      });

      wrapper.appendChild(item);
    });

    const parent = input.parentElement;

    if (parent) {
      parent.style.position = "relative";
      parent.appendChild(wrapper);
    }
  }

  function clearSuggestions(input) {
    const parent = input?.parentElement;

    if (!parent) {
      return;
    }

    const existing =
      parent.querySelector(".search-suggestions");

    if (existing) {
      existing.remove();
    }
  }

  function getCategories() {
    return getUniqueValues(
      partsData.map((part) => part.category)
    );
  }

  function getBrands() {
    return getUniqueValues(
      partsData.map(
        (part) =>
          part.brand ||
          part.make
      )
    );
  }

  function getModels() {
    return getUniqueValues(
      partsData.map((part) => part.model)
    );
  }

  function getUniqueValues(values) {
    return [
      ...new Set(
        values
          .filter(Boolean)
          .map((value) => String(value).trim())
          .filter(Boolean)
      )
    ].sort();
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

  function escapeHTML(value) {
    if (typeof window.AlDahayanUtils?.escapeHTML === "function") {
      return window.AlDahayanUtils.escapeHTML(value);
    }

    const div = document.createElement("div");

    div.textContent = String(value ?? "");

    return div.innerHTML;
  }

  function getCurrentLanguage() {
    return (
      document.documentElement.getAttribute("lang") ||
      APP_CONFIG?.site?.defaultLanguage ||
      "en"
    );
  }

  function debounceSearch(callback, delay = 250) {
    let timeout;

    return function (...args) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        callback.apply(this, args);
      }, delay);
    };
  }

  window.AlDahayanSearch = {
    initialize: initializeSearch,
    loadPartsData,
    searchParts,
    performSearch,
    getSuggestions,
    getPartByOEM,
    getCategories,
    getBrands,
    getModels,
    getAllParts: () => [...partsData],
    isLoaded: () => isLoaded
  };

  window.initializeSearch = initializeSearch;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeSearch
    );
  } else {
    initializeSearch();
  }
})();
