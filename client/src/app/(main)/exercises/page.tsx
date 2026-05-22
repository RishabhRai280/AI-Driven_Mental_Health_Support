"use client";

import React, { useState, useEffect } from "react";
import Mascot from "../../components/Mascot";
import { api } from "../../lib/api";

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: "calming" | "focus" | "release";
  pose: "sitting-zen" | "escaping-energy" | "running-excited";
  cycles: number; // in seconds per phase
}

// Predefined daily habits list
interface Habit {
  id: string;
  label: string;
  desc: string;
  color: string;
}

const DEFAULT_HABITS: Habit[] = [
  {
    id: "water",
    label: "Drink 2 Liters of Water",
    desc: "Hydrate brain tissues to diminish physical panic triggers.",
    color: "var(--color-primary)",
  },
  {
    id: "breathing",
    label: "Complete Guided Breathing Pacer",
    desc: "4-minute box breathing session to reset the autonomic nervous system.",
    color: "var(--color-success)",
  },
  {
    id: "screentime",
    label: "No Screen Time 1hr Before Bed",
    desc: "Keep blue light away to naturally induce deep REM sleep.",
    color: "var(--color-accent)",
  },
  {
    id: "outdoors",
    label: "30-Minute Outdoor Activity",
    desc: "Lowers cortisol levels and helps clear circulatory paths.",
    color: "var(--color-secondary)",
  },
  {
    id: "journal",
    label: "Log Evening Reflection Journal",
    desc: "Record emotional trends and receive sentiment metrics.",
    color: "var(--color-error)",
  },
];

const getHabitIcon = (id: string, color: string) => {
  const lower = id.toLowerCase() + " " + color.toLowerCase();
  if (
    lower.includes("water") ||
    lower.includes("drink") ||
    lower.includes("primary") ||
    lower.includes("blue")
  ) {
    return (
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
        <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
      </svg>
    );
  }
  if (
    lower.includes("breath") ||
    lower.includes("pace") ||
    lower.includes("success") ||
    lower.includes("green")
  ) {
    return (
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
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }
  if (
    lower.includes("screen") ||
    lower.includes("device") ||
    lower.includes("phone") ||
    lower.includes("accent") ||
    lower.includes("purple")
  ) {
    return (
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
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    );
  }
  if (
    lower.includes("outdoor") ||
    lower.includes("walk") ||
    lower.includes("activity") ||
    lower.includes("secondary") ||
    lower.includes("orange")
  ) {
    return (
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
        <circle cx="12" cy="5" r="1" />
        <path d="m18 22-.4-5.2c-.1-1.2-1-2.2-2.2-2.5L13 13.8V9l2.5 1.5c.5.3 1.1.2 1.5-.3l2-2.5c.3-.4.3-1 0-1.4l-3-3c-.4-.4-1-.4-1.4 0l-3 3-.3.8c-.3.9-.2 1.9.2 2.7L11.5 12 8 13.8c-.5.3-.8.8-.8 1.4L6 22" />
      </svg>
    );
  }
  if (
    lower.includes("journal") ||
    lower.includes("reflection") ||
    lower.includes("write") ||
    lower.includes("error") ||
    lower.includes("red")
  ) {
    return (
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
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    );
  }
  return (
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

export default function ExercisePage() {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(240);
  const [breathingPhase, setBreathingPhase] = useState<
    "In" | "HoldIn" | "Out" | "HoldOut"
  >("In");
  const [phaseCounter, setPhaseCounter] = useState(4); // 4 seconds countdown per phase
  const [congratsMsg, setCongratsMsg] = useState<string | null>(null);

  // Companion reaction states for real-time reactivity
  const [companionPose, setCompanionPose] = useState<any>("sitting-zen");
  const [companionDialogue, setCompanionDialogue] = useState<string>(
    "Hi there! Let's build healthy habits together today!",
  );
  const [adoptedMascotName, setAdoptedMascotName] =
    useState<string>("Companion");

  // Habit Editing States
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("");

  // Habits Dynamic catalog state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitLabel, setNewHabitLabel] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newHabitColor, setNewHabitColor] = useState("var(--color-primary)");

  // Grounding Step Wizard State
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingAnswers, setGroundingAnswers] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);

  const exercises: Exercise[] = [
    {
      id: "1",
      title: "4-4-4-4 Box Breathing Pacer",
      description:
        "A standard clinical pacer to calm sympathetic nervous hyperarousal, lower heart rate, and clear panic spikes.",
      duration: "4 min",
      category: "calming",
      pose: "sitting-zen",
      cycles: 4,
    },
    {
      id: "2",
      title: "Muscle Release Pacing (PMR)",
      description:
        "Progressive Muscle Relaxation (PMR) systematic cycles to release cortisol stores, tightness, and restlessness.",
      duration: "5 min",
      category: "release",
      pose: "escaping-energy",
      cycles: 5,
    },
    {
      id: "3",
      title: "Sensory Grounding 5-4-3-2-1",
      description:
        "A cognitive grounding wizard to draw focus away from circular anxieties and lock thoughts onto active somatic senses.",
      duration: "5 min",
      category: "focus",
      pose: "running-excited",
      cycles: 5,
    },
  ];

  // Load daily habits catalog and checked list from LocalStorage on mount, along with DB Mascot choice
  useEffect(() => {
    const savedCatalog = localStorage.getItem("sm_custom_habits_catalog");
    if (savedCatalog) {
      setHabits(JSON.parse(savedCatalog));
    } else {
      setHabits(DEFAULT_HABITS);
      localStorage.setItem(
        "sm_custom_habits_catalog",
        JSON.stringify(DEFAULT_HABITS),
      );
    }

    const today = new Date().toDateString();
    const stored = localStorage.getItem(`sm_daily_habits_${today}`);
    if (stored) {
      setCompletedHabits(JSON.parse(stored));
    }

    // Fetch adopted companion details dynamically from DB
    async function loadMascot() {
      try {
        const data = await api.get<{
          mascot: { name: string; eggType: string } | null;
        }>("/api/mascot");
        if (data?.mascot) {
          setAdoptedMascotName(data.mascot.name);
          setCompanionDialogue(
            `Hi! I'm ${data.mascot.name}. Ready to check off some daily habits?`,
          );
        }
      } catch (err) {
        console.error("Failed to load mascot on exercises page:", err);
      }
    }
    loadMascot();
  }, []);

  // Breathing intervals pacer (Corrected Box Breathing: In -> HoldIn -> Out -> HoldOut)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let tickTimer: NodeJS.Timeout;

    if (
      isPlaying &&
      secondsLeft > 0 &&
      activeExercise &&
      activeExercise.id !== "3"
    ) {
      // Main countdown
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleFinishSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Phase countdown tick
      tickTimer = setInterval(() => {
        setPhaseCounter((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currentPhase) => {
              if (currentPhase === "In") {
                setPhaseCounter(4);
                return "HoldIn";
              }
              if (currentPhase === "HoldIn") {
                setPhaseCounter(4);
                return "Out";
              }
              if (currentPhase === "Out") {
                setPhaseCounter(4);
                return "HoldOut";
              }
              setPhaseCounter(4);
              return "In";
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
      clearInterval(tickTimer);
    };
  }, [isPlaying, secondsLeft, activeExercise]);

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitLabel.trim()) return;

    const newHabit: Habit = {
      id:
        "custom_" +
        Math.random().toString(36).substring(2, 9) +
        Date.now().toString(36),
      label: newHabitLabel.trim(),
      desc: newHabitDesc.trim() || "Custom daily habit milestone.",
      color: newHabitColor,
    };

    const updated = [...habits, newHabit];
    setHabits(updated);
    localStorage.setItem("sm_custom_habits_catalog", JSON.stringify(updated));

    // Cheer excitedly when a new custom habit is set
    setCompanionPose("running-excited");
    setCompanionDialogue(
      `A new goal! "${newHabit.label}" is set. Let's conquer it together! 💪`,
    );
    setTimeout(() => {
      setCompanionPose("sitting-zen");
      setCompanionDialogue(
        `What daily habits shall we achieve today? Let's check them off!`,
      );
    }, 4000);

    setNewHabitLabel("");
    setNewHabitDesc("");
    setNewHabitColor("var(--color-primary)");
    setIsAddingHabit(false);
  };

  const handleRemoveHabit = (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation(); // Prevent toggling the checklist on delete click
    const target = habits.find((h) => h.id === habitId);
    const updated = habits.filter((h) => h.id !== habitId);
    setHabits(updated);
    localStorage.setItem("sm_custom_habits_catalog", JSON.stringify(updated));

    const today = new Date().toDateString();
    const currentCompleted = completedHabits.filter((id) => id !== habitId);
    setCompletedHabits(currentCompleted);
    localStorage.setItem(
      `sm_daily_habits_${today}`,
      JSON.stringify(currentCompleted),
    );

    // React statefully to habit deletion without cheering
    setCompanionPose("head-scratching");
    setCompanionDialogue(
      `Removed "${target?.label || "habit"}". Let's focus on what works best for you.`,
    );
    setTimeout(() => {
      setCompanionPose("sitting-zen");
      setCompanionDialogue(
        `We pace ourselves one deliberate choice at a time.`,
      );
    }, 4000);
  };

  const handleToggleHabit = async (habitId: string, habitLabel: string) => {
    const today = new Date().toDateString();
    let updated: string[];
    const isAdding = !completedHabits.includes(habitId);

    if (isAdding) {
      updated = [...completedHabits, habitId];

      // Make the companion cheer and celebrate on checkoff!
      setCompanionPose("celebrating-success");
      setCompanionDialogue(
        `Amazing! You completed "${habitLabel}"! Proud of you! 🎉`,
      );
      setTimeout(() => {
        setCompanionPose("sitting-zen");
        setCompanionDialogue(
          `Let's keep up this beautiful wellness momentum today!`,
        );
      }, 4000);

      // Log to backend wellness timeline
      try {
        await api.post("/api/wellness", {
          type: "exercise",
          title: `Daily Habit Completed: ${habitLabel}`,
          preview: `Completed the daily behavior milestone: "${habitLabel}". Positive habits trigger gradual behavioral changes.`,
          sentiment: "Positive",
        });
      } catch (err) {
        console.error("Failed to save habit log:", err);
      }
    } else {
      updated = completedHabits.filter((h) => h !== habitId);

      // Curious reaction when unchecking
      setCompanionPose("confused-question");
      setCompanionDialogue(
        `Ah, unchecked "${habitLabel}"? No worries, take it easy!`,
      );
      setTimeout(() => {
        setCompanionPose("sitting-zen");
        setCompanionDialogue(
          `Steady as we go. What's next on your daily plan?`,
        );
      }, 4000);
    }

    setCompletedHabits(updated);
    localStorage.setItem(`sm_daily_habits_${today}`, JSON.stringify(updated));
  };

  const handleStartEdit = (e: React.MouseEvent, h: Habit) => {
    e.stopPropagation(); // Avoid triggering checklist toggle
    setEditingHabitId(h.id);
    setEditLabel(h.label);
    setEditDesc(h.desc);
    setEditColor(h.color);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLabel.trim()) return;

    const updated = habits.map((h) => {
      if (h.id === editingHabitId) {
        return {
          ...h,
          label: editLabel.trim(),
          desc: editDesc.trim(),
          color: editColor,
        };
      }
      return h;
    });

    setHabits(updated);
    localStorage.setItem("sm_custom_habits_catalog", JSON.stringify(updated));

    // React statefully to custom edits
    setCompanionPose("thinking-deeply");
    setCompanionDialogue(
      `Goal refined to "${editLabel}"! Clarity is wisdom! 🧠`,
    );
    setTimeout(() => {
      setCompanionPose("sitting-zen");
      setCompanionDialogue(
        `Pacing your goals with mindful alignment leads to growth!`,
      );
    }, 4000);

    setEditingHabitId(null);
  };

  const handleStartExercise = (ex: Exercise) => {
    setActiveExercise(ex);
    setCongratsMsg(null);

    if (ex.id === "3") {
      setGroundingStep(1);
      setGroundingAnswers(["", "", "", "", ""]);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
      setSecondsLeft(ex.id === "1" ? 240 : 300);
      setBreathingPhase("In");
      setPhaseCounter(4);
    }
  };

  const handleFinishSession = async () => {
    if (!activeExercise) return;

    try {
      // Save exercise log
      await api.post("/api/exercises/logs", {
        exerciseId: activeExercise.id,
        exerciseTitle: activeExercise.title,
        category: activeExercise.category,
        durationSecs: activeExercise.id === "1" ? 240 : 300,
      });

      // Log to timeline
      await api.post("/api/wellness", {
        type: "exercise",
        title: `Completed ${activeExercise.title}`,
        preview: `Successfully completed a full pacing session using the ${activeExercise.title}. Autonomic baselines were restored.`,
        sentiment: "Positive",
      });

      setCongratsMsg(
        `Excellent job completing the ${activeExercise.title}! This practice has been permanently logged in your Wellness Timeline.`,
      );
    } catch (err) {
      console.error("Failed to save exercise session:", err);
      setCongratsMsg(`Excellent job completing the ${activeExercise.title}!`);
    }

    setActiveExercise(null);
    setIsPlaying(false);

    setTimeout(() => {
      setCongratsMsg(null);
    }, 6000);
  };

  const handleGroundingNext = async () => {
    if (groundingStep >= 5) {
      // Finished grounding wizard!
      try {
        await api.post("/api/wellness", {
          type: "exercise",
          title: "Completed Sensory Grounding 5-4-3-2-1",
          preview: `Locked somatic anchors. Answers logged: 5 See (${groundingAnswers[0]}), 4 Touch (${groundingAnswers[1]}), 3 Hear (${groundingAnswers[2]}), 2 Smell (${groundingAnswers[3]}), 1 Taste (${groundingAnswers[4]}).`,
          sentiment: "Positive",
        });
        setCongratsMsg(
          "Fantastic job wrapping up the Sensory Grounding 5-4-3-2-1 wizard! Autonomic stress triggers successfully quieted.",
        );
      } catch (err) {
        console.error(err);
        setCongratsMsg(
          "Fantastic job wrapping up the Sensory Grounding 5-4-3-2-1 wizard!",
        );
      }
      setActiveExercise(null);
      setIsPlaying(false);
      setGroundingStep(0);

      setTimeout(() => {
        setCongratsMsg(null);
      }, 6000);
    } else {
      setGroundingStep((prev) => prev + 1);
    }
  };

  const handleCloseModal = () => {
    setActiveExercise(null);
    setIsPlaying(false);
    setGroundingStep(0);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  // Cues for PMR (Progressive Muscle Relaxation) based on remaining time
  const getPMRInstruction = () => {
    if (secondsLeft > 240) {
      return {
        title: "Face & Neck",
        instruction:
          "Inhale, squeeze facial muscles & neck tightly... hold 5s... Exhale and fully release.",
      };
    }
    if (secondsLeft > 180) {
      return {
        title: "Shoulders & Chest",
        instruction:
          "Inhale, shrug shoulders up to ears & squeeze chest... hold 5s... Exhale and fully release.",
      };
    }
    if (secondsLeft > 120) {
      return {
        title: "Arms & Hands",
        instruction:
          "Inhale, squeeze arms tightly & make firm fists... hold 5s... Exhale and fully release.",
      };
    }
    if (secondsLeft > 60) {
      return {
        title: "Stomach & Lower Back",
        instruction:
          "Inhale, pull abdominal wall in & tighten lower back... hold 5s... Exhale and fully release.",
      };
    }
    return {
      title: "Legs & Feet",
      instruction:
        "Inhale, squeeze thigh muscles, calves & curl toes... hold 5s... Exhale and fully release.",
    };
  };

  const getPhaseInstruction = () => {
    if (activeExercise?.id === "2") {
      return getPMRInstruction().instruction;
    }
    switch (breathingPhase) {
      case "In":
        return "Slowly expand your lungs... breathe in the calm";
      case "HoldIn":
        return "Relax your chest... hold the breath and quiet your thoughts";
      case "Out":
        return "Gently sigh it all out... release the heavy tension";
      case "HoldOut":
        return "Quiet rest... remain empty and peaceful before the next cycle";
      default:
        return "Find your natural posture";
    }
  };

  const getPhaseColor = () => {
    if (activeExercise?.id === "2") {
      return "var(--color-error)";
    }
    switch (breathingPhase) {
      case "In":
        return "var(--color-secondary)";
      case "HoldIn":
        return "var(--color-accent)";
      case "Out":
        return "var(--color-primary)";
      case "HoldOut":
        return "var(--color-success)";
      default:
        return "#FFFFFF";
    }
  };

  const getCategoryTheme = (cat: Exercise["category"]) => {
    switch (cat) {
      case "calming":
        return {
          bg: "rgba(90, 148, 117, 0.12)",
          color: "var(--color-success)",
        };
      case "release":
        return {
          bg: "rgba(192, 118, 90, 0.12)",
          color: "var(--color-error)",
        };
      case "focus":
        return {
          bg: "rgba(169, 146, 196, 0.12)",
          color: "var(--color-accent)",
        };
    }
  };

  const habitProgress =
    habits.length > 0
      ? Math.round((completedHabits.length / habits.length) * 100)
      : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Dynamic Success Congratulations notification banner */}
      {congratsMsg && (
        <div
          className="glass-card"
          style={{
            padding: "20px",
            border: "1.5px solid var(--color-success)",
            background:
              "linear-gradient(135deg, var(--bg-surface) 0%, rgba(90, 148, 117, 0.08) 100%)",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            animation: "fadeIn 0.3s ease-out",
            boxShadow: "0 8px 32px rgba(90, 148, 117, 0.12)",
          }}
        >
          <div style={{ fontSize: "28px" }}>🏆</div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--color-success)",
                marginBottom: "4px",
              }}
            >
              Practice Completed!
            </h4>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: "1.4",
              }}
            >
              {congratsMsg}
            </p>
          </div>
          <button
            onClick={() => setCongratsMsg(null)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Intro Header */}
      <section className="glass-card" style={{ padding: "28px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontFamily: "var(--font-header)",
            marginBottom: "8px",
            fontWeight: 500,
          }}
        >
          Mindfulness & Coping Center
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          Pace your daily mental health triggers through interactive sensory
          grounders, muscle release exercises, and corrected box-breathing
          cadences. Sync completed habits directly to your digital companions.
        </p>
      </section>

      {/* Stateful Daily Habits Checklist */}
      <section
        className="glass-card"
        style={{
          padding: "28px",
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "32px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Daily Habits Checklist
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Check off daily mindful exercises to establish permanent
                wellness triggers.
              </p>
            </div>
            <button
              onClick={() => setIsAddingHabit(!isAddingHabit)}
              style={{
                backgroundColor: "var(--bg-nav)",
                border: "1px solid var(--border-light)",
                color: "var(--color-primary)",
                borderRadius: "10px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
              className="btn-add-habit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {isAddingHabit ? "Close Panel" : "Add Habit"}
            </button>
          </div>

          {/* Add Habit Glassmorphic builder panel */}
          {isAddingHabit && (
            <form
              onSubmit={handleAddCustomHabit}
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1.5px dashed var(--border-light)",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--color-primary)",
                }}
              >
                ✨ Custom Habit Builder
              </h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Habit Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={newHabitLabel}
                  onChange={(e) => setNewHabitLabel(e.target.value)}
                  placeholder="e.g. Walking for 10 minutes"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1.5px solid var(--border-light)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Brief Explanation (Why?)
                </label>
                <input
                  type="text"
                  value={newHabitDesc}
                  onChange={(e) => setNewHabitDesc(e.target.value)}
                  placeholder="e.g. Clears circulatory paths and lowers daily cortisol"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1.5px solid var(--border-light)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Visual Theme Category
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[
                    { color: "var(--color-primary)", name: "Calm Blue" },
                    { color: "var(--color-success)", name: "Zen Green" },
                    { color: "var(--color-accent)", name: "Rest Purple" },
                    { color: "var(--color-secondary)", name: "Vital Orange" },
                    { color: "var(--color-error)", name: "Coping Red" },
                  ].map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => setNewHabitColor(item.color)}
                      style={{
                        backgroundColor: item.color,
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border:
                          newHabitColor === item.color
                            ? "3px solid #FFF"
                            : "none",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        transition: "transform 0.1s",
                        transform:
                          newHabitColor === item.color
                            ? "scale(1.1)"
                            : "scale(1)",
                      }}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: "8px 20px",
                    fontSize: "13px",
                    height: "38px",
                  }}
                >
                  Save Habit
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingHabit(false)}
                  className="btn-secondary"
                  style={{
                    padding: "8px 20px",
                    fontSize: "13px",
                    height: "38px",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {habits.map((h) => {
              const checked = completedHabits.includes(h.id);

              if (editingHabitId === h.id) {
                return (
                  <form
                    key={h.id}
                    onSubmit={handleSaveEdit}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      padding: "16px 20px",
                      borderRadius: "14px",
                      border: `1.5px solid ${editColor}`,
                      backgroundColor: "rgba(255,255,255,0.02)",
                      cursor: "default",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Edit Habit Label
                      </label>
                      <input
                        type="text"
                        required
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          border: "1.5px solid var(--border-light)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "13px",
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Edit Explanation
                      </label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          border: "1.5px solid var(--border-light)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "13px",
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Theme Color
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {[
                          { color: "var(--color-primary)", name: "Calm Blue" },
                          { color: "var(--color-success)", name: "Zen Green" },
                          { color: "var(--color-accent)", name: "Rest Purple" },
                          {
                            color: "var(--color-secondary)",
                            name: "Vital Orange",
                          },
                          { color: "var(--color-error)", name: "Coping Red" },
                        ].map((item) => (
                          <button
                            key={item.color}
                            type="button"
                            onClick={() => setEditColor(item.color)}
                            style={{
                              backgroundColor: item.color,
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              border:
                                editColor === item.color
                                  ? "2px solid #FFF"
                                  : "none",
                              cursor: "pointer",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              transition: "transform 0.1s",
                              transform:
                                editColor === item.color
                                  ? "scale(1.1)"
                                  : "scale(1)",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "4px" }}
                    >
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{
                          padding: "6px 14px",
                          fontSize: "12px",
                          height: "32px",
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHabitId(null)}
                        className="btn-secondary"
                        style={{
                          padding: "6px 14px",
                          fontSize: "12px",
                          height: "32px",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={h.id}
                  onClick={() => handleToggleHabit(h.id, h.label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    border: checked
                      ? `1.5px solid ${h.color}`
                      : "1.5px solid var(--border-light)",
                    backgroundColor: checked
                      ? "rgba(255,255,255,0.03)"
                      : "var(--bg-surface)",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className="habit-item"
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: checked
                        ? h.color
                        : "rgba(255,255,255,0.05)",
                      color: checked ? "#FFFFFF" : "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {getHabitIcon(h.id, h.color)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: checked
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                        textDecoration: checked ? "line-through" : "none",
                      }}
                    >
                      {h.label}
                    </h4>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      {h.desc}
                    </p>
                  </div>

                  {/* Edit Pencil icon */}
                  <button
                    onClick={(e) => handleStartEdit(e, h)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      transition: "all 0.2s",
                      marginRight: "-4px",
                    }}
                    className="habit-edit-btn"
                    title="Edit Habit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>

                  {/* Delete Trash-can icon */}
                  <button
                    onClick={(e) => handleRemoveHabit(e, h.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      transition: "all 0.2s",
                    }}
                    className="habit-delete-btn"
                    title="Delete Habit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>

                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      border: checked
                        ? `2px solid ${h.color}`
                        : "2px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: checked ? h.color : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    {checked && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits Progress Radial Circle + Mascot Reaction Widget */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "24px",
            borderLeft: "1px solid var(--border-light)",
            paddingLeft: "32px",
          }}
        >
          {/* Active Companion Reactive Card */}
          <div
            className="glass-card"
            style={{
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              minWidth: "210px",
              border: "1.5px solid var(--border-light)",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "20px",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <Mascot pose={companionPose} size={110} interactive={true} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "var(--color-primary)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {adoptedMascotName}
            </span>
          </div>

          <div
            style={{
              position: "relative",
              width: "140px",
              height: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="140"
              height="140"
              viewBox="0 0 160 160"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="var(--border-light)"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="var(--color-primary)"
                strokeWidth="10"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * habitProgress) / 100}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  display: "block",
                }}
              >
                {habitProgress}%
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Done Today
              </span>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600" }}>
              Milestone Progress
            </h4>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              {completedHabits.length} of {habits.length} habits locked.
            </p>
          </div>
        </div>
      </section>

      {/* Recommended Practices Catalog */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
        className="exercises-grid"
      >
        {exercises.map((ex) => {
          const theme = getCategoryTheme(ex.category);
          return (
            <div
              key={ex.id}
              className="glass-card exercise-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                justifyContent: "space-between",
                padding: "28px 24px",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      backgroundColor: theme?.bg,
                      color: theme?.color,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {ex.category}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                    }}
                  >
                    {ex.duration}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "19px",
                    fontFamily: "var(--font-header)",
                    fontWeight: 500,
                  }}
                >
                  {ex.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    minHeight: "68px",
                  }}
                >
                  {ex.description}
                </p>
              </div>

              {/* Floating glass disk for Mascot inside card */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "16px 0",
                  backgroundColor: "var(--bg-nav)",
                  borderRadius: "20px",
                  border: "1px solid var(--border-light)",
                }}
              >
                <Mascot pose={ex.pose} size={100} interactive={false} />
              </div>

              <button
                onClick={() => handleStartExercise(ex)}
                className="btn-primary start-ex-btn"
                style={{ width: "100%", height: "48px", fontSize: "14px" }}
              >
                Start Exercise
              </button>
            </div>
          );
        })}
      </div>

      {/* Grounding Wizard Modal Overlay (if active id === 3) */}
      {activeExercise && activeExercise.id === "3" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background:
              "radial-gradient(circle at center, #252b36 0%, #11141a 100%)",
            backdropFilter: "blur(16px)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            color: "#FFFFFF",
            animation: "fadeIn 0.4s ease forwards",
          }}
        >
          <button
            onClick={handleCloseModal}
            style={{
              position: "absolute",
              top: "32px",
              right: "32px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1.5px solid rgba(255, 255, 255, 0.1)",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            className="modal-close-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            style={{
              textAlign: "center",
              maxWidth: "600px",
              marginBottom: "32px",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontFamily: "var(--font-header)",
                color: "#FFFFFF",
                marginBottom: "8px",
              }}
            >
              Sensory Grounding 5-4-3-2-1
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>
              Focus on somatic anchors to detach from internal panics and ground
              yourself statefully.
            </p>
          </div>

          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "32px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-accent)",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                Step {groundingStep} of 5
              </span>
              <span style={{ fontSize: "14px", fontWeight: "700" }}>
                Anchor: {6 - groundingStep} Items
              </span>
            </div>

            {groundingStep === 1 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Name 5 things you can SEE around you:
                </h4>
                <textarea
                  value={groundingAnswers[0]}
                  onChange={(e) => {
                    const copy = [...groundingAnswers];
                    copy[0] = e.target.value;
                    setGroundingAnswers(copy);
                  }}
                  placeholder="e.g. A blue book, my laptop, a green leaf outside, dust in the sun, white coffee mug..."
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "#FFF",
                    outline: "none",
                    fontSize: "14px",
                    resize: "none",
                  }}
                />
              </div>
            )}

            {groundingStep === 2 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Name 4 things you can physically TOUCH:
                </h4>
                <textarea
                  value={groundingAnswers[1]}
                  onChange={(e) => {
                    const copy = [...groundingAnswers];
                    copy[1] = e.target.value;
                    setGroundingAnswers(copy);
                  }}
                  placeholder="e.g. My soft cotton shirt, cool metallic keyboard, wooden table surface, rough denim fabric..."
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "#FFF",
                    outline: "none",
                    fontSize: "14px",
                    resize: "none",
                  }}
                />
              </div>
            )}

            {groundingStep === 3 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Name 3 things you can HEAR:
                </h4>
                <textarea
                  value={groundingAnswers[2]}
                  onChange={(e) => {
                    const copy = [...groundingAnswers];
                    copy[2] = e.target.value;
                    setGroundingAnswers(copy);
                  }}
                  placeholder="e.g. Distant wind rustling, hum of the ceiling fan, clicking keyboard keys..."
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "#FFF",
                    outline: "none",
                    fontSize: "14px",
                    resize: "none",
                  }}
                />
              </div>
            )}

            {groundingStep === 4 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Name 2 things you can SMELL:
                </h4>
                <textarea
                  value={groundingAnswers[3]}
                  onChange={(e) => {
                    const copy = [...groundingAnswers];
                    copy[3] = e.target.value;
                    setGroundingAnswers(copy);
                  }}
                  placeholder="e.g. Faint roasted coffee aroma, freshly washed clothes laundry smell..."
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "#FFF",
                    outline: "none",
                    fontSize: "14px",
                    resize: "none",
                  }}
                />
              </div>
            )}

            {groundingStep === 5 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Name 1 thing you can TASTE right now:
                </h4>
                <textarea
                  value={groundingAnswers[4]}
                  onChange={(e) => {
                    const copy = [...groundingAnswers];
                    copy[4] = e.target.value;
                    setGroundingAnswers(copy);
                  }}
                  placeholder="e.g. Minty toothpaste aftertaste, bitter leftover dark coffee..."
                  style={{
                    width: "100%",
                    height: "100px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "#FFF",
                    outline: "none",
                    fontSize: "14px",
                    resize: "none",
                  }}
                />
              </div>
            )}

            <button
              onClick={handleGroundingNext}
              className="btn-primary"
              style={{ width: "100%", height: "48px", fontSize: "14px" }}
              disabled={!groundingAnswers[groundingStep - 1]?.trim()}
            >
              {groundingStep >= 5
                ? "Complete Sensory Grounding"
                : "Proceed to Next Sense"}
            </button>
          </div>
        </div>
      )}

      {/* Full-screen Breathing Player Modal overlay (Corrected Box Breathing 4-4-4-4 & PMR) */}
      {activeExercise && activeExercise.id !== "3" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background:
              "radial-gradient(circle at center, #252b36 0%, #11141a 100%)",
            backdropFilter: "blur(16px)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            color: "#FFFFFF",
            animation: "fadeIn 0.4s ease forwards",
          }}
        >
          <button
            onClick={handleCloseModal}
            style={{
              position: "absolute",
              top: "32px",
              right: "32px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1.5px solid rgba(255, 255, 255, 0.1)",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            className="modal-close-btn"
            title="Exit Practice"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            style={{
              textAlign: "center",
              maxWidth: "600px",
              marginBottom: "48px",
            }}
          >
            <h2
              style={{
                fontSize: "30px",
                fontFamily: "var(--font-header)",
                color: "#FFFFFF",
                marginBottom: "12px",
                fontWeight: 500,
              }}
            >
              {activeExercise.title}
            </h2>
            {activeExercise.id === "2" ? (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--color-error)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Active Focus Group: {getPMRInstruction().title}
              </span>
            ) : (
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.65)",
                  fontSize: "15px",
                  lineHeight: "1.6",
                }}
              >
                Relax your shoulders, sink into your posture, and sync your
                breathing mechanism with the wellness orb.
              </p>
            )}
          </div>

          <div
            style={{
              position: "relative",
              width: "280px",
              height: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "48px",
            }}
          >
            {/* Outer breathing circle with visual glow and transition */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${getPhaseColor()} 0%, rgba(255,255,255,0.01) 100%)`,
                transform: isPlaying
                  ? breathingPhase === "In" || breathingPhase === "HoldIn"
                    ? "scale(1.2)"
                    : "scale(0.85)"
                  : "scale(1)",
                transition: "transform 4s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: 0.25,
              }}
            />
            {/* Inner breathing circle */}
            <div
              style={{
                position: "absolute",
                width: "75%",
                height: "75%",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${getPhaseColor()} 0%, rgba(255,255,255,0.01) 100%)`,
                transform: isPlaying
                  ? breathingPhase === "In" || breathingPhase === "HoldIn"
                    ? "scale(1.12)"
                    : "scale(0.88)"
                  : "scale(1)",
                transition: "transform 4s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: 0.15,
              }}
            />

            {/* Center glassmorphic floating disk for Mascot */}
            <div
              style={{
                position: "absolute",
                width: "50%",
                height: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
                border: "1.5px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <Mascot
                pose={activeExercise.pose}
                size={90}
                interactive={false}
              />
            </div>

            {isPlaying && (
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "rgba(255, 255, 255, 0.8)",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  padding: "4px 10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {phaseCounter}s
              </div>
            )}
          </div>

          {isPlaying && (
            <div
              style={{
                textAlign: "center",
                marginBottom: "40px",
                minHeight: "92px",
                maxWidth: "480px",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "500",
                  fontFamily: "var(--font-header)",
                  color: getPhaseColor(),
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: "8px",
                  transition: "color 0.8s ease",
                }}
              >
                {activeExercise.id === "2"
                  ? "Muscle Release"
                  : breathingPhase === "In"
                    ? "Breathe In"
                    : breathingPhase === "HoldIn"
                      ? "Hold (In)"
                      : breathingPhase === "Out"
                        ? "Breathe Out"
                        : "Hold (Out)"}
              </div>
              <p
                style={{
                  fontSize: "16px",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontStyle: "italic",
                  marginBottom: "12px",
                  minHeight: "24px",
                  lineHeight: "1.5",
                }}
              >
                {getPhaseInstruction()}
              </p>
              <div
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.5)",
                  fontWeight: "500",
                }}
              >
                Time Remaining: {formatTime(secondsLeft)}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "20px" }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary breathe-control-btn"
              style={{
                backgroundColor: isPlaying
                  ? "rgba(255, 255, 255, 0.12)"
                  : "var(--color-success)",
                border: isPlaying
                  ? "1.5px solid rgba(255, 255, 255, 0.2)"
                  : "none",
                color: "#FFFFFF",
                padding: "14px 38px",
                fontSize: "15px",
                fontWeight: "600",
                minWidth: "160px",
                height: "52px",
                borderRadius: "26px",
                transition: "all 0.2s",
              }}
            >
              {isPlaying ? "Pause Pacer" : "Resume Pacer"}
            </button>
            <button
              onClick={handleFinishSession}
              className="btn-secondary breathe-control-btn"
              style={{
                borderColor: "rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
                padding: "13px 37px",
                fontSize: "15px",
                fontWeight: "600",
                minWidth: "160px",
                height: "52px",
                borderRadius: "26px",
                transition: "all 0.2s",
              }}
            >
              Finish Practice
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .exercise-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-primary) !important;
          box-shadow: var(--shadow-hover) !important;
        }

        .start-ex-btn:hover {
          opacity: 0.95;
        }

        .modal-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.15) !important;
          transform: rotate(90deg);
        }

        .breathe-control-btn:hover {
          transform: scale(1.02);
        }
        .breathe-control-btn:active {
          transform: scale(0.98);
        }

        .habit-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border-color: var(--color-primary) !important;
        }

        .habit-delete-btn {
          opacity: 0.15;
          transition: all 0.2s ease;
        }
        .habit-item:hover .habit-delete-btn {
          opacity: 0.6;
        }
        .habit-delete-btn:hover {
          opacity: 1 !important;
          color: var(--color-error) !important;
          background-color: rgba(192, 118, 90, 0.1) !important;
          transform: scale(1.1);
        }

        .habit-edit-btn {
          opacity: 0.15;
          transition: all 0.2s ease;
        }
        .habit-item:hover .habit-edit-btn {
          opacity: 0.6;
        }
        .habit-edit-btn:hover {
          opacity: 1 !important;
          color: var(--color-primary) !important;
          background-color: rgba(91, 127, 166, 0.1) !important;
          transform: scale(1.1);
        }

        @media (max-width: 900px) {
          .exercises-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
