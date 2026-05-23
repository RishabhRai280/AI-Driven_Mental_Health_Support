import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// ── GET /api/calendar ─────────────────────────────────────────────────────────
// Returns all mood calendar entries for a given month/year (or current)
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const now = new Date();
  const month = parseInt(req.query.month as string) || now.getMonth() + 1;
  const year = parseInt(req.query.year as string) || now.getFullYear();

  try {
    const result = await pool.query(
      `SELECT day, mood, note
       FROM mood_calendar
       WHERE user_id = $1 AND month = $2 AND year = $3
       ORDER BY day ASC`,
      [userId, month, year]
    );

    // Build a full 31-day array with DB data merged in
    const dbMap = new Map(result.rows.map((r) => [r.day, r]));
    const days = Array.from({ length: 31 }, (_, i) => {
      const dayNum = i + 1;
      const dbRow = dbMap.get(dayNum);
      return {
        day: dayNum,
        mood: dbRow?.mood || null,
        note: dbRow?.note || "",
      };
    });

    res.json({ days, month, year });
  } catch (err) {
    console.error("GET /api/calendar error:", err);
    res.status(500).json({ error: "Failed to fetch mood calendar." });
  }
});

// ── PUT /api/calendar/:day ────────────────────────────────────────────────────
// Update or create a specific calendar day entry (upsert)
router.put("/:day", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const day = parseInt(req.params.day);
  const { mood, note, month, year } = req.body;

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  if (isNaN(day) || day < 1 || day > 31) {
    res.status(400).json({ error: "Invalid day value." });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO mood_calendar (user_id, day, month, year, mood, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, day, month, year) DO UPDATE
         SET mood = EXCLUDED.mood,
             note = EXCLUDED.note,
             updated_at = NOW()`,
      [userId, day, targetMonth, targetYear, mood || null, note || ""]
    );

    res.json({ success: true, day, mood, note });
  } catch (err) {
    console.error("PUT /api/calendar/:day error:", err);
    res.status(500).json({ error: "Failed to update calendar day." });
  }
});

export default router;
