import crypto from "crypto";

export class WherebyAdapter {
  constructor({ apiKey = "whereby_api_key" } = {}) {
    this.apiKey = apiKey;
  }

  async createEphemeralRoom({ durationMinutes = 60, roomNamePrefix = "plat01" }) {
    const roomId = crypto.randomUUID().substring(0, 8);
    const roomName = `/${roomNamePrefix}-${roomId}`;
    const endDate = new Date(Date.now() + durationMinutes * 60 * 1000);

    return {
      roomName,
      roomUrl: `https://plataforma01.whereby.com${roomName}?roomKey=guest_${crypto.randomUUID().substring(0, 8)}`,
      hostRoomUrl: `https://plataforma01.whereby.com${roomName}?roomKey=host_${crypto.randomUUID().substring(0, 8)}`,
      durationMinutes,
      expiresAt: endDate.toISOString(),
      features: {
        screenshare: true,
        chat: true,
        recording: true,
        miroWhiteboard: true
      }
    };
  }
}
