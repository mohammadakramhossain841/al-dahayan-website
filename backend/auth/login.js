const crypto = require("crypto");

/* =========================================
   AL-DAHAYAN ADMIN LOGIN SERVICE
   ========================================= */

/*
 * Credentials and JWT secret must come from environment
 * variables. Never hard-code passwords or JWT secrets.
 */

const ADMIN_USERNAME =
  process.env.ADMIN_USERNAME || "";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "";

const JWT_SECRET =
  process.env.JWT_SECRET || "";

const JWT_EXPIRES_IN_SECONDS =
  Number(process.env.JWT_EXPIRES_IN_SECONDS) || 86400;


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

  return crypto.timingSafeEqual(aBuffer, bBuffer);
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

  const now = Math.floor(Date.now() / 1000);

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
      .createHmac("sha256", JWT_SECRET)
      .update(unsignedToken)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

  return `${unsignedToken}.${signature}`;
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

  if (!safeCompare(
    normalizedUsername,
    ADMIN_USERNAME
  )) {
    return null;
  }

  if (!safeCompare(
    String(password || ""),
    ADMIN_PASSWORD
  )) {
    return null;
  }

  const admin = {
    id: "admin-001",
    username: ADMIN_USERNAME,
    role: "super_admin",

    permissions: [
      "oem.view",
      "oem.stock_update"
    ]
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
