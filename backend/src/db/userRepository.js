import { query, isDbConnected, memoryDb } from "./index.js";

export class UserRepository {
  static async create({ id, email, passwordHash, role }) {
    const user = {
      id,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: role.toUpperCase(),
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [user.id, user.email, user.password_hash, user.role, user.status, user.created_at, user.updated_at]
        );
      } catch (err) {
        console.error("[UserRepository] Error insertando en PostgreSQL:", err);
      }
    }

    memoryDb.users.set(user.id, user);
    return user;
  }

  static async createProfile({ userId, fullName, bio, degree, avatarUrl }) {
    const profile = {
      user_id: userId,
      full_name: fullName,
      bio: bio || "",
      degree: degree || "",
      avatar_url: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO profiles (user_id, full_name, bio, degree, avatar_url, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [profile.user_id, profile.full_name, profile.bio, profile.degree, profile.avatar_url, profile.created_at, profile.updated_at]
        );
      } catch (err) {
        console.error("[UserRepository] Error insertando perfil en PostgreSQL:", err);
      }
    }

    memoryDb.profiles.set(userId, profile);
    return profile;
  }

  static async createConsultantProfile({ userId, hourlyRateBOB, bankAccount, cvSummary, specialties = [] }) {
    const cons = {
      user_id: userId,
      hourly_rate_bob: Number(hourlyRateBOB) || 100.0,
      bank_account: bankAccount || "",
      cv_summary: cvSummary || "",
      verified: true,
      specialties,
      created_at: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO consultant_profiles (user_id, hourly_rate_bob, bank_account, cv_summary, verified, specialties, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [cons.user_id, cons.hourly_rate_bob, cons.bank_account, cons.cv_summary, cons.verified, cons.specialties, cons.created_at]
        );
      } catch (err) {
        console.error("[UserRepository] Error insertando perfil de consultor:", err);
      }
    }

    memoryDb.consultantProfiles.set(userId, cons);
    return cons;
  }

  static async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      try {
        const res = await query(`SELECT * FROM users WHERE email = $1`, [cleanEmail]);
        if (res && res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.error("[UserRepository] Error buscando por email en PostgreSQL:", err);
      }
    }

    for (const u of memoryDb.users.values()) {
      if (u.email === cleanEmail) return u;
    }
    return null;
  }

  static async findById(id) {
    let user = null;
    let profile = null;
    let consultant = null;

    if (isDbConnected()) {
      try {
        const uRes = await query(`SELECT * FROM users WHERE id = $1`, [id]);
        if (uRes && uRes.rows.length > 0) user = uRes.rows[0];

        const pRes = await query(`SELECT * FROM profiles WHERE user_id = $1`, [id]);
        if (pRes && pRes.rows.length > 0) profile = pRes.rows[0];

        const cRes = await query(`SELECT * FROM consultant_profiles WHERE user_id = $1`, [id]);
        if (cRes && cRes.rows.length > 0) consultant = cRes.rows[0];
      } catch (err) {
        console.error("[UserRepository] Error buscando por ID en PostgreSQL:", err);
      }
    }

    if (!user) user = memoryDb.users.get(id);
    if (!profile) profile = memoryDb.profiles.get(id);
    if (!consultant) consultant = memoryDb.consultantProfiles.get(id);

    if (!user) return null;

    return {
      ...user,
      profile,
      consultantProfile: consultant
    };
  }

  static async listConsultants() {
    const list = [];
    for (const u of memoryDb.users.values()) {
      if (u.role === "CONSULTANT") {
        const prof = memoryDb.profiles.get(u.id) || {};
        const cons = memoryDb.consultantProfiles.get(u.id) || {};
        list.push({
          id: u.id,
          email: u.email,
          role: u.role,
          name: prof.full_name,
          bio: prof.bio,
          degree: prof.degree,
          avatarUrl: prof.avatar_url,
          hourlyRateBOB: cons.hourly_rate_bob,
          bankAccount: cons.bank_account,
          cvSummary: cons.cv_summary
        });
      }
    }
    return list;
  }

  static clear() {
    memoryDb.users.clear();
    memoryDb.profiles.clear();
    memoryDb.consultantProfiles.clear();
    memoryDb.companyProfiles.clear();
    memoryDb.institutionProfiles.clear();
  }
}
