(function () {
  "use strict";

  let inventoryData = [];
  let partsData = [];
  let locationsData = [];

  let isLoaded = false;

  async function initializeInventory() {
    await loadInventoryData();
    setupInventoryInterface();
  }

  async function loadInventoryData() {
    try {
      const [
        inventory,
        parts,
        locations
      ] = await Promise.all([
        loadJSON(
          getDataPath(
            APP_CONFIG.dataFiles.inventory
          )
        ),
        loadJSON(
          getDataPath(
            APP_CONFIG.dataFiles.oemParts
          )
        ),
        loadJSON(
          getDataPath(
            APP_CONFIG.dataFiles.locations
          )
        )
      ]);

      inventoryData =
        normalizeArray(inventory);

      partsData =
        normalizeArray(parts);

      locationsData =
        normalizeArray(locations);

      isLoaded = true;

      return {
        inventory: inventoryData,
        parts: partsData,
        locations: locationsData
      };
    } catch (error) {
      console.error(
        "Al-Dahayan Inventory: Unable to load inventory data.",
        error
      );

      inventoryData = [];
      partsData = [];
      locationsData = [];

      isLoaded = false;

      return {
        inventory: [],
        parts: [],
        locations: []
      };
    }
  }

  async function loadJSON(filePath) {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(
        `Failed to load ${filePath}: ${response.status}`
      );
    }

    return response.json();
  }

  function normalizeArray(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.inventory)) {
      return data.inventory;
    }

    if (Array.isArray(data?.parts)) {
      return data.parts;
    }

    if (Array.isArray(data?.oemParts)) {
      return data.oemParts;
    }

    if (Array.isArray(data?.locations)) {
      return data.locations;
    }

    return [];
  }

  function setupInventoryInterface() {
    setupInventoryForms();
    setupInventoryFilters();
  }

  function setupInventoryForms() {
    const forms = document.querySelectorAll(
      "[data-inventory-search-form], #inventorySearchForm, .inventory-search-form"
    );

    forms.forEach((form) => {
      if (
        form.dataset.inventoryInitialized ===
        "true"
      ) {
        return;
      }

      form.dataset.inventoryInitialized =
        "true";

      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const filters =
            getFiltersFromForm(form);

          performInventorySearch(
            filters
          );
        }
      );
    });
  }

  function setupInventoryFilters() {
    const locationSelects =
      document.querySelectorAll(
        "[data-inventory-location], #inventoryLocation"
      );

    locationSelects.forEach((select) => {
      populateSelect(
        select,
        getLocations(),
        "Select Location"
      );
    });

    const statusSelects =
      document.querySelectorAll(
        "[data-inventory-status], #inventoryStatus"
      );

    statusSelects.forEach((select) => {
      populateSelect(
        select,
        getStatuses(),
        "Select Status"
      );
    });
  }

  function getFiltersFromForm(form) {
    return {
      query: getFieldValue(
        form,
        "query",
        "inventorySearch"
      ),

      oemNumber: getFieldValue(
        form,
        "oemNumber",
        "inventoryOEM"
      ),

      location: getFieldValue(
        form,
        "location",
        "inventoryLocation"
      ),

      status: getFieldValue(
        form,
        "status",
        "inventoryStatus"
      )
    };
  }

  function getFieldValue(
    form,
    name,
    id
  ) {
    const element =
      form.querySelector(
        `[name="${name}"]`
      ) ||
      form.querySelector(`#${id}`);

    return element
      ? String(element.value || "").trim()
      : "";
  }

  function performInventorySearch(
    filters = {}
  ) {
    const results =
      filterInventory(filters);

    displayInventoryResults(
      results
    );

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanInventorySearchCompleted",
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

  function filterInventory(
    filters = {}
  ) {
    if (!isLoaded) {
      return [];
    }

    const query =
      normalizeText(filters.query);

    const oemNumber =
      normalizeOEM(
        filters.oemNumber
      );

    const location =
      normalizeText(
        filters.location
      );

    const status =
      normalizeText(
        filters.status
      );

    return inventoryData
      .map((inventory) =>
        buildInventoryRecord(
          inventory
        )
      )
      .filter((record) => {
        const searchableText =
          normalizeText(
            [
              record.oemNumber,
              record.partNumber,
              record.partName,
              record.category,
              record.locationName,
              record.locationCode,
              record.status
            ]
              .filter(Boolean)
              .join(" ")
          );

        const normalizedRecordOEM =
          normalizeOEM(
            record.oemNumber
          );

        const normalizedRecordLocation =
          normalizeText(
            record.locationName ||
            record.locationCode
          );

        const normalizedRecordStatus =
          normalizeText(
            record.status
          );

        return (
          (!query ||
            searchableText.includes(
              query
            )) &&
          (!oemNumber ||
            normalizedRecordOEM.includes(
              oemNumber
            )) &&
          (!location ||
            normalizedRecordLocation ===
              location) &&
          (!status ||
            normalizedRecordStatus ===
              status)
        );
      });
  }

  function buildInventoryRecord(
    inventory
  ) {
    const part =
      findPartForInventory(
        inventory
      );

    const location =
      findLocationForInventory(
        inventory
      );

    const quantity =
      toNumber(
        inventory.quantity
      );

    const reserved =
      toNumber(
        inventory.reserved
      );

    let available =
      inventory.available !==
      undefined
        ? toNumber(
            inventory.available
          )
        : Math.max(
            quantity - reserved,
            0
          );

    const status =
      getInventoryStatus(
        inventory,
        available
      );

    return {
      ...inventory,

      partId:
        inventory.partId ||
        inventory.part_id ||
        part?.id ||
        "",

      oemNumber:
        inventory.oemNumber ||
        inventory.partNumber ||
        inventory.partNo ||
        part?.oemNumber ||
        part?.partNumber ||
        part?.partNo ||
        "",

      partNumber:
        inventory.partNumber ||
        part?.partNumber ||
        part?.partNo ||
        "",

      partName:
        inventory.partName ||
        part?.name ||
        part?.partName ||
        "",

      category:
        inventory.category ||
        part?.category ||
        "",

      locationId:
        inventory.locationId ||
        inventory.location_id ||
        location?.id ||
        "",

      locationName:
        inventory.locationName ||
        location?.name ||
        location?.locationName ||
        "",

      locationCode:
        inventory.locationCode ||
        location?.code ||
        "",

      quantity,

      reserved,

      available,

      status
    };
  }

  function findPartForInventory(
    inventory
  ) {
    const partId =
      inventory.partId ||
      inventory.part_id ||
      inventory.oemPartId;

    const oemNumber =
      normalizeOEM(
        inventory.oemNumber ||
        inventory.partNumber ||
        inventory.partNo
      );

    return (
      partsData.find((part) => {
        if (
          partId &&
          String(part.id) ===
            String(partId)
        ) {
          return true;
        }

        const partOEM =
          normalizeOEM(
            part.oemNumber ||
            part.partNumber ||
            part.partNo
          );

        return (
          oemNumber &&
          partOEM === oemNumber
        );
      }) || null
    );
  }

  function findLocationForInventory(
    inventory
  ) {
    const locationId =
      inventory.locationId ||
      inventory.location_id;

    const locationCode =
      inventory.locationCode;

    return (
      locationsData.find(
        (location) => {
          if (
            locationId &&
            String(location.id) ===
              String(locationId)
          ) {
            return true;
          }

          if (
            locationCode &&
            String(
              location.code || ""
            ).toLowerCase() ===
              String(
                locationCode
              ).toLowerCase()
          ) {
            return true;
          }

          return false;
        }
      ) || null
    );
  }

  function getInventoryStatus(
    inventory,
    available
  ) {
    if (
      inventory.status &&
      String(
        inventory.status
      ).trim() !== ""
    ) {
      return normalizeText(
        inventory.status
      );
    }

    if (available > 0) {
      return "in_stock";
    }

    if (available === 0) {
      return "out_of_stock";
    }

    return "unknown";
  }

  function getStockQuantity(
    oemNumber
  ) {
    const normalizedOEM =
      normalizeOEM(oemNumber);

    if (!normalizedOEM) {
      return 0;
    }

    return inventoryData
      .map((inventory) =>
        buildInventoryRecord(
          inventory
        )
      )
      .filter(
        (record) =>
          normalizeOEM(
            record.oemNumber
          ) === normalizedOEM
      )
      .reduce(
        (total, record) =>
          total +
          toNumber(
            record.available
          ),
        0
      );
  }

  function isInStock(
    oemNumber
  ) {
    return (
      getStockQuantity(
        oemNumber
      ) > 0
    );
  }

  function getInventoryByOEM(
    oemNumber
  ) {
    const normalizedOEM =
      normalizeOEM(oemNumber);

    if (!normalizedOEM) {
      return [];
    }

    return inventoryData
      .map((inventory) =>
        buildInventoryRecord(
          inventory
        )
      )
      .filter(
        (record) =>
          normalizeOEM(
            record.oemNumber
          ) === normalizedOEM
      );
  }

  function getInventoryByLocation(
    location
  ) {
    const normalizedLocation =
      normalizeText(location);

    return inventoryData
      .map((inventory) =>
        buildInventoryRecord(
          inventory
        )
      )
      .filter((record) => {
        return (
          normalizeText(
            record.locationName
          ) ===
            normalizedLocation ||
          normalizeText(
            record.locationCode
          ) ===
            normalizedLocation
        );
      });
  }

  function getLocations() {
    return getUniqueValues(
      locationsData.map(
        (location) =>
          location.name ||
          location.locationName ||
          location.code ||
          location.id
      )
    );
  }

  function getStatuses() {
    return [
      "in_stock",
      "out_of_stock",
      "unknown"
    ];
  }

  function getInventorySummary() {
    const records =
      inventoryData.map(
        (inventory) =>
          buildInventoryRecord(
            inventory
          )
      );

    return {
      totalRecords:
        records.length,

      totalQuantity:
        records.reduce(
          (total, record) =>
            total +
            record.quantity,
          0
        ),

      totalReserved:
        records.reduce(
          (total, record) =>
            total +
            record.reserved,
          0
        ),

      totalAvailable:
        records.reduce(
          (total, record) =>
            total +
            record.available,
          0
        ),

      inStock:
        records.filter(
          (record) =>
            record.available > 0
        ).length,

      outOfStock:
        records.filter(
          (record) =>
            record.available === 0
        ).length,

      unknown:
        records.filter(
          (record) =>
            record.status ===
            "unknown"
        ).length
    };
  }

  function displayInventoryResults(
    results,
    container = null
  ) {
    const target =
      container ||
      document.querySelector(
        "[data-inventory-results], #inventoryResults, .inventory-results"
      );

    if (!target) {
      return;
    }

    target.innerHTML = "";

    if (!results.length) {
      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "inventory-search-empty";

      empty.textContent =
        getCurrentLanguage() ===
        "ar"
          ? "لم يتم العثور على مخزون مطابق."
          : "No matching inventory found.";

      target.appendChild(empty);

      return;
    }

    results.forEach(
      (record) => {
        target.appendChild(
          createInventoryCard(
            record
          )
        );
      }
    );
  }

  function createInventoryCard(
    record
  ) {
    const card =
      document.createElement(
        "article"
      );

    card.className =
      "inventory-result";

    const statusLabel =
      getStatusLabel(
        record.status
      );

    card.innerHTML = `
      <div class="inventory-result-content">

        <h3>
          ${escapeHTML(
            record.partName ||
            "Automotive Part"
          )}
        </h3>

        ${
          record.oemNumber
            ? `
              <p>
                <strong>OEM:</strong>
                ${escapeHTML(
                  record.oemNumber
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

        <p>
          <strong>Status:</strong>
          <span class="stock-status stock-status-${escapeHTML(
            record.status
          )}">
            ${escapeHTML(
              statusLabel
            )}
          </span>
        </p>

        <p>
          <strong>Available:</strong>
          ${escapeHTML(
            record.available
          )}
        </p>

      </div>
    `;

    return card;
  }

  function getStatusLabel(
    status
  ) {
    const labels = {
      in_stock: {
        en: "In Stock",
        ar: "متوفر"
      },

      out_of_stock: {
        en: "Out of Stock",
        ar: "غير متوفر"
      },

      unknown: {
        en: "Availability Unknown",
        ar: "التوفر غير معروف"
      }
    };

    const language =
      getCurrentLanguage();

    return (
      labels[status]?.[language] ||
      labels[status]?.en ||
      status
    );
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
      document.createElement(
        "option"
      );

    option.value = "";

    option.textContent =
      getCurrentLanguage() ===
      "ar"
        ? getArabicPlaceholder(
            placeholder
          )
        : placeholder;

    select.appendChild(option);

    values.forEach(
      (value) => {
        const item =
          document.createElement(
            "option"
          );

        item.value = value;
        item.textContent = value;

        select.appendChild(item);
      }
    );
  }

  function getArabicPlaceholder(
    placeholder
  ) {
    const translations = {
      "Select Location":
        "اختر الموقع",

      "Select Status":
        "اختر الحالة"
    };

    return (
      translations[
        placeholder
      ] || placeholder
    );
  }

  function normalizeText(
    value
  ) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizeOEM(
    value
  ) {
    return String(value || "")
      .toUpperCase()
      .replace(
        /[\s\-_.]/g,
        ""
      );
  }

  function toNumber(value) {
    const number =
      Number(value);

    return Number.isFinite(
      number
    )
      ? number
      : 0;
  }

  function getUniqueValues(
    values
  ) {
    return [
      ...new Set(
        values
          .filter(
            (value) =>
              value !==
                undefined &&
              value !== null
          )
          .map((value) =>
            String(
              value
            ).trim()
          )
          .filter(Boolean)
      )
    ];
  }

  function getCurrentLanguage() {
    return (
      document.documentElement.getAttribute(
        "lang"
      ) ||
      APP_CONFIG?.site
        ?.defaultLanguage ||
      "en"
    );
  }

  function escapeHTML(
    value
  ) {
    if (
      typeof window
        .AlDahayanUtils
        ?.escapeHTML ===
      "function"
    ) {
      return window.AlDahayanUtils.escapeHTML(
        value
      );
    }

    const div =
      document.createElement(
        "div"
      );

    div.textContent =
      String(
        value ?? ""
      );

    return div.innerHTML;
  }

  window.AlDahayanInventory = {
    initialize:
      initializeInventory,

    loadInventoryData,

    performInventorySearch,

    filterInventory,

    getInventoryByOEM,

    getInventoryByLocation,

    getStockQuantity,

    isInStock,

    getLocations,

    getStatuses,

    getInventorySummary,

    getAllInventory: () => [
      ...inventoryData
    ],

    getAllParts: () => [
      ...partsData
    ],

    getAllLocations: () => [
      ...locationsData
    ],

    isLoaded: () => isLoaded
  };

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
