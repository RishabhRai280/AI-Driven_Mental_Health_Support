import { Pool } from "pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/serenemind";

async function seed() {
  console.log("🔗 Connecting to PostgreSQL database...");
  const pool = new Pool({ connectionString });

  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully.");

    // 1. Run migrations to ensure all tables exist
    console.log("📊 Running migrations from 001_init.sql...");
    const migrationPath = path.join(__dirname, "../migrations/001_init.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf8");
    
    // Execute migration
    try {
      await client.query(migrationSql);
      console.log("✅ Migrations executed successfully.");
    } catch (migErr: any) {
      console.log("ℹ️ Migrations warning (some tables/triggers might already exist):", migErr.message);
    }

    // 2. Check if user already exists
    const email = "ranjeetjat00001@gmail.com";
    const checkUser = await client.query("SELECT id FROM users WHERE email = $1", [email]);

    if (checkUser.rows.length > 0) {
      console.log(`⚠️ User with email '${email}' already exists in database.`);
    } else {
      // 3. Hash password and insert user
      console.log("🔐 Hashing password and seeding user...");
      const displayName = "Ranjeet choudhary";
      const password = "password";
      const passwordHash = await bcrypt.hash(password, 12);

      const result = await client.query(
        `INSERT INTO users (email, password_hash, display_name)
         VALUES ($1, $2, $3)
         RETURNING id, email, display_name`,
        [email, passwordHash, displayName]
      );

      console.log("🎉 Seeding completed successfully!");
      console.log("👤 User details seeded:", result.rows[0]);
    }

    client.release();
  } catch (error) {
    console.error("❌ Seeding database failed:", error);
  } finally {
    await pool.end();
  }
}

seed();
