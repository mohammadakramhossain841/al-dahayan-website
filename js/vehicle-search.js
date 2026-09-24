(function () {
  "use strict";

  let vehiclesData = [];
  let isLoaded = false;

  async function initializeVehicleSearch() {
    await loadVehiclesData();
    setupVehicleSearchInterface();
  }

  async function loadVehiclesData() {
    try {
      const filePath = getDataPath(
        APP_CONFIG.dataFiles.vehicles
      );

      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(
          `Failed to load vehicles data: ${response.status}`
        );
      }

      const data = await response.json();

      vehiclesData = normalizeVehicleData(data);
      isLoaded = true;

      return vehiclesData;
    } catch (error) {
      console.error(
        "Al-Dahayan Vehicle Search: Unable to load vehicle data.",
        error
      );

      vehiclesData = [];
      isLoaded = false;

      return [];
    }
  }

  function normalizeVehicleData(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.vehicles)) {
      return data.vehicles;
    }

    if (Array.isArray(data?.models)) {
      return data.models;
    }

    return [];
  }

  function setupVehicleSearchInterface() {
    setupVehicleForm();
    setupVehicleFilters();
  }

  function setupVehicleForm() {
    const forms = document.querySelectorAll(
      "[data-vehicle-search-form], #vehicleSearchForm, .vehicle-search-form"
    );

    forms.forEach((form) => {
      if (form.dataset.vehicleInitialized === "true") {
        return;
      }

      form.dataset.vehicleInitialized = "true";

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const filters = getFiltersFromForm(form);

        performVehicleSearch(filters);
      });
    });
  }

  function setupVehicleFilters() {
    const makeSelects = document.querySelectorAll(
      "[data-vehicle-make], #vehicleMake"
    );

    makeSelects.forEach((select) => {
      populateSelect(
        select,
        getMakes(),
        "Select Make"
      );

      select.addEventListener("change", () => {
        updateModelSelect(select);
      });
    });

    const modelSelects = document.querySelectorAll(
      "[data-vehicle-model], #vehicleModel"
    );

    modelSelects.forEach((select) => {
      select.addEventListener("change", () => {
        updateYearSelect(select);
      });
    });

    const yearSelects = document.querySelectorAll(
      "[data-vehicle-year], #vehicleYear"
    );

    yearSelects.forEach((select) => {
      select.addEventListener("change", () => {
        updateEngineSelect(select);
      });
    });
  }

  function getFiltersFromForm(form) {
    return {
      make: getFieldValue(
        form,
        "make",
        "vehicleMake"
      ),

      model: getFieldValue(
        form,
        "model",
        "vehicleModel"
      ),

      year: getFieldValue(
        form,
        "year",
        "vehicleYear"
      ),

      engine: getFieldValue(
        form,
        "engine",
        "vehicleEngine"
      ),

      query: getFieldValue(
        form,
        "query",
        "vehicleSearch"
      )
    };
  }

  function getFieldValue(
    form,
    name,
    id
  ) {
    const element =
      form.querySelector(`[name="${name}"]`) ||
      form.querySelector(`#${id}`);

    return element
      ? String(element.value || "").trim()
      : "";
  }

  function performVehicleSearch(filters = {}) {
    const results =
      filterVehicles(filters);

    displayVehicleResults(results);

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanVehicleSearchCompleted",
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

  function filterVehicles(filters = {}) {
    if (!isLoaded) {
      return [];
    }

    const make =
      normalizeText(filters.make);

    const model =
      normalizeText(filters.model);

    const year =
      String(filters.year || "").trim();

    const engine =
      normalizeText(filters.engine);

    const query =
      normalizeText(filters.query);

    return vehiclesData.filter((vehicle) => {
      const vehicleMake =
        normalizeText(
          vehicle.make ||
          vehicle.brand ||
          vehicle.manufacturer
        );

      const vehicleModel =
        normalizeText(
          vehicle.model ||
          vehicle.modelName
        );

      const vehicleYear =
        String(
          vehicle.year ||
          vehicle.modelYear ||
          ""
        ).trim();

      const vehicleEngine =
        normalizeText(
          vehicle.engine ||
          vehicle.engineType ||
          vehicle.engineCode
        );

      const searchableText = normalizeText(
        [
          vehicleMake,
          vehicleModel,
          vehicleYear,
          vehicleEngine,
          vehicle.name,
          vehicle.vehicleName
        ]
          .filter(Boolean)
          .join(" ")
      );

      return (
        (!make || vehicleMake === make) &&
        (!model || vehicleModel === model) &&
        (!year || vehicleYear === year) &&
        (!engine || vehicleEngine === engine) &&
        (!query ||
          searchableText.includes(query))
      );
    });
  }

  function getMakes() {
    return getUniqueValues(
      vehiclesData.map(
        (vehicle) =>
          vehicle.make ||
          vehicle.brand ||
          vehicle.manufacturer
      )
    );
  }

  function getModels(make = "") {
    const normalizedMake =
      normalizeText(make);

    const filtered =
      normalizedMake
        ? vehiclesData.filter((vehicle) => {
            const vehicleMake =
              normalizeText(
                vehicle.make ||
                vehicle.brand ||
                vehicle.manufacturer
              );

            return vehicleMake === normalizedMake;
          })
        : vehiclesData;

    return getUniqueValues(
      filtered.map(
        (vehicle) =>
          vehicle.model ||
          vehicle.modelName
      )
    );
  }

  function getYears(
    make = "",
    model = ""
  ) {
    const normalizedMake =
      normalizeText(make);

    const normalizedModel =
      normalizeText(model);

    const filtered =
      vehiclesData.filter((vehicle) => {
        const vehicleMake =
          normalizeText(
            vehicle.make ||
            vehicle.brand ||
            vehicle.manufacturer
          );

        const vehicleModel =
          normalizeText(
            vehicle.model ||
            vehicle.modelName
          );

        return (
          (!normalizedMake ||
            vehicleMake === normalizedMake) &&
          (!normalizedModel ||
            vehicleModel === normalizedModel)
        );
      });

    return getUniqueValues(
      filtered.map(
        (vehicle) =>
          vehicle.year ||
          vehicle.modelYear
      )
    ).sort(
      (a, b) =>
        Number(b) - Number(a)
    );
  }

  function getEngines(
    make = "",
    model = "",
    year = ""
  ) {
    const normalizedMake =
      normalizeText(make);

    const normalizedModel =
      normalizeText(model);

    const normalizedYear =
      String(year || "").trim();

    const filtered =
      vehiclesData.filter((vehicle) => {
        const vehicleMake =
          normalizeText(
            vehicle.make ||
            vehicle.brand ||
            vehicle.manufacturer
          );

        const vehicleModel =
          normalizeText(
            vehicle.model ||
            vehicle.modelName
          );

        const vehicleYear =
          String(
            vehicle.year ||
            vehicle.modelYear ||
            ""
          ).trim();

        return (
          (!normalizedMake ||
            vehicleMake === normalizedMake) &&
          (!normalizedModel ||
            vehicleModel === normalizedModel) &&
          (!normalizedYear ||
            vehicleYear === normalizedYear)
        );
      });

    return getUniqueValues(
      filtered.map(
        (vehicle) =>
          vehicle.engine ||
          vehicle.engineType ||
          vehicle.engineCode
      )
    );
  }

  function getVehicleById(id) {
    if (!id) {
      return null;
    }

    return (
      vehiclesData.find(
        (vehicle) =>
          String(vehicle.id) ===
          String(id)
      ) || null
    );
  }

  function getVehicleByDetails(
    make,
    model,
    year,
    engine = ""
  ) {
    const normalizedMake =
      normalizeText(make);

    const normalizedModel =
      normalizeText(model);

    const normalizedYear =
      String(year || "").trim();

    const normalizedEngine =
      normalizeText(engine);

    return (
      vehiclesData.find((vehicle) => {
        const vehicleMake =
          normalizeText(
            vehicle.make ||
            vehicle.brand ||
            vehicle.manufacturer
          );

        const vehicleModel =
          normalizeText(
            vehicle.model ||
            vehicle.modelName
          );

        const vehicleYear =
          String(
            vehicle.year ||
            vehicle.modelYear ||
            ""
          ).trim();

        const vehicleEngine =
          normalizeText(
            vehicle.engine ||
            vehicle.engineType ||
            vehicle.engineCode
          );

        return (
          vehicleMake === normalizedMake &&
          vehicleModel === normalizedModel &&
          vehicleYear === normalizedYear &&
          (!normalizedEngine ||
            vehicleEngine === normalizedEngine)
        );
      }) || null
    );
  }

  function updateModelSelect(makeSelect) {
    const form =
      makeSelect.closest("form") ||
      document;

    const modelSelect =
      form.querySelector(
        "[data-vehicle-model], #vehicleModel"
      );

    if (!modelSelect) {
      return;
    }

    populateSelect(
      modelSelect,
      getModels(makeSelect.value),
      "Select Model"
    );

    const yearSelect =
      form.querySelector(
        "[data-vehicle-year], #vehicleYear"
      );

    const engineSelect =
      form.querySelector(
        "[data-vehicle-engine], #vehicleEngine"
      );

    resetSelect(yearSelect, "Select Year");
    resetSelect(
      engineSelect,
      "Select Engine"
    );
  }

  function updateYearSelect(modelSelect) {
    const form =
      modelSelect.closest("form") ||
      document;

    const makeSelect =
      form.querySelector(
        "[data-vehicle-make], #vehicleMake"
      );

    const yearSelect =
      form.querySelector(
        "[data-vehicle-year], #vehicleYear"
      );

    if (!yearSelect) {
      return;
    }

    populateSelect(
      yearSelect,
      getYears(
        makeSelect?.value || "",
        modelSelect.value
      ),
      "Select Year"
    );

    const engineSelect =
      form.querySelector(
        "[data-vehicle-engine], #vehicleEngine"
      );

    resetSelect(
      engineSelect,
      "Select Engine"
    );
  }

  function updateEngineSelect(yearSelect) {
    const form =
      yearSelect.closest("form") ||
      document;

    const makeSelect =
      form.querySelector(
        "[data-vehicle-make], #vehicleMake"
      );

    const modelSelect =
      form.querySelector(
        "[data-vehicle-model], #vehicleModel"
      );

    const engineSelect =
      form.querySelector(
        "[data-vehicle-engine], #vehicleEngine"
      );

    if (!engineSelect) {
      return;
    }

    populateSelect(
      engineSelect,
      getEngines(
        makeSelect?.value || "",
        modelSelect?.value || "",
        yearSelect.value
      ),
      "Select Engine"
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

    const placeholderOption =
      document.createElement("option");

    placeholderOption.value = "";
    placeholderOption.textContent =
      getCurrentLanguage() === "ar"
        ? getArabicPlaceholder(
            placeholder
          )
        : placeholder;

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
  }

  function resetSelect(
    select,
    placeholder
  ) {
    if (!select) {
      return;
    }

    populateSelect(
      select,
      [],
      placeholder
    );
  }

  function displayVehicleResults(
    results
  ) {
    const container =
      document.querySelector(
        "[data-vehicle-results], #vehicleResults, .vehicle-results"
      );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!results.length) {
      const empty =
        document.createElement("div");

      empty.className =
        "vehicle-search-empty";

      empty.textContent =
        getCurrentLanguage() === "ar"
          ? "لم يتم العثور على مركبات مطابقة."
          : "No matching vehicles found.";

      container.appendChild(empty);

      return;
    }

    results.forEach((vehicle) => {
      container.appendChild(
        createVehicleCard(vehicle)
      );
    });
  }

  function createVehicleCard(
    vehicle
  ) {
    const card =
      document.createElement("article");

    card.className =
      "vehicle-search-result";

    const make =
      vehicle.make ||
      vehicle.brand ||
      vehicle.manufacturer ||
      "";

    const model =
      vehicle.model ||
      vehicle.modelName ||
      "";

    const year =
      vehicle.year ||
      vehicle.modelYear ||
      "";

    const engine =
      vehicle.engine ||
      vehicle.engineType ||
      vehicle.engineCode ||
      "";

    card.innerHTML = `
      <div class="vehicle-result-content">

        <h3>
          ${escapeHTML(
            `${make} ${model}`.trim()
          )}
        </h3>

        ${
          year
            ? `<p>
                <strong>Year:</strong>
                ${escapeHTML(year)}
              </p>`
            : ""
        }

        ${
          engine
            ? `<p>
                <strong>Engine:</strong>
                ${escapeHTML(engine)}
              </p>`
            : ""
        }

        <button
          type="button"
          class="vehicle-select-button"
          data-vehicle-id="${escapeHTML(
            vehicle.id || ""
          )}"
        >
          ${
            getCurrentLanguage() === "ar"
              ? "اختيار المركبة"
              : "Select Vehicle"
          }
        </button>

      </div>
    `;

    const button =
      card.querySelector(
        "[data-vehicle-id]"
      );

    if (button) {
      button.addEventListener(
        "click",
        () => {
          selectVehicle(vehicle);
        }
      );
    }

    return card;
  }

  function selectVehicle(
    vehicle
  ) {
    document.dispatchEvent(
      new CustomEvent(
        "alDahayanVehicleSelected",
        {
          detail: {
            vehicle
          }
        }
      )
    );

    if (
      typeof window
        .AlDahayanVehicleSearch
        ?.onVehicleSelected ===
      "function"
    ) {
      window.AlDahayanVehicleSearch.onVehicleSelected(
        vehicle
      );
    }
  }

  function getUniqueValues(
    values
  ) {
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

  function normalizeText(
    value
  ) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function getArabicPlaceholder(
    placeholder
  ) {
    const translations = {
      "Select Make": "اختر الشركة",
      "Select Model": "اختر الموديل",
      "Select Year": "اختر السنة",
      "Select Engine": "اختر المحرك"
    };

    return (
      translations[placeholder] ||
      placeholder
    );
  }

  function getCurrentLanguage() {
    return (
      document.documentElement.getAttribute(
        "lang"
      ) ||
      APP_CONFIG?.site?.defaultLanguage ||
      "en"
    );
  }

  function escapeHTML(value) {
    if (
      typeof window
        .AlDahayanUtils
        ?.escapeHTML === "function"
    ) {
      return window.AlDahayanUtils.escapeHTML(
        value
      );
    }

    const div =
      document.createElement("div");

    div.textContent =
      String(value ?? "");

    return div.innerHTML;
  }

  window.AlDahayanVehicleSearch = {
    initialize:
      initializeVehicleSearch,

    loadVehiclesData,

    performVehicleSearch,

    filterVehicles,

    getMakes,

    getModels,

    getYears,

    getEngines,

    getVehicleById,

    getVehicleByDetails,

    getAllVehicles: () => [
      ...vehiclesData
    ],

    isLoaded: () => isLoaded
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeVehicleSearch
    );
  } else {
    initializeVehicleSearch();
  }
})();
