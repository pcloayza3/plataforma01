import test from "node:test";
import assert from "node:assert/strict";
import { AntiLinkSanitizer } from "../src/domain/antiLinkSanitizer.js";

test("AntiLinkSanitizer: permite texto limpio sin datos de contacto ni URLs", () => {
  const cleanBio = "Docente universitario especialista en metodologías ágiles y tesis de posgrado.";
  assert.equal(AntiLinkSanitizer.validate(cleanBio), true);
});

test("AntiLinkSanitizer: detecta y bloquea URLs externas", () => {
  assert.throws(() => AntiLinkSanitizer.validate("Visita https://midespacho.com para contratarme"), /enlaces externos/);
  assert.throws(() => AntiLinkSanitizer.validate("Escríbeme a www.consultoria.bo"), /enlaces externos/);
});

test("AntiLinkSanitizer: detecta y bloquea emails personales", () => {
  assert.throws(() => AntiLinkSanitizer.validate("Mi correo es contacto@gmail.com para coordinar"), /correos electrónicos/);
});

test("AntiLinkSanitizer: detecta y bloquea números telefónicos", () => {
  assert.throws(() => AntiLinkSanitizer.validate("Llámame al 71234567 para cotizar"), /números telefónicos/);
  assert.throws(() => AntiLinkSanitizer.validate("WhatsApp: +591 78901234"), /números telefónicos/);
});

test("AntiLinkSanitizer: sanitiza y censura enlaces y teléfonos en textos", () => {
  const dirty = "Hola mi mail es asesor@yahoo.com y mi web es www.asesor.bo";
  const sanitized = AntiLinkSanitizer.sanitize(dirty);
  assert.ok(!sanitized.includes("@yahoo.com"));
  assert.ok(!sanitized.includes("www.asesor.bo"));
  assert.ok(sanitized.includes("[DATO DE CONTACTO BLOQUEADO]"));
});
