import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../db/userRepository.js";
import { AntiLinkSanitizer } from "../domain/antiLinkSanitizer.js";

const JWT_SECRET = process.env.JWT_SECRET || "plataforma01_super_secret_jwt_key_2026";
const JWT_EXPIRES_IN = "24h";

export class AuthService {
  static async register({
    email,
    password = "Password123!",
    role,
    fullName,
    name,
    bio = "",
    degree = "",
    avatarUrl = "",
    hourlyRateBOB = 100,
    bankAccount = "",
    cvSummary = ""
  }) {
    const userFullName = (fullName || name || "").trim();
    if (!email || !role || !userFullName) {
      throw new Error("Email, rol y nombre completo son obligatorios.");
    }

    // Regla anti-desintermediación estricta (se evalúa primero)
    if (bio) AntiLinkSanitizer.validate(bio);
    if (cvSummary) AntiLinkSanitizer.validate(cvSummary);

    // Verificar unicidad de email
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new Error(`El correo ${email} ya se encuentra registrado.`);
    }

    // Hash de contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${crypto.randomUUID()}`;

    // Crear usuario en base de datos
    const user = await UserRepository.create({
      id: userId,
      email,
      passwordHash,
      role
    });

    // Crear perfil base
    const profile = await UserRepository.createProfile({
      userId,
      fullName: userFullName,
      bio: AntiLinkSanitizer.sanitize(bio),
      degree,
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    });

    // Si es consultor, crear perfil extendido
    let consultantProfile = null;
    if (role.toUpperCase() === "CONSULTANT") {
      consultantProfile = await UserRepository.createConsultantProfile({
        userId,
        hourlyRateBOB,
        bankAccount,
        cvSummary: AntiLinkSanitizer.sanitize(cvSummary)
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: profile.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      message: "Usuario registrado y autenticado exitosamente.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: profile.full_name,
        name: profile.full_name,
        bio: profile.bio,
        degree: profile.degree,
        avatarUrl: profile.avatar_url,
        hourlyRateBOB: consultantProfile?.hourly_rate_bob,
        bankAccount: consultantProfile?.bank_account
      }
    };
  }

  static async login({ email, password }) {
    if (!email || !password) {
      throw new Error("Email y contraseña requeridos.");
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Credenciales inválidas. Usuario no encontrado.");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("Credenciales inválidas. Contraseña incorrecta.");
    }

    const fullUser = await UserRepository.findById(user.id);
    const profile = fullUser?.profile || {};
    const consultant = fullUser?.consultantProfile || {};

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: profile.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      message: "Inicio de sesión exitoso.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: profile.full_name,
        name: profile.full_name,
        bio: profile.bio,
        degree: profile.degree,
        avatarUrl: profile.avatar_url,
        hourlyRateBOB: consultant.hourly_rate_bob,
        bankAccount: consultant.bank_account
      }
    };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error("Token de autenticación inválido o expirado.");
    }
  }

  static async seedInitialUsers() {
    const existing = await UserRepository.findByEmail("cmendoza@universidad.edu.bo");
    if (existing) return;

    // Seed Consultor
    await this.register({
      email: "cmendoza@universidad.edu.bo",
      password: "Password123!",
      role: "CONSULTANT",
      fullName: "Dr. Carlos Mendoza",
      bio: "Especialista en Inteligencia Artificial y Metodología de Investigación para Tesis de Grado y Posgrado.",
      degree: "Ph.D. en Ciencias de la Computación",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      hourlyRateBOB: 120,
      bankAccount: "BNB-BO-9876543210",
      cvSummary: "Docente investigador con más de 15 años de experiencia asesorando tesis de pregrado y posgrado."
    });

    // Seed Estudiante
    await this.register({
      email: "ana.flores@estudiante.edu.bo",
      password: "Password123!",
      role: "STUDENT",
      fullName: "Ana Flores",
      bio: "Estudiante de último año trabajando en Tesis de Grado sobre Machine Learning aplicado a salud.",
      degree: "Licenciatura en Ingeniería de Sistemas",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    });
  }
}
