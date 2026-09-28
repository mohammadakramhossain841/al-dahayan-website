const crypto = require("crypto");

/* =========================================
   AL-DAHAYAN ADMIN AUTH MIDDLEWARE
   Authentication + Permission Control
   ========================================= */

const JWT_SECRET =
  process.env.JWT_SECRET || "";


/* =========================================
   BASE64URL DECODER
   ========================================= */

function base64UrlDecode(value) {
  const normalized =
    String(value || "")
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const padding =
    normalized.length % 4;

  const padded =
    padding === 0
      ? normalized
      : normalized + "=".repeat(4 - padding);

  return Buffer
    .from(padded, "base64")
    .toString("utf8");
}


/* =========================================
   SAFE SIGNATURE COMPARISON
   ========================================= */

function safeSignatureCompare(
  expectedSignature,
  receivedSignature
) {
  const expected =
    Buffer.from(
      String(expectedSignature || "")
    );

  const received =
    Buffer.from(
      String(receivedSignature || "")
    );

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expected,
    received
  );
}


/* =========================================
   VERIFY JWT
   ========================================= */

function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  const parts =
    String(token || "").split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [
    encodedHeader,
    encodedPayload,
    receivedSignature
  ] = parts;

  const unsignedToken =
    `${encodedHeader}.${encodedPayload}`;

  const expectedSignature =
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

  if (
    !safeSignatureCompare(
      expectedSignature,
      receivedSignature
    )
  ) {
    return null;
  }

  let header;
  let payload;

  try {
    header =
      JSON.parse(
        base64UrlDecode(encodedHeader)
      );

    payload =
      JSON.parse(
        base64UrlDecode(encodedPayload)
      );
  } catch (error) {
    return null;
  }

  if (
    !header ||
    header.alg !== "HS256" ||
    header.typ !== "JWT"
  ) {
    return null;
  }

  const now =
    Math.floor(Date.now() / 1000);

  if (
    !payload ||
    !payload.exp ||
    Number(payload.exp) <= now
  ) {
    return null;
  }

  return payload;
}


/* =========================================
   EXTRACT BEARER TOKEN
   ========================================= */

function getBearerToken(req) {
  const authorization =
    req.headers.authorization;

  if (
    typeof authorization !== "string"
  ) {
    return null;
  }

  const match =
    authorization.match(
      /^Bearer\s+(.+)$/i
    );

  if (!match) {
    return null;
  }

  return match[1].trim() || null;
}


/* =========================================
   REQUIRE AUTHENTICATION
   ========================================= */

function requireAuth(req, res, next) {
  try {
    const token =
      getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const payload =
      verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token"
      });
    }

    req.admin = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      permissions: Array.isArray(
        payload.permissions
      )
        ? payload.permissions
        : []
    };

    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Authentication service error"
    });
  }
}


/* =========================================
   REQUIRE PERMISSION
   ========================================= */

function requirePermission(permission) {
  return function (req, res, next) {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const permissions =
      Array.isArray(req.admin.permissions)
        ? req.admin.permissions
        : [];

    if (
      !permissions.includes(permission)
    ) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }

    next();
  };
}


/* =========================================
   EXPORT
   ========================================= */

module.exports = {
  requireAuth,
  requirePermission,
  verifyToken,
  getBearerToken
};
