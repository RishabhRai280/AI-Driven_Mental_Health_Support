import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";

const router = Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  try {
    // Check if email already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const name = displayName?.trim() || email.split("@")[0];

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name`,
      [email.toLowerCase(), passwordHash, name]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      (process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET) as string,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      status: "success",
      token,
      user: { id: user.id, email: user.email, displayName: user.display_name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error during registration." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash, display_name FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      (process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET) as string,
      { expiresIn: "30d" }
    );

    res.json({
      status: "success",
      token,
      user: { id: user.id, email: user.email, displayName: user.display_name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login." });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(
      token, 
      (process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET) as string
    ) as { id: string; email: string };

    const result = await pool.query(
      "SELECT id, email, display_name FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const user = result.rows[0];
    res.json({ id: user.id, email: user.email, displayName: user.display_name });
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
});

export default router;
