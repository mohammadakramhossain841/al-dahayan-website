(function () {
  "use strict";

  let vehicles = [];
  let compatibility = [];
  let parts = [];

  async function initializeVINSearch() {
    await loadVINData();
    setupVINForms();
  }

  async function loadVINData() {
    try {
      const vehicleFile =
        window.APP_CONFIG?.dataFiles?.vehicles ||
        "vehicles.json";

      const compatibilityFile =
        window.APP_CONFIG?.dataFiles?.compatibility ||
        "compatibility.json";

      const partsFile =
        window.APP_CONFIG?.dataFiles?.oemParts ||
        "oem-parts.json";

      const [
        vehiclesResponse,
        compatibilityResponse,
        partsResponse
      ] = await Promise.all([
        fetch(
          window.getDataPath?.(vehicleFile) ||
            `./data/${vehicleFile}`
        ),
        fetch(
          window.getDataPath?.(compatibilityFile) ||
            `./data/${compatibilityFile}`
        ),
        fetch(
          window.getDataPath?.(partsFile) ||
            `./data/${partsFile}`
        )
      ]);

      if (vehiclesResponse.ok) {
        const data = await vehiclesResponse.json();

        vehicles = Array.isArray(data)
          ? data
          : Array.isArray(data.vehicles)
          ? data.vehicles
          : [];
      }

      if (compatibilityResponse.ok) {
        const data = await compatibilityResponse.json();

        compatibility = Array.isArray(data)
          ? data
          : Array.isArray(data.compatibility)
          ? data.compatibility
          : [];
      }

      if (partsResponse.ok) {
        const data = await partsResponse.json();

        parts = Array.isArray(data)
          ? data
          : Array.isArray(data.parts)
          ? data.parts
          : [];
      }
    } catch (error) {
      console.error(
        "VIN data loading error:",
        error
      );
    }
  }

  function setupVINForms() {
    const forms = document.querySelectorAll(
      "[data-vin-form], .vin-search-form"
    );

    forms.forEach((form) => {
      form.addEventListener(
        "submit",
        handleVINSubmit
      );
    });
  }

  function handleVINSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const input =
      form.querySelector("[data-vin-input]") ||
      form.querySelector("input[name='vin']") ||
      form.querySelector("input");

    if (!input) {
      return;
    }

    const vin = normalizeVIN(input.value);

    if (!validateVIN(vin)) {
      showVINMessage(
        "Please enter a valid 17-character VIN."
      );
      return;
    }

    showVINMessage("Searching VIN...");

    const vehicle = identifyVehicleByVIN(vin);

    if (!vehicle) {
      showVINMessage(
        "Vehicle information was not found for this VIN."
      );

      document.dispatchEvent(
        new CustomEvent("vinSearchCompleted", {
          detail: {
            vin: vin,
            vehicle: null,
            parts: []
          }
        })
      );

      return;
    }

    const compatibleParts =
      getCompatibleParts(vehicle);

    displayVINResult(
      vin,
      vehicle,
      compatibleParts
    );

    document.dispatchEvent(
      new CustomEvent("vinSearchCompleted", {
        detail: {
          vin: vin,
          vehicle: vehicle,
          parts: compatibleParts
        }
      })
    );
  }

  function normalizeVIN(vin) {
    return String(vin || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function validateVIN(vin) {
    if (vin.length !== 17) {
      return false;
    }

    // VINs normally do not use I, O or Q.
    if (/[IOQ]/.test(vin)) {
      return false;
    }

    return true;
  }

  function identifyVehicleByVIN(vin) {
    const wmi = vin.substring(0, 3);
    const modelYearCode = vin.substring(9, 10);

    const exactMatch = vehicles.find(
      (vehicle) =>
        String(vehicle.vin || "").toUpperCase() === vin
    );

    if (exactMatch) {
      return {
        ...exactMatch,
        vin: vin
      };
    }

    const wmiMatch = vehicles.find(
      (vehicle) =>
        vehicle.wmi &&
        String(vehicle.wmi)
          .toUpperCase()
          .split(",")
          .map((item) => item.trim())
          .includes(wmi)
    );

    if (wmiMatch) {
      return {
        ...wmiMatch,
        vin: vin,
        vinWMI: wmi,
        vinYearCode: modelYearCode
      };
    }

    return null;
  }

  function getCompatibleParts(vehicle) {
    if (!vehicle) {
      return [];
    }

    const vehicleId =
      vehicle.id ||
      vehicle.vehicleId ||
      vehicle.modelId;

    const matches = compatibility.filter(
      (item) => {
        const itemVehicleId =
          item.vehicleId ||
          item.modelId;

        return (
          String(itemVehicleId || "") ===
          String(vehicleId || "")
        );
      }
    );

    const result = [];

    matches.forEach((match) => {
      const partId =
        match.partId ||
        match.oemPartId ||
        match.oemNumber;

      const part = parts.find((item) => {
        const itemId =
          item.id ||
          item.partId ||
          item.oemNumber ||
          item.partNumber ||
          item.partNo;

        return (
          String(itemId || "") ===
          String(partId || "")
        );
      });

      if (part) {
        result.push(part);
      } else if (match.oemNumber) {
        result.push({
          oemNumber: match.oemNumber
        });
      }
    });

    return result;
  }

  function displayVINResult(
    vin,
    vehicle,
    compatibleParts
  ) {
    const containers = document.querySelectorAll(
      "[data-vin-results]"
    );

    containers.forEach((container) => {
      container.innerHTML = `
        <div class="vin-result">
          <div class="vin-result-header">
            <span>VIN</span>
            <strong>${escapeHTML(vin)}</strong>
          </div>

          <div class="vin-vehicle">
            <h3>
              ${escapeHTML(
                vehicle.make ||
                  vehicle.brand ||
                  "Vehicle"
              )}
              ${escapeHTML(
                vehicle.model || ""
              )}
            </h3>

            ${
              vehicle.year
                ? `<p>Year: ${escapeHTML(
                    vehicle.year
                  )}</p>`
                : ""
            }

            ${
              vehicle.engine
                ? `<p>Engine: ${escapeHTML(
                    vehicle.engine
                  )}</p>`
                : ""
            }
          </div>

          <div class="vin-parts">
            <h4>
              Compatible Parts
            </h4>

            <p>
              ${compatibleParts.length}
              compatible part(s) found.
            </p>
          </div>
        </div>
      `;

      if (compatibleParts.length) {
        const list =
          document.createElement("div");

        list.className =
          "vin-compatible-parts";

        compatibleParts.forEach((part) => {
          const item =
            document.createElement("div");

          item.className =
            "vin-compatible-part";

          const partNumber =
            part.oemNumber ||
            part.partNumber ||
            part.partNo ||
            "N/A";

          const name =
            part.name ||
            part.partName ||
            "Automotive Spare Part";

          item.innerHTML = `
            <strong>
              ${escapeHTML(partNumber)}
            </strong>

            <span>
              ${escapeHTML(name)}
            </span>
          `;

          list.appendChild(item);
        });

        container.appendChild(list);
      }
    });
  }

  function showVINMessage(message) {
    const containers = document.querySelectorAll(
      "[data-vin-results]"
    );

    containers.forEach((container) => {
      container.innerHTML = `
        <div class="vin-message">
          ${escapeHTML(message)}
        </div>
      `;
    });
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.AlDahayanVINSearch = {
    initialize: initializeVINSearch,
    search: identifyVehicleByVIN,
    validate: validateVIN,
    getCompatibleParts
  };

  window.initializeVINSearch =
    initializeVINSearch;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeVINSearch
    );
  } else {
    initializeVINSearch();
  }
})();
