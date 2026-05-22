import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// ── GET /api/wellness ─────────────────────────────────────────────────────────
// Unified timeline — all logs for the History page
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const result = await pool.query(
      `SELECT id, type, title, preview, sentiment, created_at
       FROM wellness_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 200`,
      [userId]
    );

    const logs = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      preview: row.preview,
      sentiment: row.sentiment,
      date: formatDate(row.created_at),
    }));

    res.json({ logs });
  } catch (err) {
    console.error("GET /api/wellness error:", err);
    res.status(500).json({ error: "Failed to fetch wellness logs." });
  }
});

// ── POST /api/wellness ────────────────────────────────────────────────────────
// Add a new wellness log entry
router.post("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { type, title, preview, sentiment, refId } = req.body;

  if (!type || !title) {
    res.status(400).json({ error: "type and title are required." });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO wellness_logs (user_id, type, title, preview, sentiment, ref_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, type, title, preview, sentiment, created_at`,
      [userId, type, title, preview || "", sentiment || "Neutral", refId || null]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      type: row.type,
      title: row.title,
      preview: row.preview,
      sentiment: row.sentiment,
      date: formatDate(row.created_at),
    });
  } catch (err) {
    console.error("POST /api/wellness error:", err);
    res.status(500).json({ error: "Failed to create wellness log." });
  }
});

// ── DELETE /api/wellness/:id ──────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM wellness_logs WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Log not found or unauthorized." });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/wellness/:id error:", err);
    res.status(500).json({ error: "Failed to delete wellness log." });
  }
});

// ── DELETE /api/wellness ──────────────────────────────────────────────────────
// Clear ALL logs for user
router.delete("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    await pool.query("DELETE FROM wellness_logs WHERE user_id = $1", [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/wellness error:", err);
    res.status(500).json({ error: "Failed to clear wellness logs." });
  }
});

// Helper: format Date to readable "May 22, 2026 at 1:45 PM"
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " at " + new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default router;
