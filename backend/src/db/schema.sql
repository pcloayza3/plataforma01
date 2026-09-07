-- ESQUEMA RELACIONAL DE PLATAFORMA01 EN POSTGRESQL

-- 1. Tabla de Usuarios (Credenciales y Roles)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('STUDENT', 'CONSULTANT', 'COMPANY', 'INSTITUTION', 'ADMIN')),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Perfiles Base (Estudiantes, Consultores, Empresas e Instituciones)
CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    bio TEXT, -- Sanitizado estrictamente contra URLs, correos y números telefónicos
    degree VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla Específica para Consultores (Currículum, Tarifa y Cuenta Bancaria)
CREATE TABLE IF NOT EXISTS consultant_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    hourly_rate_bob NUMERIC(10, 2) DEFAULT 100.00,
    bank_account VARCHAR(100),
    cv_summary TEXT, -- Currículum sin enlaces externos
    verified BOOLEAN DEFAULT FALSE,
    specialties TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla Específica para Empresas y Organizaciones
CREATE TABLE IF NOT EXISTS company_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(64),
    industry VARCHAR(128),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla Específica para Instituciones Académicas (Universidades / Institutos)
CREATE TABLE IF NOT EXISTS institution_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    faculty VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 6. Tabla de Proyectos (Tesis de Pregrado/Posgrado, Prácticas o Retos)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
    consultant_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Hitos del Proyecto
CREATE TABLE IF NOT EXISTS milestones (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount_bob NUMERIC(10, 2) NOT NULL,
    duration_days INTEGER DEFAULT 14,
    status VARCHAR(32) DEFAULT 'PENDIENTE_PAGO',
    student_conformity BOOLEAN DEFAULT FALSE,
    consultant_conformity BOOLEAN DEFAULT FALSE,
    student_observations TEXT,
    consultant_observations TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla de Tareas Kanban Colaborativas con Semáforo Temporal
CREATE TABLE IF NOT EXISTS kanban_tasks (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id VARCHAR(64) REFERENCES milestones(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'TODO' CHECK (status IN ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_hours INTEGER DEFAULT 8,
    consultant_feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_student ON projects(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_consultant ON projects(consultant_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON kanban_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON kanban_tasks(due_date);

-- ==========================================
-- PASO 3: GESTIÓN FINANCIERA Y CUSTODIA INTERNA DE LA PLATAFORMA
-- ==========================================

CREATE TABLE IF NOT EXISTS platform_custody_transactions (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id VARCHAR(100) REFERENCES milestones(id) ON DELETE SET NULL,
    student_id VARCHAR(100) NOT NULL REFERENCES users(id),
    consultant_id VARCHAR(100) NOT NULL REFERENCES users(id),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'QR_SIMPLE', -- QR_SIMPLE, TARJETA, TRANSFERENCIA
    payment_option VARCHAR(50) NOT NULL DEFAULT 'MILESTONE', -- MILESTONE, PROYECTO_COMPLETO
    gross_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BOB',
    commission_rate NUMERIC(5, 2) NOT NULL, -- 15.00 o 10.00
    commission_amount NUMERIC(12, 2) NOT NULL,
    net_consultant_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE_PAGO', -- PENDIENTE_PAGO, EN_CUSTODIA_PLATAFORMA, LIQUIDADO_AL_CONSULTOR, REEMBOLSADO
    funded_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_payouts (
    id VARCHAR(100) PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL REFERENCES platform_custody_transactions(id) ON DELETE CASCADE,
    consultant_id VARCHAR(100) NOT NULL REFERENCES users(id),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BOB',
    consultant_account VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETADO', -- PROCESANDO, COMPLETADO, FALLIDO
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custody_project ON platform_custody_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_custody_student ON platform_custody_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_custody_consultant ON platform_custody_transactions(consultant_id);
CREATE INDEX IF NOT EXISTS idx_custody_status ON platform_custody_transactions(status);

