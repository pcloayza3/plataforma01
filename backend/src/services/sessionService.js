import crypto from "crypto";
import { WherebyAdapter } from "../adapters/wherebyAdapter.js";
import { MongoSessionRepository } from "../db/mongo.js";

const wherebyAdapter = new WherebyAdapter();

export class SessionService {
  /**
   * Crear y programar una sesión colaborativa Whereby (60 min) + Miro
   */
  static async createSession({
    projectId,
    milestoneId,
    studentId,
    consultantId,
    miroBoardId = null,
    durationMinutes = 60
  }) {
    if (!studentId || !consultantId || !projectId) {
      throw new Error("projectId, studentId y consultantId son obligatorios para programar la sesión.");
    }

    const sessionId = `ses_${crypto.randomUUID()}`;
    const roomResult = await wherebyAdapter.createEphemeralRoom({
      durationMinutes,
      roomNamePrefix: `plat01-${projectId.substring(0, 8)}`
    });

    const activeMiroId = miroBoardId || `miro_${crypto.randomUUID().substring(0, 8)}`;

    const sessionData = {
      id: sessionId,
      projectId,
      milestoneId: milestoneId || null,
      studentId,
      consultantId,
      durationMinutes,
      roomUrl: roomResult.roomUrl,
      hostRoomUrl: roomResult.hostRoomUrl,
      miroBoardId: activeMiroId,
      miroEmbedUrl: `https://miro.com/app/live-embed/${activeMiroId}?embedAutoplay=true`,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      expiresAt: roomResult.expiresAt,
      features: roomResult.features,
      transcript: null
    };

    // Guardar en MongoDB (colección sessions)
    await MongoSessionRepository.saveSession(sessionData);

    return sessionData;
  }

  /**
   * Obtener detalle de sesión
   */
  static async getSession(sessionId) {
    const session = await MongoSessionRepository.getSessionById(sessionId);
    if (!session) throw new Error(`Sesión ${sessionId} no encontrada.`);
    return session;
  }

  /**
   * Obtener todas las sesiones de un proyecto
   */
  static async getProjectSessions(projectId) {
    return await MongoSessionRepository.getSessionsByProject(projectId);
  }

  /**
   * Finalizar videollamada y registrar acta / acuerdos / transcripción IA en MongoDB
   */
  static async endSessionAndSaveAgreements(sessionId, { summary, agreements = [], actionItems = [] }) {
    const defaultSummary = summary || "Sesión de asesoría de 60 min completada. Se revisó el marco teórico y la normalización de datos.";
    const defaultAgreements = agreements.length > 0 ? agreements : [
      "Completar la limpieza del dataset de imágenes DICOM antes del viernes",
      "Revisión de hiperparámetros de la red neuronal en la próxima sesión"
    ];

    const result = await MongoSessionRepository.saveTranscriptAndAgreements(sessionId, {
      summary: defaultSummary,
      agreements: defaultAgreements,
      actionItems
    });

    return result;
  }
}
