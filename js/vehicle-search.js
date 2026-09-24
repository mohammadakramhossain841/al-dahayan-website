/* =========================================
   AL-DAHAYAN VEHICLE SEARCH
========================================= */

(function () {
  "use strict";

  let initialized = false;
  let vehicles = [];
  let filteredVehicles = [];

  const state = {
    make: "",
    model: "",
    year: "",
    engine: "",
    query: ""
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

  function getVehicleId(vehicle) {
    return (
      vehicle.id ||
      vehicle.vehicleId ||
      vehicle.vehicle_id ||
      ""
    );
  }

  function getMake(vehicle) {
    return (
      vehicle.make ||
      vehicle.brand ||
      vehicle.manufacturer ||
      ""
    );
  }

  function getModel(vehicle) {
    return (
      vehicle.model ||
      vehicle.modelName ||
      ""
    );
  }

  function getYear(vehicle) {
    return (
      vehicle.year ||
      vehicle.modelYear ||
      vehicle.model_year ||
      ""
    );
  }

  function getEngine(vehicle) {
    return (
      vehicle.engine ||
      vehicle.engineType ||
      vehicle.engine_name ||
      ""
    );
  }

  function getDisplayName(vehicle) {
    const make = getMake(vehicle);
    const model = getModel(vehicle);
    const year = getYear(vehicle);

    return [make, model, year]
      .filter(Boolean)
      .join(" ");
  }

  function uniqueSorted(values) {
    return [
      ...new Set(
        values
          .filter(Boolean)
          .map((value) => String(value).trim())
      )
    ].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );
  }

  async function loadVehicles() {
    if (vehicles.length) {
      return vehicles;
    }

    if (typeof window.getDataPath !== "function") {
      throw new Error("getDataPath() is not available.");
    }

    const response = await fetch(
      window.getDataPath("vehicles.json"),
      {
        cache: "no-cache"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load vehicles.json: ${response.status}`
      );
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      vehicles = data;
    } else if (Array.isArray(data.vehicles)) {
      vehicles = data.vehicles;
    } else if (Array.isArray(data.data)) {
      vehicles = data.data;
    } else {
      vehicles = [];
    }

    filteredVehicles = [...vehicles];

    return vehicles;
  }

  function getElements() {
    return {
      form: document.querySelector(
        "[data-vehicle-search-form]"
      ),

      make: document.querySelector(
        "[data-vehicle-make]"
      ),

      model: document.querySelector(
        "[data-vehicle-model]"
      ),

      year: document.querySelector(
        "[data-vehicle-year]"
      ),

      engine: document.querySelector(
        "[data-vehicle-engine]"
      ),

      query: document.querySelector(
        "[data-vehicle-query]"
      ),

      reset: document.querySelector(
        "[data-vehicle-reset]"
      ),

      summary: document.querySelector(
        "[data-vehicle-result-summary]"
      ),

      results: document.querySelector(
        "[data-vehicle-results]"
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

    const currentValue = select.value;

    select.innerHTML = "";

    const placeholderOption =
      document.createElement("option");

    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;

    select.appendChild(placeholderOption);

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
      select.value = currentValue;
    }
  }

  function updateMakeOptions() {
    const elements = getElements();

    const makes = uniqueSorted(
      vehicles.map(getMake)
    );

    setSelectOptions(
      elements.make,
      makes,
      "All Makes"
    );
  }

  function updateModelOptions() {
    const elements = getElements();

    let source = vehicles;

    if (state.make) {
      source = source.filter(
        (vehicle) =>
          normalize(getMake(vehicle)) ===
          normalize(state.make)
      );
    }

    const models = uniqueSorted(
      source.map(getModel)
    );

    setSelectOptions(
      elements.model,
      models,
      "All Models"
    );
  }

  function updateYearOptions() {
    const elements = getElements();

    let source = vehicles;

    if (state.make) {
      source = source.filter(
        (vehicle) =>
          normalize(getMake(vehicle)) ===
          normalize(state.make)
      );
    }

    if (state.model) {
      source = source.filter(
        (vehicle) =>
          normalize(getModel(vehicle)) ===
          normalize(state.model)
      );
    }

    const years = uniqueSorted(
      source.map(getYear)
    );

    setSelectOptions(
      elements.year,
      years,
      "All Years"
    );
  }

  function updateEngineOptions() {
    const elements = getElements();

    let source = vehicles;

    if (state.make) {
      source = source.filter(
        (vehicle) =>
          normalize(getMake(vehicle)) ===
          normalize(state.make)
      );
    }

    if (state.model) {
      source = source.filter(
        (vehicle) =>
          normalize(getModel(vehicle)) ===
          normalize(state.model)
      );
    }

    if (state.year) {
      source = source.filter(
        (vehicle) =>
          normalize(getYear(vehicle)) ===
          normalize(state.year)
      );
    }

    const engines = uniqueSorted(
      source.map(getEngine)
    );

    setSelectOptions(
      elements.engine,
      engines,
      "All Engines"
    );
  }

  function updateDependentFilters() {
    updateModelOptions();
    updateYearOptions();
    updateEngineOptions();
  }

  function applyFilters() {
    const query = normalize(state.query);

    filteredVehicles =
      vehicles.filter((vehicle) => {
        const make = normalize(
          getMake(vehicle)
        );

        const model = normalize(
          getModel(vehicle)
        );

        const year = normalize(
          getYear(vehicle)
        );

        const engine = normalize(
          getEngine(vehicle)
        );

        const matchesMake =
          !state.make ||
          make === normalize(state.make);

        const matchesModel =
          !state.model ||
          model === normalize(state.model);

        const matchesYear =
          !state.year ||
          year === normalize(state.year);

        const matchesEngine =
          !state.engine ||
          engine === normalize(state.engine);

        const searchableText = [
          make,
          model,
          year,
          engine,
          normalize(
            vehicle.name
          ),
          normalize(
            vehicle.fullName
          ),
          normalize(
            vehicle.description
          )
        ].join(" ");

        const matchesQuery =
          !query ||
          searchableText.includes(query);

        return (
          matchesMake &&
          matchesModel &&
          matchesYear &&
          matchesEngine &&
          matchesQuery
        );
      });

    renderResults();
  }

  function renderSummary() {
    const elements = getElements();

    if (!elements.summary) {
      return;
    }

    const count =
      filteredVehicles.length;

    elements.summary.textContent =
      `${count} vehicle${count === 1 ? "" : "s"} found`;
  }

  function renderVehicleCard(vehicle) {
    const id = getVehicleId(vehicle);
    const make = getMake(vehicle);
    const model = getModel(vehicle);
    const year = getYear(vehicle);
    const engine = getEngine(vehicle);

    const image =
      vehicle.image ||
      vehicle.imageUrl ||
      vehicle.image_url ||
      "";

    const description =
      vehicle.description ||
      vehicle.shortDescription ||
      "";

    const imageHTML = image
      ? `
        <div class="vehicle-card-image">
          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(
              getDisplayName(vehicle)
            )}"
            loading="lazy"
          >
        </div>
      `
      : "";

    return `
      <article
        class="vehicle-card"
        data-vehicle-id="${escapeHTML(id)}"
      >

        ${imageHTML}

        <div class="vehicle-card-content">

          <div class="vehicle-card-header">
            <span class="vehicle-card-brand">
              ${escapeHTML(make)}
            </span>

            ${
              year
                ? `
                  <span class="vehicle-card-year">
                    ${escapeHTML(year)}
                  </span>
                `
                : ""
            }
          </div>

          <h3 class="vehicle-card-title">
            ${escapeHTML(model)}
          </h3>

          ${
            engine
              ? `
                <p class="vehicle-card-engine">
                  <strong>Engine:</strong>
                  ${escapeHTML(engine)}
                </p>
              `
              : ""
          }

          ${
            description
              ? `
                <p class="vehicle-card-description">
                  ${escapeHTML(description)}
                </p>
              `
              : ""
          }

          <div class="vehicle-card-actions">

            <button
              type="button"
              class="vehicle-card-button"
              data-view-vehicle
              data-vehicle-id="${escapeHTML(id)}"
            >
              View Details
            </button>

            <button
              type="button"
              class="vehicle-card-button secondary"
              data-inquire-vehicle
              data-vehicle-id="${escapeHTML(id)}"
            >
              Inquiry
            </button>

          </div>

        </div>

      </article>
    `;
  }

  function renderResults() {
    const elements = getElements();

    renderSummary();

    if (!elements.results) {
      return;
    }

    if (!filteredVehicles.length) {
      elements.results.innerHTML = `
        <div class="search-empty">
          <h3>No vehicles found</h3>
          <p>
            Try changing your search filters.
          </p>
        </div>
      `;

      return;
    }

    elements.results.innerHTML =
      filteredVehicles
        .map(renderVehicleCard)
        .join("");
  }

  function findVehicleById(id) {
    const target = normalize(id);

    return vehicles.find(
      (vehicle) =>
        normalize(getVehicleId(vehicle)) ===
        target
    ) || null;
  }

  function getVehicleDetails(id) {
    return findVehicleById(id);
  }

  function selectVehicle(vehicle) {
    if (!vehicle) {
      return;
    }

    const id = getVehicleId(vehicle);

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanVehicleSelected",
        {
          detail: {
            vehicle,
            id
          }
        }
      )
    );
  }

  function handleViewVehicle(id) {
    const vehicle =
      findVehicleById(id);

    if (!vehicle) {
      return;
    }

    selectVehicle(vehicle);
  }

  function handleInquiry(vehicle) {
    if (!vehicle) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanVehicleInquiry",
        {
          detail: {
            vehicle
          }
        }
      )
    );

    const inquiryPage =
      typeof window.getPagePath === "function"
        ? window.getPagePath("inquiry.html")
        : "../pages/inquiry.html";

    const id = getVehicleId(vehicle);

    if (id) {
      window.location.href =
        `${inquiryPage}?vehicle=${encodeURIComponent(id)}`;
    } else {
      window.location.href =
        inquiryPage;
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const elements = getElements();

    state.make =
      elements.make?.value || "";

    state.model =
      elements.model?.value || "";

    state.year =
      elements.year?.value || "";

    state.engine =
      elements.engine?.value || "";

    state.query =
      elements.query?.value || "";

    applyFilters();
  }

  function handleFilterChange() {
    const elements = getElements();

    state.make =
      elements.make?.value || "";

    state.model =
      elements.model?.value || "";

    state.year =
      elements.year?.value || "";

    state.engine =
      elements.engine?.value || "";

    updateDependentFilters();

    if (
      elements.model &&
      state.model &&
      [...elements.model.options]
        .some(
          (option) =>
            option.value === state.model
        )
    ) {
      elements.model.value =
        state.model;
    }

    if (
      elements.year &&
      state.year &&
      [...elements.year.options]
        .some(
          (option) =>
            option.value === state.year
        )
    ) {
      elements.year.value =
        state.year;
    }

    if (
      elements.engine &&
      state.engine &&
      [...elements.engine.options]
        .some(
          (option) =>
            option.value === state.engine
        )
    ) {
      elements.engine.value =
        state.engine;
    }

    applyFilters();
  }

  function resetSearch() {
    const elements = getElements();

    state.make = "";
    state.model = "";
    state.year = "";
    state.engine = "";
    state.query = "";

    if (elements.form) {
      elements.form.reset();
    }

    updateMakeOptions();
    updateDependentFilters();

    filteredVehicles =
      [...vehicles];

    renderResults();
  }

  function bindEvents() {
    const elements = getElements();

    elements.form?.addEventListener(
      "submit",
      handleFormSubmit
    );

    elements.make?.addEventListener(
      "change",
      handleFilterChange
    );

    elements.model?.addEventListener(
      "change",
      handleFilterChange
    );

    elements.year?.addEventListener(
      "change",
      handleFilterChange
    );

    elements.engine?.addEventListener(
      "change",
      handleFilterChange
    );

    elements.query?.addEventListener(
      "input",
      handleFormSubmit
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
            "[data-view-vehicle]"
          );

        if (viewButton) {
          handleViewVehicle(
            viewButton.getAttribute(
              "data-vehicle-id"
            )
          );

          return;
        }

        const inquiryButton =
          event.target.closest(
            "[data-inquire-vehicle]"
          );

        if (inquiryButton) {
          const vehicle =
            findVehicleById(
              inquiryButton.getAttribute(
                "data-vehicle-id"
              )
            );

          handleInquiry(vehicle);
        }
      }
    );
  }

  async function initializeVehicleSearch() {
    if (initialized) {
      return;
    }

    initialized = true;

    try {
      await loadVehicles();

      updateMakeOptions();
      updateDependentFilters();

      bindEvents();

      renderResults();

      document.dispatchEvent(
        new CustomEvent(
          "alDahayanVehicleSearchReady",
          {
            detail: {
              count: vehicles.length
            }
          }
        )
      );

    } catch (error) {
      console.error(
        "Al-Dahayan Vehicle Search:",
        error
      );

      const elements = getElements();

      if (elements.results) {
        elements.results.innerHTML = `
          <div class="search-error">
            <h3>Unable to load vehicles</h3>
            <p>
              Please try again later.
            </p>
          </div>
        `;
      }

      if (elements.summary) {
        elements.summary.textContent =
          "Vehicle data unavailable";
      }
    }
  }

  window.AlDahayanVehicleSearch = {
    init: initializeVehicleSearch,

    load: loadVehicles,

    search: function (filters = {}) {
      state.make = filters.make || "";
      state.model = filters.model || "";
      state.year = filters.year || "";
      state.engine = filters.engine || "";
      state.query = filters.query || "";

      applyFilters();

      return filteredVehicles;
    },

    reset: resetSearch,

    getAll: function () {
      return [...vehicles];
    },

    getResults: function () {
      return [...filteredVehicles];
    },

    findById: findVehicleById,

    getDetails: getVehicleDetails,

    getState: function () {
      return {
        ...state
      };
    }
  };

  window.initializeVehicleSearch =
    initializeVehicleSearch;

  document.addEventListener(
    "DOMContentLoaded",
    initializeVehicleSearch
  );

})();
