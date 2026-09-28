const express = require("express");

const {
  getVerifiedInventory,
  getVerifiedInventoryByOEM,
  getVerifiedInventoryByLocation,
  createInventory,
  updateInventory,
  archiveInventory
} = require("../services/inventoryService");

const {
  requireAuth,
  requirePermission
} = require("../auth/middleware");

const router = express.Router();


// =========================================
// PUBLIC INVENTORY
// =========================================

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
    console.error(
      "Inventory list error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to load inventory data"
    });
  }
});


// Get inventory by OEM number
router.get(
  "/oem/:oemNumber",
  (req, res) => {
    try {
      const inventory =
        getVerifiedInventoryByOEM(
          req.params.oemNumber
        );

      res.json({
        success: true,
        oemNumber:
          req.params.oemNumber,
        count: inventory.length,
        inventory
      });
    } catch (error) {
      console.error(
        "Inventory OEM lookup error:",
        error
      );

      res.status(500).json({
        success: false,
        error: "Failed to search inventory"
      });
    }
  }
);


// Get inventory by location
router.get(
  "/location/:locationId",
  (req, res) => {
    try {
      const inventory =
        getVerifiedInventoryByLocation(
          req.params.locationId
        );

      res.json({
        success: true,
        locationId:
          req.params.locationId,
        count: inventory.length,
        inventory
      });
    } catch (error) {
      console.error(
        "Inventory location lookup error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Failed to search inventory by location"
      });
    }
  }
);


// =========================================
// ADMIN INVENTORY
// =========================================

// Get admin inventory
router.get(
  "/admin",
  requireAuth,
  requirePermission(
    "oem.stock_update"
  ),
  (req, res) => {
    try {
      const inventory =
        getVerifiedInventory();

      res.json({
        success: true,
        count: inventory.length,
        inventory
      });
    } catch (error) {
      console.error(
        "Admin inventory error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Failed to load admin inventory"
      });
    }
  }
);


// =========================================
// ADMIN ADD INVENTORY
// =========================================

router.post(
  "/admin",
  requireAuth,
  requirePermission(
    "oem.stock_update"
  ),
  (req, res) => {
    try {
      const inventory =
        createInventory(
          req.body
        );

      res.status(201).json({
        success: true,
        message:
          "Inventory created successfully",
        inventory
      });
    } catch (error) {
      console.error(
        "Admin inventory create error:",
        error
      );

      const message =
        error && error.message
          ? error.message
          : "Failed to create inventory";

      res.status(400).json({
        success: false,
        error: message
      });
    }
  }
);


// =========================================
// ADMIN UPDATE INVENTORY
// =========================================

router.put(
  "/admin/:inventoryId",
  requireAuth,
  requirePermission(
    "oem.stock_update"
  ),
  (req, res) => {
    try {
      const inventory =
        updateInventory(
          req.params.inventoryId,
          req.body
        );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          error:
            "Inventory record not found"
        });
      }

      res.json({
        success: true,
        message:
          "Inventory updated successfully",
        inventory
      });
    } catch (error) {
      console.error(
        "Admin inventory update error:",
        error
      );

      const message =
        error && error.message
          ? error.message
          : "Failed to update inventory";

      res.status(400).json({
        success: false,
        error: message
      });
    }
  }
);


// =========================================
// ADMIN ARCHIVE INVENTORY
// =========================================

router.patch(
  "/admin/:inventoryId/archive",
  requireAuth,
  requirePermission(
    "oem.stock_update"
  ),
  (req, res) => {
    try {
      const inventory =
        archiveInventory(
          req.params.inventoryId
        );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          error:
            "Inventory record not found"
        });
      }

      res.json({
        success: true,
        message:
          "Inventory archived successfully",
        inventory
      });
    } catch (error) {
      console.error(
        "Admin inventory archive error:",
        error
      );

      const message =
        error && error.message
          ? error.message
          : "Failed to archive inventory";

      res.status(400).json({
        success: false,
        error: message
      });
    }
  }
);


module.exports = router;
