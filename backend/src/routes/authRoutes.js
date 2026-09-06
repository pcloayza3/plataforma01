import express from "express";
import crypto from "crypto";
import { AntiLinkSanitizer } from "../domain/antiLinkSanitizer.js";

export const authRouter = express.Router();

// Mock database in-memory
export const usersDb = [
  {
    id: "usr_consultant_01",
    role: "CONSULTANT",
    name: "Dr. Carlos Mendoza",
    email: "cmendoza@universidad.edu.bo",
    degree: "Ph.D. en Ciencias de la Computación",
    bio: "Especialista en Inteligencia Artificial y Metodología de Investigación para Tesis de Grado y Posgrado.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    bankAccount: "BNB-BO-9876543210",
    hourlyRateBOB: 120
  },
  {
    id: "usr_student_01",
    role: "STUDENT",
    name: "Ana Flores",
    email: "ana.flores@estudiante.edu.bo",
    degree: "Licenciatura en Ingeniería de Sistemas",
    bio: "Estudiante de último año trabajando en Tesis de Grado sobre Machine Learning aplicado a salud.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  {
    id: "usr_company_01",
    role: "COMPANY",
    name: "Fintech Andina S.A.",
    email: "contacto@fintechandina.bo",
    bio: "Empresa líder en tecnología financiera y banca móvil en Bolivia.",
    avatarUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150"
  },
  {
    id: "usr_institution_01",
    role: "INSTITUTION",
    name: "Universidad Mayor de San Andrés (UMSA)",
    email: "convenios@umsa.bo",
    bio: "Facultad de Ciencias Puras y Naturales - Carrera de Informática.",
    avatarUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150"
  }
];

// Registro de usuarios con validación anti-desintermediación
authRouter.post("/register", (req, res) => {
  try {
    const { name, email, role, bio, degree, avatarUrl, bankAccount, hourlyRateBOB } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Nombre, email y rol son requeridos." });
    }

    // Regla anti-desintermediación: sanitizar bio / currículum
    if (bio) {
      AntiLinkSanitizer.validate(bio);
    }

    const newUser = {
      id: `usr_${crypto.randomUUID()}`,
      name,
      email,
      role,
      bio: bio ? AntiLinkSanitizer.sanitize(bio) : "",
      degree: degree || "",
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      bankAccount: bankAccount || "",
      hourlyRateBOB: hourlyRateBOB || 100,
      createdAt: new Date().toISOString()
    };

    usersDb.push(newUser);
    return res.status(201).json({ message: "Usuario registrado con éxito.", user: newUser });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Login
authRouter.post("/login", (req, res) => {
  const { email } = req.body;
  const user = usersDb.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }
  return res.json({ token: `mock_jwt_${user.id}`, user });
});

// Listar perfiles
authRouter.get("/profiles", (req, res) => {
  const { role } = req.query;
  const filtered = role ? usersDb.filter(u => u.role === role.toUpperCase()) : usersDb;
  return res.json(filtered);
});

// Obtener perfil por ID
authRouter.get("/profiles/:id", (req, res) => {
  const user = usersDb.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Perfil no encontrado." });
  return res.json(user);
});

// Actualizar perfil
authRouter.put("/profiles/:id", (req, res) => {
  const user = usersDb.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Perfil no encontrado." });

  try {
    const { bio, degree, avatarUrl, bankAccount, hourlyRateBOB } = req.body;
    if (bio) {
      AntiLinkSanitizer.validate(bio);
      user.bio = AntiLinkSanitizer.sanitize(bio);
    }
    if (degree !== undefined) user.degree = degree;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bankAccount !== undefined) user.bankAccount = bankAccount;
    if (hourlyRateBOB !== undefined) user.hourlyRateBOB = hourlyRateBOB;

    return res.json({ message: "Perfil actualizado correctamente.", user });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
