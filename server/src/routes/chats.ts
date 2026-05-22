import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// ── GET /api/chats ────────────────────────────────────────────────────────────
// Get chat messages — optionally filtered by sessionId
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { sessionId } = req.query;

  try {
    let result;
    if (sessionId) {
      result = await pool.query(
        `SELECT id, session_id, sender, text, created_at
         FROM chat_messages
         WHERE user_id = $1 AND session_id = $2
         ORDER BY created_at ASC`,
        [userId, sessionId]
      );
    } else {
      // Return the most recent session
      const sessionResult = await pool.query(
        `SELECT DISTINCT session_id, MAX(created_at) as last_msg
         FROM chat_messages
         WHERE user_id = $1
         GROUP BY session_id
         ORDER BY last_msg DESC
         LIMIT 1`,
        [userId]
      );

      if (sessionResult.rows.length === 0) {
        res.json({ messages: [], sessionId: null });
        return;
      }

      const latestSession = sessionResult.rows[0].session_id;
      result = await pool.query(
        `SELECT id, session_id, sender, text, created_at
         FROM chat_messages
         WHERE user_id = $1 AND session_id = $2
         ORDER BY created_at ASC`,
        [userId, latestSession]
      );
    }

    const messages = result.rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      sender: row.sender,
      text: row.text,
      timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    res.json({ messages, sessionId: messages[0]?.sessionId || null });
  } catch (err) {
    console.error("GET /api/chats error:", err);
    res.status(500).json({ error: "Failed to fetch chat messages." });
  }
});

// ── POST /api/chats ───────────────────────────────────────────────────────────
// Save a chat message (user or sparky)
router.post("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { sessionId, sender, text } = req.body;

  if (!sessionId || !sender || !text) {
    res.status(400).json({ error: "sessionId, sender, and text are required." });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO chat_messages (user_id, session_id, sender, text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, session_id, sender, text, created_at`,
      [userId, sessionId, sender, text]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      sessionId: row.session_id,
      sender: row.sender,
      text: row.text,
      timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (err) {
    console.error("POST /api/chats error:", err);
    res.status(500).json({ error: "Failed to save chat message." });
  }
});

// ── DELETE /api/chats/:sessionId ──────────────────────────────────────────────
router.delete("/:sessionId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { sessionId } = req.params;

  try {
    await pool.query(
      "DELETE FROM chat_messages WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/chats/:sessionId error:", err);
    res.status(500).json({ error: "Failed to delete chat session." });
  }
});

export default router;
