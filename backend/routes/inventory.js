const express = require("express");

const {
  getVerifiedInventory,
  getVerifiedInventoryByOEM,
  getVerifiedInventoryByLocation
} = require("../services/inventoryService");

const {
  requireAuth,
  requirePermission
} = require("../auth/middleware");

const router = express.Router();

// Get all verified inventory
router.get("/", (req, res) => {
  try {
    const inventory = getVerifiedInventory();

    res.json({
      success: true,
      count: inventory.length,
      inventory
    });
  } catch (error) {
    console.error("Inventory list error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to load inventory data"
    });
  }
});

// Get inventory by OEM number
router.get("/oem/:oemNumber", (req, res) => {
  try {
    const inventory = getVerifiedInventoryByOEM(req.params.oemNumber);

    res.json({
      success: true,
      oemNumber: req.params.oemNumber,
      count: inventory.length,
      inventory
    });
  } catch (error) {
    console.error("Inventory OEM lookup error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to search inventory"
    });
  }
});

// Get inventory by location
router.get("/location/:locationId", (req, res) => {
  try {
    const inventory = getVerifiedInventoryByLocation(
      req.params.locationId
    );

    res.json({
      success: true,
      locationId: req.params.locationId,
      count: inventory.length,
      inventory
    });
  } catch (error) {
    console.error("Inventory location lookup error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to search inventory by location"
    });
  }
});

// Admin inventory
router.get(
  "/admin",
  requireAuth,
  requirePermission("oem.stock_update"),
  (req, res) => {
    try {
      const inventory = getVerifiedInventory();

      res.json({
        success: true,
        count: inventory.length,
        inventory
      });
    } catch (error) {
      console.error("Admin inventory error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to load admin inventory"
      });
    }
  }
);

module.exports = router;
