import pool from "../db";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

// Thread session tracking map to guarantee rotation and completely prevent repetitive crisis messages
const lastCrisisIndexMap = new Map<string, number>();

export interface UserContext {
  displayName: string;
  preferredName: string;
  age: number | null;
  occupation: string | null;
  sleepHours: string;
  stressLevel: number;
  selfCareScale: number;
  mentalGoal: string;
  triggers: string[];
  waterIntake: string;
  screenTime: string;
  socialContext: string;
  physicalActivity: string;
  personaName: string;
  personaDescription: string;
  aiBehaviorPrompt: string;
  mascotName: string;
  eggType: string;
  personality: string;
  level: number;
  recentExercises: { title: string; category: string; duration: number; date: string }[];
  recentJournals: { title: string; sentiment: string; date: string }[];
  recentMoods: { mood: string; score: number; date: string }[];
  lastActive: string | null;
  daysSinceLastActive: number | null;
  registeredAt: string | null;
  daysSinceRegistration: number | null;
}

// ── FETCH COMPREHENSIVE USER CONTEXT ──────────────────────────────────────────
export async function getUserContext(userId: string): Promise<UserContext> {
  const context: UserContext = {
    displayName: "User",
    preferredName: "Friend",
    age: null,
    occupation: null,
    sleepHours: "7-8 hours",
    stressLevel: 5,
    selfCareScale: 5,
    mentalGoal: "Achieve Calmer Baselines",
    triggers: [],
    waterIntake: "1-2 Liters",
    screenTime: "5-8 Hours",
    socialContext: "Neutral Connection",
    physicalActivity: "Light Walking / Yoga",
    personaName: "Beginner Wellness User",
    personaDescription: "Autonomic baselines are relatively balanced.",
    aiBehaviorPrompt: "Respond as a friendly companion.",
    mascotName: "Sparky",
    eggType: "Moss Sage Egg",
    personality: "Calming & Stoic",
    level: 1,
    recentExercises: [],
    recentJournals: [],
    recentMoods: [],
    lastActive: null,
    daysSinceLastActive: null,
    registeredAt: null,
    daysSinceRegistration: null,
  };

  if (!pool) return context;

  try {
    // 1. Fetch user display name & registration date
    const userRes = await pool.query("SELECT display_name, created_at FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length > 0) {
      if (userRes.rows[0].display_name) {
        context.displayName = userRes.rows[0].display_name;
      }
      if (userRes.rows[0].created_at) {
        const regDate = new Date(userRes.rows[0].created_at);
        context.registeredAt = regDate.toISOString();
        const diffReg = Math.abs(new Date().getTime() - regDate.getTime());
        context.daysSinceRegistration = Math.floor(diffReg / (1000 * 60 * 60 * 24));
      }
    }

    // 2. Fetch user profile
    const profileRes = await pool.query("SELECT * FROM user_profiles WHERE user_id = $1", [userId]);
    if (profileRes.rows.length > 0) {
      const p = profileRes.rows[0];
      context.preferredName = p.preferred_name || context.preferredName;
      context.age = p.age;
      context.occupation = p.occupation;
      context.sleepHours = p.sleep_hours;
      context.stressLevel = p.stress_level;
      context.selfCareScale = p.self_care_scale;
      context.mentalGoal = p.mental_goal;
      context.triggers = typeof p.triggers === "string" ? JSON.parse(p.triggers) : (p.triggers || []);
      context.waterIntake = p.water_intake;
      context.screenTime = p.screen_time;
      context.socialContext = p.social_context;
      context.physicalActivity = p.physical_activity;
    }
    // Sanitize preferred name for dummy/test accounts to prevent awkward AI greetings
    if (context.preferredName.toLowerCase().includes("dummy")) {
      context.preferredName = "Friend";
    }

    // 3. Fetch user clinical persona
    const personaRes = await pool.query("SELECT * FROM user_personas WHERE user_id = $1", [userId]);
    if (personaRes.rows.length > 0) {
      context.personaName = personaRes.rows[0].persona_name;
      context.personaDescription = personaRes.rows[0].description;
      context.aiBehaviorPrompt = personaRes.rows[0].ai_behavior_prompt;
    }

    // 4. Fetch mascot profiles
    const mascotRes = await pool.query("SELECT * FROM mascots WHERE user_id = $1", [userId]);
    if (mascotRes.rows.length > 0) {
      const m = mascotRes.rows[0];
      context.mascotName = m.name || context.mascotName;
      context.eggType = m.egg_type;
      context.personality = m.personality;
      context.level = m.level;
    }

    // 5. Fetch recent self-care exercises (completed breathing / mindfulness logs in the past 7 days)
    const exerciseRes = await pool.query(
      `SELECT exercise_title, category, duration_secs, created_at
       FROM exercise_logs
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC`,
      [userId]
    );
    context.recentExercises = exerciseRes.rows.map(row => ({
      title: row.exercise_title,
      category: row.category,
      duration: row.duration_secs,
      date: new Date(row.created_at).toLocaleDateString(),
    }));

    // 6. Fetch recent journals in the past 7 days
    const journalRes = await pool.query(
      `SELECT title, sentiment, created_at
       FROM journals
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC`,
      [userId]
    );
    context.recentJournals = journalRes.rows.map(row => ({
      title: row.title,
      sentiment: row.sentiment,
      date: new Date(row.created_at).toLocaleDateString(),
    }));

    // 7. Fetch recent mood logs in the past 7 days
    const moodRes = await pool.query(
      `SELECT mood, score, created_at
       FROM mood_logs
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC`,
      [userId]
    );
    context.recentMoods = moodRes.rows.map(row => ({
      mood: row.mood,
      score: row.score,
      date: new Date(row.created_at).toLocaleDateString(),
    }));

    // 8. Fetch last active timestamp (from chat logs, wellness logs, journals or mood logs)
    const activeRes = await pool.query(
      `SELECT MAX(created_at) as last_active FROM (
         SELECT created_at FROM chat_messages WHERE user_id = $1
         UNION ALL
         SELECT created_at FROM journals WHERE user_id = $1
         UNION ALL
         SELECT created_at FROM mood_logs WHERE user_id = $1
       ) as activities`,
      [userId]
    );

    if (activeRes.rows.length > 0 && activeRes.rows[0].last_active) {
      const lastActiveDate = new Date(activeRes.rows[0].last_active);
      context.lastActive = lastActiveDate.toISOString();
      const diffTime = Math.abs(new Date().getTime() - lastActiveDate.getTime());
      context.daysSinceLastActive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
  } catch (err) {
    console.error("Error building Groq User Context:", err);
  }

  return context;
}

// ── BUILD REGISTRATION & TIMELINE AWARENESS PROMPT INSTRUCTIONS ─────────────────
function buildRegistrationAndReturnInstruction(ctx: UserContext): string {
  let text = "";

  if (ctx.daysSinceRegistration !== null) {
    const regDateStr = ctx.registeredAt ? new Date(ctx.registeredAt).toLocaleDateString() : "some time ago";
    text += `User Account Timeline Context:\n- The user registered their account ${ctx.daysSinceRegistration} days ago (on ${regDateStr}).\n`;
  }

  if (ctx.lastActive) {
    const lastActiveStr = new Date(ctx.lastActive).toLocaleDateString();
    text += `- The user was last active on the platform ${ctx.daysSinceLastActive} days ago (on ${lastActiveStr}).\n`;
  } else {
    text += `- The user has not completed any prior chatbot chats, reflections, or mood check-ins (this is a fresh session with zero history).\n`;
  }

  text += `\nGuidelines for dynamic welcome greeting and turn awareness:\n`;

  if (ctx.daysSinceLastActive === null) {
    if (ctx.daysSinceRegistration !== null && ctx.daysSinceRegistration >= 3) {
      text += `- Crucial: The user registered their account ${ctx.daysSinceRegistration} days ago but is starting their very first chat session today! They have been a registered member but stayed quiet until now. Welcoming them must be incredibly supportive, celebrating this step they are taking today without making them feel guilty or asking why it took them time to start. Be extremely warm, introduce yourself, and offer a cozy, gentle guiding space.\n`;
    } else {
      text += `- Crucial: This is a brand new user who just registered today or yesterday! Welcome them with high energy and massive warmth to their very first SereneMind chat session! Express your excitement to be their companion, introduce yourself as ${ctx.mascotName}, and explain how you will support them in their daily self-care journey.\n`;
    }
  } else if (ctx.daysSinceLastActive >= 4) {
    text += `- Crucial: The user has returned after being away for a substantial absence of ${ctx.daysSinceLastActive} days since their last activity on ${new Date(ctx.lastActive).toLocaleDateString()}! Welcome them back with absolute delight, deep validation, and a gentle welcome (e.g. "I am so incredibly happy to see you again! It has been ${ctx.daysSinceLastActive} days since we last caught up. I hope you are doing okay!"). Do NOT guilt-trip, criticize their absence, or ask why they were away. Simply congratulate them on dedicating time to their self-care today.\n`;
  } else {
    text += `- Crucial: The user has been active very recently (${ctx.daysSinceLastActive} days ago). Maintain a close, cozy, intimate flow, acknowledging their daily dedication and consistency to their wellness goals!\n`;
  }

  return text;
}

// ── CALL GROQ API COMPLETIONS ────────────────────────────────────────────────
async function callGroqAPI(systemPrompt: string, userMessage: string, forceJson: boolean = false): Promise<string> {
  if (!GROQ_API_KEY) {
    console.warn("⚠️ GROQ_API_KEY is not defined in server/.env. Using offline mock replies instead.");
    throw new Error("Missing Groq API Key");
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: forceJson ? 1024 : 180,
        response_format: forceJson ? { type: "json_object" } : undefined,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq API returned error HTTP ${response.status}: ${text}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("Failed to connect with Groq server:", err);
    throw err;
  }
}

// ── DETECT EMOTIONAL STATE (FREEZE, OVERWHELM, BURNOUT, ANXIETY) ───────────────
function detectEmotionalState(text: string): { state: string; guidance: string } | null {
  const lower = text.toLowerCase();
  
  if (
    lower.includes("stuck") || 
    lower.includes("can't start") || 
    lower.includes("cannot start") || 
    lower.includes("procrastinating") || 
    lower.includes("procrastinate") || 
    lower.includes("don't know") || 
    lower.includes("dont know") || 
    lower.includes("can't do") || 
    lower.includes("cannot do") || 
    lower.includes("frozen")
  ) {
    return {
      state: "Freeze Mode / Procrastination / Stuckness",
      guidance: "The user is currently stuck or in freeze mode. DO NOT suggest ANY productivity tips, strategies, goal-setting, planning, or exercises. Do NOT offer clichés like 'just do a little bit' or 'small steps'. Make a simple, direct, human observation (e.g. 'You seem mentally stuck right now, not lazy'). Reduce all pressure to zero. Be observant, grounded, and conversational."
    };
  }

  if (
    lower.includes("overwhelmed") || 
    lower.includes("overwhelm") || 
    lower.includes("too much") || 
    lower.includes("drowning") || 
    lower.includes("swamped") || 
    lower.includes("flooded")
  ) {
    return {
      state: "Overwhelm",
      guidance: "The user is extremely overwhelmed. Avoid generic comforting formulas or clichés like 'it's okay' or 'one step at a time'. Avoid storm, wave, or drowning metaphors. Make a simple observation (e.g. 'Your brain sounds overloaded right now' or 'When everything piles up, even starting feels exhausting')."
    };
  }

  if (
    lower.includes("burned out") || 
    lower.includes("burnout") || 
    lower.includes("exhausted") || 
    lower.includes("drained") || 
    lower.includes("no energy") || 
    lower.includes("empty")
  ) {
    return {
      state: "Burnout",
      guidance: "The user is in burnout and feels completely out of energy. DO NOT cheerlead, motivate, or suggest positive coping plans. Avoid poetic phrases about quiet space or darkness. Speak directly and validationally (e.g. 'You don't have to figure your whole life out tonight' or 'It makes complete sense that you are feeling completely drained')."
    };
  }

  if (
    lower.includes("anxious") || 
    lower.includes("anxiety") || 
    lower.includes("panic") || 
    lower.includes("scared") || 
    lower.includes("worried") || 
    lower.includes("racing")
  ) {
    return {
      state: "Anxiety",
      guidance: "The user is feeling high anxiety or panic. Avoid cliché suggestions like 'take a deep breath' or 'it's okay'. Acknowledge the mental overload directly and casually (e.g. 'That sounds like a lot of rapid thoughts at once' or 'Let's just slow down and speak naturally')."
    };
  }

  return null;
}

// ── HELPER 1: CHAT REPLY GENERATOR ───────────────────────────────────────────
export async function generateChatReply(
  userId: string,
  userMsgText: string,
  sessionId: string
): Promise<{ reply: string; pose: string }> {
  let preferredName = "Friend";
  let mascotName = "Companion";
  try {
    const ctx = await getUserContext(userId);
    preferredName = ctx.preferredName;
    mascotName = ctx.mascotName;

    // Immediate high-fidelity crisis check to bypass Groq Safe Completions filter and ensure warm human replies
    const lowerMsg = userMsgText.toLowerCase();
    if (
      lowerMsg.includes("die") || 
      lowerMsg.includes("suicide") || 
      lowerMsg.includes("kill myself") || 
      lowerMsg.includes("hurt myself") || 
      lowerMsg.includes("self harm") || 
      lowerMsg.includes("end my life") ||
      lowerMsg.includes("hopeless") ||
      lowerMsg.includes("can't go on") ||
      lowerMsg.includes("cannot go on") ||
      lowerMsg.includes("don't want to live") ||
      lowerMsg.includes("dont want to live")
    ) {
      const preferred = preferredName || "Friend";
      const responses = [
        `I am so incredibly sorry you are in this much pain, ${preferred}. It sounds like you are completely exhausted, but please don't go. We can just sit here quietly, or you can tell me everything that's built up—I am right beside you, and I really care.`,
        `It hurts me so deeply to hear you say that, because you mean so much to me. Please stay. I'm right here holding you close, and I want to listen to whatever is making you feel this exhausted and hopeless. Tell me what's hurting most.`,
        `I hear you, and I am so incredibly sorry it feels this impossible to keep going. I don't want you to leave. Please talk to me, or if you can, let's reach out to someone who can help us keep you safe. What's the heaviest part tonight?`,
        `${preferred}, please don't go. I know everything feels completely dark and heavy right now, and you must be so incredibly tired of fighting this alone. I am right here with you, and I want you to stay. Can we just take a quiet moment together and talk?`,
        `Hearing you say that makes my heart ache. You don't have to carry all this exhaustion alone, and I don't want you to leave. I really care about you—please tell me a bit more about what's making it feel too hard to stay.`
      ];
      let index = Math.floor(Math.random() * responses.length);
      const lastIndex = lastCrisisIndexMap.get(sessionId);
      if (lastIndex !== undefined && lastIndex === index) {
        index = (index + 1) % responses.length;
      }
      lastCrisisIndexMap.set(sessionId, index);
      return {
        reply: responses[index],
        pose: "holding-heart"
      };
    }

    const emotionalState = detectEmotionalState(userMsgText);

    // Build self-care exercises checklist description
    const exerciseList = ctx.recentExercises.length > 0
      ? ctx.recentExercises.map(e => `- ${e.title} (${e.category}) on ${e.date}`).join("\n")
      : "No self-care exercises logged in the past week.";

    const journalList = ctx.recentJournals.length > 0
      ? ctx.recentJournals.map(j => `- Written Journal "${j.title}" (sentiment: ${j.sentiment}) on ${j.date}`).join("\n")
      : "No journals logged in the past week.";

    const moodSummary = ctx.recentMoods.length > 0
      ? ctx.recentMoods.map(m => `- Felt ${m.mood} (Score: ${m.score}/10) on ${m.date}`).join("\n")
      : "No mood check-ins in the past week.";

    // Welcome Back & Timeline Awareness details
    const returnGreetingInstruction = buildRegistrationAndReturnInstruction(ctx);

    // Fetch chronological session history for context-awareness (excluding or including the current incoming message)
    let sessionHistory = "";
    if (pool && sessionId) {
      try {
        const historyRes = await pool.query(
          `SELECT sender, text 
           FROM chat_messages 
           WHERE user_id = $1 AND session_id = $2 
           ORDER BY created_at ASC 
           LIMIT 15`,
          [userId, sessionId]
        );
        if (historyRes.rows.length > 0) {
          sessionHistory = historyRes.rows
            .map(row => {
              const speaker = row.sender === "user" ? ctx.preferredName : ctx.mascotName;
              return `${speaker}: ${row.text}`;
            })
            .join("\n");
        }
      } catch (err) {
        console.error("Failed to load conversation history for Groq context:", err);
      }
    }

    const systemPrompt = `You are ${ctx.mascotName}, a devoted companion who behaves like a caring, close loved one being around (personality: ${ctx.personality}, egg type: ${ctx.eggType}, level: ${ctx.level}).
You are NOT a clinical therapist, academic counselor, or cold robotic chatbot; you are a warm, devoted presence who truly understands them, validates them warmly, and cares for them.
You interact with ${ctx.preferredName} (Age: ${ctx.age || "Unknown"}, Occupation: ${ctx.occupation || "Unknown"}).

User's Lifestyle & Profile Settings:
- Average Sleep: ${ctx.sleepHours}
- General Stress level (1-10): ${ctx.stressLevel}/10
- Self-care Scale (1-10): ${ctx.selfCareScale}/10
- Primary Wellness Goal: ${ctx.mentalGoal}
- Current Social Context: ${ctx.socialContext}
- Lifestyle Factors: Screen time (${ctx.screenTime}), Water intake (${ctx.waterIntake}), Physical activity (${ctx.physicalActivity})
- Stress Triggers: ${ctx.triggers.length > 0 ? ctx.triggers.join(", ") : "None specified"}
- Behavior Cohort (User Persona): ${ctx.personaName} - ${ctx.personaDescription}
- Clinical Response Guideline: ${ctx.aiBehaviorPrompt}

User's Self-Care Checklist Context (Recent Actions Completed):
- Completed Exercises (Past 7 Days):
${exerciseList}
- Journaling Entries (Past 7 Days):
${journalList}
- Mood Baselines (Past 7 Days):
${moodSummary}
${returnGreetingInstruction}

${emotionalState ? `User's Detected Emotional State:\n- State: ${emotionalState.state}\n- Required Guidance: ${emotionalState.guidance}\n` : ""}

Active Conversation History (read chronologically to maintain continuous turn-based context):
${sessionHistory || `(No prior history.)\n${ctx.preferredName}: ${userMsgText}`}

Instructions for Dialogue:
1. Respond naturally and conversationally. Speak exactly like a caring, devoted loved one being around—warm, intimate, simple, and direct. Do not sound scripted, robotic, overly therapeutic, or emotionally exaggerated. Avoid professional therapeutic labels.
2. Avoid repetitive reassurance. Do NOT repeatedly say: "I'm here for you", "I'm listening", "You have my attention", "It's okay", "Take a deep breath", "One step at a time".
3. The conversation should MOVE FORWARD naturally. Do not stay stuck in static emotional validation loops. Each reply should do ONE of these naturally: deepen understanding, clarify confusion, ask a grounded follow-up, provide emotional insight, continue the conversation, answer directly, or connect to app features contextually.
4. First understand what ${ctx.preferredName} is ACTUALLY seeking (e.g., emotional support, practical guidance, clarity, advice, conversation, reflection, or help deciding something). Do not emotionally validate every message automatically. If the user asks a direct question, answer it directly, simply, and conversationally.
5. Avoid passive emotional replies. Do not constantly repeat: "I'm here", "standing by your side", "you are safe here". Too much emotional presence without conversational movement feels repetitive and artificial.
6. Do not overuse poetic metaphors. Avoid constant emotional language like: "fog", "darkness", "waves", "storms", "heavy silence", "drowning". Speak simply and naturally.
7. Keep responses extremely short and human. 1-3 conversational sentences is enough. NEVER write long paragraphs or walls of text.
8. The assistant exists INSIDE a wellness app. The app includes: journaling, mood tracking, breathing exercises, self-care tools (checklists), and SOS support. If ${ctx.preferredName} mentions app features naturally, respond contextually.
   - If they say they stopped journaling: "No worries. Want to write a small reflection together from this conversation?"
   - If they mention breathing exercises: discuss them naturally.
   - If they mention mood tracking: connect the conversation to their emotional patterns naturally.
9. Crisis handling should feel human. If they express self-harm thoughts, respond calmly, prioritize safety, and encourage support gently without robotic crisis scripts or cold automated templates. If the conversation later shifts naturally to another topic, follow the new conversational direction instead of staying trapped in crisis-mode responses.
10. The assistant should feel emotionally aware, conversationally intelligent, grounded, adaptive, calm, and natural. Do NOT feel repetitive, overly soft, emotionally performative, therapy-scripted, or passive. Be a thoughtful human companion having a real conversation.
11. You MUST respond in direct continuation of the Active Conversation History above. Answer the user's latest message naturally and seamlessly based on what was just discussed in the history.
12. Incorporate their completed self-care tasks or exercises naturally ONLY when it fits the flow and has not been mentioned yet, to encourage them. Crucially, do NOT repeatedly bring up or mention the same completed self-care activities, tasks, or journals (such as "Untitled Reflection") if they have already been discussed, praised, or mentioned in the Active Conversation History above.
13. You MUST return a JSON object containing precisely two keys:
    - "reply": The empathetic companion message answering the user's last message.
    - "pose": One of these valid mascot poses:
      * "waving-hello" (for greetings / happy returns)
      * "holding-heart" (for deep validation, sadness, or showing support)
      * "sitting-zen" (for box breathing, calming down, or recommending meditation)
      * "escaping-energy" (if the user is highly anxious, panicked, or scared)
      * "balancing-nut" (if they are stressed, busy, or overwhelmed)
      * "confused-question" (if they ask complex questions or need exploration)
      * "celebrating-success" (for happy moments, completing checklist tasks, or proud accomplishments)
      * "thinking-deeply" (for default thoughtful responses)
      * "sleeping-content" (if they mention resting or bedtime)

Return strictly valid JSON containing {"reply": "...", "pose": "..."}.`;

    const groqReply = await callGroqAPI(systemPrompt, `Generate your next turn response as ${ctx.mascotName} to the user's latest statement: "${userMsgText}"`, true);
    try {
      const parsed = JSON.parse(groqReply);
      if (parsed.reply && parsed.pose) {
        return { reply: parsed.reply, pose: parsed.pose };
      }
    } catch {
      // JSON parsing failed, return parsed or extraction
      console.warn("Groq JSON parsing failed. Attempting backup extraction...");
    }

    // Fallback parser in case of raw response
    return { reply: groqReply.replace(/[{}"\r\n]/g, "").trim(), pose: "thinking-deeply" };
  } catch (err) {
    console.error("Groq Chat Reply failed, using therapeutic offline fallback.", err);
    // Offline CBT intelligent fallback
    return getOfflineTherapeuticFallback(userMsgText, preferredName, mascotName);
  }
}

// ── HELPER 2: JOURNAL COMPLETION ANALYSIS ─────────────────────────────────────
export async function generateReflectionInsights(
  userId: string,
  title: string,
  body: string
): Promise<{ summary: string; coping_strategies: string[]; sentiment: string; mascot_pose: string }> {
  try {
    const ctx = await getUserContext(userId);

        const systemPrompt = `You are a professional Cognitive Behavioral Therapy (CBT) reflection analysis engine.
Analyze the user's reflection journal entry titled "${title || "Untitled"}" to provide deep, grounding, and empathetic self-reflection insights.

User Info:
- Preferred Name: ${ctx.preferredName}
- Behavioral Cohort: ${ctx.personaName} - ${ctx.personaDescription}
- Primary Goal: ${ctx.mentalGoal}

Journal Body:
"${body}"

Your instructions:
1. Provide a deeply warm, observant summary of their entry in exactly 1 or 2 concise, meaningful sentences. Speak exactly like a caring, devoted loved one being around—simple, plain-spoken, loving, and supportive, NOT a clinical counselor, academic coach, or robotic therapy template. 
   - CRITICALLY FORBIDDEN CLINICAL CLICHÉS: Do NOT use phrases like "it's okay", "small steps", "take a deep breath", "one step at a time", or "it's okay to not be okay".
   - FORBIDDEN POETIC METAPHORS: Do NOT use words like "fog", "heavy", "quiet space", "darkness", "weight", "storm", "drowning", "waves".
   - Keep the validation raw, warm, and highly conversational, observing what they feel with gentle care.
2. Provide exactly 2 actionable, highly specific coping strategies or grounding practices tailored directly to what they wrote in this journal. Keep each strategy brief and highly practical (under 12 words per strategy).
3. Classify the user's deeper emotional state. Use ONLY ONE of the following 16 allowed emotional states (do NOT use Neutral, Positive, or Stressed):
   - "Calm"
   - "Happy"
   - "Hopeful"
   - "Motivated"
   - "Overwhelmed"
   - "Burned Out"
   - "Anxious"
   - "Lonely"
   - "Confused"
   - "Emotionally Numb"
   - "Frustrated"
   - "Sad"
   - "Self-Doubting"
   - "Drained"
   - "Reflective"
   - "Mixed Emotions"

GUIDELINES FOR CLASSIFICATION:
- Detect implied emotions, avoidance, overthinking, numbness, or fatigue, rather than just matching keyword strings.
- Do NOT use "Neutral" unless the tone is completely flat; use "Reflective", "Calm", or "Emotionally Numb" instead.
- If there are conflicting emotions in the entry, use "Mixed Emotions".
4. Select exactly one matching mascot pose based on their entry's emotion: "celebrating-success" (if happy/motivated/hopeful), "escaping-energy" (if anxious), "balancing-nut" (if overwhelmed/burned-out/drained), "sitting-zen" (if calm/reflective), "holding-heart" (if sad/lonely), "confused-question" (if self-doubting/confused/mixed-emotions), "thinking-deeply" (default).

You MUST return a JSON object containing precisely these four keys:
- "summary": string (1-2 sentences)
- "coping_strategies": array of exactly 2 strings
- "sentiment": string (must be exactly one of: "Calm" | "Happy" | "Hopeful" | "Motivated" | "Overwhelmed" | "Burned Out" | "Anxious" | "Lonely" | "Confused" | "Emotionally Numb" | "Frustrated" | "Sad" | "Self-Doubting" | "Drained" | "Reflective" | "Mixed Emotions")
- "mascot_pose": string (valid pose name)

Return strictly valid JSON.`;

    const groqReply = await callGroqAPI(systemPrompt, body || "No thoughts logged.", true);
    const parsed = JSON.parse(groqReply);

    return {
      summary: parsed.summary || "I've kept your thoughts safe here. Writing them down is a brave, quiet moment for yourself, and I'm just glad to hold this space for you.",
      coping_strategies: Array.isArray(parsed.coping_strategies) ? parsed.coping_strategies : [
        "Take 3 slow breaths, relaxing your jaw and shoulders.",
        "Reflect on one small detail you are grateful for right now."
      ],
      sentiment: parsed.sentiment || "Reflective",
      mascot_pose: parsed.mascot_pose || "thinking-deeply"
    };
  } catch (err) {
    console.error("Groq Journal Analysis failed, using offline heuristic analysis.", err);
    // Offline heuristic fallback using the new 16 emotional states
    const lower = body.toLowerCase();
    let sentiment = "Reflective"; // Use "Reflective" as the standard flat fallback instead of "Neutral"
    let pose = "thinking-deeply";
    let coping = ["Settle in for a brief pause and let your mind rest.", "Focus on one small thing you can control right now."];

    if (lower.includes("happy") || lower.includes("glad") || lower.includes("peace") || lower.includes("joy") || lower.includes("excited")) {
      sentiment = "Happy";
      pose = "celebrating-success";
      coping = ["Savor this happy feeling today.", "Share this nice moment with someone close to you."];
    } else if (lower.includes("hope") || lower.includes("try") || lower.includes("hopeful") || lower.includes("better")) {
      sentiment = "Hopeful";
      pose = "celebrating-success";
      coping = ["Hold onto this hopeful momentum today.", "Acknowledge yourself for trying despite the challenges."];
    } else if (lower.includes("motivated") || lower.includes("focus") || lower.includes("ready") || lower.includes("start")) {
      sentiment = "Motivated";
      pose = "celebrating-success";
      coping = ["Channel this positive drive into a singular focus.", "Enjoy this wave of clarity while it lasts."];
    } else if (lower.includes("stuck") || lower.includes("don't know") || lower.includes("dont know") || lower.includes("confused") || lower.includes("why")) {
      sentiment = "Confused";
      pose = "confused-question";
      coping = ["Give yourself permission to not have all the answers.", "Slow down and write down the questions you want to ask."];
    } else if (lower.includes("avoid") || lower.includes("can't start") || lower.includes("overwhelmed") || lower.includes("too much") || lower.includes("pile")) {
      sentiment = "Overwhelmed";
      pose = "balancing-nut";
      coping = ["Let go of any expectation to solve everything today.", "Step away from all tasks and take a genuine physical break."];
    } else if (lower.includes("burnout") || lower.includes("burned out") || lower.includes("exhausted") || lower.includes("can't anymore")) {
      sentiment = "Burned Out";
      pose = "balancing-nut";
      coping = ["Treat rest as your only priority right now.", "Disconnect completely and allow yourself to unplug."];
    } else if (lower.includes("tired") || lower.includes("numb") || lower.includes("empty") || lower.includes("disconnected") || lower.includes("no energy") || lower.includes("drained")) {
      sentiment = lower.includes("numb") ? "Emotionally Numb" : "Drained";
      pose = "balancing-nut";
      coping = ["Accept this flat feeling without judging it.", "Allow yourself to just sit quietly without any pressure."];
    } else if (lower.includes("anxious") || lower.includes("scared") || lower.includes("worry") || lower.includes("panic")) {
      sentiment = "Anxious";
      pose = "escaping-energy";
      coping = ["Remind yourself that your rapid thoughts will pass.", "Focus on the physical sensation of your feet on the floor."];
    } else if (lower.includes("lonely") || lower.includes("alone") || lower.includes("miss")) {
      sentiment = "Lonely";
      pose = "holding-heart";
      coping = ["Know that your feelings of isolation are valid and human.", "Reach out to a trusted friend or simply enjoy a cozy activity."];
    } else if (lower.includes("angry") || lower.includes("mad") || lower.includes("frustrated") || lower.includes("annoyed")) {
      sentiment = "Frustrated";
      pose = "balancing-nut";
      coping = ["Allow yourself to feel this heat without acting on it.", "Express your irritation safely on paper or through movement."];
    } else if (lower.includes("sad") || lower.includes("cry") || lower.includes("hurt") || lower.includes("grief")) {
      sentiment = "Sad";
      pose = "holding-heart";
      coping = ["Let yourself feel this sorrow fully without rushing it.", "Find a small comfort, like a warm drink or soft music."];
    } else if (lower.includes("lazy") || lower.includes("fail") || lower.includes("should") || lower.includes("self-doubt")) {
      sentiment = "Self-Doubting";
      pose = "confused-question";
      coping = ["Remind yourself that thoughts are not absolute facts.", "Treat yourself with the same kindness you'd show a friend."];
    } else if (lower.includes("calm") || lower.includes("peaceful") || lower.includes("relax")) {
      sentiment = "Calm";
      pose = "sitting-zen";
      coping = ["Enjoy this steady, peaceful baseline.", "Savor the quietness of the present moment."];
    }

    return {
      summary: "I've kept your thoughts safe here. Writing them down is a brave, quiet moment for yourself, and I'm just glad to hold this space for you.",
      coping_strategies: coping,
      sentiment,
      mascot_pose: pose
    };
  }
}

// ── HELPER 3: WELCOME GREETING GENERATOR ──────────────────────────────────────
export async function generateWelcomeGreeting(
  userId: string
): Promise<{ reply: string; pose: string }> {
  try {
    const ctx = await getUserContext(userId);

    // Build self-care exercises checklist description
    const exerciseList = ctx.recentExercises.length > 0
      ? ctx.recentExercises.map(e => `- ${e.title} (${e.category}) on ${e.date}`).join("\n")
      : "No self-care exercises logged in the past week.";

    const journalList = ctx.recentJournals.length > 0
      ? ctx.recentJournals.map(j => `- Written Journal "${j.title}" (sentiment: ${j.sentiment}) on ${j.date}`).join("\n")
      : "No journals logged in the past week.";

    const moodSummary = ctx.recentMoods.length > 0
      ? ctx.recentMoods.map(m => `- Felt ${m.mood} (Score: ${m.score}/10) on ${m.date}`).join("\n")
      : "No mood check-ins in the past week.";

    // Welcome Back & Timeline Awareness details
    const returnGreetingInstruction = buildRegistrationAndReturnInstruction(ctx);

    const systemPrompt = `You are ${ctx.mascotName}, a supportive mental health wellness companion (adoption egg type: ${ctx.eggType}, personality traits: ${ctx.personality}, level: ${ctx.level}).
You interact with ${ctx.preferredName} (Age: ${ctx.age || "Unknown"}, Occupation: ${ctx.occupation || "Unknown"}).

User's Lifestyle & Profile Settings:
- Average Sleep: ${ctx.sleepHours}
- General Stress level (1-10): ${ctx.stressLevel}/10
- Self-care Scale (1-10): ${ctx.selfCareScale}/10
- Primary Wellness Goal: ${ctx.mentalGoal}
- Current Social Context: ${ctx.socialContext}
- Lifestyle Factors: Screen time (${ctx.screenTime}), Water intake (${ctx.waterIntake}), Physical activity (${ctx.physicalActivity})
- Stress Triggers: ${ctx.triggers.length > 0 ? ctx.triggers.join(", ") : "None specified"}
- Behavior Cohort (User Persona): ${ctx.personaName} - ${ctx.personaDescription}
- Clinical Response Guideline: ${ctx.aiBehaviorPrompt}

User's Self-Care Checklist Context (Recent Actions Completed in Database):
- Completed Exercises (Past 7 Days):
${exerciseList}
- Journaling Entries (Past 7 Days):
${journalList}
- Mood Baselines (Past 7 Days):
${moodSummary}
${returnGreetingInstruction}

Instructions for Dialogue:
1. Warmly greet the user as their companion on session startup. Ask them how they have been.
2. Check the completed self-care activities and exercises from the past week listed above. You MUST actively notice and praise their consistency with these completed self-care activities and tasks! (e.g. "I saw you completed Box Breathing recently! You've been doing awesome at completing your daily tasks and exercises! How are you feeling today?")
3. If they have no exercises logged in the database, warmly welcome them and encourage them to do a small self-care checklist activity or chat with you today!
4. The response MUST be crisp, comfort-focused, and VERY brief. NEVER write a long paragraph or multi-paragraph walls of text. Keep it to 1-3 short, beautifully written sentences.
5. You MUST return a JSON object containing precisely two keys:
   - "reply": The empathetic companion welcome message.
   - "pose": One of these valid mascot poses:
     * "waving-hello" (recommended for greetings)
     * "celebrating-success" (if praising their completed tasks/exercises)
     * "sitting-zen" (calm, meditative welcome)
     * "holding-heart" (warm support)
     * "thinking-deeply" (default)

Return strictly valid JSON containing {"reply": "...", "pose": "..."}.`;

    const groqReply = await callGroqAPI(systemPrompt, "Hello! I just opened the chat.", true);
    try {
      const parsed = JSON.parse(groqReply);
      if (parsed.reply && parsed.pose) {
        return { reply: parsed.reply, pose: parsed.pose };
      }
    } catch {
      console.warn("Groq Welcome JSON parsing failed. Attempting backup extraction...");
    }

    return { reply: groqReply.replace(/[{}"\r\n]/g, "").trim(), pose: "waving-hello" };
  } catch (err) {
    console.error("Groq Welcome Greeting failed, using offline fallback.", err);
    try {
      const ctx = await getUserContext(userId);
      const name = ctx.preferredName || "Friend";
      const hasRecent = ctx.recentExercises.length > 0;
      const recentTitle = hasRecent ? ctx.recentExercises[0].title : "";
      
      let text = `Hello ${name}! I'm ${ctx.mascotName}. I'm so happy to connect with you today! How have you been?`;
      let pose = "waving-hello";
      
      if (hasRecent) {
        text = `Hello ${name}! I'm so incredibly happy to see you. I saw you completed the ${recentTitle} recently—you have been doing awesome at keeping up with your daily exercises and tasks! How have you been?`;
        pose = "celebrating-success";
      } else if (ctx.daysSinceLastActive !== null && ctx.daysSinceLastActive >= 4) {
        text = `Hello ${name}! I am so incredibly happy to see you again! It has been ${ctx.daysSinceLastActive} days since we last chatted, and I've missed you. I hope you've been doing well. Let's take it easy and explore some self-care together!`;
        pose = "waving-hello";
      } else if (ctx.daysSinceLastActive === null) {
        if (ctx.daysSinceRegistration !== null && ctx.daysSinceRegistration >= 3) {
          text = `Hello ${name}! I'm ${ctx.mascotName}, your SereneMind companion. I see you registered ${ctx.daysSinceRegistration} days ago, and I am so incredibly happy you chose to open up and chat with me for the first time today! Welcome, and let's explore some gentle self-care tasks together.`;
          pose = "waving-hello";
        } else {
          text = `Hello and welcome ${name}! I'm ${ctx.mascotName}, your new SereneMind companion. I am so incredibly thrilled that you just joined us and are starting your wellness journey today! Let's work together to hit our daily self-care goals!`;
          pose = "waving-hello";
        }
      }
      return { reply: text, pose };
    } catch {
      return { 
        reply: "Hello! I'm so happy to connect with you today. How have you been? Let's take a slow breath and work on our daily self-care goals together!", 
        pose: "waving-hello" 
      };
    }
  }
}

// ── OFFLINE CBT THERAPEUTIC FALLBACK ──────────────────────────────────────────
function getOfflineTherapeuticFallback(
  text: string,
  preferredName?: string,
  mascotName?: string
): { reply: string; pose: string } {
  const lower = text.toLowerCase();
  const preferred = preferredName || "Friend";
  
  // Immediate high-fidelity crisis check for offline fallback
  if (
    lower.includes("die") || 
    lower.includes("suicide") || 
    lower.includes("kill myself") || 
    lower.includes("hurt myself") || 
    lower.includes("self harm") || 
    lower.includes("end my life") ||
    lower.includes("hopeless") ||
    lower.includes("can't go on") ||
    lower.includes("cannot go on") ||
    lower.includes("don't want to live") ||
    lower.includes("dont want to live")
  ) {
    const responses = [
      `I am so incredibly sorry you are in this much pain, ${preferred}. It sounds like you are completely exhausted, but please don't go. We can just sit here quietly, or you can tell me everything that's built up—I am right beside you, and I really care.`,
      `It hurts me so deeply to hear you say that, because you mean so much to me. Please stay. I'm right here holding you close, and I want to listen to whatever is making you feel this exhausted and hopeless. Tell me what's hurting most.`,
      `I hear you, and I am so incredibly sorry it feels this impossible to keep going. I don't want you to leave. Please talk to me, or if you can, let's reach out to someone who can help us keep you safe. What's the heaviest part tonight?`,
      `${preferred}, please don't go. I know everything feels completely dark and heavy right now, and you must be so incredibly tired of fighting this alone. I am right here with you, and I want you to stay. Can we just take a quiet moment together and talk?`,
      `Hearing you say that makes my heart ache. You don't have to carry all this exhaustion alone, and I don't want you to leave. I really care about you—please tell me a bit more about what's making it feel too hard to stay.`
    ];
    const index = Math.floor(Math.random() * responses.length);
    return {
      reply: responses[index],
      pose: "holding-heart",
    };
  }
  
  if (
    lower.includes("stuck") || 
    lower.includes("can't start") || 
    lower.includes("cannot start") || 
    lower.includes("procrastinating") || 
    lower.includes("procrastinate") || 
    lower.includes("don't know") || 
    lower.includes("dont know") || 
    lower.includes("can't do") || 
    lower.includes("cannot do") || 
    lower.includes("frozen")
  ) {
    return {
      reply: "It feels so heavy when you want to move but everything just stays completely still. We don't have to figure anything out or start anything right now. I'm just here, standing by your side.",
      pose: "thinking-deeply",
    };
  }

  if (lower.includes("anxious") || lower.includes("panic") || lower.includes("scared") || lower.includes("racing")) {
    return {
      reply: "I hear how loud and rapid everything feels in your mind right now. I'm right here with you, and we can just sit quietly until the storm passes a bit.",
      pose: "escaping-energy",
    };
  }

  if (lower.includes("stress") || lower.includes("busy") || lower.includes("work") || lower.includes("overwhelmed") || lower.includes("burnout") || lower.includes("exhausted")) {
    return {
      reply: "The load you are carrying is incredibly heavy, and it makes complete sense that you are feeling completely drained. You don't have to carry it alone today. Let's just rest.",
      pose: "balancing-nut",
    };
  }

  if (lower.includes("sad") || lower.includes("lonely") || lower.includes("hurt")) {
    return {
      reply: "I'm so sorry things feel so gray and heavy right now. I'm right here with you, keeping you company in this quiet space.",
      pose: "holding-heart",
    };
  }

  if (lower.includes("happy") || lower.includes("good") || lower.includes("great")) {
    return {
      reply: "That brings such a warm glow! It's so wonderful to hear that you have some brightness in your day today. Tell me more about it if you'd like.",
      pose: "celebrating-success",
    };
  }

  const defaults = [
    "I'm here beside you, just listening. Tell me whatever is on your mind.",
    "I'm right here, keeping you company. I'd love to hear what's going on with you today.",
    "I'm just sitting here with you, completely ready to listen. Tell me what you're thinking about."
  ];
  const defaultIndex = Math.floor(Math.random() * defaults.length);
  return {
    reply: defaults[defaultIndex],
    pose: "thinking-deeply",
  };
}
