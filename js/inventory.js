(function () {
  "use strict";

  let inventory = [];
  let parts = [];
  let locations = [];

  async function initializeInventory() {
    await loadInventoryData();
    await loadPartsData();
    await loadLocationsData();

    setupInventorySearch();
    setupInventoryFilters();
  }

  async function loadInventoryData() {
    try {
      const fileName =
        window.APP_CONFIG?.dataFiles?.inventory ||
        "inventory.json";

      const path =
        window.getDataPath?.(fileName) ||
        `./data/${fileName}`;

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Unable to load inventory data: ${response.status}`
        );
      }

      const data = await response.json();

      inventory = Array.isArray(data)
        ? data
        : Array.isArray(data.inventory)
        ? data.inventory
        : [];

      return inventory;
    } catch (error) {
      console.error(
        "Inventory data loading error:",
        error
      );

      inventory = [];
      return [];
    }
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
        "Parts data loading error:",
        error
      );

      parts = [];
      return [];
    }
  }

  async function loadLocationsData() {
    try {
      const fileName =
        window.APP_CONFIG?.dataFiles?.locations ||
        "locations.json";

      const path =
        window.getDataPath?.(fileName) ||
        `./data/${fileName}`;

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Unable to load locations data: ${response.status}`
        );
      }

      const data = await response.json();

      locations = Array.isArray(data)
        ? data
        : Array.isArray(data.locations)
        ? data.locations
        : [];

      return locations;
    } catch (error) {
      console.error(
        "Locations data loading error:",
        error
      );

      locations = [];
      return [];
    }
  }

  function setupInventorySearch() {
    const forms = document.querySelectorAll(
      "[data-inventory-search-form], .inventory-search-form"
    );

    forms.forEach((form) => {
      form.addEventListener(
        "submit",
        handleInventorySearch
      );
    });
  }

  function setupInventoryFilters() {
    const filters = document.querySelectorAll(
      "[data-inventory-filter]"
    );

    filters.forEach((filter) => {
      filter.addEventListener(
        "change",
        handleInventoryFilterChange
      );
    });
  }

  function handleInventorySearch(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const query =
      getFieldValue(form, "search") ||
      getFieldValue(form, "query") ||
      getFieldValue(form, "oem") ||
      getFieldValue(form, "partNumber");

    const location =
      getFieldValue(form, "location");

    const status =
      getFieldValue(form, "status");

    const results = searchInventory({
      query,
      location,
      status
    });

    displayInventoryResults(results);

    document.dispatchEvent(
      new CustomEvent("inventorySearchCompleted", {
        detail: {
          filters: {
            query,
            location,
            status
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

  function handleInventoryFilterChange(event) {
    const filter = event.currentTarget;

    document.dispatchEvent(
      new CustomEvent("inventoryFilterChanged", {
        detail: {
          name: filter.name,
          value: filter.value
        }
      })
    );
  }

  function searchInventory(filters = {}) {
    const query =
      normalize(filters.query);

    const location =
      normalize(filters.location);

    const status =
      normalize(filters.status);

    return inventory.filter((item) => {
      const searchableText =
        getInventorySearchText(item);

      const matchesQuery =
        !query ||
        searchableText.includes(query);

      const matchesLocation =
        !location ||
        normalize(
          item.location ||
          item.warehouse ||
          item.branch ||
          item.locationName
        ).includes(location);

      const matchesStatus =
        !status ||
        normalize(
          item.status ||
          getAvailabilityStatus(item)
        ) === status;

      return (
        matchesQuery &&
        matchesLocation &&
        matchesStatus
      );
    });
  }

  function getInventorySearchText(item) {
    const values = [
      item.id,
      item.inventoryId,
      item.oemNumber,
      item.partNumber,
      item.partNo,
      item.oem,
      item.name,
      item.partName,
      item.category,
      item.brand,
      item.make,
      item.model,
      item.location,
      item.locationName,
      item.warehouse,
      item.branch,
      item.status
    ];

    return values
      .filter(Boolean)
      .map(normalize)
      .join(" ");
  }

  function getStockQuantity(item) {
    const quantity =
      item.quantity ??
      item.stockQuantity ??
      item.stock ??
      item.availableQuantity ??
      0;

    const number =
      Number(quantity);

    return Number.isFinite(number)
      ? number
      : 0;
  }

  function getAvailabilityStatus(item) {
    const quantity =
      getStockQuantity(item);

    if (quantity > 0) {
      return "in-stock";
    }

    return "out-of-stock";
  }

  function getAvailabilityLabel(item) {
    const customStatus =
      item.status;

    if (customStatus) {
      return customStatus;
    }

    return getAvailabilityStatus(item);
  }

  function isInStock(item) {
    return getStockQuantity(item) > 0;
  }

  function getInventoryByOEM(oemNumber) {
    const normalizedOEM =
      normalizeOEM(oemNumber);

    if (!normalizedOEM) {
      return [];
    }

    return inventory.filter((item) => {
      const values = [
        item.oemNumber,
        item.partNumber,
        item.partNo,
        item.oem
      ];

      return values.some(
        (value) =>
          normalizeOEM(value) ===
          normalizedOEM
      );
    });
  }

  function getTotalStock(oemNumber) {
    const items =
      getInventoryByOEM(oemNumber);

    return items.reduce(
      (total, item) =>
        total + getStockQuantity(item),
      0
    );
  }

  function getAvailableLocations(oemNumber) {
    const items =
      getInventoryByOEM(oemNumber);

    return [
      ...new Set(
        items
          .map(
            (item) =>
              item.location ||
              item.locationName ||
              item.warehouse ||
              item.branch
          )
          .filter(Boolean)
      )
    ];
  }

  function getInventoryStatus(oemNumber) {
    const totalStock =
      getTotalStock(oemNumber);

    if (totalStock > 0) {
      return "in-stock";
    }

    return "out-of-stock";
  }

  function getInventorySummary(oemNumber) {
    const items =
      getInventoryByOEM(oemNumber);

    const totalStock =
      items.reduce(
        (total, item) =>
          total + getStockQuantity(item),
        0
      );

    const availableLocations =
      getAvailableLocations(oemNumber);

    return {
      oemNumber,
      totalStock,
      status:
        totalStock > 0
          ? "in-stock"
          : "out-of-stock",
      locations: availableLocations,
      records: items
    };
  }

  function getLocations() {
    return [...locations];
  }

  function getInventory() {
    return [...inventory];
  }

  function displayInventoryResults(results) {
    const containers =
      document.querySelectorAll(
        "[data-inventory-results]"
      );

    containers.forEach(
      (container) => {
        container.innerHTML = "";

        if (!results.length) {
          container.innerHTML = `
            <div class="search-message">
              No inventory records found.
            </div>
          `;

          return;
        }

        results.forEach((item) => {
          container.appendChild(
            createInventoryCard(item)
          );
        });
      }
    );
  }

  function createInventoryCard(item) {
    const card =
      document.createElement("article");

    card.className =
      "inventory-result";

    const oem =
      item.oemNumber ||
      item.partNumber ||
      item.partNo ||
      "N/A";

    const name =
      item.name ||
      item.partName ||
      "Automotive Spare Part";

    const quantity =
      getStockQuantity(item);

    const location =
      item.location ||
      item.locationName ||
      item.warehouse ||
      item.branch ||
      "Location not specified";

    const status =
      getAvailabilityLabel(item);

    card.innerHTML = `
      <div class="inventory-result-content">

        <span class="inventory-status ${escapeHTML(
          status
        )}">
          ${escapeHTML(status)}
        </span>

        <h3>
          ${escapeHTML(name)}
        </h3>

        <p>
          <strong>OEM:</strong>
          ${escapeHTML(oem)}
        </p>

        <p>
          <strong>Available Quantity:</strong>
          ${quantity}
        </p>

        <p>
          <strong>Location:</strong>
          ${escapeHTML(location)}
        </p>

        <button
          type="button"
          class="btn btn-primary"
          data-inventory-oem="${escapeHTML(
            oem
          )}"
        >
          Check Availability
        </button>

      </div>
    `;

    const button =
      card.querySelector(
        "[data-inventory-oem]"
      );

    if (button) {
      button.addEventListener(
        "click",
        () => {
          selectInventory(item);
        }
      );
    }

    return card;
  }

  function selectInventory(item) {
    document.dispatchEvent(
      new CustomEvent(
        "inventorySelected",
        {
          detail: {
            inventory: item
          }
        }
      )
    );
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
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

  window.AlDahayanInventory = {
    initialize:
      initializeInventory,

    search:
      searchInventory,

    getInventory,

    getLocations,

    getInventoryByOEM,

    getTotalStock,

    getAvailableLocations,

    getInventoryStatus,

    getInventorySummary,

    getStockQuantity,

    getAvailabilityStatus,

    getAvailabilityLabel,

    isInStock,

    selectInventory
  };

  window.initializeInventory =
    initializeInventory;

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeInventory
    );
  } else {
    initializeInventory();
  }
})();
