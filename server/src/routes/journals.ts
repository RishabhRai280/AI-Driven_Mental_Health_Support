import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { generateReflectionInsights } from "../lib/groq";

const router = Router();

// ── GET /api/journals ─────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const result = await pool.query(
      `SELECT id, title, body, sentiment, summary, coping_strategies, mascot_pose, created_at, updated_at
       FROM journals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const journals = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      body: row.body,
      sentiment: row.sentiment,
      summary: row.summary,
      copingStrategies: typeof row.coping_strategies === "string" ? JSON.parse(row.coping_strategies) : row.coping_strategies,
      mascotPose: row.mascot_pose,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json({ journals });
  } catch (err) {
    console.error("GET /api/journals error:", err);
    res.status(500).json({ error: "Failed to fetch journals." });
  }
});

// ── POST /api/journals ────────────────────────────────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { title, body } = req.body;

  if (!body && !title) {
    res.status(400).json({ error: "title or body is required." });
    return;
  }

  try {
    // Generate CBT-style insights using LLaMA on Groq
    const insights = await generateReflectionInsights(userId, title || "Untitled Reflection", body || "");

    const result = await pool.query(
      `INSERT INTO journals (user_id, title, body, sentiment, summary, coping_strategies, mascot_pose)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, body, sentiment, summary, coping_strategies, mascot_pose, created_at`,
      [
        userId,
        title || "Untitled Reflection",
        body || "",
        insights.sentiment,
        insights.summary,
        JSON.stringify(insights.coping_strategies),
        insights.mascot_pose
      ]
    );

    const row = result.rows[0];
    res.status(201).json({
      journal: {
        id: row.id,
        title: row.title,
        body: row.body,
        sentiment: row.sentiment,
        summary: row.summary,
        copingStrategies: typeof row.coping_strategies === "string" ? JSON.parse(row.coping_strategies) : row.coping_strategies,
        mascotPose: row.mascot_pose,
        createdAt: row.created_at,
      }
    });
  } catch (err) {
    console.error("POST /api/journals error:", err);
    res.status(500).json({ error: "Failed to create journal." });
  }
});

// ── PUT /api/journals/:id ─────────────────────────────────────────────────────
// Auto-save/update an existing journal with real-time CBT insights
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, body } = req.body;

  try {
    // Generate CBT-style insights using LLaMA on Groq
    const insights = await generateReflectionInsights(userId, title || "Untitled Reflection", body || "");

    const result = await pool.query(
      `UPDATE journals
       SET title = COALESCE($1, title),
           body = COALESCE($2, body),
           sentiment = COALESCE($3, sentiment),
           summary = COALESCE($4, summary),
           coping_strategies = COALESCE($5, coping_strategies),
           mascot_pose = COALESCE($6, mascot_pose),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, title, body, sentiment, summary, coping_strategies, mascot_pose`,
      [
        title,
        body,
        insights.sentiment,
        insights.summary,
        JSON.stringify(insights.coping_strategies),
        insights.mascot_pose,
        id,
        userId
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Journal not found." });
      return;
    }

    const row = result.rows[0];
    res.json({
      success: true,
      journal: {
        id: row.id,
        title: row.title,
        body: row.body,
        sentiment: row.sentiment,
        summary: row.summary,
        copingStrategies: typeof row.coping_strategies === "string" ? JSON.parse(row.coping_strategies) : row.coping_strategies,
        mascotPose: row.mascot_pose,
      }
    });
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
