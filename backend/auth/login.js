const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/* =========================================
   AL-DAHAYAN ADMIN LOGIN SERVICE
   ========================================= */

const ADMIN_USERNAME =
  process.env.ADMIN_USERNAME || "";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "";

const JWT_SECRET =
  process.env.JWT_SECRET || "";

const JWT_EXPIRES_IN_SECONDS =
  Number(process.env.JWT_EXPIRES_IN_SECONDS) || 86400;


/* =========================================
   DATA FILES
   ========================================= */

const ADMIN_USERS_FILE = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "admin-users.json"
);

const ADMIN_PERMISSIONS_FILE = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "admin-permissions.json"
);


/* =========================================
   LOAD ADMIN USERS
   ========================================= */

function loadAdminUsers() {
  const data = JSON.parse(
    fs.readFileSync(
      ADMIN_USERS_FILE,
      "utf8"
    )
  );

  if (!Array.isArray(data.users)) {
    throw new Error(
      "Invalid admin-users.json: users must be an array."
    );
  }

  return data.users;
}


/* =========================================
   LOAD ROLE PERMISSIONS
   ========================================= */

function loadRolePermissions() {
  const data = JSON.parse(
    fs.readFileSync(
      ADMIN_PERMISSIONS_FILE,
      "utf8"
    )
  );

  if (
    !data.rolePermissions ||
    typeof data.rolePermissions !== "object"
  ) {
    throw new Error(
      "Invalid admin-permissions.json: rolePermissions is required."
    );
  }

  return data.rolePermissions;
}


/* =========================================
   SAFE STRING COMPARISON
   ========================================= */

function safeCompare(valueA, valueB) {
  const a = String(valueA || "");
  const b = String(valueB || "");

  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    aBuffer,
    bBuffer
  );
}


/* =========================================
   BASE64URL
   ========================================= */

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}


/* =========================================
   CREATE JWT
   ========================================= */

function createToken(admin) {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  const now =
    Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const payload = {
    sub: admin.id,
    username: admin.username,
    role: admin.role,
    permissions: admin.permissions,
    iat: now,
    exp: now + JWT_EXPIRES_IN_SECONDS
  };

  const encodedHeader =
    base64UrlEncode(
      JSON.stringify(header)
    );

  const encodedPayload =
    base64UrlEncode(
      JSON.stringify(payload)
    );

  const unsignedToken =
    `${encodedHeader}.${encodedPayload}`;

  const signature =
    crypto
      .createHmac(
        "sha256",
        JWT_SECRET
      )
      .update(unsignedToken)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

  return `${unsignedToken}.${signature}`;
}


/* =========================================
   FIND ADMIN USER
   ========================================= */

function findAdminUser(username) {
  const users = loadAdminUsers();

  const normalizedUsername =
    String(username || "").trim();

  return users.find((user) =>
    user &&
    user.active !== false &&
    safeCompare(
      String(user.username || "").trim(),
      normalizedUsername
    )
  );
}


/* =========================================
   BUILD ADMIN PERMISSIONS
   ========================================= */

function getPermissionsForRole(role) {
  const rolePermissions =
    loadRolePermissions();

  const permissions =
    rolePermissions[role];

  if (!Array.isArray(permissions)) {
    throw new Error(
      `No permissions configured for role: ${role}`
    );
  }

  return [
    ...new Set(
      permissions.filter(
        (permission) =>
          typeof permission === "string" &&
          permission.trim() !== ""
      )
    )
  ];
}


/* =========================================
   LOGIN
   ========================================= */

async function login(username, password) {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error(
      "Admin credentials are not configured."
    );
  }

  if (!JWT_SECRET) {
    throw new Error(
      "JWT secret is not configured."
    );
  }

  const normalizedUsername =
    String(username || "").trim();

  /*
   * Environment username remains the
   * authentication credential source.
   */
  if (
    !safeCompare(
      normalizedUsername,
      ADMIN_USERNAME
    )
  ) {
    return null;
  }

  if (
    !safeCompare(
      String(password || ""),
      ADMIN_PASSWORD
    )
  ) {
    return null;
  }

  /*
   * Load the corresponding admin record.
   */
  const adminUser =
    findAdminUser(
      normalizedUsername
    );

  if (!adminUser) {
    throw new Error(
      "Authenticated admin user is not configured in admin-users.json."
    );
  }

  if (!adminUser.id) {
    throw new Error(
      "Admin user ID is missing."
    );
  }

  if (!adminUser.role) {
    throw new Error(
      "Admin user role is missing."
    );
  }

  /*
   * Load permissions from the centralized
   * role-permission mapping.
   */
  const permissions =
    getPermissionsForRole(
      adminUser.role
    );

  const admin = {
    id: adminUser.id,
    username: normalizedUsername,
    role: adminUser.role,
    permissions
  };

  const token =
    createToken(admin);

  return {
    admin,
    token
  };
}


/* =========================================
   EXPORT
   ========================================= */

module.exports = {
  login
};
