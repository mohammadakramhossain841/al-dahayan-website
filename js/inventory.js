/* =========================================
   AL-DAHAYAN INVENTORY / STOCK SYSTEM
========================================= */

(function () {
  "use strict";

  let initialized = false;

  let inventory = [];
  let parts = [];
  let locations = [];

  let inventoryRecords = [];
  let filteredInventory = [];

  const state = {
    query: "",
    status: "",
    location: "",
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
      part?.id ||
      part?.partId ||
      part?.part_id ||
      ""
    );
  }

  function getOEM(part) {
    return (
      part?.oem ||
      part?.oemNumber ||
      part?.oem_number ||
      part?.partNumber ||
      part?.part_number ||
      ""
    );
  }

  function getPartName(part) {
    return (
      part?.name ||
      part?.partName ||
      part?.part_name ||
      ""
    );
  }

  function getCategory(part) {
    return (
      part?.category ||
      part?.categoryName ||
      part?.category_name ||
      ""
    );
  }

  function getInventoryPartId(record) {
    return (
      record?.partId ||
      record?.part_id ||
      record?.oemPartId ||
      record?.oem_part_id ||
      record?.productId ||
      record?.product_id ||
      ""
    );
  }

  function getLocationId(record) {
    return (
      record?.locationId ||
      record?.location_id ||
      record?.warehouseId ||
      record?.warehouse_id ||
      ""
    );
  }

  function getQuantity(record) {
    const value =
      record?.quantity ??
      record?.qty ??
      record?.stockQuantity ??
      record?.stock_quantity ??
      0;

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  }

  function getReserved(record) {
    const value =
      record?.reserved ??
      record?.reservedQuantity ??
      record?.reserved_quantity ??
      0;

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  }

  function getAvailableQuantity(record) {
    return Math.max(
      0,
      getQuantity(record) -
        getReserved(record)
    );
  }

  function getStatus(record) {
    const explicitStatus =
      normalize(
        record?.status ||
        record?.stockStatus ||
        record?.stock_status
      );

    if (explicitStatus) {
      return explicitStatus;
    }

    const available =
      getAvailableQuantity(record);

    if (available <= 0) {
      return "out-of-stock";
    }

    if (available <= 5) {
      return "low-stock";
    }

    return "in-stock";
  }

  function getStatusLabel(status) {
    const labels = {
      "in-stock": "In Stock",
      "low-stock": "Low Stock",
      "out-of-stock": "Out of Stock",
      "on-order": "On Order",
      "discontinued": "Discontinued"
    };

    return (
      labels[status] ||
      "Unknown"
    );
  }

  function uniqueSorted(values) {
    return [
      ...new Set(
        values
          .filter(Boolean)
          .map((value) =>
            String(value).trim()
          )
      )
    ].sort((a, b) =>
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

  async function fetchJSON(fileName) {
    if (
      typeof window.getDataPath !==
      "function"
    ) {
      throw new Error(
        "getDataPath() is not available."
      );
    }

    const response = await fetch(
      window.getDataPath(fileName),
      {
        cache: "no-cache"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load ${fileName}: ${response.status}`
      );
    }

    return response.json();
  }

  function extractArray(data, keys = []) {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  }

  async function loadData() {
    const [
      inventoryData,
      partsData,
      locationsData
    ] = await Promise.all([
      fetchJSON("inventory.json"),
      fetchJSON("oem-parts.json"),
      fetchJSON("locations.json")
    ]);

    inventory =
      extractArray(
        inventoryData,
        ["inventory", "items", "records"]
      );

    parts =
      extractArray(
        partsData,
        ["parts", "oemParts"]
      );

    locations =
      extractArray(
        locationsData,
        ["locations", "warehouses"]
      );

    buildInventoryRecords();

    return inventoryRecords;
  }

  function findPart(partId) {
    const target =
      normalize(partId);

    return (
      parts.find(
        (part) =>
          normalize(
            getPartId(part)
          ) === target
      ) || null
    );
  }

  function findLocation(locationId) {
    const target =
      normalize(locationId);

    return (
      locations.find(
        (location) =>
          normalize(
            location.id ||
            location.locationId ||
            location.location_id ||
            ""
          ) === target
      ) || null
    );
  }

  function getLocationName(location) {
    if (!location) {
      return "";
    }

    return (
      location.name ||
      location.locationName ||
      location.location_name ||
      location.warehouse ||
      location.city ||
      ""
    );
  }

  function buildInventoryRecords() {
    inventoryRecords =
      inventory.map((record) => {
        const part =
          findPart(
            getInventoryPartId(record)
          );

        const location =
          findLocation(
            getLocationId(record)
          );

        const quantity =
          getQuantity(record);

        const reserved =
          getReserved(record);

        const available =
          Math.max(
            0,
            quantity - reserved
          );

        const status =
          getStatus({
            ...record,
            quantity,
            reserved
          });

        return {
          ...record,

          part,
          location,

          partId:
            getInventoryPartId(record),

          locationId:
            getLocationId(record),

          quantity,
          reserved,
          available,

          status,

          oem:
            getOEM(part) ||
            record.oem ||
            record.oemNumber ||
            "",

          partName:
            getPartName(part) ||
            record.partName ||
            record.part_name ||
            "",

          category:
            getCategory(part) ||
            record.category ||
            "",

          locationName:
            getLocationName(location) ||
            record.locationName ||
            record.location_name ||
            ""
        };
      });

    filteredInventory =
      [...inventoryRecords];
  }

  function getElements() {
    return {
      form: document.querySelector(
        "[data-inventory-search-form]"
      ),

      query: document.querySelector(
        "[data-inventory-query]"
      ),

      status: document.querySelector(
        "[data-inventory-status]"
      ),

      location: document.querySelector(
        "[data-inventory-location]"
      ),

      category: document.querySelector(
        "[data-inventory-category]"
      ),

      reset: document.querySelector(
        "[data-inventory-reset]"
      ),

      summary: document.querySelector(
        "[data-inventory-result-summary]"
      ),

      results: document.querySelector(
        "[data-inventory-results]"
      ),

      total: document.querySelector(
        "[data-inventory-total]"
      ),

      available: document.querySelector(
        "[data-inventory-available]"
      ),

      lowStock: document.querySelector(
        "[data-inventory-low-stock]"
      ),

      outOfStock: document.querySelector(
        "[data-inventory-out-of-stock]"
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

    const currentValue =
      select.value;

    select.innerHTML = "";

    const placeholderOption =
      document.createElement("option");

    placeholderOption.value = "";
    placeholderOption.textContent =
      placeholder;

    select.appendChild(
      placeholderOption
    );

    values.forEach((value) => {
      const option =
        document.createElement("option");

      option.value = value;
      option.textContent = value;

      select.appendChild(option);
    });

    if (
      values.includes(currentValue)
    ) {
      select.value =
        currentValue;
    }
  }

  function updateFilterOptions() {
    const elements =
      getElements();

    const statuses =
      uniqueSorted(
        inventoryRecords.map(
          (record) =>
            record.status
        )
      );

    const locationNames =
      uniqueSorted(
        inventoryRecords.map(
          (record) =>
            record.locationName
        )
      );

    const categories =
      uniqueSorted(
        inventoryRecords.map(
          (record) =>
            record.category
        )
      );

    setSelectOptions(
      elements.status,
      statuses,
      "All Stock Status"
    );

    setSelectOptions(
      elements.location,
      locationNames,
      "All Locations"
    );

    setSelectOptions(
      elements.category,
      categories,
      "All Categories"
    );
  }

  function applyFilters() {
    const query =
      normalize(state.query);

    const status =
      normalize(state.status);

    const location =
      normalize(state.location);

    const category =
      normalize(state.category);

    filteredInventory =
      inventoryRecords.filter(
        (record) => {
          const searchableText = [
            record.oem,
            record.partName,
            record.category,
            record.locationName,
            record.status,
            record.part?.brand,
            record.part?.model
          ]
            .map(normalize)
            .join(" ");

          const matchesQuery =
            !query ||
            searchableText.includes(
              query
            );

          const matchesStatus =
            !status ||
            normalize(
              record.status
            ) === status;

          const matchesLocation =
            !location ||
            normalize(
              record.locationName
            ) === location;

          const matchesCategory =
            !category ||
            normalize(
              record.category
            ) === category;

          return (
            matchesQuery &&
            matchesStatus &&
            matchesLocation &&
            matchesCategory
          );
        }
      );

    renderResults();
  }

  function renderSummary() {
    const elements =
      getElements();

    if (!elements.summary) {
      return;
    }

    const count =
      filteredInventory.length;

    elements.summary.textContent =
      `${count} inventory record${
        count === 1 ? "" : "s"
      } found`;
  }

  function renderStatistics() {
    const elements =
      getElements();

    const total =
      inventoryRecords.length;

    const available =
      inventoryRecords.filter(
        (record) =>
          record.status ===
          "in-stock"
      ).length;

    const lowStock =
      inventoryRecords.filter(
        (record) =>
          record.status ===
          "low-stock"
      ).length;

    const outOfStock =
      inventoryRecords.filter(
        (record) =>
          record.status ===
          "out-of-stock"
      ).length;

    if (elements.total) {
      elements.total.textContent =
        total;
    }

    if (elements.available) {
      elements.available.textContent =
        available;
    }

    if (elements.lowStock) {
      elements.lowStock.textContent =
        lowStock;
    }

    if (elements.outOfStock) {
      elements.outOfStock.textContent =
        outOfStock;
    }
  }

  function renderStockBadge(status) {
    const label =
      getStatusLabel(status);

    return `
      <span
        class="stock-badge stock-${escapeHTML(
          status
        )}"
      >
        ${escapeHTML(label)}
      </span>
    `;
  }

  function renderInventoryCard(
    record
  ) {
    const part =
      record.part;

    const partId =
      record.partId;

    const image =
      part?.image ||
      part?.imageUrl ||
      part?.image_url ||
      "";

    return `
      <article
        class="inventory-card"
        data-inventory-id="${escapeHTML(
          record.id || ""
        )}"
      >

        ${
          image
            ? `
              <div class="inventory-card-image">
                <img
                  src="${escapeHTML(image)}"
                  alt="${escapeHTML(
                    record.partName
                  )}"
                  loading="lazy"
                >
              </div>
            `
            : ""
        }

        <div class="inventory-card-content">

          <div class="inventory-card-header">

            <div>
              ${
                record.oem
                  ? `
                    <span class="inventory-card-oem">
                      ${escapeHTML(
                        record.oem
                      )}
                    </span>
                  `
                  : ""
              }

              <h3 class="inventory-card-title">
                ${escapeHTML(
                  record.partName ||
                  "Spare Part"
                )}
              </h3>
            </div>

            ${renderStockBadge(
              record.status
            )}

          </div>

          ${
            record.category
              ? `
                <p>
                  <strong>Category:</strong>
                  ${escapeHTML(
                    record.category
                  )}
                </p>
              `
              : ""
          }

          ${
            record.locationName
              ? `
                <p>
                  <strong>Location:</strong>
                  ${escapeHTML(
                    record.locationName
                  )}
                </p>
              `
              : ""
          }

          <div class="inventory-quantity">

            <span>
              <strong>Available:</strong>
              ${escapeHTML(
                record.available
              )}
            </span>

            <span>
              <strong>Reserved:</strong>
              ${escapeHTML(
                record.reserved
              )}
            </span>

          </div>

          <div class="inventory-card-actions">

            ${
              partId
                ? `
                  <button
                    type="button"
                    class="inventory-card-button"
                    data-inventory-part
                    data-part-id="${escapeHTML(
                      partId
                    )}"
                  >
                    View Part
                  </button>
                `
                : ""
            }

            <button
              type="button"
              class="inventory-card-button secondary"
              data-inventory-inquiry
              data-part-id="${escapeHTML(
                partId
              )}"
            >
              Inquiry
            </button>

          </div>

        </div>

      </article>
    `;
  }

  function renderResults() {
    const elements =
      getElements();

    renderSummary();
    renderStatistics();

    if (!elements.results) {
      return;
    }

    if (!filteredInventory.length) {
      elements.results.innerHTML = `
        <div class="search-empty">
          <h3>No inventory records found</h3>
          <p>
            Try changing your search or stock filters.
          </p>
        </div>
      `;

      return;
    }

    elements.results.innerHTML =
      filteredInventory
        .map(renderInventoryCard)
        .join("");
  }

  function findInventoryById(id) {
    const target =
      normalize(id);

    return (
      inventoryRecords.find(
        (record) =>
          normalize(
            record.id
          ) === target
      ) || null
    );
  }

  function findStockByPartId(
    partId
  ) {
    const target =
      normalize(partId);

    return inventoryRecords.filter(
      (record) =>
        normalize(
          record.partId
        ) === target
    );
  }

  function getPartStock(partId) {
    const records =
      findStockByPartId(partId);

    const quantity =
      records.reduce(
        (total, record) =>
          total +
          record.quantity,
        0
      );

    const reserved =
      records.reduce(
        (total, record) =>
          total +
          record.reserved,
        0
      );

    const available =
      records.reduce(
        (total, record) =>
          total +
          record.available,
        0
      );

    let status =
      "out-of-stock";

    if (available > 5) {
      status = "in-stock";
    } else if (available > 0) {
      status = "low-stock";
    }

    return {
      partId,
      quantity,
      reserved,
      available,
      status,
      records
    };
  }

  function handlePartView(partId) {
    const part =
      parts.find(
        (item) =>
          normalize(
            getPartId(item)
          ) ===
          normalize(partId)
      );

    if (!part) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanPartSelected",
        {
          detail: {
            part,
            id: partId
          }
        }
      )
    );
  }

  function handleInquiry(partId) {
    const part =
      parts.find(
        (item) =>
          normalize(
            getPartId(item)
          ) ===
          normalize(partId)
      );

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanInventoryInquiry",
        {
          detail: {
            part,
            partId,
            stock:
              getPartStock(partId)
          }
        }
      )
    );

    const inquiryPage =
      typeof window.getPagePath ===
      "function"
        ? window.getPagePath(
            "inquiry.html"
          )
        : "../pages/inquiry.html";

    if (partId) {
      window.location.href =
        `${inquiryPage}?part=${encodeURIComponent(
          partId
        )}`;
    } else {
      window.location.href =
        inquiryPage;
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const elements =
      getElements();

    state.query =
      elements.query?.value || "";

    state.status =
      elements.status?.value || "";

    state.location =
      elements.location?.value || "";

    state.category =
      elements.category?.value || "";

    applyFilters();
  }

  function handleFilterChange() {
    const elements =
      getElements();

    state.status =
      elements.status?.value || "";

    state.location =
      elements.location?.value || "";

    state.category =
      elements.category?.value || "";

    applyFilters();
  }

  function resetSearch() {
    const elements =
      getElements();

    state.query = "";
    state.status = "";
    state.location = "";
    state.category = "";

    if (elements.form) {
      elements.form.reset();
    }

    updateFilterOptions();

    filteredInventory =
      [...inventoryRecords];

    renderResults();
  }

  function bindEvents() {
    const elements =
      getElements();

    elements.form?.addEventListener(
      "submit",
      handleFormSubmit
    );

    elements.query?.addEventListener(
      "input",
      handleFormSubmit
    );

    elements.status?.addEventListener(
      "change",
      handleFilterChange
    );

    elements.location?.addEventListener(
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
            "[data-inventory-part]"
          );

        if (viewButton) {
          handlePartView(
            viewButton.getAttribute(
              "data-part-id"
            )
          );

          return;
        }

        const inquiryButton =
          event.target.closest(
            "[data-inventory-inquiry]"
          );

        if (inquiryButton) {
          handleInquiry(
            inquiryButton.getAttribute(
              "data-part-id"
            )
          );
        }
      }
    );
  }

  async function initializeInventory() {
    if (initialized) {
      return;
    }

    initialized = true;

    try {
      await loadData();

      updateFilterOptions();
      bindEvents();
      renderResults();

      document.dispatchEvent(
        new CustomEvent(
          "alDahayanInventoryReady",
          {
            detail: {
              count:
                inventoryRecords.length
            }
          }
        )
      );

    } catch (error) {
      console.error(
        "Al-Dahayan Inventory:",
        error
      );

      const elements =
        getElements();

      if (elements.results) {
        elements.results.innerHTML = `
          <div class="search-error">
            <h3>
              Unable to load inventory
            </h3>
            <p>
              Please try again later.
            </p>
          </div>
        `;
      }

      if (elements.summary) {
        elements.summary.textContent =
          "Inventory data unavailable";
      }
    }
  }

  window.AlDahayanInventory = {
    init:
      initializeInventory,

    load:
      loadData,

    search: function (
      filters = {}
    ) {
      state.query =
        filters.query || "";

      state.status =
        filters.status || "";

      state.location =
        filters.location || "";

      state.category =
        filters.category || "";

      applyFilters();

      return [
        ...filteredInventory
      ];
    },

    reset:
      resetSearch,

    getAll: function () {
      return [
        ...inventoryRecords
      ];
    },

    getResults: function () {
      return [
        ...filteredInventory
      ];
    },

    findById:
      findInventoryById,

    findByPartId:
      findStockByPartId,

    getPartStock:
      getPartStock,

    getParts: function () {
      return [...parts];
    },

    getLocations: function () {
      return [...locations];
    },

    getState: function () {
      return {
        ...state
      };
    }
  };

  window.initializeInventory =
    initializeInventory;

  document.addEventListener(
    "DOMContentLoaded",
    initializeInventory
  );

})();
