/* =========================================
   AL-DAHAYAN INVENTORY / STOCK SYSTEM
   LIVE INVENTORY + VERIFIED AVAILABILITY
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

  /* =========================================
     CONFIG HELPERS
  ========================================= */

  function getConfig() {
    return window.AlDahayanConfig || {};
  }

  function getInventoryConfig() {
    return (
      getConfig().inventory || {
        enabled: true,
        lowStockThreshold: 5,
        quantityDisplay: false,
        allowManualOverride: true,
        allowOnRequest: true,
        requireVerifiedStock: true,
        defaultStatus: "unknown"
      }
    );
  }

  function getLowStockThreshold() {
    const value = Number(
      getInventoryConfig().lowStockThreshold
    );

    return Number.isFinite(value) && value >= 0
      ? value
      : 5;
  }

  function isInventoryEnabled() {
    const config = getInventoryConfig();

    return config.enabled !== false;
  }

  /* =========================================
     GENERAL HELPERS
  ========================================= */

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
      ? Math.max(0, number)
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
      ? Math.max(0, number)
      : 0;
  }

  function getAvailableQuantity(record) {
    return Math.max(
      0,
      getQuantity(record) -
        getReserved(record)
    );
  }

  /* =========================================
     CONTROL MODE
  ========================================= */

  function getControlMode(record) {
    const explicit =
      normalize(
        record?.controlMode ||
        record?.control_mode ||
        record?.stockControlMode ||
        record?.stock_control_mode ||
        record?.mode
      );

    if (
      explicit === "manual" ||
      explicit === "manual_override"
    ) {
      return "manual";
    }

    return "automatic";
  }

  function isActiveRecord(record) {
    return record?.active !== false;
  }

  /* =========================================
     STOCK STATUS
  ========================================= */

  function normalizeStatus(status) {
    const value = normalize(status);

    const aliases = {
      "in-stock": "in_stock",
      "in stock": "in_stock",
      "instock": "in_stock",

      "low-stock": "low_stock",
      "low stock": "low_stock",
      "lowstock": "low_stock",

      "out-of-stock": "out_of_stock",
      "out of stock": "out_of_stock",
      "outofstock": "out_of_stock",

      "on-order": "on_request",
      "on order": "on_request",
      "on-request": "on_request",
      "on request": "on_request",

      "unknown": "unknown"
    };

    return aliases[value] || value || "unknown";
  }

  function getAutomaticStatus(available) {
    const threshold =
      getLowStockThreshold();

    if (available <= 0) {
      return "out_of_stock";
    }

    if (available <= threshold) {
      return "low_stock";
    }

    return "in_stock";
  }

  function getStatus(record) {
    const mode =
      getControlMode(record);

    const explicitStatus =
      normalizeStatus(
        record?.status ||
        record?.stockStatus ||
        record?.stock_status
      );

    /*
      Manual mode:
      Admin's explicit status is respected.
    */
    if (
      mode === "manual" &&
      explicitStatus &&
      explicitStatus !== "unknown"
    ) {
      return explicitStatus;
    }

    /*
      ON REQUEST can be manually specified
      even when quantity is not available.
    */
    if (
      explicitStatus === "on_request" &&
      getInventoryConfig().allowOnRequest !== false
    ) {
      return "on_request";
    }

    /*
      Unknown records must not be presented
      as verified stock.
    */
    if (
      explicitStatus === "unknown" ||
      !explicitStatus
    ) {
      const hasVerifiedQuantity =
        record?.verified === true ||
        record?.stockVerified === true ||
        record?.stock_verified === true;

      if (!hasVerifiedQuantity) {
        return "unknown";
      }
    }

    return getAutomaticStatus(
      getAvailableQuantity(record)
    );
  }

  function getStatusLabel(status) {
    const labels = {
      in_stock: "In Stock",
      low_stock: "Low Stock",
      out_of_stock: "Out of Stock",
      on_request: "On Request",
      unknown: "Availability To Be Confirmed",

      /* Backward compatibility */
      "in-stock": "In Stock",
      "low-stock": "Low Stock",
      "out-of-stock": "Out of Stock",
      "on-order": "On Request",
      discontinued: "Discontinued"
    };

    return (
      labels[normalizeStatus(status)] ||
      labels[status] ||
      "Unknown"
    );
  }

  function getStockClass(status) {
    const normalized =
      normalizeStatus(status);

    return normalized.replace(
      /_/g,
      "-"
    );
  }

  /* =========================================
     VERIFICATION
  ========================================= */

  function isVerifiedRecord(record) {
    if (!record) {
      return false;
    }

    if (!isActiveRecord(record)) {
      return false;
    }

    if (
      record.verified === true ||
      record.stockVerified === true ||
      record.stock_verified === true
    ) {
      return true;
    }

    const status =
      normalizeStatus(record.status);

    /*
      Unknown data is never verified.
    */
    if (status === "unknown") {
      return false;
    }

    /*
      Existing inventory records with a concrete
      stock status can be treated as verified only
      when the record explicitly declares it or when
      Admin data has a meaningful lastUpdated value.
    */
    const lastUpdated =
      record.lastUpdated ||
      record.last_updated ||
      record.updatedAt ||
      record.updated_at;

    return Boolean(lastUpdated);
  }

  function getVerificationState(record) {
    return isVerifiedRecord(record)
      ? "verified"
      : "unverified";
  }

  /* =========================================
     DATA PATH
  ========================================= */

  function getDataPath(fileName) {
    if (
      window.AlDahayanConfig &&
      typeof window.AlDahayanConfig.getDataPath ===
        "function"
    ) {
      return window.AlDahayanConfig.getDataPath(
        fileName
      );
    }

    if (
      typeof window.getDataPath ===
      "function"
    ) {
      return window.getDataPath(
        fileName
      );
    }

    return `../data/${fileName}`;
  }

  async function fetchJSON(fileName) {
    const response = await fetch(
      getDataPath(fileName),
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

  function extractArray(
    data,
    keys = []
  ) {
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

  /* =========================================
     DATA LOADING
  ========================================= */

  async function loadData() {
    if (!isInventoryEnabled()) {
      inventory = [];
      parts = [];
      locations = [];
      inventoryRecords = [];
      filteredInventory = [];

      return [];
    }

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
        [
          "inventory",
          "items",
          "records"
        ]
      );

    parts =
      extractArray(
        partsData,
        [
          "parts",
          "oemParts"
        ]
      );

    locations =
      extractArray(
        locationsData,
        [
          "locations",
          "warehouses"
        ]
      );

    buildInventoryRecords();

    return inventoryRecords;
  }

  /* =========================================
     LOOKUPS
  ========================================= */

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

  function getLocationName(
    location
  ) {
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

  /* =========================================
     BUILD MASTER INVENTORY RECORDS
  ========================================= */

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

        const controlMode =
          getControlMode(record);

        const status =
          getStatus({
            ...record,
            quantity,
            reserved
          });

        const verified =
          isVerifiedRecord({
            ...record,
            status
          });

        return {
          ...record,

          id:
            record.id ||
            record.inventoryId ||
            record.inventory_id ||
            "",

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
          controlMode,

          verified,
          verification:
            verified
              ? "verified"
              : "unverified",

          lastUpdated:
            record.lastUpdated ||
            record.last_updated ||
            record.updatedAt ||
            record.updated_at ||
            "",

          active:
            record.active !== false,

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

          brand:
            part?.brand ||
            record.brand ||
            "",

          model:
            part?.model ||
            record.model ||
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

  /* =========================================
     DOM
  ========================================= */

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

  /* =========================================
     SEARCH / FILTER
  ========================================= */

  function applyFilters() {
    const query =
      normalize(state.query);

    const status =
      normalizeStatus(
        state.status
      );

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
            record.brand,
            record.model,
            record.part?.brand,
            record.part?.model
          ]
            .flat()
            .map(normalize)
            .join(" ");

          const matchesQuery =
            !query ||
            searchableText.includes(
              query
            );

          const matchesStatus =
            !state.status ||
            normalizeStatus(
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

  /* =========================================
     STATISTICS
  ========================================= */

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

    const activeRecords =
      inventoryRecords.filter(
        (record) =>
          record.active !== false
      );

    const total =
      activeRecords.length;

    const available =
      activeRecords.filter(
        (record) =>
          record.status ===
          "in_stock"
      ).length;

    const lowStock =
      activeRecords.filter(
        (record) =>
          record.status ===
          "low_stock"
      ).length;

    const outOfStock =
      activeRecords.filter(
        (record) =>
          record.status ===
          "out_of_stock"
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

  /* =========================================
     STOCK BADGE
  ========================================= */

  function renderStockBadge(
    status,
    verified
  ) {
    const normalized =
      normalizeStatus(status);

    const label =
      getStatusLabel(normalized);

    return `
      <span
        class="stock-badge stock-${escapeHTML(
          getStockClass(normalized)
        )}"
        data-stock-status="${escapeHTML(
          normalized
        )}"
      >
        ${escapeHTML(label)}
      </span>

      ${
        verified
          ? `
            <span
              class="inventory-verified-badge"
              title="Verified inventory data"
            >
              Verified
            </span>
          `
          : ""
      }
    `;
  }

  /* =========================================
     CUSTOMER QUANTITY DISPLAY
  ========================================= */

  function shouldShowExactQuantity() {
    return (
      getInventoryConfig()
        .quantityDisplay === true
    );
  }

  function renderQuantityInfo(
    record
  ) {
    /*
      Exact quantity is Admin-controlled.
      Customer-facing search does not expose
      exact stock by default.
    */

    if (
      !record.verified
    ) {
      return `
        <div class="inventory-availability-note">
          Availability will be confirmed by Al-Dahayan.
        </div>
      `;
    }

    if (
      !shouldShowExactQuantity()
    ) {
      return `
        <div class="inventory-availability-note">
          Availability verified.
        </div>
      `;
    }

    return `
      <div class="inventory-quantity">

        <span>
          <strong>Available:</strong>
          ${escapeHTML(
            record.available
          )}
        </span>

        ${
          record.reserved > 0
            ? `
              <span>
                <strong>Reserved:</strong>
                ${escapeHTML(
                  record.reserved
                )}
              </span>
            `
            : ""
        }

      </div>
    `;
  }

  /* =========================================
     INVENTORY CARD
  ========================================= */

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

            <div class="inventory-card-stock">

              ${renderStockBadge(
                record.status,
                record.verified
              )}

            </div>

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

          ${renderQuantityInfo(
            record
          )}

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

  /* =========================================
     RESULTS
  ========================================= */

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

  /* =========================================
     FIND INVENTORY
  ========================================= */

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
        record.active !== false &&
        normalize(
          record.partId
        ) === target
    );
  }

  /* =========================================
     PART STOCK SUMMARY
  ========================================= */

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

    const verifiedRecords =
      records.filter(
        (record) =>
          record.verified === true
      );

    const hasVerified =
      verifiedRecords.length > 0;

    let status =
      "unknown";

    if (hasVerified) {
      const hasOnRequest =
        verifiedRecords.some(
          (record) =>
            record.status ===
            "on_request"
        );

      const verifiedAvailable =
        verifiedRecords.reduce(
          (total, record) =>
            total +
            record.available,
          0
        );

      if (
        hasOnRequest &&
        verifiedAvailable <= 0
      ) {
        status = "on_request";
      } else {
        status =
          getAutomaticStatus(
            verifiedAvailable
          );
      }
    }

    return {
      partId,
      quantity,
      reserved,
      available,
      status,
      verified:
        hasVerified,
      verification:
        hasVerified
          ? "verified"
          : "unverified",
      records
    };
  }

  /* =========================================
     VERIFIED AVAILABILITY
     Used by search.js / AI / customer flow
  ========================================= */

  function getVerifiedAvailability(
    options = {}
  ) {
    const oemNumber =
      options.oemNumber ||
      options.oem ||
      "";

    const partId =
      options.partId ||
      options.part_id ||
      "";

    let records = [];

    if (partId) {
      records =
        findStockByPartId(
          partId
        );
    }

    if (
      oemNumber &&
      !records.length
    ) {
      const targetOEM =
        normalize(oemNumber);

      records =
        inventoryRecords.filter(
          (record) =>
            record.active !== false &&
            normalize(
              record.oem
            ) === targetOEM
        );
    }

    /*
      Only verified records are allowed
      to become customer-facing availability.
    */
    const verifiedRecords =
      records.filter(
        (record) =>
          record.verified === true
      );

    if (!verifiedRecords.length) {
      return {
        verified: false,
        status: "unknown",
        statusLabel:
          "Availability To Be Confirmed",
        quantity: null,
        availableQuantity: null,
        records: [],
        message:
          "Final availability will be confirmed by Al-Dahayan."
      };
    }

    const quantity =
      verifiedRecords.reduce(
        (total, record) =>
          total +
          record.quantity,
        0
      );

    const reserved =
      verifiedRecords.reduce(
        (total, record) =>
          total +
          record.reserved,
        0
      );

    const availableQuantity =
      verifiedRecords.reduce(
        (total, record) =>
          total +
          record.available,
        0
      );

    const hasOnRequest =
      verifiedRecords.some(
        (record) =>
          record.status ===
          "on_request"
      );

    let status;

    if (
      hasOnRequest &&
      availableQuantity <= 0
    ) {
      status = "on_request";
    } else {
      status =
        getAutomaticStatus(
          availableQuantity
        );
    }

    return {
      verified: true,

      status,

      statusLabel:
        getStatusLabel(status),

      quantity:
        shouldShowExactQuantity()
          ? quantity
          : null,

      reserved:
        shouldShowExactQuantity()
          ? reserved
          : null,

      availableQuantity:
        shouldShowExactQuantity()
          ? availableQuantity
          : null,

      quantityHidden:
        !shouldShowExactQuantity(),

      records:
        verifiedRecords,

      message:
        status === "on_request"
          ? "Please contact Al-Dahayan for availability."
          : "Inventory availability verified."
    };
  }

  /* =========================================
     CUSTOMER-FACING STOCK RESULT
  ========================================= */

  function getCustomerStock(
    options = {}
  ) {
    return getVerifiedAvailability(
      options
    );
  }

  /* =========================================
     PART VIEW
  ========================================= */

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

  /* =========================================
     INQUIRY
  ========================================= */

  function handleInquiry(partId) {
    const part =
      parts.find(
        (item) =>
          normalize(
            getPartId(item)
          ) ===
          normalize(partId)
      );

    const stock =
      getPartStock(partId);

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanInventoryInquiry",
        {
          detail: {
            part,
            partId,
            stock
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

  /* =========================================
     FORM EVENTS
  ========================================= */

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

  /* =========================================
     EVENTS
  ========================================= */

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

  /* =========================================
     INITIALIZATION
  ========================================= */

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

  /* =========================================
     PUBLIC API
  ========================================= */

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

    getVerifiedAvailability:
      getVerifiedAvailability,

    getCustomerStock:
      getCustomerStock,

    isVerifiedRecord:
      isVerifiedRecord,

    getVerificationState:
      getVerificationState,

    getStatusLabel:
      getStatusLabel,

    getParts: function () {
      return [
        ...parts
      ];
    },

    getLocations: function () {
      return [
        ...locations
      ];
    },

    getState: function () {
      return {
        ...state
      };
    },

    getConfig: function () {
      return {
        ...getInventoryConfig()
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
