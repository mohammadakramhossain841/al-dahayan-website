(function () {
  "use strict";

  let parts = [];

  async function initializeSearch() {
    await loadPartsData();
    setupSearchForms();
    setupSearchInputs();
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
      console.error("Parts data loading error:", error);
      parts = [];
      return [];
    }
  }

  function setupSearchForms() {
    const forms = document.querySelectorAll(
      "[data-search-form], .search-form"
    );

    forms.forEach((form) => {
      form.addEventListener("submit", handleSearchSubmit);
    });
  }

  function setupSearchInputs() {
    const inputs = document.querySelectorAll(
      "[data-search-input]"
    );

    inputs.forEach((input) => {
      input.addEventListener("input", handleSearchInput);
    });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const input =
      form.querySelector("[data-search-input]") ||
      form.querySelector("input[name='search']") ||
      form.querySelector("input[type='search']") ||
      form.querySelector("input");

    if (!input) {
      return;
    }

    const query = input.value.trim();

    if (!query) {
      showSearchMessage(
        "Please enter an OEM part number or search keyword."
      );
      return;
    }

    const results = searchParts(query);

    displaySearchResults(results);

    document.dispatchEvent(
      new CustomEvent("partsSearchCompleted", {
        detail: {
          query: query,
          results: results
        }
      })
    );
  }

  function handleSearchInput(event) {
    const input = event.currentTarget;
    const query = input.value.trim();

    if (query.length < 2) {
      clearSearchSuggestions();
      return;
    }

    const results = searchParts(query).slice(0, 6);

    displaySearchSuggestions(results);
  }

  function searchParts(query) {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      return [];
    }

    return parts.filter((part) => {
      const searchableText = getPartSearchText(part);

      return searchableText.includes(normalizedQuery);
    });
  }

  function getPartSearchText(part) {
    const values = [
      part.partNumber,
      part.oemNumber,
      part.partNo,
      part.oem,
      part.name,
      part.partName,
      part.description,
      part.category,
      part.brand,
      part.model
    ];

    return values
      .filter(Boolean)
      .map(normalizeSearchText)
      .join(" ");
  }

  function normalizeSearchText(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function displaySearchResults(results) {
    const containers = document.querySelectorAll(
      "[data-search-results]"
    );

    containers.forEach((container) => {
      container.innerHTML = "";

      if (!results.length) {
        showSearchMessage(
          "No matching parts found.",
          container
        );
        return;
      }

      results.forEach((part) => {
        const card = createPartResultCard(part);
        container.appendChild(card);
      });
    });
  }

  function displaySearchSuggestions(results) {
    const containers = document.querySelectorAll(
      "[data-search-suggestions]"
    );

    containers.forEach((container) => {
      container.innerHTML = "";

      if (!results.length) {
        container.hidden = true;
        return;
      }

      results.forEach((part) => {
        const item = document.createElement("button");

        item.type = "button";
        item.className = "search-suggestion";

        item.textContent =
          part.oemNumber ||
          part.partNumber ||
          part.partNo ||
          part.name ||
          "Part";

        item.addEventListener("click", () => {
          const input = document.querySelector(
            "[data-search-input]"
          );

          if (input) {
            input.value =
              part.oemNumber ||
              part.partNumber ||
              part.partNo ||
              "";

            input.dispatchEvent(
              new Event("input", {
                bubbles: true
              })
            );
          }

          displaySearchResults([part]);
          container.hidden = true;
        });

        container.appendChild(item);
      });

      container.hidden = false;
    });
  }

  function createPartResultCard(part) {
    const card = document.createElement("article");

    card.className = "part-search-result";

    const partNumber =
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
      "Automotive Parts";

    card.innerHTML = `
      <div class="part-search-result-content">
        <span class="part-search-result-category">
          ${escapeHTML(category)}
        </span>

        <h3>${escapeHTML(name)}</h3>

        <p>
          <strong>OEM:</strong>
          ${escapeHTML(partNumber)}
        </p>

        <button
          type="button"
          class="btn btn-primary"
          data-part-number="${escapeHTML(partNumber)}"
        >
          View Part
        </button>
      </div>
    `;

    const button = card.querySelector(
      "[data-part-number]"
    );

    if (button) {
      button.addEventListener("click", () => {
        openPartDetails(part);
      });
    }

    return card;
  }

  function openPartDetails(part) {
    document.dispatchEvent(
      new CustomEvent("partSelected", {
        detail: {
          part: part
        }
      })
    );

    const partNumber =
      part.oemNumber ||
      part.partNumber ||
      part.partNo;

    if (partNumber) {
      const encodedPartNumber =
        encodeURIComponent(partNumber);

      const target =
        `./pages/parts.html?oem=${encodedPartNumber}`;

      window.location.href = target;
    }
  }

  function showSearchMessage(message, container = null) {
    const targets = container
      ? [container]
      : document.querySelectorAll(
          "[data-search-results]"
        );

    targets.forEach((target) => {
      target.innerHTML = `
        <div class="search-message">
          ${escapeHTML(message)}
        </div>
      `;
    });
  }

  function clearSearchSuggestions() {
    const containers = document.querySelectorAll(
      "[data-search-suggestions]"
    );

    containers.forEach((container) => {
      container.innerHTML = "";
      container.hidden = true;
    });
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getParts() {
    return [...parts];
  }

  window.AlDahayanSearch = {
    initialize: initializeSearch,
    search: searchParts,
    getParts
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
