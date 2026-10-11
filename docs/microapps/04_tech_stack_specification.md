# Especificación del Stack Tecnológico
## MicroApp 1: ClinikLocal (Gestión Clínica y Dental Local-First Multiplataforma)

---

## 1. Criterios de Selección Tecnológica

Para cumplir los requisitos estrictos de:
1. **Multiplataforma universal:** Android, iOS (iPhone), Windows, macOS y Linux con una única base de código.
2. **Local-First estricto:** Persistencia local instantánea, cero dependencia de red para atención diaria, cero latencia.
3. **Privacidad y cifrado:** Cifrado en reposo para datos de salud y copias de seguridad de conocimiento cero (*Zero-Knowledge*).
4. **Integración WhatsApp fluida:** Capacidad de invocar enlaces profundos y compartir recetas sin servidores intermediarios.

---

## 2. Stack Tecnológico Seleccionado

| Capa / Componente | Tecnología Seleccionada | Justificación Técnica y Estándar |
| :--- | :--- | :--- |
| **Arquitectura de Software** | **Clean Architecture + Local-First** | Desacoplamiento total entre interfaz de usuario, lógica médica de dominio y almacenamiento local. |
| **Framework Multiplataforma Core** | **Flutter (Dart 3.x)** *(Alternativa Web/PWA complementaria: HTML5/Vanilla JS/TypeScript + Tailwind)* | Compilación nativa para Android, iOS, Windows, macOS y Linux con acelerador de renderizado y rendimiento de 60fps. |
| **Motor de Base de Datos Local** | **SQLite + Drift / SQFlite FFI** con cifrado **SQLCipher (AES-256)** | Motor embebido ligero, transaccional, estándar de la industria médica para almacenamiento sin servidor local. |
| **Generación de Recetas en PDF** | **PDF Kit Nativo (dart:pdf / pdfmake)** | Creación de archivos PDF vectoriales de alta definición directamente en el dispositivo, con membrete y firma. |
| **Módulo de Comunicación WhatsApp** | **URL Launcher / wa.me / esquemas URI** | Invoca la app nativa de WhatsApp en móviles y WhatsApp Web / Desktop en computadoras sin coste de APIs. |
| **Motor Criptográfico de Respaldo** | **AES-256-GCM + PBKDF2** | Cifrado simétrico del snapshot de datos derivado de contraseña maestra antes de salir del dispositivo. |
| **Infraestructura Cloud de Respaldo (Add-on)** | **Cloudflare R2 / AWS S3 + Node.js Microservicio** | Almacenamiento seguro de objetos con costo cero de egreso (*$0 egress fees*) para alojar los respaldos cifrados. |

---

## 3. Estructura de Directorios del Proyecto

```
clinik_local/
├── src/
│   ├── core/                    # Utilidades de cifrado, formateador WhatsApp, generador PDF
│   ├── domain/                  # Entidades (Paciente, Consulta, Cita, Receta) y Casos de Uso
│   ├── data/                    # Repositorio SQLite, DAOs locales, adaptador de backup
│   └── presentation/            # Vistas minimalistas y componentes de UI
│       ├── screens/
│       │   ├── patients_screen  # Directorio y ficha del paciente
│       │   ├── clinical_record  # Historia médica y odontograma
│       │   ├── agenda_screen    # Calendario y recordatorios WhatsApp
│       │   ├── prescription     # Emisor de recetas y PDF
│       │   └── backup_screen    # Respaldo local y nube
│       └── components/          # Botones, modales limpios, tarjetas minimalistas
```
