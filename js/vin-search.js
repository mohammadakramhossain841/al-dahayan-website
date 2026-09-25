/* =========================================
   AL-DAHAYAN VIN SEARCH
   VERIFIED VIN + COMPATIBILITY + INVENTORY
========================================= */

(function () {
  "use strict";

  const CONFIG =
    window.AlDahayanConfig || null;

  const UTILS =
    window.AlDahayanUtils || null;

  let initialized = false;
  let eventsBound = false;

  let vehicles = [];
  let compatibility = [];
  let parts = [];

  const state = {
    vin: "",
    vehicle: null,
    compatibleParts: [],
    verified: false,
    inventory: []
  };

  /* =========================================
     Helpers
  ========================================= */

  function normalize(value) {
    return String(value ?? "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
  }

  function getDataPath(fileName) {
    if (
      CONFIG &&
      typeof CONFIG.getDataPath ===
        "function"
    ) {
      return CONFIG.getDataPath(
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

  function escapeHTML(value) {
    if (
      UTILS &&
      typeof UTILS.escapeHTML ===
        "function"
    ) {
      return UTILS.escapeHTML(value);
    }

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getValue(object, keys) {
    for (const key of keys) {
      if (
        object &&
        object[key] !== undefined &&
        object[key] !== null
      ) {
        return object[key];
      }
    }

    return "";
  }

  function normalizeArray(
    data,
    keys = []
  ) {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of keys) {
      if (
        data &&
        Array.isArray(data[key])
      ) {
        return data[key];
      }
    }

    return [];
  }

  /* =========================================
     Vehicle Helpers
  ========================================= */

  function getVehicleID(vehicle) {
    return getValue(vehicle, [
      "id",
      "vehicleId",
      "vehicle_id"
    ]);
  }

  function getVehicleVIN(vehicle) {
    return getValue(vehicle, [
      "vin",
      "VIN",
      "vinNumber",
      "vin_number"
    ]);
  }

  function getVehicleMake(vehicle) {
    return getValue(vehicle, [
      "make",
      "brand",
      "manufacturer"
    ]);
  }

  function getVehicleModel(vehicle) {
    return getValue(vehicle, [
      "model",
      "vehicleModel",
      "vehicle_model"
    ]);
  }

  function getVehicleYear(vehicle) {
    return getValue(vehicle, [
      "year",
      "modelYear",
      "model_year"
    ]);
  }

  function getVehicleEngine(vehicle) {
    return getValue(vehicle, [
      "engine",
      "engineType",
      "engine_type",
      "engine_name"
    ]);
  }

  function isActive(record) {
    return record?.active !== false;
  }

  /* =========================================
     Part Helpers
  ========================================= */

  function getPartID(part) {
    return getValue(part, [
      "id",
      "partId",
      "part_id"
    ]);
  }

  function getPartOEM(part) {
    return getValue(part, [
      "oem",
      "oemNumber",
      "oem_number",
      "partNumber",
      "part_number"
    ]);
  }

  function getPartName(part) {
    return getValue(part, [
      "name",
      "partName",
      "part_name",
      "title"
    ]);
  }

  /* =========================================
     Compatibility Helpers
  ========================================= */

  function getCompatibilityVehicleID(
    item
  ) {
    return getValue(item, [
      "vehicleId",
      "vehicle_id",
      "vehicle",
      "vehicleID"
    ]);
  }

  function getCompatibilityPartID(
    item
  ) {
    return getValue(item, [
      "partId",
      "part_id",
      "part",
      "partID"
    ]);
  }

  /* =========================================
     Data Loading
  ========================================= */

  async function loadJSON(
    fileName
  ) {
    const response =
      await fetch(
        getDataPath(fileName),
        {
          cache: "no-cache"
        }
      );

    if (!response.ok) {
      throw new Error(
        `Unable to load ${fileName}: ${response.status}`
      );
    }

    return response.json();
  }

  async function loadData(
    force = false
  ) {
    if (
      vehicles.length &&
      compatibility.length &&
      parts.length &&
      !force
    ) {
      return true;
    }

    try {
      const [
        vehicleData,
        compatibilityData,
        partData
      ] = await Promise.all([
        loadJSON(
          "vehicles.json"
        ),
        loadJSON(
          "compatibility.json"
        ),
        loadJSON(
          "oem-parts.json"
        )
      ]);

      vehicles =
        normalizeArray(
          vehicleData,
          [
            "vehicles",
            "items",
            "data"
          ]
        ).filter(
          isActive
        );

      compatibility =
        normalizeArray(
          compatibilityData,
          [
            "compatibility",
            "items",
            "data"
          ]
        ).filter(
          isActive
        );

      parts =
        normalizeArray(
          partData,
          [
            "parts",
            "items",
            "data"
          ]
        ).filter(
          isActive
        );

      return true;

    } catch (error) {
      console.error(
        "Al-Dahayan VIN Search:",
        error
      );

      vehicles = [];
      compatibility = [];
      parts = [];

      return false;
    }
  }

  /* =========================================
     Inventory Integration
  ========================================= */

  function getInventoryService() {
    return (
      window.AlDahayanInventory ||
      null
    );
  }

  function getVerifiedInventory(
    part
  ) {
    const inventoryService =
      getInventoryService();

    if (
      !inventoryService ||
      typeof inventoryService
        .getVerifiedAvailability !==
        "function"
    ) {
      return {
        verified: false,
        status: "unknown",
        quantity: null,
        records: []
      };
    }

    const oem =
      getPartOEM(part);

    if (!oem) {
      return {
        verified: false,
        status: "unknown",
        quantity: null,
        records: []
      };
    }

    try {
      const result =
        inventoryService
          .getVerifiedAvailability({
            oemNumber: oem
          });

      if (!result) {
        return {
          verified: false,
          status: "unknown",
          quantity: null,
          records: []
        };
      }

      return {
        verified:
          result.verified === true,
        status:
          result.status ||
          "unknown",
        quantity:
          result.quantity ??
          null,
        records:
          Array.isArray(
            result.records
          )
            ? result.records
            : []
      };

    } catch (error) {
      console.warn(
        "VIN inventory verification failed:",
        error
      );

      return {
        verified: false,
        status: "unknown",
        quantity: null,
        records: []
      };
    }
  }

  function getStockLabel(
    inventory
  ) {
    if (
      !inventory ||
      inventory.verified !== true
    ) {
      return "AVAILABILITY TO BE CONFIRMED";
    }

    switch (
      normalize(
        inventory.status
      ).toLowerCase()
    ) {
      case "in_stock":
        return "IN STOCK";

      case "low_stock":
        return "LOW STOCK";

      case "out_of_stock":
        return "OUT OF STOCK";

      case "on_request":
        return "ON REQUEST";

      default:
        return "AVAILABILITY TO BE CONFIRMED";
    }
  }

  /* =========================================
     VIN Validation
  ========================================= */

  function validateVIN(vin) {
    const normalized =
      normalize(vin);

    if (!normalized) {
      return {
        valid: false,
        message:
          "Please enter a VIN."
      };
    }

    if (
      normalized.length !== 17
    ) {
      return {
        valid: false,
        message:
          "VIN must contain exactly 17 characters."
      };
    }

    if (
      /[IOQ]/.test(
        normalized
      )
    ) {
      return {
        valid: false,
        message:
          "VIN cannot contain I, O or Q."
      };
    }

    if (
      !/^[A-HJ-NPR-Z0-9]{17}$/.test(
        normalized
      )
    ) {
      return {
        valid: false,
        message:
          "Please enter a valid VIN."
      };
    }

    return {
      valid: true,
      vin: normalized
    };
  }

  /* =========================================
     Exact VIN Matching
  ========================================= */

  function findVehicleByVIN(vin) {
    const normalizedVIN =
      normalize(vin);

    if (!normalizedVIN) {
      return null;
    }

    /*
     * IMPORTANT:
     * Only exact verified VIN matches
     * are accepted.
     *
     * WMI-only matching is intentionally
     * NOT used because it could return
     * the wrong vehicle.
     */

    return (
      vehicles.find(
        (vehicle) =>
          normalize(
            getVehicleVIN(vehicle)
          ) === normalizedVIN
      ) || null
    );
  }

  /* =========================================
     Compatibility Matching
  ========================================= */

  function getCompatiblePartIDs(
    vehicle
  ) {
    if (!vehicle) {
      return [];
    }

    const vehicleID =
      normalize(
        getVehicleID(vehicle)
      );

    if (!vehicleID) {
      return [];
    }

    return compatibility
      .filter(
        (item) =>
          normalize(
            getCompatibilityVehicleID(
              item
            )
          ) === vehicleID
      )
      .map(
        (item) =>
          getCompatibilityPartID(
            item
          )
      )
      .filter(Boolean);
  }

  function getCompatibleParts(
    vehicle
  ) {
    if (!vehicle) {
      return [];
    }

    const partIDs =
      getCompatiblePartIDs(
        vehicle
      );

    /*
     * Only use explicit compatibility
     * relationships.
     *
     * We do not guess compatibility
     * from make/model/year.
     */

    if (!partIDs.length) {
      return [];
    }

    return parts.filter(
      (part) =>
        partIDs.some(
          (id) =>
            normalize(
              getPartID(part)
            ) ===
            normalize(id)
        )
    );
  }

  /* =========================================
     Prepare Parts + Inventory
  ========================================= */

  function prepareCompatibleParts(
    compatibleParts
  ) {
    return compatibleParts.map(
      (part) => {
        const inventory =
          getVerifiedInventory(
            part
          );

        return {
          ...part,

          inventory: {
            verified:
              inventory.verified,
            status:
              inventory.status,
            quantity:
              inventory.quantity
          },

          stockLabel:
            getStockLabel(
              inventory
            )
        };
      }
    );
  }

  /* =========================================
     VIN Search
  ========================================= */

  function searchVIN(vin) {
    const validation =
      validateVIN(vin);

    if (!validation.valid) {
      state.vin =
        normalize(vin);

      state.vehicle = null;
      state.compatibleParts = [];
      state.verified = false;
      state.inventory = [];

      renderVehicle(null);
      renderParts([]);
      renderMessage(
        validation.message,
        "error"
      );

      return {
        success: false,
        verified: false,
        vehicle: null,
        parts: [],
        message:
          validation.message
      };
    }

    const normalizedVIN =
      validation.vin;

    const vehicle =
      findVehicleByVIN(
        normalizedVIN
      );

    state.vin =
      normalizedVIN;

    state.vehicle =
      vehicle;

    if (!vehicle) {
      state.compatibleParts = [];
      state.verified = false;
      state.inventory = [];

      renderVehicle(null);
      renderParts([]);

      renderMessage(
        "This VIN could not be verified in our current vehicle database. Please contact Al-Dahayan for assistance.",
        "warning"
      );

      dispatchVINEvent(
        "alDahayanVINSearchComplete",
        {
          vin:
            normalizedVIN,
          vehicle: null,
          parts: [],
          verified: false
        }
      );

      return {
        success: false,
        verified: false,
        vehicle: null,
        parts: [],
        message:
          "VIN could not be verified."
      };
    }

    const compatibleParts =
      getCompatibleParts(
        vehicle
      );

    const enrichedParts =
      prepareCompatibleParts(
        compatibleParts
      );

    state.compatibleParts =
      enrichedParts;

    state.verified = true;

    state.inventory =
      enrichedParts.map(
        (part) => ({
          partId:
            getPartID(part),
          oem:
            getPartOEM(part),
          inventory:
            part.inventory
        })
      );

    renderVehicle(
      vehicle
    );

    renderParts(
      enrichedParts
    );

    if (
      !enrichedParts.length
    ) {
      renderMessage(
        "Vehicle verified, but no verified compatible parts are currently linked to this vehicle.",
        "warning"
      );
    } else {
      renderMessage(
        "",
        ""
      );
    }

    dispatchVINEvent(
      "alDahayanVINSearchComplete",
      {
        vin:
          normalizedVIN,
        vehicle:
          vehicle,
        parts:
          enrichedParts,
        verified: true
      }
    );

    return {
      success: true,
      verified: true,
      vehicle:
        vehicle,
      parts:
        enrichedParts,
      vin:
        normalizedVIN
    };
  }

  function dispatchVINEvent(
    eventName,
    detail
  ) {
    document.dispatchEvent(
      new CustomEvent(
        eventName,
        {
          detail
        }
      )
    );
  }

  /* =========================================
     Vehicle Rendering
  ========================================= */

  function renderVehicle(
    vehicle
  ) {
    document
      .querySelectorAll(
        "[data-vin-vehicle-result]"
      )
      .forEach(
        (container) => {
          if (!vehicle) {
            container.innerHTML =
              "";
            container.hidden =
              true;
            return;
          }

          const make =
            escapeHTML(
              getVehicleMake(
                vehicle
              )
            );

          const model =
            escapeHTML(
              getVehicleModel(
                vehicle
              )
            );

          const year =
            escapeHTML(
              getVehicleYear(
                vehicle
              )
            );

          const engine =
            escapeHTML(
              getVehicleEngine(
                vehicle
              )
            );

          container.innerHTML = `
            <div class="vehicle-card">

              <div class="vehicle-card-content">

                <div class="vehicle-card-header">
                  <span class="vehicle-card-brand">
                    ${make || "Vehicle"}
                  </span>

                  ${
                    year
                      ? `
                        <span class="vehicle-card-year">
                          ${year}
                        </span>
                      `
                      : ""
                  }
                </div>

                <h3 class="vehicle-card-title">
                  ${model || "Verified Vehicle"}
                </h3>

                ${
                  engine
                    ? `
                      <p class="vehicle-card-engine">
                        <strong>Engine:</strong>
                        ${engine}
                      </p>
                    `
                    : ""
                }

                <p class="vin-verified-status">
                  VIN Verified
                </p>

              </div>

            </div>
          `;

          container.hidden =
            false;
        }
      );
  }

  /* =========================================
     Parts Rendering
  ========================================= */

  function renderParts(
    compatibleParts
  ) {
    document
      .querySelectorAll(
        "[data-vin-parts-results]"
      )
      .forEach(
        (container) => {
          if (
            !compatibleParts.length
          ) {
            container.innerHTML = `
              <div class="search-empty">

                <h3>
                  No compatible parts found
                </h3>

                <p>
                  Please contact Al-Dahayan
                  for assistance.
                </p>

              </div>
            `;

            return;
          }

          container.innerHTML =
            compatibleParts
              .map(
                (part) => {
                  const id =
                    escapeHTML(
                      getPartID(
                        part
                      )
                    );

                  const oem =
                    escapeHTML(
                      getPartOEM(
                        part
                      )
                    );

                  const name =
                    escapeHTML(
                      getPartName(
                        part
                      )
                    );

                  const stockLabel =
                    escapeHTML(
                      part.stockLabel ||
                        "AVAILABILITY TO BE CONFIRMED"
                    );

                  const inventoryStatus =
                    normalize(
                      part
                        .inventory
                        ?.status ||
                        "unknown"
                    )
                      .toLowerCase()
                      .replace(
                        /[^a-z0-9_-]/g,
                        ""
                      );

                  const showQuantity =
                    CONFIG &&
                    typeof CONFIG.getEffectiveAppConfig ===
                      "function"
                      ? CONFIG
                          .getEffectiveAppConfig()
                          ?.inventory
                          ?.quantityDisplay ===
                        true
                      : false;

                  const quantity =
                    part
                      .inventory
                      ?.quantity;

                  return `
                    <article
                      class="part-card"
                      data-part-id="${id}"
                    >

                      <div
                        class="part-card-content"
                      >

                        <span
                          class="part-card-oem"
                        >
                          ${
                            oem || "—"
                          }
                        </span>

                        <h3
                          class="part-card-title"
                        >
                          ${
                            name ||
                            "Spare Part"
                          }
                        </h3>

                        <div
                          class="stock-badge stock-${escapeHTML(
                            inventoryStatus
                          )}"
                        >
                          ${stockLabel}
                        </div>

                        ${
                          showQuantity &&
                          part.inventory
                            ?.verified ===
                            true &&
                          quantity !== null
                            ? `
                              <p class="part-card-stock-quantity">
                                Quantity:
                                ${escapeHTML(
                                  quantity
                                )}
                              </p>
                            `
                            : ""
                        }

                        <div
                          class="part-card-actions"
                        >

                          <button
                            type="button"
                            class="button primary"
                            data-vin-inquire-part="${id}"
                          >
                            Inquiry
                          </button>

                        </div>

                      </div>

                    </article>
                  `;
                }
              )
              .join("");
        }
      );

    document
      .querySelectorAll(
        "[data-vin-result-summary]"
      )
      .forEach(
        (element) => {
          element.textContent =
            `${compatibleParts.length} compatible part${
              compatibleParts.length ===
              1
                ? ""
                : "s"
            }`;
        }
      );
  }

  /* =========================================
     Status Message
  ========================================= */

  function renderMessage(
    message,
    type
  ) {
    document
      .querySelectorAll(
        "[data-vin-status]"
      )
      .forEach(
        (element) => {
          element.textContent =
            message || "";

          element.className =
            `vin-status ${
              type
                ? `is-${type}`
                : ""
            }`;

          element.hidden =
            !message;
        }
      );
  }

  /* =========================================
     Form
  ========================================= */

  function getVINInput() {
    return document.querySelector(
      "[data-vin-input]"
    );
  }

  function getVINForm() {
    return document.querySelector(
      "[data-vin-search-form]"
    );
  }

  function initializeForm() {
    const form =
      getVINForm();

    const input =
      getVINInput();

    if (input) {
      input.addEventListener(
        "input",
        () => {
          input.value =
            normalize(
              input.value
            ).substring(0, 17);
        }
      );
    }

    if (form) {
      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          searchVIN(
            input
              ? input.value
              : ""
          );
        }
      );
    }
  }

  /* =========================================
     Reset
  ========================================= */

  function reset() {
    state.vin = "";
    state.vehicle = null;
    state.compatibleParts = [];
    state.verified = false;
    state.inventory = [];

    const form =
      getVINForm();

    if (form) {
      form.reset();
    }

    renderVehicle(null);
    renderParts([]);
    renderMessage(
      "",
      ""
    );

    return {
      success: true
    };
  }

  /* =========================================
     Part Inquiry
  ========================================= */

  function handlePartInquiry(
    part
  ) {
    if (!part) {
      return;
    }

    const detail = {
      part,
      vin:
        state.vin,
      vehicle:
        state.vehicle,
      inventory:
        part.inventory ||
        null,
      verified:
        state.verified
    };

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanPartInquiry",
        {
          detail
        }
      )
    );
  }

  /* =========================================
     Events
  ========================================= */

  function initializeEvents() {
    if (eventsBound) {
      return;
    }

    document.addEventListener(
      "click",
      (event) => {
        const resetButton =
          event.target.closest(
            "[data-vin-reset]"
          );

        if (resetButton) {
          event.preventDefault();
          reset();
          return;
        }

        const inquiryButton =
          event.target.closest(
            "[data-vin-inquire-part]"
          );

        if (!inquiryButton) {
          return;
        }

        const id =
          inquiryButton.getAttribute(
            "data-vin-inquire-part"
          );

        const part =
          state.compatibleParts.find(
            (item) =>
              normalize(
                getPartID(item)
              ) ===
              normalize(id)
          );

        handlePartInquiry(
          part
        );
      }
    );

    document.addEventListener(
      "alDahayanVehiclesUpdated",
      async () => {
        await reloadData();
      }
    );

    document.addEventListener(
      "alDahayanInventoryReady",
      () => {
        if (state.vehicle) {
          searchVIN(
            state.vin
          );
        }
      }
    );

    document.addEventListener(
      "alDahayanConfigUpdated",
      () => {
        if (state.vehicle) {
          renderParts(
            state.compatibleParts
          );
        }
      }
    );

    eventsBound = true;
  }

  /* =========================================
     Reload
  ========================================= */

  async function reloadData() {
    const success =
      await loadData(true);

    if (
      success &&
      state.vin
    ) {
      searchVIN(
        state.vin
      );
    }

    return success;
  }

  /* =========================================
     Initialize
  ========================================= */

  async function initializeVINSearch() {
    if (initialized) {
      return true;
    }

    const success =
      await loadData();

    initializeForm();
    initializeEvents();

    initialized = true;

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanVINSearchReady",
        {
          detail: {
            vehicles:
              vehicles.length,
            compatibility:
              compatibility.length,
            parts:
              parts.length,
            dataLoaded:
              success
          }
        }
      )
    );

    return success;
  }

  /* =========================================
     Public API
  ========================================= */

  window.AlDahayanVINSearch = {

    init:
      initializeVINSearch,

    initialize:
      initializeVINSearch,

    load:
      loadData,

    reload:
      reloadData,

    search:
      searchVIN,

    validate:
      validateVIN,

    reset:
      reset,

    findVehicle:
      findVehicleByVIN,

    getCompatibleParts:
      getCompatibleParts,

    getVerifiedInventory:
      getVerifiedInventory,

    getState:
      () => ({
        vin:
          state.vin,

        vehicle:
          state.vehicle,

        compatibleParts:
          [
            ...state.compatibleParts
          ],

        verified:
          state.verified,

        inventory:
          [
            ...state.inventory
          ]
      }),

    isInitialized:
      () => initialized
  };

  window.initializeVINSearch =
    initializeVINSearch;

  /* =========================================
     DOM Ready
  ========================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeVINSearch,
      {
        once: true
      }
    );
  } else {
    initializeVINSearch();
  }

})();
