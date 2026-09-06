import { app } from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[plataforma01-backend] Servidor REST escuchando en http://localhost:${PORT}`);
  console.log(`[plataforma01-backend] Healthcheck disponible en http://localhost:${PORT}/health`);
});
