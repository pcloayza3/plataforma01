import express from "express";
import { R2StorageAdapter } from "../adapters/r2StorageAdapter.js";

export const storageRouter = express.Router();
export const r2Adapter = new R2StorageAdapter();

// Generar URL prefirmada para subida de archivos (Cloudflare R2 / S3)
storageRouter.post("/presigned-url", (req, res) => {
  try {
    const { fileName, fileSizeBytes, contentType } = req.body;
    if (!fileName || !fileSizeBytes) {
      return res.status(400).json({ error: "fileName y fileSizeBytes son requeridos." });
    }

    const presigned = r2Adapter.generateUploadUrl({
      fileName,
      fileSizeBytes: Number(fileSizeBytes),
      contentType: contentType || "application/pdf"
    });

    return res.json(presigned);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
