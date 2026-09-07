import express from "express";
import { AuthService } from "../services/authService.js";
import { UserRepository } from "../db/userRepository.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { AntiLinkSanitizer } from "../domain/antiLinkSanitizer.js";

export const authRouter = express.Router();

// Inicializar usuarios semilla
AuthService.seedInitialUsers().catch(err => console.error("Error sembrando usuarios iniciales:", err));

// 1. Registro de usuario con bcrypt, PostgreSQL y AntiLinkSanitizer
authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, role, fullName, name, bio, degree, avatarUrl, hourlyRateBOB, bankAccount, cvSummary } = req.body;
    const result = await AuthService.register({
      email,
      password: password || "Password123!",
      role,
      fullName: fullName || name,
      name: fullName || name,
      bio,
      degree,
      avatarUrl,
      hourlyRateBOB,
      bankAccount,
      cvSummary
    });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 2. Login con verificación bcrypt y emisión de JWT
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({
      email,
      password: password || "Password123!"
    });
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

// 3. Obtener perfil del usuario autenticado actual (Ruta protegida)
authRouter.get("/me", authenticate, async (req, res) => {
  try {
    const fullUser = await UserRepository.findById(req.user.userId);
    if (!fullUser) return res.status(404).json({ error: "Usuario no encontrado." });

    const { password_hash, ...safeUser } = fullUser;
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Listar consultores certificados para el matching
authRouter.get("/consultants", async (req, res) => {
  try {
    const consultants = await UserRepository.listConsultants();
    return res.json(consultants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Perfil por ID
authRouter.get("/profiles/:id", async (req, res) => {
  try {
    const fullUser = await UserRepository.findById(req.params.id);
    if (!fullUser) return res.status(404).json({ error: "Perfil no encontrado." });

    const { password_hash, ...safeUser } = fullUser;
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Actualizar perfil propio con validación anti-desintermediación (Ruta protegida)
authRouter.put("/profile", authenticate, async (req, res) => {
  try {
    const { bio, degree, avatarUrl, cvSummary, hourlyRateBOB, bankAccount } = req.body;

    if (bio) AntiLinkSanitizer.validate(bio);
    if (cvSummary) AntiLinkSanitizer.validate(cvSummary);

    const fullUser = await UserRepository.findById(req.user.userId);
    if (!fullUser) return res.status(404).json({ error: "Usuario no encontrado." });

    if (fullUser.profile) {
      if (bio !== undefined) fullUser.profile.bio = AntiLinkSanitizer.sanitize(bio);
      if (degree !== undefined) fullUser.profile.degree = degree;
      if (avatarUrl !== undefined) fullUser.profile.avatar_url = avatarUrl;
    }

    if (fullUser.consultantProfile) {
      if (cvSummary !== undefined) fullUser.consultantProfile.cv_summary = AntiLinkSanitizer.sanitize(cvSummary);
      if (hourlyRateBOB !== undefined) fullUser.consultantProfile.hourly_rate_bob = Number(hourlyRateBOB);
      if (bankAccount !== undefined) fullUser.consultantProfile.bank_account = bankAccount;
    }

    return res.json({ message: "Perfil actualizado con éxito.", profile: fullUser.profile });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
