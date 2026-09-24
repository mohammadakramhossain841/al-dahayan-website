/* =========================================
   AL-DAHAYAN VIN SEARCH
========================================= */

(function () {
  "use strict";

  let initialized = false;

  let vehicles = [];
  let compatibility = [];
  let parts = [];

  const state = {
    vin: "",
    vehicle: null,
    compatibleParts: []
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

  function getVehicleID(vehicle) {
    return getValue(vehicle, [
      "id",
      "vehicleId",
      "vehicle_id"
    ]);
  }

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
      "engine_type"
    ]);
  }

  /* =========================================
     Data Loading
  ========================================= */

  async function loadJSON(fileName) {
    if (
      typeof window.getDataPath !==
      "function"
    ) {
      throw new Error(
        "getDataPath() is unavailable."
      );
    }

    const path =
      window.getDataPath(fileName);

    const response =
      await fetch(path);

    if (!response.ok) {
      throw new Error(
        `Unable to load ${fileName}: ${response.status}`
      );
    }

    return response.json();
  }

  function normalizeArray(data, keys = []) {
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

  async function loadData() {
    try {
      const [
        vehicleData,
        compatibilityData,
        partData
      ] = await Promise.all([
        loadJSON("vehicles.json"),
        loadJSON("compatibility.json"),
        loadJSON("oem-parts.json")
      ]);

      vehicles = normalizeArray(
        vehicleData,
        [
          "vehicles",
          "items",
          "data"
        ]
      );

      compatibility =
        normalizeArray(
          compatibilityData,
          [
            "compatibility",
            "items",
            "data"
          ]
        );

      parts = normalizeArray(
        partData,
        [
          "parts",
          "items",
          "data"
        ]
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

    if (normalized.length !== 17) {
      return {
        valid: false,
        message:
          "VIN must contain exactly 17 characters."
      };
    }

    if (
      /[IOQ]/.test(normalized)
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
     Vehicle Matching
  ========================================= */

  function findVehicleByVIN(vin) {
    const normalizedVIN =
      normalize(vin);

    if (!normalizedVIN) {
      return null;
    }

    const exact =
      vehicles.find(
        (vehicle) =>
          normalize(
            getVehicleVIN(vehicle)
          ) === normalizedVIN
      );

    if (exact) {
      return exact;
    }

    /*
      Foundation-level VIN matching.

      If a full VIN decoder/API is added later,
      this function can be replaced without
      changing the public API.
    */

    const wmi =
      normalizedVIN.substring(0, 3);

    const wmiMatch =
      vehicles.find((vehicle) => {
        const vehicleVIN =
          normalize(
            getVehicleVIN(vehicle)
          );

        return (
          vehicleVIN &&
          vehicleVIN.substring(0, 3) ===
            wmi
        );
      });

    return wmiMatch || null;
  }

  /* =========================================
     Compatibility Matching
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

    const matches =
      compatibility.filter(
        (item) => {

          const itemVehicleID =
            normalize(
              getCompatibilityVehicleID(
                item
              )
            );

          return (
            itemVehicleID &&
            itemVehicleID ===
              vehicleID
          );
        }
      );

    return matches
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

    if (partIDs.length) {
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

    /*
      Fallback compatibility matching
      by make / model / year.
    */

    const make =
      normalize(
        getVehicleMake(vehicle)
      );

    const model =
      normalize(
        getVehicleModel(vehicle)
      );

    const year =
      String(
        getVehicleYear(vehicle)
      );

    return parts.filter(
      (part) => {

        const partMake =
          normalize(
            getValue(part, [
              "brand",
              "make",
              "manufacturer"
            ])
          );

        const partModel =
          normalize(
            getValue(part, [
              "model",
              "vehicleModel",
              "vehicle_model"
            ])
          );

        const partYear =
          String(
            getValue(part, [
              "year",
              "modelYear",
              "model_year"
            ])
          );

        const makeMatch =
          !make ||
          !partMake ||
          partMake === make;

        const modelMatch =
          !model ||
          !partModel ||
          partModel === model;

        const yearMatch =
          !year ||
          !partYear ||
          partYear === year;

        return (
          makeMatch &&
          modelMatch &&
          yearMatch
        );
      }
    );
  }

  /* =========================================
     Search VIN
  ========================================= */

  function searchVIN(vin) {
    const validation =
      validateVIN(vin);

    if (!validation.valid) {
      state.vin =
        normalize(vin);

      state.vehicle = null;
      state.compatibleParts = [];

      renderMessage(
        validation.message,
        "error"
      );

      return {
        success: false,
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

      renderVehicle(
        null
      );

      renderParts([]);

      renderMessage(
        "No vehicle was found for this VIN.",
        "warning"
      );

      return {
        success: false,
        vehicle: null,
        parts: [],
        message:
          "No vehicle found."
      };
    }

    const compatibleParts =
      getCompatibleParts(
        vehicle
      );

    state.compatibleParts =
      compatibleParts;

    renderVehicle(
      vehicle
    );

    renderParts(
      compatibleParts
    );

    renderMessage(
      "",
      ""
    );

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanVINSearchComplete",
        {
          detail: {
            vin:
              normalizedVIN,
            vehicle:
              vehicle,
            parts:
              compatibleParts
          }
        }
      )
    );

    return {
      success: true,
      vehicle: vehicle,
      parts: compatibleParts,
      vin: normalizedVIN
    };
  }

  /* =========================================
     Rendering
  ========================================= */

  function escapeHTML(value) {
    if (
      window.AlDahayanUtils &&
      typeof window.AlDahayanUtils
        .escapeHTML === "function"
    ) {
      return window.AlDahayanUtils
        .escapeHTML(value);
    }

    return String(value ?? "")
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  function renderVehicle(
    vehicle
  ) {
    document
      .querySelectorAll(
        "[data-vin-vehicle-result]"
      )
      .forEach((container) => {

        if (!vehicle) {
          container.innerHTML = "";
          container.hidden = true;
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

              <h3>
                ${make || "Vehicle"}
                ${model || ""}
              </h3>

              ${
                year
                  ? `
                    <p>
                      <strong>Year:</strong>
                      ${year}
                    </p>
                  `
                  : ""
              }

              ${
                engine
                  ? `
                    <p>
                      <strong>Engine:</strong>
                      ${engine}
                    </p>
                  `
                  : ""
              }

            </div>

          </div>
        `;

        container.hidden = false;
      });
  }

  function renderParts(
    compatibleParts
  ) {
    document
      .querySelectorAll(
        "[data-vin-parts-results]"
      )
      .forEach((container) => {

        if (
          !compatibleParts.length
        ) {
          container.innerHTML = `
            <div class="search-empty">
              <h3>
                No compatible parts found.
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
                    getValue(
                      part,
                      [
                        "name",
                        "partName",
                        "part_name",
                        "title"
                      ]
                    )
                  );

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
      });

    document
      .querySelectorAll(
        "[data-vin-result-summary]"
      )
      .forEach((element) => {
        element.textContent =
          `${compatibleParts.length} compatible part${
            compatibleParts.length === 1
              ? ""
              : "s"
          }`;
      });
  }

  function renderMessage(
    message,
    type
  ) {
    document
      .querySelectorAll(
        "[data-vin-status]"
      )
      .forEach((element) => {

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
      });
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

          const vin =
            input
              ? input.value
              : "";

          searchVIN(vin);
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

    const form =
      getVINForm();

    if (form) {
      form.reset();
    }

    renderVehicle(null);
    renderParts([]);
    renderMessage("", "");

    return {
      success: true
    };
  }

  /* =========================================
     Dynamic Events
  ========================================= */

  function initializeEvents() {
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

        if (inquiryButton) {
          const id =
            inquiryButton.getAttribute(
              "data-vin-inquire-part"
            );

          const part =
            parts.find(
              (item) =>
                normalize(
                  getPartID(item)
                ) ===
                normalize(id)
            );

          if (part) {
            document.dispatchEvent(
              new CustomEvent(
                "alDahayanPartInquiry",
                {
                  detail: {
                    part: part,
                    vin: state.vin,
                    vehicle:
                      state.vehicle
                  }
                }
              )
            );
          }
        }
      }
    );
  }

  /* =========================================
     Initialize
  ========================================= */

  async function initializeVINSearch() {
    if (initialized) {
      return;
    }

    initialized = true;

    await loadData();

    initializeForm();

    initializeEvents();

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
              parts.length
          }
        }
      )
    );
  }

  /* =========================================
     Public API
  ========================================= */

  window.AlDahayanVINSearch = {

    initialize:
      initializeVINSearch,

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

    getState:
      () => ({
        vin: state.vin,
        vehicle:
          state.vehicle,
        compatibleParts:
          [
            ...state.compatibleParts
          ]
      })
  };

  window.initializeVINSearch =
    initializeVINSearch;

  /* =========================================
     DOM Ready
  ========================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      initializeVINSearch();
    }
  );

})();
