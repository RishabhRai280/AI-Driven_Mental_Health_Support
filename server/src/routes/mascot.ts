import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// ── GET /api/mascot ───────────────────────────────────────────────────────────
// Returns mascot + profile + persona data for the logged-in user
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const mascotResult = await pool.query(
      "SELECT * FROM mascots WHERE user_id = $1",
      [userId]
    );
    
    const profileResult = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    const personaResult = await pool.query(
      "SELECT * FROM user_personas WHERE user_id = $1",
      [userId]
    );

    // Map user_profiles record to 'persona' property for strict backward compatibility with client components
    const profile = profileResult.rows[0] || null;
    const mappedPersonaData = profile ? {
      id: profile.id,
      age: profile.age,
      occupation: profile.occupation,
      sleepHours: profile.sleep_hours,
      stressLevel: profile.stress_level,
      selfCareScale: profile.self_care_scale,
      mentalGoal: profile.mental_goal,
      triggers: typeof profile.triggers === "string" ? JSON.parse(profile.triggers) : profile.triggers,
      waterIntake: profile.water_intake,
      screenTime: profile.screen_time,
      socialContext: profile.social_context,
      physicalActivity: profile.physical_activity,
    } : null;

    res.json({
      mascot: mascotResult.rows[0] || null,
      profile: profileResult.rows[0] || null,
      persona: mappedPersonaData,
      assignedPersona: personaResult.rows[0] || null,
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
// Create or update user profile details and dynamically calculate persona (upsert both)
router.post("/persona", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { age, occupation, sleepHours, stressLevel, selfCareScale, mentalGoal, triggers } = req.body;

  if (!age || !occupation) {
    res.status(400).json({ error: "age and occupation are required." });
    return;
  }

  // 1. Parse composite parameters from request triggers list (for onboarding backward-compatibility)
  let waterIntake = "1-2 Liters";
  let screenTime = "5-8 Hours";
  let socialContext = "Neutral Connection";
  let physicalActivity = "Light Walking / Yoga";
  const preferredName = (req.user as any).displayName || req.user!.email.split("@")[0] || "Ranjeet choudhary";

  if (Array.isArray(triggers)) {
    const waterMatch = triggers.find(t => t.startsWith("water:"));
    if (waterMatch) waterIntake = waterMatch.replace("water:", "");

    const screenMatch = triggers.find(t => t.startsWith("screentime:"));
    if (screenMatch) screenTime = screenMatch.replace("screentime:", "");

    const socialMatch = triggers.find(t => t.startsWith("social:"));
    if (socialMatch) socialContext = socialMatch.replace("social:", "");

    const activityMatch = triggers.find(t => t.startsWith("activity:"));
    if (activityMatch) physicalActivity = activityMatch.replace("activity:", "");
  }

  // 2. Dynamic evaluation of clinical persona cohort
  let personaName = "Beginner Wellness User";
  let description = "Autonomic baselines are relatively balanced. Focusing on positive habit formation.";
  let aiBehaviorPrompt = "Respond as a friendly wellness cheerleader. Encourage consistent water intake, active journaling, box breathing practice, and gradual wellness progress.";

  const isStudent = occupation.toLowerCase().includes("student") || 
                    occupation.toLowerCase().includes("college") || 
                    occupation.toLowerCase().includes("university") || 
                    occupation.toLowerCase().includes("school");
  const isLowSleep = sleepHours === "<5 hours" || sleepHours === "5-6 hours";

  if (stressLevel >= 6 && isStudent) {
    personaName = "Student Stress";
    description = "Experiencing high autonomic stress combined with academic or developmental loads.";
    aiBehaviorPrompt = "Respond as an empathetic, academic-mindful mentor. Focus on study-life boundaries, micro-breaks, box breathing, and lowering self-imposed academic pressure.";
  } else if (stressLevel >= 6 && isLowSleep) {
    personaName = "Burnout Professional";
    description = "Suffering from excessive screen time, low sleep hours, and occupational stress.";
    aiBehaviorPrompt = "Respond as a calming workplace coach. Prioritize somatic pacing, strict work sleep boundaries, progressive muscle relaxation (PMR), and screen-free evening routines.";
  } else if (socialContext === "Feeling Isolated") {
    personaName = "Isolated User";
    description = "Lacking a strong real-world support network, experiencing isolation.";
    aiBehaviorPrompt = "Respond as an uplifting, deeply warm, and friendly companion. Emphasize social outreach, self-compassion, somatic grounding, and gentle connection milestones.";
  }

  try {
    // 3. Upsert user profile details
    const profileResult = await pool.query(
      `INSERT INTO user_profiles (
        user_id, preferred_name, age, occupation, sleep_hours, stress_level, 
        self_care_scale, mental_goal, triggers, water_intake, screen_time, 
        social_context, physical_activity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_name = EXCLUDED.preferred_name,
        age = EXCLUDED.age,
        occupation = EXCLUDED.occupation,
        sleep_hours = EXCLUDED.sleep_hours,
        stress_level = EXCLUDED.stress_level,
        self_care_scale = EXCLUDED.self_care_scale,
        mental_goal = EXCLUDED.mental_goal,
        triggers = EXCLUDED.triggers,
        water_intake = EXCLUDED.water_intake,
        screen_time = EXCLUDED.screen_time,
        social_context = EXCLUDED.social_context,
        physical_activity = EXCLUDED.physical_activity,
        updated_at = NOW()
      RETURNING *`,
      [
        userId, preferredName, age, occupation, sleepHours || "7-8 hours", stressLevel || 5, 
        selfCareScale || 5, mentalGoal || "Achieve Calmer Baselines", JSON.stringify(triggers || []),
        waterIntake, screenTime, socialContext, physicalActivity
      ]
    );

    // 4. Upsert user clinical persona
    const personaResult = await pool.query(
      `INSERT INTO user_personas (
        user_id, persona_name, assigned_by, description, ai_behavior_prompt
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        persona_name = EXCLUDED.persona_name,
        assigned_by = EXCLUDED.assigned_by,
        description = EXCLUDED.description,
        ai_behavior_prompt = EXCLUDED.ai_behavior_prompt,
        updated_at = NOW()
      RETURNING *`,
      [userId, personaName, "system_evaluation", description, aiBehaviorPrompt]
    );

    const p = profileResult.rows[0];
    res.status(201).json({
      id: p.id,
      age: p.age,
      occupation: p.occupation,
      sleepHours: p.sleep_hours,
      stressLevel: p.stress_level,
      selfCareScale: p.self_care_scale,
      mentalGoal: p.mental_goal,
      triggers: typeof p.triggers === "string" ? JSON.parse(p.triggers) : p.triggers,
      assignedPersona: personaResult.rows[0],
    });
  } catch (err) {
    console.error("POST /api/mascot/persona error:", err);
    res.status(500).json({ error: "Failed to save profile & persona." });
  }
});

export default router;
