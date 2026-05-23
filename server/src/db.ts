import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool: Pool | null = null;
let isDevelopmentMode = false;

// Initialize pool with fallback for development
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Connection pool settings
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on("error", (err) => {
    console.error("[DB Error] Unexpected PostgreSQL pool error:", err.message);
  });
}

// Test connection on startup
export async function testConnection(): Promise<void> {
  if (!pool) {
    console.warn("[DB Warning] Running in development mode without database connection");
    isDevelopmentMode = true;
    console.log("[DB Info] Development mode initialized (mock responses enabled)");
    return;
  }

  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    
    // Check if old user_personas table contains the 'age' column (unified schema)
    const checkOldPersonaTable = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_personas' AND column_name = 'age'
    `);
    
    if (checkOldPersonaTable.rows.length > 0) {
      console.log("[DB Warning] Found old user_personas table. Migrating to separate user_profiles and user_personas schema...");
      await client.query("DROP TABLE IF EXISTS user_personas CASCADE");
    }

    // Create separate user_profiles table
    await client.query(`
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
      )
    `);

    // Create separate user_personas table (representing matched behavioral cohorts)
    await client.query(`
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
      )
    `);

    // Attach updated_at triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
      CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_user_personas_updated_at ON user_personas;
      CREATE TRIGGER update_user_personas_updated_at BEFORE UPDATE ON user_personas
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    `);

    // Alter journals table to support dynamic Groq CBT reflection insights
    await client.query(`
      ALTER TABLE journals 
      ADD COLUMN IF NOT EXISTS summary TEXT,
      ADD COLUMN IF NOT EXISTS coping_strategies TEXT,
      ADD COLUMN IF NOT EXISTS mascot_pose VARCHAR(50);
    `);

    client.release();
    console.log("[DB Success] PostgreSQL connected successfully & profiles/personas/journals schemas verified.");
  } catch (err) {
    console.warn("[DB Warning] PostgreSQL connection failed, falling back to development mode:", err);
    console.warn("   Run: docker-compose up -d");
    console.log("   Then: npm run dev");
    isDevelopmentMode = true;
  }
}

export { isDevelopmentMode };
export default pool;
