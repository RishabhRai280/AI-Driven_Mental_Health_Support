import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// ── GET /api/mascot ───────────────────────────────────────────────────────────
// Returns mascot + persona data for the logged-in user
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const mascotResult = await pool.query(
      "SELECT * FROM mascots WHERE user_id = $1",
      [userId]
    );
    const personaResult = await pool.query(
      "SELECT * FROM user_personas WHERE user_id = $1",
      [userId]
    );

    res.json({
      mascot: mascotResult.rows[0] || null,
      persona: personaResult.rows[0] || null,
    });
  } catch (err) {
    console.error("GET /api/mascot error:", err);
    res.status(500).json({ error: "Failed to fetch mascot data." });
  }
});

// ── POST /api/mascot ──────────────────────────────────────────────────────────
// Create or update mascot for user (upsert)
router.post("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { name, eggType, personality, level } = req.body;

  if (!name || !eggType) {
    res.status(400).json({ error: "name and eggType are required." });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO mascots (user_id, name, egg_type, personality, level)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
         SET name = EXCLUDED.name,
             egg_type = EXCLUDED.egg_type,
             personality = EXCLUDED.personality,
             level = EXCLUDED.level,
             updated_at = NOW()
       RETURNING *`,
      [userId, name, eggType, personality || "Calming & Stoic", level || 1]
    );

    const m = result.rows[0];
    res.status(201).json({
      id: m.id,
      name: m.name,
      eggType: m.egg_type,
      personality: m.personality,
      level: m.level,
    });
  } catch (err) {
    console.error("POST /api/mascot error:", err);
    res.status(500).json({ error: "Failed to save mascot." });
  }
});

// ── PUT /api/mascot/level ─────────────────────────────────────────────────────
// Update mascot level
router.put("/level", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { level } = req.body;

  try {
    await pool.query(
      "UPDATE mascots SET level = $1, updated_at = NOW() WHERE user_id = $2",
      [level, userId]
    );
    res.json({ success: true, level });
  } catch (err) {
    console.error("PUT /api/mascot/level error:", err);
    res.status(500).json({ error: "Failed to update mascot level." });
  }
});

// ── POST /api/mascot/persona ──────────────────────────────────────────────────
// Create or update user persona (upsert)
router.post("/persona", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { age, occupation, sleepHours, stressLevel, selfCareScale, mentalGoal, triggers } = req.body;

  if (!age || !occupation) {
    res.status(400).json({ error: "age and occupation are required." });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_personas (user_id, age, occupation, sleep_hours, stress_level, self_care_scale, mental_goal, triggers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE
         SET age = EXCLUDED.age,
             occupation = EXCLUDED.occupation,
             sleep_hours = EXCLUDED.sleep_hours,
             stress_level = EXCLUDED.stress_level,
             self_care_scale = EXCLUDED.self_care_scale,
             mental_goal = EXCLUDED.mental_goal,
             triggers = EXCLUDED.triggers,
             updated_at = NOW()
       RETURNING *`,
      [userId, age, occupation, sleepHours || "7-8 hours", stressLevel || 5, selfCareScale || 5, mentalGoal || "Achieve Calmer Baselines", JSON.stringify(triggers || [])]
    );

    const p = result.rows[0];
    res.status(201).json({
      id: p.id,
      age: p.age,
      occupation: p.occupation,
      sleepHours: p.sleep_hours,
      stressLevel: p.stress_level,
      selfCareScale: p.self_care_scale,
      mentalGoal: p.mental_goal,
      triggers: p.triggers,
    });
  } catch (err) {
    console.error("POST /api/mascot/persona error:", err);
    res.status(500).json({ error: "Failed to save persona." });
  }
});

export default router;
