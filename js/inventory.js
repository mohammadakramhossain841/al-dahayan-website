/* =========================================
   AL-DAHAYAN INVENTORY / STOCK SYSTEM
   LIVE INVENTORY + VERIFIED AVAILABILITY
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let eventsBound = false;
  let loadingPromise = null;

  let inventory = [];
  let parts = [];
  let locations = [];

  let inventoryRecords = [];
  let filteredInventory = [];

  const state = {
    query: "",
    status: "",
    location: "",
    category: "",
    brand: "",
    vehicle: ""
  };

  /* =========================================
     CONFIG HELPERS
  ========================================= */

  function getConfig() {
    return window.AlDahayanConfig || {};
  }

  function getEffectiveConfig() {
    const config = getConfig();

    if (
      typeof config.getEffectiveAppConfig ===
      "function"
    ) {
      return (
        config.getEffectiveAppConfig() || {}
      );
    }

    return config;
  }

  function getInventoryConfig() {
    const config =
      getEffectiveConfig();

    return {
      enabled:
        config.inventory?.enabled !== false,

      lowStockThreshold:
        Number.isFinite(
          Number(
            config.inventory
              ?.lowStockThreshold
          )
        )
          ? Number(
              config.inventory
                .lowStockThreshold
            )
          : 5,

      quantityDisplay:
        config.inventory
          ?.quantityDisplay === true,

      allowManualOverride:
        config.inventory
          ?.allowManualOverride !== false,

      allowOnRequest:
        config.inventory
          ?.allowOnRequest !== false,

      requireVerifiedStock:
        config.inventory
          ?.requireVerifiedStock !== false,

      defaultStatus:
        config.inventory
          ?.defaultStatus || "unknown"
    };
  }

  function getLowStockThreshold() {
    const value = Number(
      getInventoryConfig()
        .lowStockThreshold
    );

    return Number.isFinite(value) &&
      value >= 0
      ? value
      : 5;
  }

  function isInventoryEnabled() {
    return (
      getInventoryConfig()
        .enabled !== false
    );
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

  /*
   * OEM is the primary public inventory key.
   */
  function getOEM(source) {
    return (
      source?.oemNumber ||
      source?.oem_number ||
      source?.oem ||
      source?.partNumber ||
      source?.part_number ||
      ""
    );
  }

  function getPartName(part) {
    return (
      part?.partName ||
      part?.part_name ||
      part?.name ||
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

  function getBrand(source) {
    return (
      source?.brand ||
      source?.make ||
      ""
    );
  }

  function getModels(source) {
    const models =
      source?.model ||
      source?.models ||
      [];

    if (Array.isArray(models)) {
      return models;
    }

    if (models) {
      return [models];
    }

    return [];
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

  /*
   * Branch ID is the canonical location reference.
   * locationId remains supported for backward
   * compatibility with existing data.
   */
  function getBranchId(record) {
    return (
      record?.branchId ||
      record?.branch_id ||
      record?.locationId ||
      record?.location_id ||
      record?.warehouseId ||
      record?.warehouse_id ||
      ""
    );
  }

  function getLocationId(record) {
    return getBranchId(record);
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
      record?.reservedQuantity ??
      record?.reserved_quantity ??
      record?.reserved ??
      0;

    const number = Number(value);

    return Number.isFinite(number)
      ? Math.max(0, number)
      : 0;
  }

  function getAvailableQuantity(record) {
    if (
      record?.availableQuantity !==
        undefined &&
      record?.availableQuantity !== null
    ) {
      const value = Number(
        record.availableQuantity
      );

      if (Number.isFinite(value)) {
        return Math.max(0, value);
      }
    }

    return Math.max(
      0,
      getQuantity(record) -
        getReserved(record)
    );
  }

  function getLastUpdated(record) {
    return (
      record?.lastUpdated ||
      record?.last_updated ||
      record?.updatedAt ||
      record?.updated_at ||
      ""
    );
  }

  /* =========================================
     CONTROL MODE
  ========================================= */

  function getControlMode(record) {
    const config =
      getInventoryConfig();

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
      return config.allowManualOverride
        ? "manual"
        : "automatic";
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
    const value =
      normalize(status);

    const aliases = {
      "in-stock": "in_stock",
      "in stock": "in_stock",
      instock: "in_stock",

      "low-stock": "low_stock",
      "low stock": "low_stock",
      lowstock: "low_stock",

      "out-of-stock":
        "out_of_stock",
      "out of stock":
        "out_of_stock",
      outofstock:
        "out_of_stock",

      "on-order": "on_request",
      "on order": "on_request",
      "on-request": "on_request",
      "on request": "on_request",

      "manual override":
        "manual_override",

      unknown: "unknown"
    };

    return (
      aliases[value] ||
      value ||
      "unknown"
    );
  }

  function getAutomaticStatus(
    available
  ) {
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
    const config =
      getInventoryConfig();

    const mode =
      getControlMode(record);

    const explicitStatus =
      normalizeStatus(
        record?.status ||
        record?.stockStatus ||
        record?.stock_status
      );

    /*
     * ON REQUEST is a deliberate Admin state.
     */
    if (
      explicitStatus ===
        "on_request" &&
      config.allowOnRequest
    ) {
      return "on_request";
    }

    /*
     * Manual Override:
     * Admin's explicit stock state is respected.
     */
    if (
      mode === "manual" &&
      config.allowManualOverride &&
      explicitStatus !== "unknown"
    ) {
      return explicitStatus;
    }

    /*
     * Automatic mode calculates the status
     * from verified available quantity.
     */
    if (
      explicitStatus === "unknown" ||
      !explicitStatus
    ) {
      return "unknown";
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
      unknown:
        "Availability To Be Confirmed",

      "in-stock": "In Stock",
      "low-stock": "Low Stock",
      "out-of-stock":
        "Out of Stock",
      "on-order": "On Request",
      discontinued:
        "Discontinued"
    };

    const normalized =
      normalizeStatus(status);

    return (
      labels[normalized] ||
      labels[status] ||
      "Unknown"
    );
  }

  function getStockClass(status) {
    return normalizeStatus(
      status
    ).replace(/_/g, "-");
  }

  /* =========================================
     VERIFICATION
  ========================================= */

  function hasExplicitVerification(
    record
  ) {
    return (
      record?.verified === true ||
      record?.stockVerified === true ||
      record?.stock_verified === true
    );
  }

  function isVerifiedRecord(record) {
    if (!record) {
      return false;
    }

    if (!isActiveRecord(record)) {
      return false;
    }

    /*
     * Explicit verification always wins.
     */
    if (
      hasExplicitVerification(record)
    ) {
      return true;
    }

    /*
     * If verification is required,
     * do not infer verification merely
     * from quantity or lastUpdated.
     */
    if (
      getInventoryConfig()
        .requireVerifiedStock
    ) {
      return false;
    }

    /*
     * Legacy compatibility:
     * if verification is not required,
     * a concrete updated record may be
     * considered usable.
     */
    const status =
      normalizeStatus(
        record?.status
      );

    if (status === "unknown") {
      return false;
    }

    return Boolean(
      getLastUpdated(record)
    );
  }

  function getVerificationState(
    record
  ) {
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
      typeof window.AlDahayanConfig
        .getDataPath ===
        "function"
    ) {
      return window.AlDahayanConfig
        .getDataPath(fileName);
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
    const response =
      await fetch(
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
      if (
        Array.isArray(
          data?.[key]
        )
      ) {
        return data[key];
      }
    }

    if (
      Array.isArray(data?.data)
    ) {
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
      fetchJSON(
        "inventory.json"
      ),
      fetchJSON(
        "oem-parts.json"
      ),
      fetchJSON(
        "locations.json"
      )
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
          "branches",
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

    if (!target) {
      return null;
    }

    return (
      parts.find(
        (part) =>
          normalize(
            getPartId(part)
          ) === target
      ) || null
    );
  }

  function findPartByOEM(
    oemNumber
  ) {
    const target =
      normalize(oemNumber);

    if (!target) {
      return null;
    }

    return (
      parts.find(
        (part) =>
          normalize(
            getOEM(part)
          ) === target
      ) || null
    );
  }

  function findLocation(
    locationId
  ) {
    const target =
      normalize(locationId);

    if (!target) {
      return null;
    }

    return (
      locations.find(
        (location) =>
          normalize(
            location.id ||
            location.locationId ||
            location.location_id ||
            location.branchId ||
            location.branch_id ||
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
      location.branchName ||
      location.branch_name ||
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
      inventory
        .filter(isActiveRecord)
        .map((record) => {
          const part =
            findPart(
              getInventoryPartId(
                record
              )
            ) ||
            findPartByOEM(
              getOEM(record)
            );

          const branchId =
            getBranchId(record);

          const location =
            findLocation(
              branchId
            );

          const quantity =
            getQuantity(record);

          const reserved =
            getReserved(record);

          const available =
            getAvailableQuantity(
              record
            );

          const controlMode =
            getControlMode(record);

          const status =
            getStatus({
              ...record,
              quantity,
              reserved,
              availableQuantity:
                available
            });

          const verified =
            isVerifiedRecord({
              ...record,
              status
            });

          const partOEM =
            getOEM(part);

          const recordOEM =
            getOEM(record);

          const oem =
            partOEM ||
            recordOEM ||
            "";

          const models =
            getModels(part).length
              ? getModels(part)
              : getModels(record);

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
              getInventoryPartId(
                record
              ) ||
              getPartId(part),

            /*
             * Canonical branch reference.
             */
            branchId,

            /*
             * Backward compatibility.
             */
            locationId:
              branchId,

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
              getLastUpdated(record),

            active:
              record.active !== false,

            oem,

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
              getBrand(part) ||
              getBrand(record) ||
              "",

            model:
              models,

            models,

            locationName:
              getLocationName(
                location
              ) ||
              record.locationName ||
              record.location_name ||
              record.branchName ||
              "",

            /*
             * Keep branch/location details
             * separate from the inventory
             * master data.
             */
            branch:
              location || null
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
      form:
        document.querySelector(
          "[data-inventory-search-form]"
        ),

      query:
        document.querySelector(
          "[data-inventory-query]"
        ),

      status:
        document.querySelector(
          "[data-inventory-status]"
        ),

      location:
        document.querySelector(
          "[data-inventory-location]"
        ),

      category:
        document.querySelector(
          "[data-inventory-category]"
        ),

      reset:
        document.querySelector(
          "[data-inventory-reset]"
        ),

      summary:
        document.querySelector(
          "[data-inventory-result-summary]"
        ),

      results:
        document.querySelector(
          "[data-inventory-results]"
        ),

      total:
        document.querySelector(
          "[data-inventory-total]"
        ),

      available:
        document.querySelector(
          "[data-inventory-available]"
        ),

      lowStock:
        document.querySelector(
          "[data-inventory-low-stock]"
        ),

      outOfStock:
        document.querySelector(
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
    ].sort(
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
      document.createElement(
        "option"
      );

    placeholderOption.value = "";
    placeholderOption.textContent =
      placeholder;

    select.appendChild(
      placeholderOption
    );

    values.forEach((value) => {
      const option =
        document.createElement(
          "option"
        );

      option.value = value;
      option.textContent = value;

      select.appendChild(option);
    });

    if (
      values.includes(
        currentValue
      )
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

    const brand =
      normalize(state.brand);

    const vehicle =
      normalize(state.vehicle);

    filteredInventory =
      inventoryRecords.filter(
        (record) => {
          const modelText =
            Array.isArray(
              record.models
            )
              ? record.models.join(" ")
              : record.model;

          const searchableText = [
            record.oem,
            record.partName,
            record.category,
            record.locationName,
            record.status,
            record.brand,
            modelText,
            record.part?.brand,
            record.part?.model,
            record.part?.models
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

          const matchesBrand =
            !brand ||
            normalize(
              record.brand
            ) === brand;

          const matchesVehicle =
            !vehicle ||
            searchableText.includes(
              vehicle
            );

          return (
            matchesQuery &&
            matchesStatus &&
            matchesLocation &&
            matchesCategory &&
            matchesBrand &&
            matchesVehicle
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
        count === 1
          ? ""
          : "s"
      } found`;
  }

  function renderStatistics() {
    const elements =
      getElements();

    const activeRecords =
      inventoryRecords.filter(
        isActiveRecord
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
      getStatusLabel(
        normalized
      );

    return `
      <span
        class="stock-badge stock-${escapeHTML(
          getStockClass(
            normalized
          )
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
          : `
            <span
              class="inventory-unverified-badge"
              title="Inventory availability requires confirmation"
            >
              Confirmation Required
            </span>
          `
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
    if (!record.verified) {
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
        data-oem="${escapeHTML(
          record.oem || ""
        )}"
        data-branch-id="${escapeHTML(
          record.branchId || ""
        )}"
      >

        ${
          image
            ? `
              <div class="inventory-card-image">
                <img
                  src="${escapeHTML(
                    image
                  )}"
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
            record.brand
              ? `
                <p>
                  <strong>Brand:</strong>
                  ${escapeHTML(
                    record.brand
                  )}
                </p>
              `
              : ""
          }

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
                  <strong>Branch:</strong>
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
              data-oem="${escapeHTML(
                record.oem
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

    if (
      !filteredInventory.length
    ) {
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
        .map(
          renderInventoryCard
        )
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

    if (!target) {
      return [];
    }

    return inventoryRecords.filter(
      (record) =>
        isActiveRecord(record) &&
        normalize(
          record.partId
        ) === target
    );
  }

  function findStockByOEM(
    oemNumber
  ) {
    const target =
      normalize(oemNumber);

    if (!target) {
      return [];
    }

    return inventoryRecords.filter(
      (record) =>
        isActiveRecord(record) &&
        normalize(
          record.oem
        ) === target
    );
  }

  /* =========================================
     PART STOCK SUMMARY
  ========================================= */

  function getPartStock(partId) {
    const records =
      findStockByPartId(
        partId
      );

    return buildStockSummary(
      records,
      partId
    );
  }

  /* =========================================
     OEM STOCK SUMMARY
  ========================================= */

  function getOEMStock(
    oemNumber
  ) {
    const records =
      findStockByOEM(
        oemNumber
      );

    return buildStockSummary(
      records,
      null,
      oemNumber
    );
  }

  function buildStockSummary(
    records,
    partId = null,
    oemNumber = ""
  ) {
    const verifiedRecords =
      records.filter(
        (record) =>
          record.verified === true
      );

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

    const available =
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

    let status =
      "unknown";

    if (
      verifiedRecords.length
    ) {
      if (
        hasOnRequest &&
        available <= 0
      ) {
        status =
          "on_request";
      } else {
        status =
          getAutomaticStatus(
            available
          );
      }
    }

    return {
      partId,

      oemNumber:
        oemNumber || "",

      quantity,

      reserved,

      available,

      status,

      statusLabel:
        getStatusLabel(status),

      verified:
        verifiedRecords.length > 0,

      verification:
        verifiedRecords.length
          ? "verified"
          : "unverified",

      branchCount:
        new Set(
          verifiedRecords
            .map(
              (record) =>
                record.branchId
            )
            .filter(Boolean)
        ).size,

      records
    };
  }

  /* =========================================
     VERIFIED AVAILABILITY
     Used by:
     search.js
     parts-search.js
     vin-search.js
     inquiry.js
     AI
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

    /*
     * OEM is the primary fallback key.
     */
    if (
      oemNumber &&
      !records.length
    ) {
      records =
        findStockByOEM(
          oemNumber
        );
    }

    /*
     * No verified inventory means
     * no customer-facing stock claim.
     */
    const verifiedRecords =
      records.filter(
        (record) =>
          record.verified === true &&
          record.active !== false
      );

    if (
      !verifiedRecords.length
    ) {
      return {
        verified: false,

        status: "unknown",

        statusLabel:
          getStatusLabel(
            "unknown"
          ),

        quantity: null,

        reserved: null,

        availableQuantity: null,

        quantityHidden: true,

        branchCount: 0,

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
      status =
        "on_request";
    } else {
      status =
        getAutomaticStatus(
          availableQuantity
        );
    }

    const showQuantity =
      shouldShowExactQuantity();

    const branchCount =
      new Set(
        verifiedRecords
          .map(
            (record) =>
              record.branchId
          )
          .filter(Boolean)
      ).size;

    return {
      verified: true,

      status,

      statusLabel:
        getStatusLabel(
          status
        ),

      quantity:
        showQuantity
          ? quantity
          : null,

      reserved:
        showQuantity
          ? reserved
          : null,

      availableQuantity:
        showQuantity
          ? availableQuantity
          : null,

      quantityHidden:
        !showQuantity,

      branchCount,

      records:
        verifiedRecords,

      message:
        status ===
        "on_request"
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

  function handlePartView(
    partId
  ) {
    const part =
      findPart(partId);

    if (!part) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanPartSelected",
        {
          detail: {
            part,
            id: partId,

            inventory:
              getVerifiedAvailability(
                {
                  partId
                }
              )
          }
        }
      )
    );
  }

  /* =========================================
     INQUIRY
  ========================================= */

  function handleInquiry(
    partId,
    oemNumber = ""
  ) {
    const part =
      findPart(partId);

    const stock =
      partId
        ? getPartStock(
            partId
          )
        : getOEMStock(
            oemNumber
          );

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanInventoryInquiry",
        {
          detail: {
            part,

            partId,

            oemNumber:
              oemNumber ||
              getOEM(part),

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

    const params =
      new URLSearchParams();

    if (partId) {
      params.set(
        "part",
        partId
      );
    }

    if (oemNumber) {
      params.set(
        "oem",
        oemNumber
      );
    }

    const query =
      params.toString();

    window.location.href =
      query
        ? `${inquiryPage}?${query}`
        : inquiryPage;
  }

  /* =========================================
     FORM EVENTS
  ========================================= */

  function handleFormSubmit(
    event
  ) {
    event.preventDefault();

    const elements =
      getElements();

    state.query =
      elements.query?.value ||
      "";

    state.status =
      elements.status?.value ||
      "";

    state.location =
      elements.location?.value ||
      "";

    state.category =
      elements.category?.value ||
      "";

    applyFilters();
  }

  function handleFilterChange() {
    const elements =
      getElements();

    state.status =
      elements.status?.value ||
      "";

    state.location =
      elements.location?.value ||
      "";

    state.category =
      elements.category?.value ||
      "";

    applyFilters();
  }

  function resetSearch() {
    const elements =
      getElements();

    state.query = "";
    state.status = "";
    state.location = "";
    state.category = "";
    state.brand = "";
    state.vehicle = "";

    if (elements.form) {
      elements.form.reset();
    }

    updateFilterOptions();

    filteredInventory =
      [...inventoryRecords];

    renderResults();
  }

  /* =========================================
     EVENT BINDING
  ========================================= */

  function bindEvents() {
    if (eventsBound) {
      return;
    }

    eventsBound = true;

    document.addEventListener(
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
            ),
            inquiryButton.getAttribute(
              "data-oem"
            ) || ""
          );
        }
      }
    );

    document.addEventListener(
      "alDahayanConfigUpdated",
      () => {
        refresh();
      }
    );

    document.addEventListener(
      "alDahayanInventoryUpdated",
      () => {
        refresh();
      }
    );

    document.addEventListener(
      "alDahayanWebsiteSettingsUpdated",
      () => {
        renderResults();
      }
    );
  }

  /* =========================================
     REFRESH
  ========================================= */

  async function refresh() {
    try {
      await loadData();

      updateFilterOptions();

      applyFilters();

      document.dispatchEvent(
        new CustomEvent(
          "alDahayanInventoryReady",
          {
            detail: {
              count:
                inventoryRecords.length,

              timestamp:
                new Date().toISOString()
            }
          }
        )
      );

      return [
        ...inventoryRecords
      ];
    } catch (error) {
      console.error(
        "Al-Dahayan Inventory refresh:",
        error
      );

      return [];
    }
  }

  /* =========================================
     INITIALIZATION
  ========================================= */

  async function initializeInventory() {
    if (
      initialized &&
      loadingPromise
    ) {
      return loadingPromise;
    }

    if (initialized) {
      return inventoryRecords;
    }

    initialized = true;

    loadingPromise =
      (async () => {
        try {
          await loadData();

          updateFilterOptions();

          const elements =
            getElements();

          /*
           * Bind only when an inventory
           * UI exists.
           */
          if (
            elements.form ||
            elements.results
          ) {
            bindEvents();

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

            renderResults();
          } else {
            /*
             * Global inventory API can still
             * operate without an inventory UI.
             */
            bindEvents();
          }

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

          return inventoryRecords;
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

          return [];
        }
      })();

    return loadingPromise;
  }

  /* =========================================
     PUBLIC API
  ========================================= */

  window.AlDahayanInventory = {

    init:
      initializeInventory,

    initialize:
      initializeInventory,

    load:
      loadData,

    refresh:
      refresh,

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

      state.brand =
        filters.brand || "";

      state.vehicle =
        filters.vehicle || "";

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

    findByOEM:
      findStockByOEM,

    getPartStock:
      getPartStock,

    getOEMStock:
      getOEMStock,

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

    getStockClass:
      getStockClass,

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

    getBranches: function () {
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
    },

    isInitialized:
      function () {
        return initialized;
      }
  };

  window.initializeInventory =
    initializeInventory;

  /* =========================================
     DOM READY
  ========================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeInventory,
      {
        once: true
      }
    );
  } else {
    initializeInventory();
  }

})();
