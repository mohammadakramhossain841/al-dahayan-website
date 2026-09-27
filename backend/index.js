const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const { login } = require("./auth/login");
const { requireAuth, requirePermission } = require("./auth/middleware");
const inventoryRouter = require("./routes/inventory");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..")));

// ===============================
// ADMIN LOGIN
// ===============================

app.post("/api/v1/admin/login", async (req, res) => {
  const { username, password } = req.body || {};

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required"
      });
    }

    const result = await login(username, password);

    if (!result) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password"
      });
    }

    res.json({
      success: true,
      admin: result.admin,
      token: result.token
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      success: false,
      error: "Login failed"
    });
  }
});

// ===============================
// ADMIN OEM CATALOG
// ===============================

app.get(
  "/api/v1/admin/oem",
  requireAuth,
  requirePermission("oem.view"),
  (req, res) => {
    try {
      const filePath = path.join(
        __dirname,
        "..",
        "data",
        "oem-catalog.json"
      );

      const catalog = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      );

      res.json({
        success: true,
        catalogVersion: catalog.catalogVersion,
        brandScope: catalog.brandScope,
        count: Array.isArray(catalog.parts)
          ? catalog.parts.length
          : 0,
        parts: Array.isArray(catalog.parts)
          ? catalog.parts
          : []
      });
    } catch (error) {
      console.error("Admin OEM list error:", error);

      res.status(500).json({
        success: false,
        error: "Unable to load OEM catalog"
      });
    }
  }
);

// ===============================
// ADMIN AUTH TEST
// ===============================

app.get(
  "/api/v1/admin/test",
  requireAuth,
  requirePermission("oem.view"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin authentication verified",
      admin: req.admin
    });
  }
);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Al-Dahayan Backend API",
    status: "healthy"
  });
});

// ===============================
// INVENTORY API
// ===============================

app.use("/api/v1/inventory", inventoryRouter);

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Al-Dahayan API running on port ${PORT}`);
});
