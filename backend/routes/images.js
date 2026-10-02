/**
 * Al-Dahayan Trading Company
 * Unified Image Management API
 *
 * File:
 * backend/routes/images.js
 *
 * Purpose:
 * Admin-controlled image registry and storage API.
 */

const express = require("express");

const {
    requireAuth,
    requirePermission
} = require("../auth/middleware");

const {
    registerImage,
    getImageById,
    listImages,
    updateImage,
    deactivateImage
} = require("../services/imageStorageService");

const router = express.Router();


/* =========================================================
   GET ALL IMAGES
   Permission: image.view
========================================================= */

router.get(
    "/",
    requireAuth,
    requirePermission("image.view"),
    (req, res) => {
        try {
            const filters = {
                entityType:
                    req.query.entityType || undefined,

                entityId:
                    req.query.entityId || undefined,

                type:
                    req.query.type || undefined,

                active:
                    req.query.active === undefined
                        ? undefined
                        : req.query.active === "true"
            };

            const images =
                listImages(filters);

            res.json({
                success: true,
                count: images.length,
                images
            });
        } catch (error) {
            console.error(
                "Image list error:",
                error
            );

            res.status(500).json({
                success: false,
                error:
                    "Failed to load image registry"
            });
        }
    }
);


/* =========================================================
   GET IMAGE BY ID
   Permission: image.view
========================================================= */

router.get(
    "/:imageId",
    requireAuth,
    requirePermission("image.view"),
    (req, res) => {
        try {
            const image =
                getImageById(
                    req.params.imageId
                );

            if (!image) {
                return res.status(404).json({
                    success: false,
                    error:
                        "Image not found"
                });
            }

            res.json({
                success: true,
                image
            });
        } catch (error) {
            console.error(
                "Image lookup error:",
                error
            );

            res.status(500).json({
                success: false,
                error:
                    "Failed to load image"
            });
        }
    }
);


/* =========================================================
   UPLOAD IMAGE
   Permission: image.upload
========================================================= */

router.post(
    "/",
    requireAuth,
    requirePermission("image.upload"),
    (req, res) => {
        try {
            const {
                imageBase64,
                mimeType,
                entityType,
                entityId,
                entityName,
                type,
                altText,
                altTextArabic,
                caption,
                captionArabic,
                isPrimary
            } = req.body || {};

            if (!imageBase64) {
                return res.status(400).json({
                    success: false,
                    error:
                        "imageBase64 is required"
                });
            }

            if (!mimeType) {
                return res.status(400).json({
                    success: false,
                    error:
                        "mimeType is required"
                });
            }

            if (!entityType) {
                return res.status(400).json({
                    success: false,
                    error:
                        "entityType is required"
                });
            }

            if (!type) {
                return res.status(400).json({
                    success: false,
                    error:
                        "image type is required"
                });
            }

            const base64Data =
                imageBase64.includes(",")
                    ? imageBase64.split(",")[1]
                    : imageBase64;

            const buffer =
                Buffer.from(
                    base64Data,
                    "base64"
                );

            const image =
                registerImage({
                    buffer,
                    mimeType,
                    entityType,
                    entityId,
                    entityName,
                    type,
                    altText,
                    altTextArabic,
                    caption,
                    captionArabic,
                    isPrimary
                });

            res.status(201).json({
                success: true,
                message:
                    "Image uploaded successfully",
                image
            });
        } catch (error) {
            console.error(
                "Image upload error:",
                error
            );

            res.status(400).json({
                success: false,
                error:
                    error.message ||
                    "Failed to upload image"
            });
        }
    }
);


/* =========================================================
   UPDATE IMAGE
   Permission: image.edit
========================================================= */

router.put(
    "/:imageId",
    requireAuth,
    requirePermission("image.edit"),
    (req, res) => {
        try {
            const image =
                updateImage(
                    req.params.imageId,
                    req.body || {}
                );

            if (!image) {
                return res.status(404).json({
                    success: false,
                    error:
                        "Image not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Image updated successfully",
                image
            });
        } catch (error) {
            console.error(
                "Image update error:",
                error
            );

            res.status(400).json({
                success: false,
                error:
                    error.message ||
                    "Failed to update image"
            });
        }
    }
);


/* =========================================================
   DELETE / DEACTIVATE IMAGE
   Permission: image.delete
========================================================= */

router.delete(
    "/:imageId",
    requireAuth,
    requirePermission("image.delete"),
    (req, res) => {
        try {
            const image =
                deactivateImage(
                    req.params.imageId
                );

            if (!image) {
                return res.status(404).json({
                    success: false,
                    error:
                        "Image not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Image deactivated successfully",
                image
            });
        } catch (error) {
            console.error(
                "Image delete error:",
                error
            );

            res.status(400).json({
                success: false,
                error:
                    error.message ||
                    "Failed to deactivate image"
            });
        }
    }
);


module.exports = router;
