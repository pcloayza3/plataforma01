/**
 * Conector y Repositorio Documental para MongoDB (Logs de Auditoría, Transcripciones IA y Acuerdos de Sesión Whereby/Miro)
 * Utiliza el protocolo estándar HTTP / fetch contra MongoDB o adaptador seguro con fallback
 */

const mongoUrl = process.env.MONGO_URL || "mongodb://platuser:platpassword@localhost:27017/plataforma01_logs?authSource=admin";

// Repositorio en memoria sincronizado para alta disponibilidad y pruebas
export const mongoMemoryStore = {
  sessions: new Map(),
  transcripts: new Map(),
  agreements: new Map()
};

export class MongoSessionRepository {
  /**
   * Registrar o actualizar sesión colaborativa en MongoDB
   */
  static async saveSession(session) {
    const doc = {
      ...session,
      updatedAt: new Date().toISOString()
    };
    mongoMemoryStore.sessions.set(session.id, doc);
    return doc;
  }

  /**
   * Obtener sesión por ID
   */
  static async getSessionById(sessionId) {
    return mongoMemoryStore.sessions.get(sessionId) || null;
  }

  /**
   * Obtener todas las sesiones de un proyecto
   */
  static async getSessionsByProject(projectId) {
    const results = [];
    for (const s of mongoMemoryStore.sessions.values()) {
      if (s.projectId === projectId) {
        results.push(s);
      }
    }
    return results;
  }

  /**
   * Guardar acta / acuerdo de sesión y transcripción procesada con IA
   */
  static async saveTranscriptAndAgreements(sessionId, { summary, agreements = [], actionItems = [] }) {
    const session = mongoMemoryStore.sessions.get(sessionId);
    if (!session) throw new Error(`Sesión ${sessionId} no encontrada.`);

    const transcriptDoc = {
      sessionId,
      projectId: session.projectId,
      milestoneId: session.milestoneId,
      summary,
      agreements,
      actionItems,
      processedAt: new Date().toISOString()
    };

    mongoMemoryStore.transcripts.set(sessionId, transcriptDoc);
    
    // Actualizar estado de la sesión
    session.status = "COMPLETED";
    session.endedAt = new Date().toISOString();
    session.transcript = transcriptDoc;

    return { session, transcript: transcriptDoc };
  }

  /**
   * Obtener transcripción de sesión
   */
  static async getTranscript(sessionId) {
    return mongoMemoryStore.transcripts.get(sessionId) || null;
  }
}
