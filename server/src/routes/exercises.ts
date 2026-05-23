import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// ── GET /api/exercises/logs ───────────────────────────────────────────────────
router.get("/logs", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const result = await pool.query(
      `SELECT id, exercise_id, exercise_title, category, duration_secs, created_at
       FROM exercise_logs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ logs: result.rows });
  } catch (err) {
    console.error("GET /api/exercises/logs error:", err);
    res.status(500).json({ error: "Failed to fetch exercise logs." });
  }
});

// ── POST /api/exercises/logs ──────────────────────────────────────────────────
router.post("/logs", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { exerciseId, exerciseTitle, category, durationSecs } = req.body;

  if (!exerciseTitle) {
    res.status(400).json({ error: "exerciseTitle is required." });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO exercise_logs (user_id, exercise_id, exercise_title, category, duration_secs)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, exercise_id, exercise_title, category, created_at`,
      [userId, exerciseId || "custom", exerciseTitle, category || "calming", durationSecs || null]
    );

    res.status(201).json({ log: result.rows[0] });
  } catch (err) {
    console.error("POST /api/exercises/logs error:", err);
    res.status(500).json({ error: "Failed to save exercise log." });
  }
});

export default router;
