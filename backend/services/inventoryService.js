const fs = require("fs");
const path = require("path");

const INVENTORY_FILE = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "inventory.json"
);

function loadInventoryData() {
  const raw = fs.readFileSync(INVENTORY_FILE, "utf8");
  return JSON.parse(raw);
}

function getInventory() {
  const data = loadInventoryData();

  return Array.isArray(data.inventory)
    ? data.inventory.filter((item) => item.active !== false)
    : [];
}

function getInventoryByOEM(oemNumber) {
  const normalizedOEM = String(oemNumber || "").trim().toUpperCase();

  if (!normalizedOEM) {
    return [];
  }

  return getInventory().filter(
    (item) =>
      String(item.oemNumber || "").trim().toUpperCase() === normalizedOEM
  );
}

function getInventoryByLocation(locationId) {
  const normalizedLocationId = String(locationId || "").trim();

  if (!normalizedLocationId) {
    return [];
  }

  return getInventory().filter(
    (item) => String(item.locationId || "").trim() === normalizedLocationId
  );
}

function calculateAvailability(item) {
  const quantity = Number(item.quantity) || 0;
  const reservedQuantity = Number(item.reservedQuantity) || 0;

  const availableQuantity = Math.max(
    quantity - reservedQuantity,
    0
  );

  let status = "unknown";

  if (availableQuantity > 0) {
    status = availableQuantity <= 5
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

function getVerifiedInventory() {
  return getInventory().map(calculateAvailability);
}

function getVerifiedInventoryByOEM(oemNumber) {
  return getInventoryByOEM(oemNumber).map(calculateAvailability);
}

function getVerifiedInventoryByLocation(locationId) {
  return getInventoryByLocation(locationId).map(calculateAvailability);
}

module.exports = {
  loadInventoryData,
  getInventory,
  getInventoryByOEM,
  getInventoryByLocation,
  calculateAvailability,
  getVerifiedInventory,
  getVerifiedInventoryByOEM,
  getVerifiedInventoryByLocation
};
