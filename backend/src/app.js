import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes.js";
import { projectRouter } from "./routes/projectRoutes.js";
import { escrowRouter } from "./routes/escrowRoutes.js";
import { paymentRouter } from "./routes/paymentRoutes.js";
import { sessionRouter } from "./routes/sessionRoutes.js";
import { ratingRouter } from "./routes/ratingRoutes.js";
import { storageRouter } from "./routes/storageRoutes.js";

export const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "thesisbridge-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Rutas de API
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/escrow", escrowRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/ratings", ratingRouter);
app.use("/api/storage", storageRouter);

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada.` });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({ error: "Error interno del servidor.", details: err.message });
});
