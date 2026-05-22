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
    console.error("❌ Unexpected PostgreSQL pool error:", err.message);
  });
}

// Test connection on startup
export async function testConnection(): Promise<void> {
  if (!pool) {
    console.warn("⚠️  Running in development mode without database connection");
    isDevelopmentMode = true;
    console.log("✅ Development mode initialized (mock responses enabled)");
    return;
  }

  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("✅ PostgreSQL connected successfully");
  } catch (err) {
    console.warn("⚠️  PostgreSQL connection failed, falling back to development mode");
    console.warn("   Run: docker-compose up -d");
    console.log("   Then: npm run dev");
    isDevelopmentMode = true;
  }
}

export { isDevelopmentMode };
export default pool;
