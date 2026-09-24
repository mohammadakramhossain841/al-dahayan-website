(function () {
  "use strict";

  let vehicles = [];

  async function initializeVehicleSearch() {
    await loadVehicleData();
    setupVehicleSearchForms();
    setupVehicleFilters();
  }

  async function loadVehicleData() {
    try {
      const fileName =
        window.APP_CONFIG?.dataFiles?.vehicles ||
        "vehicles.json";

      const path =
        window.getDataPath?.(fileName) ||
        `./data/${fileName}`;

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Unable to load vehicle data: ${response.status}`
        );
      }

      const data = await response.json();

      vehicles = Array.isArray(data)
        ? data
        : Array.isArray(data.vehicles)
        ? data.vehicles
        : [];

      return vehicles;
    } catch (error) {
      console.error(
        "Vehicle data loading error:",
        error
      );

      vehicles = [];
      return [];
    }
  }

  function setupVehicleSearchForms() {
    const forms = document.querySelectorAll(
      "[data-vehicle-search-form], .vehicle-search-form"
    );

    forms.forEach((form) => {
      form.addEventListener(
        "submit",
        handleVehicleSearchSubmit
      );
    });
  }

  function setupVehicleFilters() {
    const filters = document.querySelectorAll(
      "[data-vehicle-filter]"
    );

    filters.forEach((filter) => {
      filter.addEventListener(
        "change",
        handleVehicleFilterChange
      );
    });
  }

  function handleVehicleSearchSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const make =
      getFormValue(form, "make") ||
      getFormValue(form, "brand");

    const model =
      getFormValue(form, "model");

    const year =
      getFormValue(form, "year");

    const engine =
      getFormValue(form, "engine");

    const results = searchVehicles({
      make,
      model,
      year,
      engine
    });

    displayVehicleResults(results);

    document.dispatchEvent(
      new CustomEvent("vehicleSearchCompleted", {
        detail: {
          filters: {
            make,
            model,
            year,
            engine
          },
          results
        }
      })
    );
  }

  function getFormValue(form, name) {
    const element =
      form.querySelector(
        `[name="${name}"]`
      );

    return element
      ? element.value.trim()
      : "";
  }

  function handleVehicleFilterChange(event) {
    const filter = event.currentTarget;
    const value = filter.value;

    document.dispatchEvent(
      new CustomEvent("vehicleFilterChanged", {
        detail: {
          name: filter.name,
          value: value
        }
      })
    );
  }

  function searchVehicles(filters = {}) {
    return vehicles.filter((vehicle) => {
      return (
        matchesVehicleField(
          vehicle.make ||
            vehicle.brand ||
            vehicle.manufacturer,
          filters.make
        ) &&
        matchesVehicleField(
          vehicle.model,
          filters.model
        ) &&
        matchesVehicleField(
          vehicle.year,
          filters.year
        ) &&
        matchesVehicleField(
          vehicle.engine ||
            vehicle.engineType,
          filters.engine
        )
      );
    });
  }

  function matchesVehicleField(
    vehicleValue,
    filterValue
  ) {
    if (!filterValue) {
      return true;
    }

    return normalizeValue(vehicleValue)
      .includes(normalizeValue(filterValue));
  }

  function normalizeValue(value) {
    return String(value || "")
      .toLowerCase()
      .trim();
  }

  function getMakes() {
    return getUniqueValues(
      vehicles.map(
        (vehicle) =>
          vehicle.make ||
          vehicle.brand ||
          vehicle.manufacturer
      )
    );
  }

  function getModels(make = "") {
    let source = vehicles;

    if (make) {
      source = source.filter((vehicle) =>
        matchesVehicleField(
          vehicle.make ||
            vehicle.brand ||
            vehicle.manufacturer,
          make
        )
      );
    }

    return getUniqueValues(
      source.map(
        (vehicle) => vehicle.model
      )
    );
  }

  function getYears(
    make = "",
    model = ""
  ) {
    let source = vehicles;

    if (make) {
      source = source.filter((vehicle) =>
        matchesVehicleField(
          vehicle.make ||
            vehicle.brand ||
            vehicle.manufacturer,
          make
        )
      );
    }

    if (model) {
      source = source.filter((vehicle) =>
        matchesVehicleField(
          vehicle.model,
          model
        )
      );
    }

    return getUniqueValues(
      source.map(
        (vehicle) => vehicle.year
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
    let source = vehicles;

    if (make) {
      source = source.filter((vehicle) =>
        matchesVehicleField(
          vehicle.make ||
            vehicle.brand ||
            vehicle.manufacturer,
          make
        )
      );
    }

    if (model) {
      source = source.filter((vehicle) =>
        matchesVehicleField(
          vehicle.model,
          model
        )
      );
    }

    if (year) {
      source = source.filter((vehicle) =>
        matchesVehicleField(
          vehicle.year,
          year
        )
      );
    }

    return getUniqueValues(
      source.map(
        (vehicle) =>
          vehicle.engine ||
          vehicle.engineType
      )
    );
  }

  function getUniqueValues(values) {
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

  function displayVehicleResults(
    results
  ) {
    const containers =
      document.querySelectorAll(
        "[data-vehicle-results]"
      );

    containers.forEach(
      (container) => {
        container.innerHTML = "";

        if (!results.length) {
          container.innerHTML = `
            <div class="search-message">
              No matching vehicles found.
            </div>
          `;

          return;
        }

        results.forEach(
          (vehicle) => {
            container.appendChild(
              createVehicleCard(vehicle)
            );
          }
        );
      }
    );
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
      vehicle.model || "";

    const year =
      vehicle.year || "";

    const engine =
      vehicle.engine ||
      vehicle.engineType ||
      "";

    card.innerHTML = `
      <div class="vehicle-search-result-content">

        <span class="vehicle-make">
          ${escapeHTML(make)}
        </span>

        <h3>
          ${escapeHTML(model)}
        </h3>

        ${
          year
            ? `<p><strong>Year:</strong> ${escapeHTML(
                year
              )}</p>`
            : ""
        }

        ${
          engine
            ? `<p><strong>Engine:</strong> ${escapeHTML(
                engine
              )}</p>`
            : ""
        }

        <button
          type="button"
          class="btn btn-primary"
          data-vehicle-id="${escapeHTML(
            vehicle.id ||
              vehicle.vehicleId ||
              ""
          )}"
        >
          View Vehicle
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

  function selectVehicle(vehicle) {
    document.dispatchEvent(
      new CustomEvent("vehicleSelected", {
        detail: {
          vehicle
        }
      })
    );

    const vehicleId =
      vehicle.id ||
      vehicle.vehicleId;

    if (vehicleId) {
      const encodedId =
        encodeURIComponent(vehicleId);

      window.location.href =
        `./pages/vehicles.html?id=${encodedId}`;
    }
  }

  function getVehicles() {
    return [...vehicles];
  }

  window.AlDahayanVehicleSearch = {
    initialize:
      initializeVehicleSearch,

    search: searchVehicles,

    getVehicles,

    getMakes,

    getModels,

    getYears,

    getEngines,

    selectVehicle
  };

  window.initializeVehicleSearch =
    initializeVehicleSearch;

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
