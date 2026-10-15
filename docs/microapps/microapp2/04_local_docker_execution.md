# Guía de Contenerización y Ejecución Local
## MicroApp 2: Recordatorio y Notas Visuales Inteligentes (*PostyLocal*)

---

## 1. Visión General de Ejecución

Siguiendo el principio de **simplicidad y cero complicación**, **PostyLocal** se puede ejecutar de forma inmediata en dos modalidades para el entorno de desarrollo y validación, antes de su empaquetado para smartphone:

1. **Modalidad Nativa Directa (Recomendada - Sin Docker ni dependencias):**
   Ejecución directa en el navegador con el script incluido.
2. **Modalidad Contenerizada (Docker & Docker Compose):**
   Empaquetado en un contenedor Nginx ultra-ligero de menos de 15 MB basado en Alpine Linux.

> [!NOTE]
> **En el Smartphone (Android/iOS):**
> La aplicación no utiliza Docker ni servidores. Se instala directamente como un APK independiente en el almacenamiento del celular y opera de forma 100% nativa con SQLite embebido.

---

## 2. Modalidad A: Ejecución Nativa Directa

### Paso 1: Navegar al directorio de la aplicación
```bash
cd /Users/paul/develop/platform01/apps/posty_local
```

### Paso 2: Iniciar la previsualización local
```bash
./start.sh
```
* **URL de acceso:** `http://localhost:8092`
* Se levantará la interfaz interactiva móvil con persistencia local en el navegador, mini-player de audio, modo protector de pantalla (🌙) y simulación de alertas push (🔔).

### Paso 3: Detener la ejecución
Presione `Ctrl + C` en la terminal.

---

## 3. Modalidad B: Ejecución Contenerizada con Docker Compose

### Requisitos Previos
* Docker instalado y en ejecución (`docker --version`).
* Docker Compose (`docker compose version`).

### Paso 1: Navegar al directorio del contenedor
```bash
cd /Users/paul/develop/platform01/apps/posty_local
```

### Paso 2: Construir e iniciar el contenedor en segundo plano
```bash
docker compose up -d --build
```

### Paso 3: Verificar el estado del contenedor
```bash
docker compose ps
```
Deberá mostrar el servicio `posty_local_app` en estado `Up (healthy)` en el puerto `8092->80/tcp`.

### Paso 4: Probar la conectividad
```bash
curl -I http://localhost:8092/index.html
```
* **Respuesta esperada:** `HTTP/1.1 200 OK`

### Paso 5: Detener el contenedor
```bash
docker compose down
```

---

## 4. Estructura de Archivos de Ejecución Local

```
apps/posty_local/
├── Dockerfile           # Imagen ligera Nginx Alpine (< 15 MB)
├── docker-compose.yml   # Orquestación local en puerto 8092 con healthcheck
├── start.sh             # Script de arranque nativo sin Docker
├── index.html           # Interfaz de usuario móvil (PostyBoard)
├── styles.css           # Estilos de post-its, animaciones y modo AOD
├── app.js               # Lógica interactiva en cliente
├── test_posty_core.py   # Suite TDD para validación de lógica y algoritmos
└── core/                # Módulos del Core (Modelos, Parser, Geocercas, SQLite)
```

---

## 5. Control de Puerta de Calidad (Quality Gate)

* **Documento Técnico:** `docs/microapps/microapp2/04_local_docker_execution.md`
* **Rama GitFlow:** `feature/microapp2-04-local-execution`
* **Issue Kanban:** `#36` (Asignado a `pcloayza3` en estado `In Progress`)
* **Estado:** Configuración de contenerización y ejecución local completada y validada.
