import test from "node:test";
import assert from "node:assert/strict";
import { AntiLinkSanitizer } from "../src/domain/antiLinkSanitizer.js";

test("QA Seguridad: Detección de evasión en mayúsculas y protocolos alternativos", () => {
  assert.throws(() => AntiLinkSanitizer.validate("Mira mi perfil en HTTPS://MIWEB.COM"), /enlaces externos/);
  assert.throws(() => AntiLinkSanitizer.validate("Entra a HTTP://CONSULTOR.BO"), /enlaces externos/);
  assert.throws(() => AntiLinkSanitizer.validate("Visita WWW.PLATAFORMA-EXTERNA.NET"), /enlaces externos/);
});

test("QA Seguridad: Detección de números telefónicos con guiones o paréntesis", () => {
  assert.throws(() => AntiLinkSanitizer.validate("WhatsApp: (591) 7123-4567"), /números telefónicos/);
  assert.throws(() => AntiLinkSanitizer.validate("Tel: +591-70012345"), /números telefónicos/);
  assert.throws(() => AntiLinkSanitizer.validate("Escríbeme al 78945612 directo"), /números telefónicos/);
});

test("QA Seguridad: Sanitización completa en bloques de texto mixtos", () => {
  const attackVector = "Contactar a dr.carlos@consultoria.edu.bo o llamar a +591 71234567 o entrar a www.asesoriaprivada.bo";
  const sanitized = AntiLinkSanitizer.sanitize(attackVector);
  
  assert.ok(!sanitized.includes("@consultoria.edu.bo"));
  assert.ok(!sanitized.includes("+591 71234567"));
  assert.ok(!sanitized.includes("www.asesoriaprivada.bo"));
  assert.equal((sanitized.match(/\[DATO DE CONTACTO BLOQUEADO\]/g) || []).length, 3);
});
