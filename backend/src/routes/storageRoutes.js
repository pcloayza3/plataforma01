import express from "express";
import crypto from "crypto";
import { R2StorageAdapter } from "../adapters/r2StorageAdapter.js";
import { DocumentRepository } from "../db/documentRepository.js";

export const storageRouter = express.Router();
export const r2Adapter = new R2StorageAdapter();

/**
 * POST /api/storage/presigned-url
 * Generar URL prefirmada para subida a Cloudflare R2 / S3 y registrar entregable
 */
storageRouter.post("/presigned-url", async (req, res) => {
  try {
    const { fileName, fileSizeBytes, contentType, projectId, milestoneId, uploadedBy } = req.body;
    if (!fileName || !fileSizeBytes) {
      return res.status(400).json({ error: "fileName y fileSizeBytes son requeridos." });
    }

    // 1. Generar URL prefirmada validando tipo y tamaño (máx 25 MB)
    const presigned = r2Adapter.generateUploadUrl({
      fileName,
      fileSizeBytes: Number(fileSizeBytes),
      contentType: contentType || "application/pdf"
    });

    // 2. Registrar en PostgreSQL si se incluye proyecto
    if (projectId && uploadedBy) {
      try {
        const ext = fileName.split(".").pop().toLowerCase();
        await DocumentRepository.createDocument({
          id: `doc_${crypto.randomUUID()}`,
          projectId,
          milestoneId: milestoneId || null,
          uploadedBy,
          fileName,
          fileSizeBytes: Number(fileSizeBytes),
          fileExtension: ext,
          storageKey: presigned.fileKey,
          publicUrl: presigned.publicDownloadUrl
        });
      } catch (dbErr) {
        console.warn("[Storage] Error guardando metadatos en BD:", dbErr.message);
      }
    }

    return res.json(presigned);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/storage/project/:projectId
 * Listar entregables de un proyecto
 */
storageRouter.get("/project/:projectId", async (req, res) => {
  try {
    const { milestoneId } = req.query;
    const docs = await DocumentRepository.getDocumentsByProject(req.params.projectId, milestoneId);
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
