/**
 * Filtro de seguridad anti-desintermediación para perfiles y mensajes.
 * Detecta y bloquea URLs, correos electrónicos y números de teléfono.
 */
export class AntiLinkSanitizer {
  // Regex sin flag global para pruebas deterministas
  static get URL_REGEX() {
    return /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9.-]+\.(?:com|bo|org|net|edu|io|co|me|dev)\b)/i;
  }

  static get EMAIL_REGEX() {
    return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;
  }

  static get PHONE_REGEX() {
    return /(\+?\d{1,3}[\s-]?)?\(?\d{2,3}\)?[\s-]?\d{4,5}[\s-]?\d{3,5}|\b\d{7,10}\b/;
  }

  static validate(text) {
    if (!text) return true;

    // Evaluamos primero emails para mensajes específicos
    if (this.EMAIL_REGEX.test(text)) {
      throw new Error("Violación de política: No está permitido incluir correos electrónicos.");
    }
    if (this.URL_REGEX.test(text)) {
      throw new Error("Violación de política: No está permitido incluir enlaces externos (URLs).");
    }
    if (this.PHONE_REGEX.test(text)) {
      throw new Error("Violación de política: No está permitido compartir números telefónicos.");
    }

    return true;
  }

  static sanitize(text) {
    if (!text) return "";

    const urlGlobal = new RegExp(this.URL_REGEX.source, "gi");
    const emailGlobal = new RegExp(this.EMAIL_REGEX.source, "gi");
    const phoneGlobal = new RegExp(this.PHONE_REGEX.source, "g");

    return text
      .replace(emailGlobal, "[DATO DE CONTACTO BLOQUEADO]")
      .replace(urlGlobal, "[DATO DE CONTACTO BLOQUEADO]")
      .replace(phoneGlobal, "[DATO DE CONTACTO BLOQUEADO]");
  }
}
