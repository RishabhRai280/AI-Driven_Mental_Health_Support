"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Mascot, { HamsterPose } from "../../components/Mascot";
import UnboxingParcel from "../../components/UnboxingParcel";
import { useAuth } from "../../context/AuthContext";
import { api, MascotData, PersonaData } from "../../lib/api";

type Mood = "Calm" | "Anxious" | "Stressed" | "Sad" | "Energetic";

interface AdoptedMascot {
  name: string;
  eggType: string;
  initialPersonality: string;
  level: number;
}

const EGGS = [
  {
    id: "sapphire",
    label: "Happy Hamster",
    comp: "golden-hamster",
    color: "var(--color-error)",
    glow: "rgba(192, 118, 90, 0.45)",
    desc: "An enthusiastic cheerleader that celebrates progress and routine daily habits.",
  },
  {
    id: "goldie",
    label: "Goldie the Pup",
    comp: "goldie",
    color: "var(--color-success)",
    glow: "rgba(90, 148, 117, 0.45)",
    desc: "A loyal and loving canine companion that helps maintain daily warmth and comfort.",
  },
  {
    id: "otter",
    label: "Playful Otter",
    comp: "otter",
    color: "var(--color-accent)",
    glow: "rgba(169, 146, 196, 0.45)",
    desc: "A cheerful water companion that teaches digital boundaries, calm resting, and play.",
  },
  {
    id: "pandi",
    label: "Peaceful Panda",
    comp: "pandi",
    color: "var(--color-primary)",
    glow: "rgba(91, 127, 166, 0.45)",
    desc: "A quiet, patient panda companion that promotes study-life balance and deep zen focus.",
  },
];

// Emojiless vector smileys mapping
const MOOD_ICONS: Record<Mood, React.JSX.Element> = {
  Calm: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Anxious: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <line x1="9" y1="10" x2="9.01" y2="10" />
      <line x1="15" y1="10" x2="15.01" y2="10" />
    </svg>
  ),
  Stressed: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="15" x2="16" y2="15" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Sad: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <line x1="9" y1="9" x2="9" y2="11" />
      <line x1="15" y1="9" x2="15" y2="11" />
    </svg>
  ),
  Energetic: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 13s1.5 3 4 3 4-3 4-3" />
      <line x1="9" y1="9" x2="10" y2="10" />
      <line x1="10" y1="9" x2="9" y2="10" />
      <line x1="14" y1="9" x2="15" y2="10" />
      <line x1="15" y1="9" x2="14" y2="10" />
    </svg>
  ),
};

export default function DashboardPage() {
  const { user } = useAuth();

  // Navigation & Adoption States
  const [hasAdoptedMascot, setHasAdoptedMascot] = useState(true);
  const [hasFilledPersona, setHasFilledPersona] = useState(true);
  const [isLoadingMascot, setIsLoadingMascot] = useState(true);

  // Egg Selection states
  const [selectedEgg, setSelectedEgg] = useState<(typeof EGGS)[0] | null>(null);
  const [hatchStep, setHatchStep] = useState<
    "choose" | "tap" | "name" | "persona"
  >("choose");
  const [tapCount, setTapCount] = useState(0);
  const [isHatchingShaking, setIsHatchingShaking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<
    { id: number; text: string; x: number; y: number }[]
  >([]);

  // Name & Persona Form states
  const [mascotName, setMascotName] = useState("");
  const [mascotDemeanor, setMascotDemeanor] = useState("Calming & Stoic");
  const [adoptedMascotState, setAdoptedMascotState] =
    useState<AdoptedMascot | null>(null);

  // Persona states
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [sleepHours, setSleepHours] = useState("7-8 hours");
  const [mentalGoal, setMentalGoal] = useState("Achieve Calmer Baselines");
  const [tempTriggers, setTempTriggers] = useState<string[]>([]);

  // Interactive diagnostic questionnaire states (choices 0 to 3)
  const [stressAnswers, setStressAnswers] = useState<number[]>([1, 1, 1, 1]);
  const [careAnswers, setCareAnswers] = useState<number[]>([2, 1, 1, 1]);

  // Additional parameters
  const [waterIntake, setWaterIntake] = useState("1-2 Liters");
  const [screenTime, setScreenTime] = useState("5-8 Hours");
  const [socialContext, setSocialContext] = useState("Neutral Connection");
  const [physicalActivity, setPhysicalActivity] = useState(
    "Light Walking / Yoga",
  );

  // Real-time wellness logs from database
  const [dbLogs, setDbLogs] = useState<any[]>([]);

  // Normal Dashboard states
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [mascotPose, setMascotPose] = useState<HamsterPose>("waving-hello");
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingText, setBreathingText] = useState("Click Start to practice");

  const moods: { label: Mood; pose: HamsterPose; dialogue: string }[] = [
    {
      label: "Calm",
      pose: "sitting-zen",
      dialogue: "Ah, absolute serenity. Let's take a slow breath together.",
    },
    {
      label: "Anxious",
      pose: "escaping-energy",
      dialogue:
        "Heavy heart? It's okay to feel anxious. Let's discharge that together.",
    },
    {
      label: "Stressed",
      pose: "balancing-nut",
      dialogue:
        "A lot on your mind? Let's take a step back and simplify things.",
    },
    {
      label: "Sad",
      pose: "holding-heart",
      dialogue:
        "I'm right here with a warm hug. You don't have to carry this alone.",
    },
    {
      label: "Energetic",
      pose: "running-excited",
      dialogue: "Yay! Awesome vibes! Let's channel this wonderful energy!",
    },
  ];

  // Calculated dynamic levels
  const calculatedStress = useMemo(() => {
    const sum = stressAnswers.reduce((a, b) => a + b, 0);
    return Math.max(1, Math.min(10, Math.round((sum / 12) * 9) + 1));
  }, [stressAnswers]);

  const calculatedSelfCare = useMemo(() => {
    const sum = careAnswers.reduce((a, b) => a + b, 0);
    return Math.max(1, Math.min(10, Math.round((sum / 12) * 9) + 1));
  }, [careAnswers]);

  // Check adoption on mount — fetch from DB
  useEffect(() => {
    async function fetchPortalData() {
      try {
        const data = await api.get<{
          mascot: MascotData | null;
          persona: PersonaData | null;
        }>("/api/mascot");
        if (data.mascot) {
          const eType = (data.mascot as any).egg_type || data.mascot.eggType;
          setAdoptedMascotState({
            name: data.mascot.name,
            eggType: eType,
            initialPersonality: data.mascot.personality,
            level: data.mascot.level,
          });
          setHasAdoptedMascot(true);

          // Seed global cache so all pages render correct mascot companion
          let compType = "golden-hamster";
          if (eType === "Goldie the Pup") compType = "goldie";
          else if (eType === "Playful Otter") compType = "otter";
          else if (eType === "Peaceful Panda") compType = "pandi";
          localStorage.setItem("serenemind-companion-type", compType);
        } else {
          setHasAdoptedMascot(false);
          setHatchStep("choose");
        }

        if (data.persona) {
          setHasFilledPersona(true);
        } else {
          setHasFilledPersona(false);
        }

        // Fetch real-time wellness logs directly from DB
        const logsData = await api.get<{ logs: any[] }>("/api/wellness");
        setDbLogs(logsData.logs || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setHasAdoptedMascot(false);
      } finally {
        setIsLoadingMascot(false);
      }
    }
    fetchPortalData();
  }, []);

  // Evolution engine mapping user self-care progression to mascot evolution updates
  const mascotProgressInfo = useMemo(() => {
    if (!adoptedMascotState)
      return {
        level: 1,
        title: "Hatchling Bond",
        state: "Calm Observer",
        pose: "waving-hello" as HamsterPose,
      };

    const logsCount = dbLogs.length;
    const positiveCount = dbLogs.filter(
      (l: any) => l.sentiment === "Positive",
    ).length;
    const stressedCount = dbLogs.filter(
      (l: any) => l.sentiment === "Stressed" || l.sentiment === "Anxious",
    ).length;

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
  }, [adoptedMascotState, dbLogs]);

  // Adjust current dashboard mascot pose to match evolved state on startup
  useEffect(() => {
    if (hasAdoptedMascot && hasFilledPersona) {
      setMascotPose(mascotProgressInfo.pose);
    }
  }, [hasAdoptedMascot, hasFilledPersona, mascotProgressInfo.pose]);

  // Stabilize the breathing interval
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

  const handleMoodSelect = async (moodItem: (typeof moods)[0]) => {
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
      // POST directly to the database
      const response = await api.post<any>("/api/wellness", {
        type: "mood",
        title: `Dashboard Mood Check-in: ${moodItem.label}`,
        preview: `Checked in feeling ${moodItem.label} on the main dashboard. ${mascotName || "Your companion"} noted: "${moodItem.dialogue}"`,
        sentiment: detectedSentiment,
      });

      // Update state dynamically
      setDbLogs((prev) => [response, ...prev]);
    } catch (err) {
      console.error("Failed to save mood log:", err);
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

  const handleEggTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tapCount >= 5) return;

    setIsHatchingShaking(true);
    setTimeout(() => setIsHatchingShaking(false), 120);

    const nextTaps = tapCount + 1;
    setTapCount(nextTaps);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const crackPhrases = [
      "*Tap!*",
      "*Crack!*",
      "*Wobble!*",
      "*Squeak!*",
      "*Burst!*",
    ];

    setFloatingTexts((prev) => [
      ...prev,
      { id: Date.now(), text: crackPhrases[nextTaps - 1] || "*Crack!*", x, y },
    ]);

    if (nextTaps >= 5) {
      setTimeout(() => {
        setHatchStep("tap");
      }, 1200);
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

    // Dynamic evaluation of internal behavioral persona
    let calculatedPersona = "Beginner Wellness User";
    const isStudent =
      occupation.toLowerCase().includes("student") ||
      occupation.toLowerCase().includes("college") ||
      occupation.toLowerCase().includes("university");
    const isLowSleep = sleepHours === "<5 hours" || sleepHours === "5-6 hours";

    if (calculatedStress >= 6 && isStudent) {
      calculatedPersona = "Student Stress";
    } else if (calculatedStress >= 6 && isLowSleep) {
      calculatedPersona = "Burnout Professional";
    } else if (socialContext === "Feeling Isolated") {
      calculatedPersona = "Isolated User";
    }

    // Embed diagnostic telemetry parameters cleanly into triggers array
    const compositeTriggers = [
      ...tempTriggers,
      `water:${waterIntake}`,
      `screentime:${screenTime}`,
      `social:${socialContext}`,
      `activity:${physicalActivity}`,
      `persona:${calculatedPersona}`,
    ];

    try {
      await api.post("/api/mascot/persona", {
        age: parseInt(age),
        occupation,
        sleepHours,
        stressLevel: calculatedStress,
        selfCareScale: calculatedSelfCare,
        mentalGoal,
        triggers: compositeTriggers,
      });
      setHasFilledPersona(true);
      alert(
        `Congratulations! ${mascotName} is now bonded. Your behavioral profile indicates a close fit with our "${calculatedPersona}" group. We have tailored your dashboard companionships accordingly!`,
      );
      window.location.reload();
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

  const updateStressChoice = (qIdx: number, val: number) => {
    const copy = [...stressAnswers];
    copy[qIdx] = val;
    setStressAnswers(copy);
  };

  const updateCareChoice = (qIdx: number, val: number) => {
    const copy = [...careAnswers];
    copy[qIdx] = val;
    setCareAnswers(copy);
  };

  // Show loading skeleton while fetching mascot from DB
  if (isLoadingMascot) {
    return (
      <div
        className="glass-card"
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeDasharray="32"
              strokeDashoffset="10"
            />
          </svg>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>
          Verifying mindfulness bounds...
        </p>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              padding: "10px 0",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "28px",
                  fontFamily: "var(--font-header)",
                  fontWeight: 500,
                }}
              >
                Your SereneMind Package Has Arrived!
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  maxWidth: "520px",
                  margin: "8px auto 0",
                  lineHeight: "1.5",
                }}
              >
                Welcome to your mental health space! A tactile unboxing parcel
                has been delivered. **Click the box 5 times** to unwrap and
                reveal your companion.
              </p>
            </div>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <UnboxingParcel
                tapCount={tapCount}
                isShaking={isHatchingShaking}
                onClick={handleEggTap}
              />

              {/* Floating text ticks */}
              {floatingTexts.map((ft) => (
                <span
                  key={ft.id}
                  style={{
                    position: "absolute",
                    left: `${ft.x}px`,
                    top: `${ft.y}px`,
                    color: "var(--color-accent)",
                    fontSize: "16px",
                    fontWeight: "900",
                    pointerEvents: "none",
                    animation: "floatUp 0.8s forwards",
                    textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    zIndex: 50,
                  }}
                >
                  {ft.text}
                </span>
              ))}

              {/* Render dynamic parcel unboxing particles when box opened (Confetti style!) */}
              {tapCount >= 5 &&
                Array.from({ length: 48 }).map((_, i) => {
                  const angle =
                    (i / 48) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
                  const distance = 120 + Math.random() * 200;
                  const tx = `${Math.cos(angle) * distance}px`;
                  const ty = `${Math.sin(angle) * distance - 40}px`;
                  const scale = 0.5 + Math.random() * 0.8;
                  const rot = `${(Math.random() - 0.5) * 720}deg`;
                  return (
                    <div
                      key={i}
                      className="box-particle"
                      style={{
                        left: "130px",
                        top: "160px",
                        backgroundColor:
                          i % 4 === 0
                            ? "var(--color-primary)"
                            : i % 4 === 1
                              ? "var(--color-success)"
                              : i % 4 === 2
                                ? "var(--color-accent)"
                                : "var(--color-secondary)",
                        // @ts-ignore
                        "--tx": tx,
                        "--ty": ty,
                        "--scale": scale,
                        "--rot": rot,
                        animationDelay: `${Math.random() * 0.15}s`,
                      }}
                    />
                  );
                })}
            </div>
          </div>
        )}

        {hatchStep === "tap" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "28px" }}
          >
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "28px",
                  fontFamily: "var(--font-header)",
                  color: "var(--color-success)",
                  fontWeight: 500,
                }}
              >
                Companion Emerged!
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  maxWidth: "520px",
                  margin: "6px auto 0",
                }}
              >
                The package flew open and revealed 4 serene companion spirits.
                Select your favorite partner to pace your mental health journey.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
              className="eggs-grid"
            >
              {EGGS.map((egg) => {
                const isSel = selectedEgg?.id === egg.id;

                return (
                  <div
                    key={egg.id}
                    onClick={() => setSelectedEgg(egg)}
                    className="glass-card egg-card"
                    style={{
                      padding: "24px 20px",
                      cursor: "pointer",
                      border: isSel
                        ? `2.5px solid ${egg.color}`
                        : "1.5px solid var(--border-light)",
                      backgroundColor: isSel
                        ? "rgba(91, 127, 166, 0.05)"
                        : "var(--bg-surface)",
                      boxShadow: isSel
                        ? `0 8px 24px ${egg.glow}`
                        : "var(--shadow-subtle)",
                      transition: "all 0.25s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "16px",
                    }}
                  >
                    {/* Live mascot preview badge instead of initials */}
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "var(--bg-nav)",
                        border: `1.5px solid ${egg.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 16px ${egg.glow}`,
                        transition: "transform 0.2s",
                        overflow: "hidden",
                        padding: "4px",
                      }}
                      className="egg-render"
                    >
                      <Mascot
                        pose="waving-hello"
                        size={65}
                        interactive={false}
                        companionType={egg.comp as any}
                      />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: "700" }}>
                        {egg.label}
                      </h4>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          marginTop: "6px",
                          lineHeight: "1.4",
                        }}
                      >
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
                  alert("Please select a companion spirit!");
                  return;
                }
                setHatchStep("name");
              }}
              className="btn-primary"
              style={{
                alignSelf: "center",
                padding: "12px 32px",
                marginTop: "8px",
              }}
              disabled={!selectedEgg}
            >
              Adopt Selected Companion
            </button>
          </div>
        )}

        {hatchStep === "name" && selectedEgg && (
          <form
            onSubmit={handleAdoptSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "28px",
                  fontFamily: "var(--font-header)",
                  color: "var(--color-success)",
                }}
              >
                COMPANION HATCHED!
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  marginTop: "6px",
                }}
              >
                Name your new partner and select its baseline demeanor to
                finalize adoption.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "12px 0",
              }}
            >
              <Mascot
                pose="celebrating-success"
                size={170}
                dialogue="Hi! I'm so excited to be here!"
                interactive={false}
                companionType={selectedEgg.comp as any}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
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
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
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
                  <option value="Cheerfully Energetic">
                    Cheerfully Energetic
                  </option>
                  <option value="Calming & Stoic">Calming & Stoic</option>
                  <option value="Quiet & Pensive">Quiet & Pensive</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                alignSelf: "center",
                padding: "12px 32px",
                marginTop: "10px",
              }}
            >
              Begin Adoption!
            </button>
          </form>
        )}

        {hatchStep === "persona" && (
          <form
            onSubmit={handlePersonaSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "26px",
                  fontFamily: "var(--font-header)",
                  color: "var(--color-primary)",
                }}
              >
                Establish Your Diagnostics Persona
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                Complete the scientific screener checklist below so we can
                accurately assess and track your mental baseline.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Occupation / Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student / Engineer"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Typical Sleep Hours
                </label>
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
                  <option value="8+ hours">
                    8+ hours (High replenishment)
                  </option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Primary Health Goal
                </label>
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
                  <option value="Reduce Panic Sparks">
                    Reduce Panic Sparks
                  </option>
                  <option value="Achieve Calmer Baselines">
                    Achieve Calmer Baselines
                  </option>
                  <option value="Build Self-Compassion">
                    Build Self-Compassion
                  </option>
                  <option value="Gain Focus Momentum">
                    Gain Focus Momentum
                  </option>
                </select>
              </div>
            </div>

            {/* Interactive validated stress questionnaire */}
            <div
              className="glass-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--color-error)",
                }}
              >
                Autonomic Stress Screener
              </h3>
              {[
                "1. Feel unable to control important life events?",
                "2. Feel nervous, stressed, or hyperaroused?",
                "3. Struggle to sleep or turn off circular worries?",
                "4. Feel physically fatigued, tight-chested, or tense?",
              ].map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {q}
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {["Never", "Rarely", "Often", "Always"].map(
                      (label, val) => {
                        const selected = stressAnswers[idx] === val;
                        return (
                          <button
                            type="button"
                            key={val}
                            onClick={() => updateStressChoice(idx, val)}
                            style={{
                              padding: "8px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: "pointer",
                              border: selected
                                ? "2px solid var(--color-error)"
                                : "1px solid var(--border-light)",
                              backgroundColor: selected
                                ? "rgba(192, 118, 90, 0.08)"
                                : "var(--bg-surface)",
                              color: selected
                                ? "var(--color-error)"
                                : "var(--text-secondary)",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {label}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive validated self-care commitment questionnaire */}
            <div
              className="glass-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--color-success)",
                }}
              >
                Self-Care Dedication Screener
              </h3>
              {[
                "1. Practice deliberate breathing, pacing, or stretching?",
                "2. Log your active mood or write reflective journals?",
                "3. Set boundaries between work/study pressure and rest?",
                "4. Seek wellness guides or use companion coping tools?",
              ].map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {q}
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {["Never", "Rarely", "Moderately", "Highly"].map(
                      (label, val) => {
                        const selected = careAnswers[idx] === val;
                        return (
                          <button
                            type="button"
                            key={val}
                            onClick={() => updateCareChoice(idx, val)}
                            style={{
                              padding: "8px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: "pointer",
                              border: selected
                                ? "2px solid var(--color-success)"
                                : "1px solid var(--border-light)",
                              backgroundColor: selected
                                ? "rgba(125, 170, 143, 0.08)"
                                : "var(--bg-surface)",
                              color: selected
                                ? "var(--color-success)"
                                : "var(--text-secondary)",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {label}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional parameters */}
            <div
              className="glass-card"
              style={{
                padding: "20px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Daily Water Intake
                </label>
                <select
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                >
                  <option value="Under 1 Liter">Under 1 Liter</option>
                  <option value="1-2 Liters">1-2 Liters</option>
                  <option value="2-3 Liters">2-3 Liters</option>
                  <option value="Over 3 Liters">Over 3 Liters</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Screen Time Exposure
                </label>
                <select
                  value={screenTime}
                  onChange={(e) => setScreenTime(e.target.value)}
                >
                  <option value="Under 2 Hours">Under 2 Hours</option>
                  <option value="2-5 Hours">2-5 Hours</option>
                  <option value="5-8 Hours">5-8 Hours</option>
                  <option value="Over 8 Hours">Over 8 Hours</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Social Context Support
                </label>
                <select
                  value={socialContext}
                  onChange={(e) => setSocialContext(e.target.value)}
                >
                  <option value="Feeling Isolated">Feeling Isolated</option>
                  <option value="Neutral Connection">Neutral Connection</option>
                  <option value="Strong Support Network">
                    Strong Support Network
                  </option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Physical Activity Rate
                </label>
                <select
                  value={physicalActivity}
                  onChange={(e) => setPhysicalActivity(e.target.value)}
                >
                  <option value="Sedentary baseline">Sedentary baseline</option>
                  <option value="Light Walking / Yoga">
                    Light Walking / Yoga
                  </option>
                  <option value="Heavy Workout / Cardio">
                    Heavy Workout / Cardio
                  </option>
                </select>
              </div>
            </div>

            {/* Dynamic Screener feedback badges */}
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  backgroundColor: "rgba(192,118,90,0.12)",
                  color: "var(--color-error)",
                  padding: "6px 14px",
                  borderRadius: "12px",
                }}
              >
                Stress Evaluation: {calculatedStress} / 10
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  backgroundColor: "rgba(125,170,143,0.12)",
                  color: "var(--color-success)",
                  padding: "6px 14px",
                  borderRadius: "12px",
                }}
              >
                Self-Care Index: {calculatedSelfCare} / 10
              </span>
            </div>

            {/* Trigger Multi-select pills */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Active Anxiety Triggers
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  "Academic Pressure",
                  "Social Anxiety",
                  "Work Burnout",
                  "Insomnia",
                  "Health Anxiety",
                  "General Worries",
                ].map((tr) => {
                  const active = tempTriggers.includes(tr);
                  return (
                    <button
                      type="button"
                      key={tr}
                      onClick={() => toggleTrigger(tr)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "14px",
                        border: active
                          ? "2.5px solid var(--color-accent)"
                          : "1.5px solid var(--border-light)",
                        backgroundColor: active
                          ? "rgba(169, 146, 196, 0.08)"
                          : "var(--bg-surface)",
                        color: active
                          ? "var(--color-accent)"
                          : "var(--text-secondary)",
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

            <button
              type="submit"
              className="btn-primary"
              style={{
                alignSelf: "center",
                padding: "12px 32px",
                marginTop: "10px",
              }}
            >
              Establish Persona & Enter SereneMind
            </button>
          </form>
        )}

        <style jsx global>{`
          .parcel-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 160px;
            height: 160px;
            cursor: pointer;
            perspective: 600px;
          }
          .parcel-box {
            position: relative;
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #e5c19d 0%, #c69c6d 100%);
            border-radius: 12px;
            box-shadow:
              0 12px 30px rgba(0, 0, 0, 0.15),
              inset 0 -6px 12px rgba(0, 0, 0, 0.08);
            transition: transform 0.15s ease-out;
            transform-style: preserve-3d;
          }
          .parcel-lid {
            position: absolute;
            top: -8px;
            left: -6px;
            width: 132px;
            height: 26px;
            background: linear-gradient(135deg, #ebd0b3 0%, #cca37a 100%);
            border-radius: 6px;
            box-shadow:
              0 4px 8px rgba(0, 0, 0, 0.1),
              inset 0 -2px 4px rgba(0, 0, 0, 0.08);
            z-index: 10;
            transition:
              transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.5s ease;
          }
          .parcel-ribbon-v {
            position: absolute;
            top: -8px;
            left: 52px;
            width: 16px;
            height: 128px;
            background: linear-gradient(to bottom, #d4af37 0%, #b8860b 100%);
            z-index: 5;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .parcel-ribbon-h {
            position: absolute;
            top: 44px;
            left: 0;
            width: 120px;
            height: 16px;
            background: linear-gradient(to right, #d4af37 0%, #b8860b 100%);
            z-index: 5;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .parcel-bow {
            position: absolute;
            top: -26px;
            left: 40px;
            width: 40px;
            height: 20px;
            z-index: 15;
            display: flex;
            gap: 4px;
            justify-content: center;
            transition:
              transform 0.8s ease,
              opacity 0.5s ease;
          }
          .parcel-bow-loop-l {
            width: 18px;
            height: 18px;
            border: 3.5px solid #d4af37;
            border-radius: 50% 50% 0 50%;
            transform: rotate(-45deg);
            background-color: rgba(212, 175, 55, 0.1);
          }
          .parcel-bow-loop-r {
            width: 18px;
            height: 18px;
            border: 3.5px solid #d4af37;
            border-radius: 50% 50% 50% 0;
            transform: rotate(45deg);
            background-color: rgba(212, 175, 55, 0.1);
          }
          .parcel-shake {
            animation: parcelWiggle 0.15s infinite ease-in-out;
          }
          @keyframes parcelWiggle {
            0% {
              transform: scale(1.1) rotate(0deg);
            }
            25% {
              transform: scale(1.1) rotate(-3deg);
            }
            50% {
              transform: scale(1.1) rotate(0deg);
            }
            75% {
              transform: scale(1.1) rotate(3deg);
            }
            100% {
              transform: scale(1.1) rotate(0deg);
            }
          }
          .parcel-opened .parcel-lid {
            transform: translateY(-80px) rotate(-25deg) scale(0.8);
            opacity: 0;
          }
          .parcel-opened .parcel-bow {
            transform: translateY(-90px) rotate(45deg) scale(0.6);
            opacity: 0;
          }
          .box-particle {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            pointer-events: none;
            animation: explodeParticle 1s cubic-bezier(0.1, 0.8, 0.3, 1)
              forwards;
          }
          @keyframes explodeParticle {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(var(--tx), var(--ty)) scale(0);
              opacity: 0;
            }
          }
          .egg-card:hover {
            transform: translateY(-4px);
          }
          .egg-card:hover .egg-render {
            transform: scale(1.05) rotate(-2deg);
          }
          @keyframes floatUp {
            0% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateY(-60px) scale(0.85);
              opacity: 0;
            }
          }
          @media (max-width: 600px) {
            .eggs-grid {
              grid-template-columns: 1fr !important;
            }
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
          background:
            "linear-gradient(135deg, var(--bg-surface) 0%, rgba(91, 127, 166, 0.05) 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "30px", fontFamily: "var(--font-header)" }}>
              Welcome back, {user?.displayName || "Mindfulness Practitioner"}
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
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "16px",
              maxWidth: "600px",
              lineHeight: "1.5",
            }}
          >
            Hope you are having a peaceful day. Your companion **
            {adoptedMascotState?.name || "Sparky"}** is currently active as **
            {mascotProgressInfo.state}** by your side. Select your current mood
            below to check in!
          </p>
        </div>
        <div style={{ paddingRight: "20px" }}>
          <Mascot pose={mascotPose} size={150} interactive={false} />
        </div>
      </section>

      {/* 2. Mood Check-in Selector */}
      <section className="glass-card">
        <h3
          style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}
        >
          How are you feeling right now?
        </h3>
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
                  border: isSelected
                    ? "2px solid var(--color-primary)"
                    : "1.5px solid var(--border-light)",
                  backgroundColor: isSelected
                    ? "rgba(91, 127, 166, 0.08)"
                    : "var(--bg-surface)",
                  color: isSelected
                    ? "var(--color-primary)"
                    : "var(--text-primary)",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  height: "52px",
                  transition: "all 0.2s ease",
                }}
                className="mood-btn"
              >
                {MOOD_ICONS[mood.label]}
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
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)" }}>
            Quick Wellness Actions
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Chat with Sparky
                </h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Talk out your feelings and receive kind guidance.
                </p>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Write reflective journal
                </h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Record today&apos;s summary and see sentiment metrics.
                </p>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Recommended Exercises
                </h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Calm your heart or exercise to improve focus state.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Breathing Visualizer Widget */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            padding: "40px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              alignSelf: "flex-start",
            }}
          >
            Interactive Breathing Pacer
          </h3>

          {/* Calming visual circles */}
          <div
            style={{
              position: "relative",
              width: "160px",
              height: "160px",
              display: "flex",
              alignItems: "center",
              justifySelf: "center",
              justifyContent: "center",
            }}
          >
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-success)" }}
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10Z" />
                <path d="M19 2c-3 3-7 4-11 5" />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              {breathingText}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Synchronize your breathing with the pulsing circles.
            </p>
          </div>

          <button
            onClick={toggleBreathing}
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: "14px" }}
          >
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
