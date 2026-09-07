import { query } from "./index.js";

export class DocumentRepository {
  /**
   * Registrar metadatos de un entregable en PostgreSQL
   */
  static async createDocument({
    id,
    projectId,
    milestoneId = null,
    uploadedBy,
    fileName,
    fileSizeBytes,
    fileExtension,
    storageKey,
    publicUrl
  }) {
    const text = `
      INSERT INTO project_documents (
        id, project_id, milestone_id, uploaded_by,
        file_name, file_size_bytes, file_extension, storage_key, public_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      id, projectId, milestoneId, uploadedBy,
      fileName, fileSizeBytes, fileExtension, storageKey, publicUrl
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  /**
   * Listar entregables de un proyecto o hito
   */
  static async getDocumentsByProject(projectId, milestoneId = null) {
    let text = `
      SELECT d.*, u.full_name AS uploader_name
      FROM project_documents d
      LEFT JOIN profiles u ON u.user_id = d.uploaded_by
      WHERE d.project_id = $1
    `;
    const params = [projectId];
    if (milestoneId) {
      text += ` AND d.milestone_id = $2`;
      params.push(milestoneId);
    }
    text += ` ORDER BY d.created_at DESC;`;

    const res = await query(text, params);
    return res.rows;
  }
}
