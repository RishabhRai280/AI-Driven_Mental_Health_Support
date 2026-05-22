import pool from "./db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  console.log("[Seed] Seeding SereneMind PostgreSQL database...");
  if (!pool) {
    console.error("[Seed Error] PostgreSQL pool is not configured! Check DATABASE_URL.");
    process.exit(1);
  }

  try {
    // 1. Create seeded user (Ranjeet)
    const email = "ranjeet@example.com";
    const password = "password";
    const passwordHash = bcrypt.hashSync(password, 12);
    const displayName = "Ranjeet choudhary";

    console.log("[Seed Info] Seeding default user...");
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         password_hash = EXCLUDED.password_hash
       RETURNING id, email`,
      [email, passwordHash, displayName]
    );

    const userId = userResult.rows[0].id;
    console.log(`[Seed Success] Seeded user: ${email} (ID: ${userId})`);

    // 2. Adopted Mascot (Sparky)
    console.log("[Seed Info] Seeding mascot companion...");
    await pool.query(
      `INSERT INTO mascots (user_id, name, egg_type, personality, level)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         name = EXCLUDED.name,
         egg_type = EXCLUDED.egg_type,
         personality = EXCLUDED.personality,
         level = EXCLUDED.level`,
      [userId, "Goldie", "Moss Sage Egg", "Calming & Stoic", 2]
    );
    console.log("[Seed Success] Seeded mascot companion.");

    // 3. User Demographics Profile
    console.log("[Seed Info] Seeding user demographics profile...");
    const triggers = [
      "Academic Pressure",
      "Social Anxiety",
      "water:1-2 Liters",
      "screentime:5-8 Hours",
      "social:Neutral Connection",
      "activity:Light Walking / Yoga"
    ];
    await pool.query(
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
         physical_activity = EXCLUDED.physical_activity`,
      [
        userId, displayName, 24, "Student / Developer", "7-8 hours", 6,
        7, "Achieve Calmer Baselines", JSON.stringify(triggers), "1-2 Liters",
        "5-8 Hours", "Neutral Connection", "Light Walking / Yoga"
      ]
    );
    console.log("[Seed Success] Seeded demographics profile.");

    // 4. Clinical Cohort Persona
    console.log("[Seed Info] Seeding system matched cohort persona...");
    await pool.query(
      `INSERT INTO user_personas (
         user_id, persona_name, assigned_by, description, ai_behavior_prompt
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         persona_name = EXCLUDED.persona_name,
         assigned_by = EXCLUDED.assigned_by,
         description = EXCLUDED.description,
         ai_behavior_prompt = EXCLUDED.ai_behavior_prompt`,
      [
        userId,
        "Student Stress",
        "system_evaluation",
        "Experiencing high autonomic stress combined with academic or developmental loads.",
        "Respond as an empathetic, academic-mindful mentor. Focus on study-life boundaries, micro-breaks, box breathing, and lowering self-imposed academic pressure."
      ]
    );
    console.log("[Seed Success] Seeded system matched cohort persona.");

    // Clear previous logs to avoid duplicates or overlapping data
    console.log("[Seed Info] Cleaning old telemetry logs for a clean slate...");
    await pool.query("DELETE FROM mood_logs WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM journals WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM chat_messages WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM exercise_logs WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM wellness_logs WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM mood_calendar WHERE user_id = $1", [userId]);

    // 5. Seed mood check-ins (5 days logs)
    console.log("[Seed Info] Seeding mood check-in records...");
    const moodEntries = [
      { mood: "Calm", score: 8, notes: "Practiced grounding before morning exams.", offsetDays: 4 },
      { mood: "Content", score: 7, notes: "Completed homework deadlines early.", offsetDays: 3 },
      { mood: "Anxious", score: 4, notes: "Triggered by university project presentation prep.", offsetDays: 2 },
      { mood: "Rested", score: 9, notes: "Got excellent sleep and limited evening screens.", offsetDays: 1 },
      { mood: "Tense", score: 5, notes: "Sitting for long developer coding sessions.", offsetDays: 0 }
    ];

    for (const m of moodEntries) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - m.offsetDays);

      const logRes = await pool.query(
        `INSERT INTO mood_logs (user_id, mood, score, notes, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, m.mood, m.score, m.notes, logDate]
      );

      // Add to unified wellness timeline
      await pool.query(
        `INSERT INTO wellness_logs (user_id, type, title, preview, sentiment, ref_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, "mood", `Mood Logged: ${m.mood}`, m.notes, m.score >= 7 ? "Positive" : m.score >= 5 ? "Neutral" : "Anxious", logRes.rows[0].id, logDate]
      );
    }
    console.log("[Seed Success] Seeded mood check-in records.");

    // 6. Seed journals
    console.log("[Seed Info] Seeding journaling entries...");
    const journalEntries = [
      {
        title: "Reflections on Autonomic Pacing",
        body: "Today I practiced box breathing for 4 minutes during academic study breaks. It helped lower my shoulder tension and clear circulatory patterns. I noticed a strong sense of cognitive balance returning.",
        sentiment: "Positive",
        offsetDays: 3
      },
      {
        title: "Late Night Overwhelm",
        body: "Feeling overloaded by the impending exam dates and general career pressure. Screen time was extremely high today (over 8 hours) which disrupted my sleep cycle.",
        sentiment: "Stressed",
        offsetDays: 2
      },
      {
        title: "Finding Zen in Small Walks",
        body: "Took a quiet 30-minute outdoor walk in the evening without any device screens. The visual field green space helped diminish my physical panic sparks. Felt peaceful.",
        sentiment: "Positive",
        offsetDays: 1
      }
    ];

    for (const j of journalEntries) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - j.offsetDays);

      const logRes = await pool.query(
        `INSERT INTO journals (user_id, title, body, sentiment, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, j.title, j.body, j.sentiment, logDate]
      );

      // Add to unified wellness timeline
      await pool.query(
        `INSERT INTO wellness_logs (user_id, type, title, preview, sentiment, ref_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, "journal", j.title, j.body.substring(0, 100) + "...", j.sentiment, logRes.rows[0].id, logDate]
      );
    }
    console.log("[Seed Success] Seeded journaling entries.");

    // 7. Seed Chat Messages
    console.log("[Seed Info] Seeding chat conversation history...");
    const sessionId = uuidv4();
    const chatDate = new Date();
    chatDate.setDate(chatDate.getDate() - 1); // Yesterday

    const conversation = [
      { sender: "user", text: "Hey Goldie, I am feeling a bit stressed about the university projects." },
      { sender: "companion", text: "As your academic-mindful mentor, I hear you. High workloads are challenging, but remember that your wellness always comes first. How can we make some supportive space for you today?" },
      { sender: "user", text: "I feel like I have too much screen time and not enough sleep." },
      { sender: "companion", text: "A high study load can trigger intense overwhelm. Let's break it down into smaller, actionable chunks: what is ONE single item we can complete right now, and let the rest sit? Breathe with me." }
    ];

    for (const c of conversation) {
      await pool.query(
        `INSERT INTO chat_messages (user_id, session_id, sender, text, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, sessionId, c.sender, c.text, chatDate]
      );
    }

    // Add unified log for the session
    await pool.query(
      `INSERT INTO wellness_logs (user_id, type, title, preview, sentiment, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, "chat", "Companion chat with Goldie", `Vent details: "${conversation[0].text}"`, "Stressed", chatDate]
    );
    console.log("[Seed Success] Seeded chat conversation history.");

    // 8. Seed Exercise logs
    console.log("[Seed Info] Seeding completed wellness exercises...");
    const exercises = [
      { exerciseId: "1", title: "4-Minute Box Breathing Reset", category: "calming", durationSecs: 240, offsetDays: 4 },
      { exerciseId: "2", title: "Progressive Muscle Relaxation (PMR)", category: "release", durationSecs: 180, offsetDays: 3 },
      { exerciseId: "3", title: "5-4-3-2-1 Sensory Grounding", category: "focus", durationSecs: 300, offsetDays: 1 }
    ];

    for (const ex of exercises) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - ex.offsetDays);

      const logRes = await pool.query(
        `INSERT INTO exercise_logs (user_id, exercise_id, exercise_title, category, duration_secs, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [userId, ex.exerciseId, ex.title, ex.category, ex.durationSecs, logDate]
      );

      // Add to unified wellness timeline
      await pool.query(
        `INSERT INTO wellness_logs (user_id, type, title, preview, sentiment, ref_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, "exercise", ex.title, `Completed ${Math.floor(ex.durationSecs / 60)}m ${ex.category} practice successfully.`, "Positive", logRes.rows[0].id, logDate]
      );
    }
    console.log("[Seed Success] Seeded completed wellness exercises.");

    // 9. Seed Mood Heatmap Calendar
    console.log("[Seed Info] Seeding monthly mood calendar heatmap...");
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const dailyMoods = [
      { day: 1, mood: "Calm", note: "Starting month fresh" },
      { day: 2, mood: "Serene", note: "Beautiful weather outside" },
      { day: 3, mood: "Tired", note: "Busy study session" },
      { day: 4, mood: "Anxious", note: "Exams dates announced" },
      { day: 5, mood: "Happy", note: "Spent time with friends" },
      { day: 6, mood: "Rested", note: "Felt very recharged" },
      { day: 7, mood: "Balanced", note: "Stable paces achieved" }
    ];

    for (const d of dailyMoods) {
      await pool.query(
        `INSERT INTO mood_calendar (user_id, day, month, year, mood, note)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, day, month, year) DO UPDATE SET
           mood = EXCLUDED.mood,
           note = EXCLUDED.note`,
        [userId, d.day, currentMonth, currentYear, d.mood, d.note]
      );
    }
    console.log("[Seed Success] Seeded monthly mood calendar heatmap.");

    console.log("[Seed Success] Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("[Seed Error] Critical seeding failure:", err);
    process.exit(1);
  }
}

seed();
