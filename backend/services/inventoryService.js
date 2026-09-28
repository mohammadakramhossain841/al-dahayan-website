const fs = require("fs");
const path = require("path");

const INVENTORY_FILE = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "inventory.json"
);


/* =========================================
   FILE HELPERS
   ========================================= */

function loadInventoryData() {
  const raw = fs.readFileSync(
    INVENTORY_FILE,
    "utf8"
  );

  return JSON.parse(raw);
}


function saveInventoryData(data) {
  const tempFile =
    `${INVENTORY_FILE}.tmp`;

  const serialized =
    JSON.stringify(data, null, 2);

  fs.writeFileSync(
    tempFile,
    `${serialized}\n`,
    "utf8"
  );

  fs.renameSync(
    tempFile,
    INVENTORY_FILE
  );
}


/* =========================================
   NORMALIZATION
   ========================================= */

function normalizeOEM(oemNumber) {
  return String(oemNumber || "")
    .trim()
    .toUpperCase();
}


function normalizeLocationId(locationId) {
  return String(locationId || "")
    .trim();
}


function normalizeInventoryId(id) {
  return String(id || "")
    .trim();
}


/* =========================================
   READ INVENTORY
   ========================================= */

function getInventory() {
  const data = loadInventoryData();

  return Array.isArray(data.inventory)
    ? data.inventory.filter(
        (item) => item.active !== false
      )
    : [];
}


function getInventoryByOEM(oemNumber) {
  const normalizedOEM =
    normalizeOEM(oemNumber);

  if (!normalizedOEM) {
    return [];
  }

  return getInventory().filter(
    (item) =>
      normalizeOEM(item.oemNumber) ===
      normalizedOEM
  );
}


function getInventoryByLocation(locationId) {
  const normalizedLocationId =
    normalizeLocationId(locationId);

  if (!normalizedLocationId) {
    return [];
  }

  return getInventory().filter(
    (item) =>
      normalizeLocationId(item.locationId) ===
      normalizedLocationId
  );
}


/* =========================================
   AVAILABILITY CALCULATION
   ========================================= */

function calculateAvailability(item) {
  const quantity =
    Number(item.quantity) || 0;

  const reservedQuantity =
    Number(item.reservedQuantity) || 0;

  const availableQuantity =
    Math.max(
      quantity - reservedQuantity,
      0
    );

  let status = "unknown";

  if (availableQuantity > 0) {
    status =
      availableQuantity <= 5
        ? "low_stock"
        : "in_stock";
  } else if (quantity === 0) {
    status = "out_of_stock";
  }

  return {
    ...item,
    availableQuantity,
    status
  };
}


/* =========================================
   VERIFIED INVENTORY
   ========================================= */

function getVerifiedInventory() {
  return getInventory().map(
    calculateAvailability
  );
}


function getVerifiedInventoryByOEM(oemNumber) {
  return getInventoryByOEM(oemNumber).map(
    calculateAvailability
  );
}


function getVerifiedInventoryByLocation(locationId) {
  return getInventoryByLocation(locationId).map(
    calculateAvailability
  );
}


/* =========================================
   VALIDATION
   ========================================= */

function validateInventoryInput(input) {
  if (
    !input ||
    typeof input !== "object"
  ) {
    throw new Error(
      "Inventory data is required."
    );
  }

  const oemNumber =
    normalizeOEM(input.oemNumber);

  const locationId =
    normalizeLocationId(input.locationId);

  if (!oemNumber) {
    throw new Error(
      "OEM number is required."
    );
  }

  if (!locationId) {
    throw new Error(
      "Location ID is required."
    );
  }

  const quantity =
    Number(input.quantity);

  const reservedQuantity =
    Number(input.reservedQuantity || 0);

  if (
    !Number.isFinite(quantity) ||
    quantity < 0
  ) {
    throw new Error(
      "Quantity must be a valid non-negative number."
    );
  }

  if (
    !Number.isFinite(reservedQuantity) ||
    reservedQuantity < 0
  ) {
    throw new Error(
      "Reserved quantity must be a valid non-negative number."
    );
  }

  if (reservedQuantity > quantity) {
    throw new Error(
      "Reserved quantity cannot exceed quantity."
    );
  }

  return {
    oemNumber,
    locationId,
    quantity,
    reservedQuantity
  };
}


/* =========================================
   CREATE INVENTORY
   ========================================= */

function createInventory(input) {
  const validated =
    validateInventoryInput(input);

  const data =
    loadInventoryData();

  if (!Array.isArray(data.inventory)) {
    data.inventory = [];
  }

  const requestedId =
    normalizeInventoryId(input.id);

  const inventoryId =
    requestedId ||
    `INV-${String(
      data.inventory.length + 1
    ).padStart(3, "0")}`;

  const duplicate =
    data.inventory.some(
      (item) =>
        normalizeInventoryId(item.id) ===
        inventoryId
    );

  if (duplicate) {
    throw new Error(
      `Inventory ID already exists: ${inventoryId}`
    );
  }

  const now =
    new Date().toISOString();

  const inventoryItem = {
    id: inventoryId,

    oemNumber:
      validated.oemNumber,

    locationId:
      validated.locationId,

    quantity:
      validated.quantity,

    reservedQuantity:
      validated.reservedQuantity,

    availableQuantity:
      Math.max(
        validated.quantity -
        validated.reservedQuantity,
        0
      ),

    status: "unknown",

    lastUpdated: now,

    active: input.active !== false
  };

  data.inventory.push(
    inventoryItem
  );

  saveInventoryData(data);

  return calculateAvailability(
    inventoryItem
  );
}


/* =========================================
   UPDATE INVENTORY
   ========================================= */

function updateInventory(
  inventoryId,
  input
) {
  const normalizedId =
    normalizeInventoryId(
      inventoryId
    );

  if (!normalizedId) {
    throw new Error(
      "Inventory ID is required."
    );
  }

  const validated =
    validateInventoryInput(input);

  const data =
    loadInventoryData();

  if (!Array.isArray(data.inventory)) {
    throw new Error(
      "Inventory data is invalid."
    );
  }

  const index =
    data.inventory.findIndex(
      (item) =>
        normalizeInventoryId(item.id) ===
        normalizedId
    );

  if (index === -1) {
    return null;
  }

  const existing =
    data.inventory[index];

  const updatedItem = {
    ...existing,

    oemNumber:
      validated.oemNumber,

    locationId:
      validated.locationId,

    quantity:
      validated.quantity,

    reservedQuantity:
      validated.reservedQuantity,

    availableQuantity:
      Math.max(
        validated.quantity -
        validated.reservedQuantity,
        0
      ),

    status: "unknown",

    lastUpdated:
      new Date().toISOString(),

    active:
      input.active !== false
  };

  data.inventory[index] =
    updatedItem;

  saveInventoryData(data);

  return calculateAvailability(
    updatedItem
  );
}


/* =========================================
   ARCHIVE INVENTORY
   ========================================= */

function archiveInventory(inventoryId) {
  const normalizedId =
    normalizeInventoryId(
      inventoryId
    );

  if (!normalizedId) {
    throw new Error(
      "Inventory ID is required."
    );
  }

  const data =
    loadInventoryData();

  if (!Array.isArray(data.inventory)) {
    throw new Error(
      "Inventory data is invalid."
    );
  }

  const index =
    data.inventory.findIndex(
      (item) =>
        normalizeInventoryId(item.id) ===
        normalizedId
    );

  if (index === -1) {
    return null;
  }

  const archivedItem = {
    ...data.inventory[index],

    active: false,

    lastUpdated:
      new Date().toISOString()
  };

  data.inventory[index] =
    archivedItem;

  saveInventoryData(data);

  return archivedItem;
}


/* =========================================
   EXPORTS
   ========================================= */

module.exports = {
  loadInventoryData,
  saveInventoryData,

  getInventory,
  getInventoryByOEM,
  getInventoryByLocation,

  calculateAvailability,

  getVerifiedInventory,
  getVerifiedInventoryByOEM,
  getVerifiedInventoryByLocation,

  validateInventoryInput,

  createInventory,
  updateInventory,
  archiveInventory
};
