import crypto from "crypto";

export class R2StorageAdapter {
  constructor({ bucket = "plataforma01-storage", endpoint = "https://<account-id>.r2.cloudflarestorage.com" } = {}) {
    this.bucket = bucket;
    this.endpoint = endpoint;
    this.allowedExtensions = ["pdf", "docx", "xlsx", "pptx", "jpg", "jpeg", "png"];
    this.maxFileSizeBytes = 25 * 1024 * 1024; // 25 MB
  }

  generateUploadUrl({ fileName, fileSizeBytes, contentType }) {
    if (fileSizeBytes > this.maxFileSizeBytes) {
      throw new Error(`El archivo supera el límite de 25 MB (tamaño: ${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB).`);
    }

    const ext = fileName.split(".").pop().toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new Error(`Extensión '.${ext}' no permitida. Formatos válidos: ${this.allowedExtensions.join(", ")}.`);
    }

    const fileKey = `uploads/${crypto.randomUUID()}-${fileName}`;
    const uploadUrl = `${this.endpoint}/${this.bucket}/${fileKey}?X-Amz-Expires=3600&X-Amz-Signature=${crypto.randomUUID()}`;
    const publicDownloadUrl = `https://storage.plataforma01.com/${fileKey}`;

    return {
      fileKey,
      uploadUrl,
      publicDownloadUrl,
      expiresInSeconds: 3600,
      contentType
    };
  }
}
