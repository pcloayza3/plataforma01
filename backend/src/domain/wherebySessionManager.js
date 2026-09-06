import crypto from "crypto";

export class WherebySessionManager {
  constructor(wherebyAdapter) {
    this.wherebyAdapter = wherebyAdapter;
    this.sessions = new Map();
  }

  async createSession({ projectId, milestoneId, studentId, consultantId, miroBoardId = null, durationMinutes = 60 }) {
    if (!studentId || !consultantId) {
      throw new Error("Se requiere estudiante y consultor para iniciar la sesión.");
    }

    const sessionId = `ses_${crypto.randomUUID()}`;
    const roomResult = await this.wherebyAdapter.createEphemeralRoom({
      durationMinutes,
      roomNamePrefix: `plat01-${projectId ? projectId.substring(0, 8) : "demo"}`
    });

    const session = {
      id: sessionId,
      projectId,
      milestoneId,
      studentId,
      consultantId,
      durationMinutes,
      roomUrl: roomResult.roomUrl,
      hostRoomUrl: roomResult.hostRoomUrl,
      miroBoardId: miroBoardId || "miro-board-default",
      miroEmbedUrl: `https://miro.com/app/live-embed/${miroBoardId || "uXjV..."}`,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      expiresAt: roomResult.expiresAt,
      transcript: null
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  endSession(sessionId, aiTranscriptSummary = "") {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Sesión ${sessionId} no encontrada.`);

    session.status = "COMPLETED";
    session.endedAt = new Date().toISOString();
    session.transcript = {
      summary: aiTranscriptSummary || "Transcripción procesada: Se revisaron los avances del hito y se acordaron ajustes de metodología.",
      generatedAt: new Date().toISOString()
    };

    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
}
