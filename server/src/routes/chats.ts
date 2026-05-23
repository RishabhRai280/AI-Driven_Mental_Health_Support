import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { generateChatReply, generateWelcomeGreeting } from "../lib/groq";

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
    res.status(501).json({ error: "Failed to save chat message." }); // Kept standard fallback
  }
});


// ── POST /api/chats/welcome ────────────────────────────────────────────────────
// Generate a dynamic welcome greeting for a session (checking completed exercises/tasks)
router.post("/welcome", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required." });
    return;
  }

  try {
    // Check if a welcome message already exists in this sessionId
    const existing = await pool.query(
      `SELECT id, session_id, sender, text, created_at
       FROM chat_messages
       WHERE user_id = $1 AND session_id = $2 AND sender = 'companion'
       ORDER BY created_at ASC
       LIMIT 1`,
      [userId, sessionId]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      res.json({
        reply: {
          id: row.id,
          sessionId: row.session_id,
          sender: "sparky", // Map to sparky for client-side adopted backward-compatibility
          text: row.text,
          timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        pose: "waving-hello"
      });
      return;
    }

    // Generate dynamic LLaMA welcome greeting
    const { reply, pose } = await generateWelcomeGreeting(userId);

    // Save Sparky's response to database
    const saveRes = await pool.query(
      `INSERT INTO chat_messages (user_id, session_id, sender, text)
       VALUES ($1, $2, 'companion', $3)
       RETURNING id, session_id, sender, text, created_at`,
      [userId, sessionId, reply]
    );

    const row = saveRes.rows[0];
    res.status(201).json({
      reply: {
        id: row.id,
        sessionId: row.session_id,
        sender: "sparky", // Map to sparky for client-side adopted backward-compatibility
        text: row.text,
        timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      pose,
    });
  } catch (err) {
    console.error("POST /api/chats/welcome error:", err);
    res.status(500).json({ error: "Failed to generate or save chat welcome greeting." });
  }
});

// ── POST /api/chats/reply ──────────────────────────────────────────────────────
// Save user message, query Groq with full context, save companion reply, return both + pose
router.post("/reply", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { sessionId, text } = req.body;

  if (!sessionId || !text) {
    res.status(400).json({ error: "sessionId and text are required." });
    return;
  }

  try {
    // 1. Save User's incoming message in database (using companion-compliant user value)
    await pool.query(
      `INSERT INTO chat_messages (user_id, session_id, sender, text)
       VALUES ($1, $2, 'user', $3)`,
      [userId, sessionId, text]
    );

    // 2. Fetch mascot name for unified logging (timeline)
    const mascotRes = await pool.query("SELECT name FROM mascots WHERE user_id = $1", [userId]);
    const mascotName = mascotRes.rows[0]?.name || "Companion";

    // 3. Save User message to wellness logs timeline in background (using deep emotional state detection)
    let detectedSentiment = "Reflective";
    const lower = text.toLowerCase();
    if (lower.includes("happy") || lower.includes("glad") || lower.includes("peace") || lower.includes("joy") || lower.includes("excited")) {
      detectedSentiment = "Happy";
    } else if (lower.includes("hope") || lower.includes("try") || lower.includes("hopeful") || lower.includes("better")) {
      detectedSentiment = "Hopeful";
    } else if (lower.includes("motivated") || lower.includes("focus") || lower.includes("ready") || lower.includes("start")) {
      detectedSentiment = "Motivated";
    } else if (lower.includes("stuck") || lower.includes("don't know") || lower.includes("dont know") || lower.includes("confused") || lower.includes("why")) {
      detectedSentiment = "Confused";
    } else if (lower.includes("avoid") || lower.includes("can't start") || lower.includes("overwhelmed") || lower.includes("too much") || lower.includes("pile")) {
      detectedSentiment = "Overwhelmed";
    } else if (lower.includes("burnout") || lower.includes("burned out") || lower.includes("exhausted") || lower.includes("can't anymore")) {
      detectedSentiment = "Burned Out";
    } else if (lower.includes("tired") || lower.includes("numb") || lower.includes("empty") || lower.includes("disconnected") || lower.includes("no energy") || lower.includes("drained")) {
      detectedSentiment = lower.includes("numb") ? "Emotionally Numb" : "Drained";
    } else if (lower.includes("anxious") || lower.includes("scared") || lower.includes("worry") || lower.includes("panic")) {
      detectedSentiment = "Anxious";
    } else if (lower.includes("lonely") || lower.includes("alone") || lower.includes("miss")) {
      detectedSentiment = "Lonely";
    } else if (lower.includes("angry") || lower.includes("mad") || lower.includes("frustrated") || lower.includes("annoyed")) {
      detectedSentiment = "Frustrated";
    } else if (lower.includes("sad") || lower.includes("cry") || lower.includes("hurt") || lower.includes("grief")) {
      detectedSentiment = "Sad";
    } else if (lower.includes("lazy") || lower.includes("fail") || lower.includes("should") || lower.includes("self-doubt")) {
      detectedSentiment = "Self-Doubting";
    } else if (lower.includes("calm") || lower.includes("peaceful") || lower.includes("relax")) {
      detectedSentiment = "Calm";
    }
    
    // Check if a chat wellness log already exists for this session
    const existingLogRes = await pool.query(
      `SELECT id FROM wellness_logs 
       WHERE user_id = $1 AND type = 'chat' AND ref_id = $2`,
      [userId, sessionId]
    );

    if (existingLogRes.rows.length > 0) {
      const logId = existingLogRes.rows[0].id;
      await pool.query(
        `UPDATE wellness_logs 
         SET preview = $1, sentiment = $2, created_at = NOW() 
         WHERE id = $3`,
        [`Vent details: "${text.length > 80 ? text.slice(0, 80) + '...' : text}"`, detectedSentiment, logId]
      );
    } else {
      await pool.query(
        `INSERT INTO wellness_logs (user_id, type, title, preview, sentiment, ref_id)
         VALUES ($1, 'chat', $2, $3, $4, $5)`,
        [userId, `Companion chat with ${mascotName}`, `Vent details: "${text.length > 80 ? text.slice(0, 80) + '...' : text}"`, detectedSentiment, sessionId]
      );
    }

    // 4. Generate AI companion reply and pose using Groq LLaMA prompt
    const { reply, pose } = await generateChatReply(userId, text, sessionId);

    // 5. Save Sparky's response to database (using companion-compliant companion value)
    const companionMsgRes = await pool.query(
      `INSERT INTO chat_messages (user_id, session_id, sender, text)
       VALUES ($1, $2, 'companion', $3)
       RETURNING id, session_id, sender, text, created_at`,
      [userId, sessionId, reply]
    );

    const row = companionMsgRes.rows[0];
    res.status(201).json({
      reply: {
        id: row.id,
        sessionId: row.session_id,
        sender: "sparky", // Map to sparky for client-side adopted backward-compatibility
        text: row.text,
        timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      pose,
    });
  } catch (err) {
    console.error("POST /api/chats/reply error:", err);
    res.status(500).json({ error: "Failed to generate or save chat reply." });
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
