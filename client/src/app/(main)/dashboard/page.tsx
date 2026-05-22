"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Mascot, { HamsterPose } from "../../components/Mascot";
import { useAuth } from "../../context/AuthContext";
import { api, MascotData, PersonaData } from "../../lib/api";

type Mood = "Calm" | "Anxious" | "Stressed" | "Sad" | "Energetic";

interface AdoptedMascot {
  name: string;
  eggType: string;
  initialPersonality: string;
  level: number;
}

interface UserPersona {
  age: string;
  occupation: string;
  sleepHours: string;
  stressLevel: number;
  triggers: string[];
  selfCareScale: number;
  mentalGoal: string;
}

const EGGS = [
  { id: "sage", label: "Moss Sage Egg", color: "var(--color-success)", glow: "rgba(90, 148, 117, 0.4)", desc: "Hatches a Joyful companion: Cheerful, active, and highly motivating." },
  { id: "sapphire", label: "Mist Sapphire Egg", color: "var(--color-primary)", glow: "rgba(91, 127, 166, 0.4)", desc: "Hatches a Peaceful companion: Quiet, pensive, and deeply comforting." },
  { id: "amethyst", label: "Lavender Amethyst Egg", color: "var(--color-accent)", glow: "rgba(169, 146, 196, 0.4)", desc: "Hatches a Zen companion: Stoic, calm, and perfectly balanced." },
  { id: "hearth", label: "Terracotta Hearth Egg", color: "var(--color-error)", glow: "rgba(192, 118, 90, 0.4)", desc: "Hatches a Guardian companion: Protective, warm, and highly encouraging." },
];

export default function DashboardPage() {
  const { user } = useAuth();

  // Navigation & Adoption States
  const [hasAdoptedMascot, setHasAdoptedMascot] = useState(true);
  const [hasFilledPersona, setHasFilledPersona] = useState(true);
  const [isLoadingMascot, setIsLoadingMascot] = useState(true);

  // Egg Selection states
  const [selectedEgg, setSelectedEgg] = useState<typeof EGGS[0] | null>(null);
  const [hatchStep, setHatchStep] = useState<"choose" | "tap" | "name" | "persona">("choose");
  const [tapCount, setTapCount] = useState(0);
  const [isHatchingShaking, setIsHatchingShaking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Name & Persona Form states
  const [mascotName, setMascotName] = useState("Sparky");
  const [mascotDemeanor, setMascotDemeanor] = useState("Calming & Stoic");
  const [adoptedMascotState, setAdoptedMascotState] = useState<AdoptedMascot | null>(null);

  // Persona Telemetry states
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [sleepHours, setSleepHours] = useState("7-8 hours");
  const [stressLevel, setStressLevel] = useState(5);
  const [selfCareScale, setSelfCareScale] = useState(5);
  const [mentalGoal, setMentalGoal] = useState("Achieve Calmer Baselines");
  const [tempTriggers, setTempTriggers] = useState<string[]>([]);

  // Normal Dashboard states
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [mascotPose, setMascotPose] = useState<HamsterPose>("waving-hello");
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingText, setBreathingText] = useState("Click Start to practice");

  const moods: { label: Mood; emoji: string; pose: HamsterPose; dialogue: string }[] = [
    {
      label: "Calm",
      emoji: "🧘",
      pose: "sitting-zen",
      dialogue: "Ah, absolute serenity. Let's take a slow breath together.",
    },
    {
      label: "Anxious",
      emoji: "😰",
      pose: "escaping-energy",
      dialogue: "Heavy heart? It's okay to feel anxious. Let's discharge that together.",
    },
    {
      label: "Stressed",
      emoji: "🤯",
      pose: "balancing-nut",
      dialogue: "A lot on your mind? Let's take a step back and simplify things.",
    },
    {
      label: "Sad",
      emoji: "😢",
      pose: "holding-heart",
      dialogue: "I'm right here with a warm hug. You don't have to carry this alone.",
    },
    {
      label: "Energetic",
      emoji: "⚡",
      pose: "running-excited",
      dialogue: "Yay! Awesome vibes! Let's channel this wonderful energy!",
    },
  ];

  // Check adoption on mount — fetch from DB
  useEffect(() => {
    async function fetchMascotData() {
      try {
        const data = await api.get<{ mascot: MascotData | null; persona: PersonaData | null }>("/api/mascot");
        if (data.mascot) {
          setAdoptedMascotState({
            name: data.mascot.name,
            eggType: data.mascot.eggType,
            initialPersonality: data.mascot.personality,
            level: data.mascot.level,
          });
          setHasAdoptedMascot(true);
        } else {
          setHasAdoptedMascot(false);
          setHatchStep("choose");
        }

        if (data.persona) {
          setHasFilledPersona(true);
        } else {
          setHasFilledPersona(false);
        }
      } catch (err) {
        console.error("Failed to fetch mascot data:", err);
        setHasAdoptedMascot(false);
      } finally {
        setIsLoadingMascot(false);
      }
    }
    fetchMascotData();
  }, []);

  // Evolution engine mapping user self-care progression to mascot evolution updates
  const mascotProgressInfo = useMemo(() => {
    if (!adoptedMascotState) return { level: 1, title: "Hatchling Bond", state: "Calm Observer", pose: "waving-hello" as HamsterPose };

    const savedLogs = localStorage.getItem("wellness-logs");
    let logsCount = 0;
    let positiveCount = 0;
    let stressedCount = 0;

    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        logsCount = parsed.length;
        positiveCount = parsed.filter((l: any) => l.sentiment === "Positive").length;
        stressedCount = parsed.filter((l: any) => l.sentiment === "Stressed" || l.sentiment === "Anxious").length;
      } catch (e) {
        console.error(e);
      }
    }

    let level = 1;
    let title = "Mindful Hatchling";
    let state = "Gentle Observer";
    let pose: HamsterPose = "waving-hello";

    if (logsCount >= 6 || positiveCount >= 3) {
      level = 3;
      title = "Serenity Guardian";
      state = "Zen Master";
      pose = "sitting-zen";
    } else if (logsCount >= 3 || positiveCount >= 1) {
      level = 2;
      title = "Mindful Shield";
      state = "Uplifting Guide";
      pose = "celebrating-success";
    }

    // Stress response override
    if (stressedCount >= 2 && level < 3) {
      state = "Empathy Anchor";
      pose = "holding-heart";
    }

    return { level, title, state, pose };
  }, [adoptedMascotState]);

  // Adjust current dashboard mascot pose to match evolved state on startup
  useEffect(() => {
    if (hasAdoptedMascot && hasFilledPersona) {
      setMascotPose(mascotProgressInfo.pose);
    }
  }, [hasAdoptedMascot, hasFilledPersona, mascotProgressInfo.pose]);

  // Stabilize the breathing interval with standard hook architecture to resolve stale closures
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingActive) {
      setBreathingText("Breathe in... (Expand)");
      let count = 0;
      interval = setInterval(() => {
        count++;
        if (count % 3 === 0) {
          setBreathingText("Breathe in... (Expand)");
        } else if (count % 3 === 1) {
          setBreathingText("Hold... (Sustain)");
        } else {
          setBreathingText("Breathe out... (Relax)");
        }
      }, 4000);
    } else {
      setBreathingText("Click Start to practice");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive]);

  // Wellness log saved to DB
  const handleMoodSelect = async (moodItem: typeof moods[0]) => {
    setSelectedMood(moodItem.label);
    setMascotPose(moodItem.pose);

    let detectedSentiment = "Neutral";
    if (moodItem.label === "Calm" || moodItem.label === "Energetic") {
      detectedSentiment = "Positive";
    } else if (moodItem.label === "Anxious") {
      detectedSentiment = "Anxious";
    } else if (moodItem.label === "Stressed") {
      detectedSentiment = "Stressed";
    }

    try {
      await api.post("/api/wellness", {
        type: "mood",
        title: `Dashboard Mood Check-in: ${moodItem.label}`,
        preview: `Checked in feeling ${moodItem.label} on the main dashboard. Sparky companion noted: "${moodItem.dialogue}"`,
        sentiment: detectedSentiment,
      });
      alert(`Sparky logged your "${moodItem.label}" check-in! Feel free to review it inside your Wellness Timeline logs.`);
    } catch (err) {
      console.error("Failed to save mood log:", err);
      alert(`Sparky noted your "${moodItem.label}" mood check-in!`);
    }
  };

  const toggleBreathing = () => {
    setIsBreathingActive(!isBreathingActive);
    if (!isBreathingActive) {
      setMascotPose(mascotProgressInfo.pose);
    } else {
      setMascotPose("sitting-zen");
    }
  };

  // Egg Hatching clicks
  const handleEggTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tapCount >= 5) return;
    
    // Shaking motion effect
    setIsHatchingShaking(true);
    setTimeout(() => setIsHatchingShaking(false), 120);

    const nextTaps = tapCount + 1;
    setTapCount(nextTaps);

    // Floating text feedback
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const crackPhrases = ["*Tap!*", "*Crack!*", "*Wobble!*", "*Squeak!*", "*Burst!*"];
    
    setFloatingTexts((prev) => [
      ...prev,
      { id: Date.now(), text: crackPhrases[nextTaps - 1] || "*Crack!*", x, y },
    ]);

    if (nextTaps >= 5) {
      setTimeout(() => {
        setHatchStep("name");
      }, 900);
    }
  };

  const handleAdoptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMascot: AdoptedMascot = {
      name: mascotName.trim() || "Sparky",
      eggType: selectedEgg?.label || "Moss Sage Egg",
      initialPersonality: mascotDemeanor,
      level: 1,
    };

    try {
      await api.post("/api/mascot", {
        name: newMascot.name,
        eggType: newMascot.eggType,
        personality: newMascot.initialPersonality,
        level: 1,
      });
      setAdoptedMascotState(newMascot);
      setHasAdoptedMascot(true);
      setHatchStep("persona");
    } catch (err) {
      console.error("Failed to save mascot:", err);
      alert("Could not save mascot. Please try again.");
    }
  };

  const handlePersonaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !occupation) {
      alert("Please fill out your Age and Occupation for a validated persona.");
      return;
    }

    try {
      await api.post("/api/mascot/persona", {
        age: parseInt(age),
        occupation,
        sleepHours,
        stressLevel,
        selfCareScale,
        mentalGoal,
        triggers: tempTriggers,
      });
      setHasFilledPersona(true);
      alert(`Congratulations! ${mascotName} is now bonded, and your persona has been successfully established.`);
    } catch (err) {
      console.error("Failed to save persona:", err);
      alert("Could not save persona. Please try again.");
    }
  };

  const toggleTrigger = (tr: string) => {
    if (tempTriggers.includes(tr)) {
      setTempTriggers(tempTriggers.filter((t) => t !== tr));
    } else {
      setTempTriggers([...tempTriggers, tr]);
    }
  };

  // Show loading skeleton while fetching mascot from DB
  if (isLoadingMascot) {
    return (
      <div className="glass-card" style={{ maxWidth: "800px", margin: "40px auto", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>🌀</div>
        <p style={{ color: "var(--text-secondary)" }}>Loading your companion...</p>
      </div>
    );
  }

  // ==========================================
  // RENDER: Hatching Adoption Wizard Flow
  // ==========================================
  if (!hasAdoptedMascot || !hasFilledPersona) {
    return (
      <div
        className="glass-card"
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "var(--shadow-hover)",
          border: "1px solid var(--border-light)",
        }}
      >
        {hatchStep === "choose" && (
          <>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "40px" }}>🥚</span>
              <h2 style={{ fontSize: "28px", fontFamily: "var(--font-header)", marginTop: "12px" }}>
                Select Your Companionship Egg
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "560px", margin: "8px auto 0" }}>
                Welcome! To begin your mental health pacing, select a serene egg. Different eggs hold distinct autonomic coping personalities.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }} className="eggs-grid">
              {EGGS.map((egg) => {
                const isSel = selectedEgg?.id === egg.id;
                return (
                  <div
                    key={egg.id}
                    onClick={() => setSelectedEgg(egg)}
                    className="glass-card egg-card"
                    style={{
                      padding: "20px",
                      cursor: "pointer",
                      border: isSel ? `2.5px solid ${egg.color}` : "1.5px solid var(--border-light)",
                      backgroundColor: isSel ? `rgba(${egg.id === "sage" ? "90,148,117" : egg.id === "sapphire" ? "91,127,166" : egg.id === "amethyst" ? "169,146,196" : "192,118,90"}, 0.05)` : "var(--bg-surface)",
                      boxShadow: isSel ? `0 8px 24px ${egg.glow}` : "var(--shadow-subtle)",
                      transition: "all 0.25s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "76px",
                        borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                        backgroundColor: egg.color,
                        boxShadow: `0 4px 16px ${egg.glow}`,
                        transition: "transform 0.2s",
                      }}
                      className="egg-render"
                    />
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: "700" }}>{egg.label}</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
                        {egg.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (!selectedEgg) {
                  alert("Please choose an egg to hatch!");
                  return;
                }
                setHatchStep("tap");
              }}
              className="btn-primary"
              style={{ alignSelf: "center", padding: "12px 32px", marginTop: "16px" }}
              disabled={!selectedEgg}
            >
              Continue with Egg
            </button>
          </>
        )}

        {hatchStep === "tap" && selectedEgg && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "28px" }}>
            <div>
              <h2 style={{ fontSize: "26px", fontFamily: "var(--font-header)" }}>
                Help Your Companion Hatch!
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "480px", margin: "6px auto 0" }}>
                The egg is warm and active. **Tap rapidly on the egg 5 times** to help your baby Sparky break out of the shell!
              </p>
            </div>

            {/* Tap count force */}
            <div style={{ fontSize: "14px", fontWeight: "700", color: selectedEgg.color }}>
              CRACK FORCE: {tapCount} / 5
            </div>

            {/* Glowing Cracking Egg container */}
            <div
              onClick={handleEggTap}
              style={{
                position: "relative",
                width: "160px",
                height: "210px",
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                backgroundColor: selectedEgg.color,
                boxShadow: `0 0 40px ${selectedEgg.glow}, inset 0 -12px 24px rgba(0,0,0,0.15)`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: isHatchingShaking ? "scale(0.95) rotate(4deg)" : "scale(1)",
                transition: "transform 0.1s ease",
              }}
              className="cracking-egg-sphere"
            >
              {/* crack marks based on tap count */}
              {tapCount >= 1 && (
                <div style={{ position: "absolute", width: "100%", height: "100%", backgroundImage: "radial-gradient(circle, #2C2F35 1px, transparent 2px)", opacity: 0.6 }} />
              )}
              {tapCount >= 3 && (
                <div style={{ position: "absolute", width: "80%", height: "80%", borderTop: "2px solid #2C2F35", borderBottom: "2px solid #2C2F35", transform: "rotate(45deg)", opacity: 0.8 }} />
              )}

              {/* Floating Crack Texts */}
              {floatingTexts.map((ft) => (
                <span
                  key={ft.id}
                  style={{
                    position: "absolute",
                    left: `${ft.x}px`,
                    top: `${ft.y}px`,
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: "900",
                    pointerEvents: "none",
                    animation: "floatUp 0.8s forwards",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {ft.text}
                </span>
              ))}

              <span style={{ fontSize: "36px", pointerEvents: "none" }}>❤️</span>
            </div>

            <div style={{ width: "100%", maxWidth: "320px", height: "8px", backgroundColor: "var(--border-light)", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${(tapCount / 5) * 100}%`,
                  height: "100%",
                  backgroundColor: selectedEgg.color,
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          </div>
        )}

        {hatchStep === "name" && selectedEgg && (
          <form onSubmit={handleAdoptSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "28px", fontFamily: "var(--font-header)", color: "var(--color-success)" }}>
                🎉 EGG HATCHED SUCCESSFULLY!
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
                A cute baby Sparky emerged! Name your new partner and select its baseline demeanor to finalize adoption.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
              <Mascot pose="celebrating-success" size={170} dialogue="Hi! I'm so excited to be here!" interactive={false} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Companion Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sparky"
                  value={mascotName}
                  onChange={(e) => setMascotName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Companion Demeanor
                </label>
                <select
                  value={mascotDemeanor}
                  onChange={(e) => setMascotDemeanor(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--border-input)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  <option value="Cheerfully Energetic">Cheerfully Energetic</option>
                  <option value="Calming & Stoic">Calming & Stoic</option>
                  <option value="Quiet & Pensive">Quiet & Pensive</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: "center", padding: "12px 32px", marginTop: "10px" }}>
              Begin Adoption!
            </button>
          </form>
        )}

        {hatchStep === "persona" && (
          <form onSubmit={handlePersonaSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontFamily: "var(--font-header)" }}>
                Establish Your Diagnostics Persona
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                To detect cognitive shifts and personalize Sparky&apos;s wellness advice, we require a validated clinical profile.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Age</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Occupation / Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Student / Engineer"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Typical Sleep Hours</label>
                <select
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--border-input)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  <option value="<5 hours">&lt;5 hours (Risk range)</option>
                  <option value="5-6 hours">5-6 hours (Moderate debt)</option>
                  <option value="7-8 hours">7-8 hours (Balanced range)</option>
                  <option value="8+ hours">8+ hours (High replenishment)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Primary Health Goal</label>
                <select
                  value={mentalGoal}
                  onChange={(e) => setMentalGoal(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--border-input)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  <option value="Reduce Panic Sparks">Reduce Panic Sparks</option>
                  <option value="Achieve Calmer Baselines">Achieve Calmer Baselines</option>
                  <option value="Build Self-Compassion">Build Self-Compassion</option>
                  <option value="Gain Focus Momentum">Gain Focus Momentum</option>
                </select>
              </div>
            </div>

            {/* Sliders */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Daily Autonomic Stress Level: <strong style={{ color: "var(--color-error)" }}>{stressLevel}/10</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  style={{ cursor: "pointer", height: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Self-Care Commitment: <strong style={{ color: "var(--color-success)" }}>{selfCareScale}/10</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selfCareScale}
                  onChange={(e) => setSelfCareScale(Number(e.target.value))}
                  style={{ cursor: "pointer", height: "6px" }}
                />
              </div>
            </div>

            {/* Trigger Multi-select pills */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                Active Anxiety Triggers
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["Academic Pressure", "Social Anxiety", "Work Burnout", "Insomnia", "Health Anxiety", "General Worries"].map((tr) => {
                  const active = tempTriggers.includes(tr);
                  return (
                    <button
                      type="button"
                      key={tr}
                      onClick={() => toggleTrigger(tr)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "14px",
                        border: active ? "2.5px solid var(--color-accent)" : "1.5px solid var(--border-light)",
                        backgroundColor: active ? "rgba(169, 146, 196, 0.08)" : "var(--bg-surface)",
                        color: active ? "var(--color-accent)" : "var(--text-secondary)",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {tr}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: "center", padding: "12px 32px", marginTop: "10px" }}>
              Establish Persona & Enter SereneMind
            </button>
          </form>
        )}

        <style jsx global>{`
          .egg-card:hover {
            transform: translateY(-4px);
          }
          .egg-card:hover .egg-render {
            transform: scale(1.05) rotate(-2deg);
          }
          @keyframes floatUp {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-40px) scale(0.85); opacity: 0; }
          }
          @media (max-width: 600px) {
            .eggs-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    );
  }

  // ==========================================
  // RENDER: Normal dashboard (Both Complete)
  // ==========================================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* 1. Welcoming Greeting Banner */}
      <section
        className="glass-card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "24px",
          alignItems: "center",
          background: "linear-gradient(135deg, var(--bg-surface) 0%, rgba(91, 127, 166, 0.05) 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "30px", fontFamily: "var(--font-header)" }}>
          Welcome back, {user?.displayName || "Friend"}
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                backgroundColor: "rgba(125, 170, 143, 0.12)",
                color: "var(--color-success)",
                padding: "4px 10px",
                borderRadius: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              LVL {mascotProgressInfo.level} {mascotProgressInfo.title}
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", lineHeight: "1.5" }}>
            Hope you are having a peaceful day. Your companion **{adoptedMascotState?.name || "Sparky"}** is currently active as **{mascotProgressInfo.state}** by your side. Select your current mood below to check in!
          </p>
        </div>
        <div style={{ paddingRight: "20px" }}>
          <Mascot pose={mascotPose} size={150} interactive={false} />
        </div>
      </section>

      {/* 2. Mood Check-in Selector */}
      <section className="glass-card">
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>How are you feeling right now?</h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.label;
            return (
              <button
                key={mood.label}
                onClick={() => handleMoodSelect(mood)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 24px",
                  borderRadius: "24px",
                  border: isSelected ? "2px solid var(--color-primary)" : "1.5px solid var(--border-light)",
                  backgroundColor: isSelected ? "rgba(91, 127, 166, 0.08)" : "var(--bg-surface)",
                  color: isSelected ? "var(--color-primary)" : "var(--text-primary)",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  height: "52px",
                  transition: "all 0.2s ease",
                }}
                className="mood-btn"
              >
                <span style={{ fontSize: "20px" }}>{mood.emoji}</span>
                {mood.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Quick Actions & Breathing Widgets */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
        }}
        className="dashboard-two-cols"
      >
        {/* Quick Actions Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)" }}>Quick Wellness Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link
              href="/chatbot"
              className="glass-card action-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "20px",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(91, 127, 166, 0.12)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>Chat with Sparky</h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Talk out your feelings and receive kind guidance.</p>
              </div>
            </Link>

            <Link
              href="/journaling"
              className="glass-card action-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "20px",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(125, 170, 143, 0.12)",
                  color: "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>Write reflective journal</h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Record today&apos;s summary and see sentiment metrics.</p>
              </div>
            </Link>

            <Link
              href="/exercises"
              className="glass-card action-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "20px",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(169, 146, 196, 0.12)",
                  color: "var(--color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>Recommended Exercises</h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Calm your heart or exercise to improve focus state.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Breathing Visualizer Widget */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", padding: "40px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", alignSelf: "flex-start" }}>Interactive Breathing Pacer</h3>

          {/* Calming visual circles */}
          <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", alignItems: "center", justifySelf: "center", justifyContent: "center" }}>
            <div
              className={isBreathingActive ? "breathing-outer" : ""}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "rgba(125, 170, 143, 0.15)",
                transition: "all 0.4s ease",
              }}
            />
            <div
              className={isBreathingActive ? "breathing-inner" : ""}
              style={{
                position: "absolute",
                width: "70%",
                height: "70%",
                borderRadius: "50%",
                backgroundColor: "rgba(169, 146, 196, 0.15)",
                transition: "all 0.4s ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "40%",
                height: "40%",
                borderRadius: "50%",
                backgroundColor: "var(--bg-surface)",
                border: "1.5px solid var(--border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-subtle)",
              }}
            >
              <span>🌱</span>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>{breathingText}</p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Synchronize your breathing with the pulsing circles.</p>
          </div>

          <button onClick={toggleBreathing} className="btn-primary" style={{ padding: "10px 24px", fontSize: "14px" }}>
            {isBreathingActive ? "Pause Practice" : "Start Practice"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .mood-btn:hover {
          border-color: var(--color-primary) !important;
          transform: translateY(-2px);
        }
        .action-card:hover {
          transform: translateX(6px);
          border-color: var(--color-primary) !important;
          box-shadow: var(--shadow-hover) !important;
        }
        @media (max-width: 768px) {
          .dashboard-two-cols {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
