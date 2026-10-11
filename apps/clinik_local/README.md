# ClinikLocal (MicroApp 1) - Primera Versión Operativa
## Gestión Clínica y Dental Local-First Multiplataforma

---

## 🌟 Resumen del Producto

**ClinikLocal** es una microaplicación médica diseñada para odontólogos y médicos especialistas independientes, construida bajo el principio **Local-First**:
* **100% Local:** Todos los datos (pacientes, historiales clínicos, recetas, turnos) se guardan directamente en el dispositivo del profesional sin intermediarios ni tarifas de servidor obligatorias.
* **Comunicación Inmediata con Pacientes:** Integración directa con WhatsApp para confirmación de citas y envío de recetas con un solo clic (`wa.me`).
* **Odontograma Interactivo (FDI):** Mapeo gráfico de arcadas dentales superior e inferior con 32 piezas y selector de estados (Sano, Caries, Restaurado, Endodoncia, Ausente).
* **Emisión de Recetas en PDF:** Previsualización en tiempo real con membrete profesional e impresión / descarga en PDF.
* **Respaldo Local y Servicio Cloud Add-on:** Exportación/restauración de snapshots `.clinik` en el equipo y simulación del servicio comercial de respaldo cifrado en la nube.

---

## 🚀 Cómo Ejecutar la Primera Versión en este Equipo

### Opción 1: Servidor Local Rápido (Recomendado)
```bash
# Iniciar servidor local
./apps/clinik_local/start.sh
```
Abre en tu navegador favorito: **[http://localhost:8080](http://localhost:8080)**

### Opción 2: Abrir Directamente el Archivo HTML
También puedes hacer doble clic o abrir directamente en cualquier navegador:
`apps/clinik_local/index.html`

---

## 📱 Empaquetado Multiplataforma Nativo

Para distribuir como binarios instalables autónomos en cada sistema operativo:

1. **Escritorio (Windows, macOS, Linux):**
   * **Tauri / Electron:** Empaqueta `index.html`, `styles.css` y `app.js` en instaladores ligeros nativos (`.exe` para Windows, `.dmg` para macOS, `.AppImage` para Linux) con almacenamiento local SQLite embebido.
2. **Móviles (Android, iOS / iPhone):**
   * **Capacitor / Flutter:** Compila como aplicación nativa para Android (`.apk` / Play Store) y para iOS (`.ipa` / App Store / TestFlight) con acceso a cámara, contactos y esquemas de llamada a WhatsApp.

---

## 🧪 Pruebas Automatizadas (TDD)

```bash
python3 apps/clinik_local/test_clinik_core.py -v
```
Verifica:
* Sanitización de números internacionales y generación de links de WhatsApp.
* Integridad de piezas dentales FDI (cuadrantes 1 al 4) y máquina de estados.
* Serialización e importación del archivo de respaldo local `.clinik`.
* Formateo de recetas médicas para WhatsApp.
