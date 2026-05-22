import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// ── GET /api/journals ─────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const result = await pool.query(
      `SELECT id, title, body, sentiment, created_at, updated_at
       FROM journals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ journals: result.rows });
  } catch (err) {
    console.error("GET /api/journals error:", err);
    res.status(500).json({ error: "Failed to fetch journals." });
  }
});

// ── POST /api/journals ────────────────────────────────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { title, body, sentiment } = req.body;

  if (!body && !title) {
    res.status(400).json({ error: "title or body is required." });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO journals (user_id, title, body, sentiment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, body, sentiment, created_at`,
      [userId, title || "Untitled Reflection", body || "", sentiment || "Neutral"]
    );

    res.status(201).json({ journal: result.rows[0] });
  } catch (err) {
    console.error("POST /api/journals error:", err);
    res.status(500).json({ error: "Failed to create journal." });
  }
});

// ── PUT /api/journals/:id ─────────────────────────────────────────────────────
// Auto-save/update an existing journal
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, body, sentiment } = req.body;

  try {
    const result = await pool.query(
      `UPDATE journals
       SET title = COALESCE($1, title),
           body = COALESCE($2, body),
           sentiment = COALESCE($3, sentiment),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id`,
      [title, body, sentiment, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Journal not found." });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/journals/:id error:", err);
    res.status(500).json({ error: "Failed to update journal." });
  }
});

// ── DELETE /api/journals/:id ──────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM journals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/journals/:id error:", err);
    res.status(500).json({ error: "Failed to delete journal." });
  }
});

export default router;
