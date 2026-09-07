import { app } from "./app.js";
import { initDbConnection } from "./db/index.js";

const PORT = process.env.PORT || 4000;

// Inicializar conexión a PostgreSQL
initDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`[plataforma01-backend] Servidor REST escuchando en http://localhost:${PORT}`);
    console.log(`[plataforma01-backend] Healthcheck disponible en http://localhost:${PORT}/health`);
  });
}).catch(err => {
  console.error("[plataforma01-backend] Error inicializando servidor:", err);
  process.exit(1);
});
