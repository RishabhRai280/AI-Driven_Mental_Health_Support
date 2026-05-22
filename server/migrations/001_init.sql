-- ============================================================
-- SereneMind PostgreSQL Schema v1.0
-- Run: psql -d serenemind -f migrations/001_init.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100) NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MASCOTS — stores each user's adopted companion
-- ============================================================
CREATE TABLE IF NOT EXISTS mascots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL DEFAULT '',
  egg_type     VARCHAR(100) NOT NULL DEFAULT 'Moss Sage Egg',
  personality  VARCHAR(100) NOT NULL DEFAULT 'Calming & Stoic',
  level        INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ============================================================
-- USER PROFILES — raw demographic & lifestyle metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_name  VARCHAR(100) NOT NULL DEFAULT '',
  age             INTEGER,
  occupation      VARCHAR(200),
  sleep_hours     VARCHAR(50) NOT NULL DEFAULT '7-8 hours',
  stress_level    INTEGER NOT NULL DEFAULT 5 CHECK (stress_level BETWEEN 1 AND 10),
  self_care_scale INTEGER NOT NULL DEFAULT 5 CHECK (self_care_scale BETWEEN 1 AND 10),
  mental_goal     VARCHAR(200) NOT NULL DEFAULT 'Achieve Calmer Baselines',
  triggers        JSONB NOT NULL DEFAULT '[]',
  water_intake    VARCHAR(50) NOT NULL DEFAULT '1-2 Liters',
  screen_time     VARCHAR(50) NOT NULL DEFAULT '5-8 Hours',
  social_context  VARCHAR(50) NOT NULL DEFAULT 'Neutral Connection',
  physical_activity VARCHAR(100) NOT NULL DEFAULT 'Light Walking / Yoga',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ============================================================
-- USER PERSONAS — clinical diagnostic cohorts (matched groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_personas (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_name       VARCHAR(100) NOT NULL DEFAULT 'Beginner Wellness User',
  assigned_by        VARCHAR(50) NOT NULL DEFAULT 'system_evaluation',
  description        TEXT NOT NULL DEFAULT '',
  ai_behavior_prompt TEXT NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ============================================================
-- MOOD LOGS — quick mood check-ins from dashboard
-- ============================================================
CREATE TABLE IF NOT EXISTS mood_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood       VARCHAR(50) NOT NULL,
  score      INTEGER CHECK (score BETWEEN 1 AND 10),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- JOURNALS — reflection entries from journaling page
-- ============================================================
CREATE TABLE IF NOT EXISTS journals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(300) NOT NULL DEFAULT 'Untitled Reflection',
  body       TEXT NOT NULL DEFAULT '',
  sentiment  VARCHAR(50) NOT NULL DEFAULT 'Neutral',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHAT MESSAGES — all chatbot messages grouped by session
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  sender     VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'companion')),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, created_at DESC);

-- ============================================================
-- EXERCISE LOGS — completed breathing/mindfulness sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS exercise_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id    VARCHAR(50) NOT NULL,
  exercise_title VARCHAR(200) NOT NULL,
  category       VARCHAR(50) NOT NULL DEFAULT 'calming',
  duration_secs  INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WELLNESS LOGS — unified timeline (History page)
-- Combines mood check-ins, journals, chats, and exercises
-- ============================================================
CREATE TABLE IF NOT EXISTS wellness_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(20) NOT NULL CHECK (type IN ('chat', 'journal', 'exercise', 'mood')),
  title      VARCHAR(300) NOT NULL,
  preview    TEXT NOT NULL DEFAULT '',
  sentiment  VARCHAR(50) NOT NULL DEFAULT 'Neutral',
  ref_id     UUID,           -- optional FK to source record (journal_id, chat session, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wellness_logs_user ON wellness_logs(user_id, created_at DESC);

-- ============================================================
-- MOOD CALENDAR — analysis page monthly heatmap
-- ============================================================
CREATE TABLE IF NOT EXISTS mood_calendar (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day        INTEGER NOT NULL CHECK (day BETWEEN 1 AND 31),
  month      INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year       INTEGER NOT NULL,
  mood       VARCHAR(50),
  note       TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, day, month, year)
);

-- ============================================================
-- TRIGGER: auto-update updated_at columns
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_mascots_updated_at BEFORE UPDATE ON mascots
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON user_personas
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- Confirmation
-- ============================================================
DO $$ BEGIN
  RAISE NOTICE 'SereneMind schema initialized successfully ✅';
END $$;
