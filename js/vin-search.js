(function () {
  "use strict";

  let vehiclesData = [];
  let compatibilityData = [];
  let partsData = [];

  let isLoaded = false;

  async function initializeVINSearch() {
    await loadVINData();
    setupVINInterface();
  }

  async function loadVINData() {
    try {
      const [
        vehicles,
        compatibility,
        parts
      ] = await Promise.all([
        loadJSON(
          getDataPath(APP_CONFIG.dataFiles.vehicles)
        ),
        loadJSON(
          getDataPath(APP_CONFIG.dataFiles.compatibility)
        ),
        loadJSON(
          getDataPath(APP_CONFIG.dataFiles.oemParts)
        )
      ]);

      vehiclesData = normalizeArray(vehicles);
      compatibilityData = normalizeArray(compatibility);
      partsData = normalizeArray(parts);

      isLoaded = true;

      return {
        vehicles: vehiclesData,
        compatibility: compatibilityData,
        parts: partsData
      };
    } catch (error) {
      console.error(
        "Al-Dahayan VIN Search: Unable to load VIN data.",
        error
      );

      vehiclesData = [];
      compatibilityData = [];
      partsData = [];

      isLoaded = false;

      return {
        vehicles: [],
        compatibility: [],
        parts: []
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

    if (Array.isArray(data?.vehicles)) {
      return data.vehicles;
    }

    if (Array.isArray(data?.compatibility)) {
      return data.compatibility;
    }

    if (Array.isArray(data?.parts)) {
      return data.parts;
    }

    if (Array.isArray(data?.oemParts)) {
      return data.oemParts;
    }

    return [];
  }

  function setupVINInterface() {
    const forms = document.querySelectorAll(
      "[data-vin-form], #vinSearchForm, .vin-search-form"
    );

    forms.forEach((form) => {
      if (form.dataset.vinInitialized === "true") {
        return;
      }

      form.dataset.vinInitialized = "true";

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const input = form.querySelector(
          "input[name='vin'], #vin, [data-vin-input]"
        );

        const vin = input ? input.value : "";

        performVINSearch(vin);
      });
    });

    const inputs = document.querySelectorAll(
      "input[name='vin'], #vin, [data-vin-input]"
    );

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        input.value = input.value
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 17);
      });
    });
  }

  function validateVIN(vin) {
    const normalizedVIN = normalizeVIN(vin);

    if (!normalizedVIN) {
      return {
        valid: false,
        message:
          getCurrentLanguage() === "ar"
            ? "يرجى إدخال رقم الهيكل VIN."
            : "Please enter a VIN."
      };
    }

    if (normalizedVIN.length !== 17) {
      return {
        valid: false,
        message:
          getCurrentLanguage() === "ar"
            ? "يجب أن يتكون رقم VIN من 17 خانة."
            : "VIN must contain 17 characters."
      };
    }

    if (/[IOQ]/.test(normalizedVIN)) {
      return {
        valid: false,
        message:
          getCurrentLanguage() === "ar"
            ? "رقم VIN لا يمكن أن يحتوي على الأحرف I أو O أو Q."
            : "VIN cannot contain the letters I, O, or Q."
      };
    }

    return {
      valid: true,
      vin: normalizedVIN,
      message: ""
    };
  }

  function normalizeVIN(vin) {
    return String(vin || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function performVINSearch(vin) {
    const validation = validateVIN(vin);

    if (!validation.valid) {
      displayVINMessage(validation.message, "error");
      return {
        success: false,
        error: validation.message
      };
    }

    if (!isLoaded) {
      const message =
        getCurrentLanguage() === "ar"
          ? "بيانات البحث غير متاحة حالياً."
          : "VIN search data is currently unavailable.";

      displayVINMessage(message, "error");

      return {
        success: false,
        error: message
      };
    }

    const result = identifyVehicleByVIN(
      validation.vin
    );

    displayVINResults(result);

    document.dispatchEvent(
      new CustomEvent("alDahayanVINSearchCompleted", {
        detail: result
      })
    );

    return result;
  }

  function identifyVehicleByVIN(vin) {
    /*
     * Foundation-level VIN matching.
     *
     * This is NOT a complete VIN decoder.
     * Production VIN decoding can later be connected
     * to a verified VIN data/API service.
     */

    const exactVehicle = vehiclesData.find(
      (vehicle) =>
        normalizeVIN(vehicle.vin) === vin
    );

    if (exactVehicle) {
      return buildVINResult(
        vin,
        exactVehicle,
        "exact"
      );
    }

    const wmi = vin.substring(0, 3);

    const wmiMatches = vehiclesData.filter(
      (vehicle) =>
        String(vehicle.wmi || "")
          .toUpperCase() === wmi
    );

    if (wmiMatches.length) {
      return buildVINResult(
        vin,
        wmiMatches[0],
        "wmi"
      );
    }

    return {
      success: false,
      vin,
      matchType: "none",
      vehicle: null,
      compatibleParts: [],
      message:
        getCurrentLanguage() === "ar"
          ? "لم يتم العثور على مركبة مطابقة في قاعدة البيانات الحالية."
          : "No matching vehicle was found in the current database."
    };
  }

  function buildVINResult(
    vin,
    vehicle,
    matchType
  ) {
    const compatibleParts =
      getCompatibleParts(vehicle);

    return {
      success: true,
      vin,
      matchType,
      vehicle,
      compatibleParts,
      message:
        getCurrentLanguage() === "ar"
          ? "تم العثور على بيانات متوافقة."
          : "Compatible vehicle information found."
    };
  }

  function getCompatibleParts(vehicle) {
    if (!vehicle) {
      return [];
    }

    const vehicleId =
      vehicle.id ||
      vehicle.vehicleId ||
      vehicle.vehicle_id;

    const make =
      normalizeText(
        vehicle.make ||
        vehicle.brand
      );

    const model =
      normalizeText(
        vehicle.model ||
        vehicle.modelName
      );

    const year = String(
      vehicle.year ||
      ""
    );

    const matchingCompatibility =
      compatibilityData.filter((record) => {
        const recordVehicleId =
          record.vehicleId ||
          record.vehicle_id;

        const recordMake =
          normalizeText(
            record.make ||
            record.brand
          );

        const recordModel =
          normalizeText(
            record.model ||
            record.modelName
          );

        const recordYear = String(
          record.year ||
          ""
        );

        if (
          vehicleId &&
          recordVehicleId &&
          String(recordVehicleId) ===
            String(vehicleId)
        ) {
          return true;
        }

        return (
          (!make || !recordMake || make === recordMake) &&
          (!model || !recordModel || model === recordModel) &&
          (!year || !recordYear || year === recordYear)
        );
      });

    const partIds = new Set();

    matchingCompatibility.forEach(
      (record) => {
        const partId =
          record.partId ||
          record.part_id ||
          record.oemPartId ||
          record.oemNumber;

        if (partId) {
          partIds.add(String(partId));
        }
      }
    );

    return partsData.filter((part) => {
      const identifiers = [
        part.id,
        part.partId,
        part.oemPartId,
        part.oemNumber,
        part.partNumber,
        part.partNo
      ]
        .filter(Boolean)
        .map(String);

      return identifiers.some((id) =>
        partIds.has(id)
      );
    });
  }

  function displayVINResults(result) {
    const container = document.querySelector(
      "[data-vin-results], #vinResults, .vin-results"
    );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!result.success) {
      displayVINMessage(
        result.message,
        "empty",
        container
      );

      return;
    }

    const vehicle = result.vehicle;

    const vehicleCard =
      document.createElement("article");

    vehicleCard.className =
      "vin-vehicle-result";

    vehicleCard.innerHTML = `
      <div class="vin-result-header">
        <h3>
          ${
            getCurrentLanguage() === "ar"
              ? "بيانات المركبة"
              : "Vehicle Information"
          }
        </h3>

        <span class="vin-match-type">
          ${escapeHTML(result.matchType)}
        </span>
      </div>

      <div class="vin-vehicle-details">
        ${
          vehicle.make
            ? `<p>
                <strong>Make:</strong>
                ${escapeHTML(vehicle.make)}
              </p>`
            : ""
        }

        ${
          vehicle.model
            ? `<p>
                <strong>Model:</strong>
                ${escapeHTML(vehicle.model)}
              </p>`
            : ""
        }

        ${
          vehicle.year
            ? `<p>
                <strong>Year:</strong>
                ${escapeHTML(vehicle.year)}
              </p>`
            : ""
        }

        ${
          vehicle.engine
            ? `<p>
                <strong>Engine:</strong>
                ${escapeHTML(vehicle.engine)}
              </p>`
            : ""
        }

        <p>
          <strong>VIN:</strong>
          ${escapeHTML(result.vin)}
        </p>
      </div>
    `;

    container.appendChild(vehicleCard);

    displayCompatibleParts(
      result.compatibleParts,
      container
    );
  }

  function displayCompatibleParts(
    parts,
    container
  ) {
    const section =
      document.createElement("section");

    section.className =
      "vin-compatible-parts";

    const title =
      document.createElement("h3");

    title.textContent =
      getCurrentLanguage() === "ar"
        ? "قطع الغيار المتوافقة"
        : "Compatible Parts";

    section.appendChild(title);

    if (!parts.length) {
      const empty =
        document.createElement("p");

      empty.textContent =
        getCurrentLanguage() === "ar"
          ? "لا توجد قطع متوافقة مسجلة حالياً."
          : "No compatible parts are currently registered.";

      section.appendChild(empty);

      container.appendChild(section);

      return;
    }

    const list =
      document.createElement("div");

    list.className =
      "vin-parts-list";

    parts.forEach((part) => {
      const item =
        document.createElement("article");

      item.className =
        "vin-compatible-part";

      const name =
        part.name ||
        part.partName ||
        "Automotive Part";

      const number =
        part.oemNumber ||
        part.partNumber ||
        part.partNo ||
        "";

      item.innerHTML = `
        <h4>${escapeHTML(name)}</h4>

        ${
          number
            ? `<p>
                <strong>OEM:</strong>
                ${escapeHTML(number)}
              </p>`
            : ""
        }
      `;

      list.appendChild(item);
    });

    section.appendChild(list);

    container.appendChild(section);
  }

  function displayVINMessage(
    message,
    type = "info",
    container = null
  ) {
    const target =
      container ||
      document.querySelector(
        "[data-vin-results], #vinResults, .vin-results"
      );

    if (!target) {
      return;
    }

    target.innerHTML = "";

    const messageElement =
      document.createElement("div");

    messageElement.className =
      `vin-message vin-message-${type}`;

    messageElement.textContent = message;

    target.appendChild(messageElement);
  }

  function getCurrentLanguage() {
    return (
      document.documentElement.getAttribute("lang") ||
      APP_CONFIG?.site?.defaultLanguage ||
      "en"
    );
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function escapeHTML(value) {
    if (
      typeof window.AlDahayanUtils?.escapeHTML ===
      "function"
    ) {
      return window.AlDahayanUtils.escapeHTML(value);
    }

    const div =
      document.createElement("div");

    div.textContent =
      String(value ?? "");

    return div.innerHTML;
  }

  window.AlDahayanVINSearch = {
    initialize: initializeVINSearch,
    loadVINData,
    validateVIN,
    normalizeVIN,
    performVINSearch,
    identifyVehicleByVIN,
    getCompatibleParts,
    getVehicles: () => [...vehiclesData],
    getCompatibility: () => [
      ...compatibilityData
    ],
    getParts: () => [...partsData],
    isLoaded: () => isLoaded
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeVINSearch
    );
  } else {
    initializeVINSearch();
  }
})();
