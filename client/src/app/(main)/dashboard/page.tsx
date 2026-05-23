"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Anxious: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <line x1="9" y1="10" x2="9.01" y2="10" />
      <line x1="15" y1="10" x2="15.01" y2="10" />
    </svg>
  ),
  Stressed: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="15" x2="16" y2="15" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Sad: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <line x1="9" y1="9" x2="9" y2="11" />
      <line x1="15" y1="9" x2="15" y2="11" />
    </svg>
  ),
  Energetic: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  const [hatchStep, setHatchStep] = useState<"choose" | "tap" | "name" | "persona">("choose");
  const [tapCount, setTapCount] = useState(0);
  const [isHatchingShaking, setIsHatchingShaking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Name & Persona Form states
  const [mascotName, setMascotName] = useState("");
  const [mascotDemeanor, setMascotDemeanor] = useState("Calming & Stoic");
  const [adoptedMascotState, setAdoptedMascotState] = useState<AdoptedMascot | null>(null);

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
  const [physicalActivity, setPhysicalActivity] = useState("Light Walking / Yoga");

  // Real-time wellness logs from database
  const [dbLogs, setDbLogs] = useState<any[]>([]);

  // Normal Dashboard states
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [mascotPose, setMascotPose] = useState<HamsterPose>("waving-hello");
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingText, setBreathingText] = useState("Click Start to practice");
  const [breathingCycle, setBreathingCycle] = useState<"in" | "hold" | "out">("in");
  const [isMuted, setIsMuted] = useState(false);

  // Chart interactivity states
  const [trendFilter, setTrendFilter] = useState<"7" | "all">("7");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);
  const [chartTooltipPos, setChartTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [donutDrawTrigger, setDonutDrawTrigger] = useState(false);

  const trendSvgRef = useRef<SVGSVGElement | null>(null);

  const moods: { label: Mood; pose: HamsterPose; dialogue: string }[] = [
    { label: "Calm", pose: "sitting-zen", dialogue: "Ah, absolute serenity. Let's take a slow breath together." },
    { label: "Anxious", pose: "escaping-energy", dialogue: "Heavy heart? It's okay to feel anxious. Let's discharge that together." },
    { label: "Stressed", pose: "balancing-nut", dialogue: "A lot on your mind? Let's take a step back and simplify things." },
    { label: "Sad", pose: "holding-heart", dialogue: "I'm right here with a warm hug. You don't have to carry this alone." },
    { label: "Energetic", pose: "running-excited", dialogue: "Yay! Awesome vibes! Let's channel this wonderful energy!" },
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
        // Trigger donut animation
        setTimeout(() => setDonutDrawTrigger(true), 150);
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
    const positiveCount = dbLogs.filter((l: any) => l.sentiment === "Positive").length;
    const stressedCount = dbLogs.filter((l: any) => l.sentiment === "Stressed" || l.sentiment === "Anxious").length;

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
      setBreathingCycle("in");
      let count = 0;
      interval = setInterval(() => {
        count++;
        if (count % 3 === 0) {
          setBreathingText("Breathe in... (Expand)");
          setBreathingCycle("in");
        } else if (count % 3 === 1) {
          setBreathingText("Hold... (Sustain)");
          setBreathingCycle("hold");
        } else {
          setBreathingText("Breathe out... (Relax)");
          setBreathingCycle("out");
        }
      }, 4000);
    } else {
      setBreathingText("Click Start to practice");
      setBreathingCycle("in");
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
        preview: `Checked in feeling ${moodItem.label} on the main dashboard. ${adoptedMascotState?.name || "Your companion"} noted: "${moodItem.dialogue}"`,
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
    const crackPhrases = ["*Tap!*", "*Crack!*", "*Wobble!*", "*Squeak!*", "*Burst!*"];

    setFloatingTexts((prev) => [...prev, { id: Date.now(), text: crackPhrases[nextTaps - 1] || "*Crack!*", x, y }]);

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
        `Congratulations! ${mascotName || "Your companion"} is now bonded. Your behavioral profile indicates a close fit with our "${calculatedPersona}" group. We have tailored your dashboard companionships accordingly!`,
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

  // ==========================================
  // COMPLEX SVG GRAPH CALCULATIONS & HANDLERS
  // ==========================================

  // Sentiment scoring for Y-axis plotting
  const sentimentScoreMap: Record<string, number> = {
    Positive: 8,
    Neutral: 5.5,
    Anxious: 3.5,
    Stressed: 2.5,
    Negative: 1.5,
  };

  // Mock logs for Demo Mode when database is empty
  const mockLogs = useMemo(() => [
    {
      id: "mock-1",
      type: "mood",
      title: "Morning Calm State",
      preview: "Started the day with deep box breathing and quiet tea.",
      sentiment: "Positive",
      date: "May 18, 2026 at 8:30 AM"
    },
    {
      id: "mock-2",
      type: "journal",
      title: "Reflection on Boundaries",
      preview: "Felt overwhelmed by project sprint. Set computer aside.",
      sentiment: "Neutral",
      date: "May 19, 2026 at 6:15 PM"
    },
    {
      id: "mock-3",
      type: "chat",
      title: "Mascot Pacing Talk",
      preview: "Sparky noticed elevated screen time. Guided me to step outside.",
      sentiment: "Anxious",
      date: "May 20, 2026 at 3:10 PM"
    },
    {
      id: "mock-4",
      type: "exercise",
      title: "Breathing Exercise",
      preview: "Completed 5 full cycles of deep box breathing.",
      sentiment: "Positive",
      date: "May 21, 2026 at 11:45 AM"
    },
    {
      id: "mock-5",
      type: "mood",
      title: "Evening Stressed check-in",
      preview: "Sprint deadline approaching. Shared worries with companion.",
      sentiment: "Stressed",
      date: "May 22, 2026 at 8:20 PM"
    }
  ], []);

  const isDemoMode = useMemo(() => dbLogs.length === 0, [dbLogs]);

  const activeLogs = useMemo(() => {
    return isDemoMode ? mockLogs : dbLogs;
  }, [dbLogs, isDemoMode, mockLogs]);

  // Helper to check if all trend logs occurred on the same calendar day
  const allSameDay = useMemo(() => {
    if (activeLogs.length <= 1) return true;
    const limit = trendFilter === "7" ? 7 : 15;
    const sortedLogs = [...activeLogs].slice(0, limit);
    
    const getDatePart = (dStr: string) => {
      if (!dStr) return "";
      return dStr.split(",")[0].trim(); // Extract e.g. "May 22"
    };
    
    const firstDate = getDatePart(sortedLogs[0]?.date);
    return sortedLogs.every((log) => getDatePart(log.date) === firstDate);
  }, [activeLogs, trendFilter]);

  const formatXLabel = (dateStr: string, sameDay: boolean) => {
    if (!dateStr) return "";
    const parts = dateStr.split(" at ");
    if (parts.length < 2) return dateStr.split(",")[0];
    const datePart = parts[0].split(",")[0]; // "May 22"
    const timePart = parts[1]; // "9:00 PM"
    const timeShort = timePart.replace(":00", "").toLowerCase().replace(" ", "");
    return sameDay ? timeShort : datePart;
  };

  // 1. Mood Trend Bezier Plot coordinates
  const trendPoints = useMemo(() => {
    if (activeLogs.length === 0) return [];
    
    // Slice logs based on user filter preference
    const limit = trendFilter === "7" ? 7 : 15;
    const sortedLogs = [...activeLogs].slice(0, limit);
    // Reverse to display chronologically (past -> present)
    sortedLogs.reverse();

    const svgWidth = 500;
    const svgHeight = 240;
    const paddingLeft = 55;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 40;
    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const getResiliencePower = (sentiment: string, type?: string) => {
      if (type === "exercise") return 84;
      switch (sentiment) {
        case "Positive": return 92;
        case "Neutral": return 68;
        case "Anxious": return 46;
        case "Stressed": return 32;
        case "Negative": return 15;
        default: return 60;
      }
    };

    return sortedLogs.map((log, i) => {
      const x = paddingLeft + (sortedLogs.length > 1 ? (i / (sortedLogs.length - 1)) * plotWidth : plotWidth / 2);
      
      // Smart scoring: Exercises map to a higher resilience baseline
      let score = sentimentScoreMap[log.sentiment] || 5.5;
      if (log.type === "exercise") {
        score = 7.5;
      }
      
      // Add a small deterministic sine variation to avoid dead-flat lines on consecutive entries
      score += Math.sin(i * 1.7) * 0.25;
      score = Math.max(1, Math.min(10, score)); // Keep within scale bounds

      // Map score 1-10 to plot height (inverted Y)
      const y = svgHeight - paddingBottom - ((score - 1) / 9) * plotHeight;
      const power = getResiliencePower(log.sentiment, log.type);
      return { x, y, log, score, power };
    });
  }, [activeLogs, trendFilter]);

  // Bezier curve string generator
  const trendPaths = useMemo(() => {
    if (trendPoints.length === 0) return { line: "", area: "" };
    if (trendPoints.length === 1) {
      return {
        line: `M ${trendPoints[0].x} ${trendPoints[0].y} L ${trendPoints[0].x + 1} ${trendPoints[0].y}`,
        area: `M ${trendPoints[0].x} ${trendPoints[0].y} L ${trendPoints[0].x + 1} ${trendPoints[0].y} L ${trendPoints[0].x + 1} 200 L ${trendPoints[0].x} 200 Z`
      };
    }

    let d = `M ${trendPoints[0].x} ${trendPoints[0].y}`;
    for (let i = 0; i < trendPoints.length - 1; i++) {
      const p0 = trendPoints[i];
      const p1 = trendPoints[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) * 2 / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const svgHeight = 240;
    const paddingBottom = 40;
    const chartBaseline = svgHeight - paddingBottom;
    const area = `${d} L ${trendPoints[trendPoints.length - 1].x} ${chartBaseline} L ${trendPoints[0].x} ${chartBaseline} Z`;

    return { line: d, area };
  }, [trendPoints]);

  const handleTrendMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (trendPoints.length === 0 || !trendSvgRef.current) return;
    const rect = trendSvgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Normalizing mouse positions back to SVG viewport
    const scaleX = 500 / rect.width;
    const svgMouseX = mouseX * scaleX;

    let closestIdx = 0;
    let minDist = Infinity;
    trendPoints.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgMouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setHoveredPointIndex(closestIdx);

    // Compute screen space tooltip coordinates
    const scaleY = 240 / rect.height;
    const tipX = (trendPoints[closestIdx].x / scaleX) + 12;
    const tipY = (trendPoints[closestIdx].y / scaleY) - 50;
    setChartTooltipPos({ x: tipX, y: tipY });
  };

  // 2. Donut Chart Breakdown Calculations
  const donutData = useMemo(() => {
    if (activeLogs.length === 0) return [];
    const counts = { mood: 0, journal: 0, chat: 0, exercise: 0 };
    activeLogs.forEach((l) => {
      const type = l.type?.toLowerCase();
      if (type in counts) {
        counts[type as keyof typeof counts]++;
      }
    });

    const items = [
      { label: "Mood Logs", count: counts.mood, color: "var(--color-primary)", description: "Daily mood states" },
      { label: "Journals", count: counts.journal, color: "var(--color-secondary)", description: "Written reflections" },
      { label: "Mascot Chats", count: counts.chat, color: "var(--color-accent)", description: "Sparky dialogues" },
      { label: "Exercises", count: counts.exercise, color: "var(--color-success)", description: "Completed practices" },
    ];

    const total = items.reduce((a, b) => a + b.count, 0);

    let accumulatedPercentage = 0;
    const radius = 38;
    const circumference = 2 * Math.PI * radius; // ~238.76

    return items.map((item) => {
      const percent = total > 0 ? (item.count / total) * 100 : 0;
      const length = (percent / 100) * circumference;
      const strokeDashoffset = -(accumulatedPercentage / 100) * circumference;
      accumulatedPercentage += percent;

      return {
        ...item,
        percent,
        length,
        strokeDashoffset,
        totalLogs: total,
      };
    });
  }, [activeLogs]);

  const activeDonutSlice = useMemo(() => {
    if (hoveredSliceIndex === null) return null;
    return donutData[hoveredSliceIndex] || null;
  }, [hoveredSliceIndex, donutData]);

  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);


  // Show loading skeleton while fetching mascot from DB
  if (isLoadingMascot) {
    return (
      <div className="glass-card" style={{ maxWidth: "800px", margin: "40px auto", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
          </svg>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>Verifying mindfulness bounds...</p>
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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "10px 0" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "28px", fontFamily: "var(--font-header)", fontWeight: 500 }}>
                Your SereneMind Package Has Arrived!
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "520px", margin: "8px auto 0", lineHeight: "1.5" }}>
                Welcome to your mental health space! A tactile unboxing parcel has been delivered. **Click the box 5 times** to unwrap and reveal your companion.
              </p>
            </div>

            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "16px" }}>
              <UnboxingParcel tapCount={tapCount} isShaking={isHatchingShaking} onClick={handleEggTap} />

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

              {/* Render dynamic parcel unboxing particles when box opened */}
              {tapCount >= 5 &&
                Array.from({ length: 48 }).map((_, i) => {
                  const angle = (i / 48) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
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
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "28px", fontFamily: "var(--font-header)", color: "var(--color-success)", fontWeight: 500 }}>
                Companion Emerged!
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "520px", margin: "6px auto 0" }}>
                The package flew open and revealed 4 serene companion spirits. Select your favorite partner to pace your mental health journey.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="eggs-grid">
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
                      border: isSel ? `2.5px solid ${egg.color}` : "1.5px solid var(--border-light)",
                      backgroundColor: isSel ? "rgba(91, 127, 166, 0.05)" : "var(--bg-surface)",
                      boxShadow: isSel ? `0 8px 24px ${egg.glow}` : "var(--shadow-subtle)",
                      transition: "all 0.25s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "16px",
                    }}
                  >
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
                      <Mascot pose="waving-hello" size={65} interactive={false} companionType={egg.comp as any} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: "700" }}>{egg.label}</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: "1.4" }}>
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
              style={{ alignSelf: "center", padding: "12px 32px", marginTop: "8px" }}
              disabled={!selectedEgg}
            >
              Adopt Selected Companion
            </button>
          </div>
        )}

        {hatchStep === "name" && selectedEgg && (
          <form onSubmit={handleAdoptSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "28px", fontFamily: "var(--font-header)", color: "var(--color-success)" }}>
                COMPANION HATCHED!
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
                Name your new partner and select its baseline demeanor to finalize adoption.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
              <Mascot pose="celebrating-success" size={170} dialogue="Hi! I'm so excited to be here!" interactive={false} companionType={selectedEgg.comp as any} />
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
          <form onSubmit={handlePersonaSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "26px", fontFamily: "var(--font-header)", color: "var(--color-primary)" }}>
                Establish Your Diagnostics Persona
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                Complete the scientific screener checklist below so we can accurately assess and track your mental baseline.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Age
                </label>
                <input type="number" placeholder="e.g. 24" value={age} onChange={(e) => setAge(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Occupation / Focus
                </label>
                <input type="text" placeholder="e.g. Student / Engineer" value={occupation} onChange={(e) => setOccupation(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
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
                  <option value="8+ hours">8+ hours (High replenishment)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
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
                  <option value="Reduce Panic Sparks">Reduce Panic Sparks</option>
                  <option value="Achieve Calmer Baselines">Achieve Calmer Baselines</option>
                  <option value="Build Self-Compassion">Build Self-Compassion</option>
                  <option value="Gain Focus Momentum">Gain Focus Momentum</option>
                </select>
              </div>
            </div>

            {/* Interactive stress questionnaire */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-error)" }}>
                Autonomic Stress Screener
              </h3>
              {[
                "1. Feel unable to control important life events?",
                "2. Feel nervous, stressed, or hyperaroused?",
                "3. Struggle to sleep or turn off circular worries?",
                "4. Feel physically fatigued, tight-chested, or tense?",
              ].map((q, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{q}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    {["Never", "Rarely", "Often", "Always"].map((label, val) => {
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
                            border: selected ? "2px solid var(--color-error)" : "1px solid var(--border-light)",
                            backgroundColor: selected ? "rgba(192, 118, 90, 0.08)" : "var(--bg-surface)",
                            color: selected ? "var(--color-error)" : "var(--text-secondary)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive self-care questionnaire */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-success)" }}>
                Self-Care Dedication Screener
              </h3>
              {[
                "1. Practice deliberate breathing, pacing, or stretching?",
                "2. Log your active mood or write reflective journals?",
                "3. Set boundaries between work/study pressure and rest?",
                "4. Seek wellness guides or use companion coping tools?",
              ].map((q, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{q}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    {["Never", "Rarely", "Moderately", "Highly"].map((label, val) => {
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
                            border: selected ? "2px solid var(--color-success)" : "1px solid var(--border-light)",
                            backgroundColor: selected ? "rgba(125, 170, 143, 0.08)" : "var(--bg-surface)",
                            color: selected ? "var(--color-success)" : "var(--text-secondary)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional parameters */}
            <div className="glass-card" style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Daily Water Intake
                </label>
                <select value={waterIntake} onChange={(e) => setWaterIntake(e.target.value)}>
                  <option value="Under 1 Liter">Under 1 Liter</option>
                  <option value="1-2 Liters">1-2 Liters</option>
                  <option value="2-3 Liters">2-3 Liters</option>
                  <option value="Over 3 Liters">Over 3 Liters</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Screen Time Exposure
                </label>
                <select value={screenTime} onChange={(e) => setScreenTime(e.target.value)}>
                  <option value="Under 2 Hours">Under 2 Hours</option>
                  <option value="2-5 Hours">2-5 Hours</option>
                  <option value="5-8 Hours">5-8 Hours</option>
                  <option value="Over 8 Hours">Over 8 Hours</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Social Context Support
                </label>
                <select value={socialContext} onChange={(e) => setSocialContext(e.target.value)}>
                  <option value="Feeling Isolated">Feeling Isolated</option>
                  <option value="Neutral Connection">Neutral Connection</option>
                  <option value="Strong Support Network">Strong Support Network</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Physical Activity Rate
                </label>
                <select value={physicalActivity} onChange={(e) => setPhysicalActivity(e.target.value)}>
                  <option value="Sedentary baseline">Sedentary baseline</option>
                  <option value="Light Walking / Yoga">Light Walking / Yoga</option>
                  <option value="Heavy Workout / Cardio">Heavy Workout / Cardio</option>
                </select>
              </div>
            </div>

            {/* Dynamic Screener feedback badges */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", backgroundColor: "rgba(192,118,90,0.12)", color: "var(--color-error)", padding: "6px 14px", borderRadius: "12px" }}>
                Stress Evaluation: {calculatedStress} / 10
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", backgroundColor: "rgba(125,170,143,0.12)", color: "var(--color-success)", padding: "6px 14px", borderRadius: "12px" }}>
                Self-Care Index: {calculatedSelfCare} / 10
              </span>
            </div>

            {/* Trigger Multi-select pills */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
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
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15), inset 0 -6px 12px rgba(0, 0, 0, 0.08);
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
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.08);
            z-index: 10;
            transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease;
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
            transition: transform 0.8s ease, opacity 0.5s ease;
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
            0% { transform: scale(1.1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(-3deg); }
            50% { transform: scale(1.1) rotate(0deg); }
            75% { transform: scale(1.1) rotate(3deg); }
            100% { transform: scale(1.1) rotate(0deg); }
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
            animation: explodeParticle 1s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
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

  return (
    <div className="premium-dashboard-container">
      {/* 1. Global Header HUD */}
      <header className="dashboard-hud-header animated-fade-in">
        <div className="hud-greeting-zone">
          <span className="hud-eyebrow-label">Mindfulness Dashboard</span>
          <h1 className="hud-title">
            {greetingText}, {user?.displayName || "Friend"}!
          </h1>
          <p className="hud-subtitle">Here is a snapshot of your mental wellness and autonomic trends today.</p>
        </div>
        <div className="hud-badges-zone">
          <div className="hud-badge-capsule date-capsule">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{formattedDate}</span>
          </div>
          <Link href="/history" className="hud-badge-capsule streak-capsule">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            <span>5 Day Streak</span>
          </Link>
        </div>
      </header>

      {/* 2. Main Dashboard Layout Grid */}
      <div className="premium-dashboard-grid">
        
        {/* LEFT COLUMN: ACTIVE WELLNESS SPACE */}
        <div className="wellness-column animated-fade-in delay-1">
          
          {/* A. Evolved Mascot Companion Hero Card */}
          <section className="glass-card mascot-hero-card">
            <div className="mascot-hero-glow" />
            
            <div className="mascot-hero-content">
              <div className="mascot-badge-row">
                <span className="mascot-level-badge">
                  Level {mascotProgressInfo.level}
                </span>
                <span className="mascot-title-badge">
                  {mascotProgressInfo.title}
                </span>
              </div>
              
              <h2 className="mascot-hero-heading">
                Your companion <span className="highlight-text">{adoptedMascotState?.name || "Sparky"}</span> is active
              </h2>
              
              <p className="mascot-hero-description">
                Serving as your <strong className="state-highlight">{mascotProgressInfo.state}</strong>. Chat with them to share your thoughts, log your journals, or review your mental diagnostics.
              </p>
              
              <div className="mascot-speech-bubble">
                <div className="bubble-pointer" />
                <p className="bubble-text">
                  {selectedMood
                    ? moods.find((m) => m.label === selectedMood)?.dialogue
                    : `Welcome back! How is your mind pacing today? Click below to chat.`}
                </p>
              </div>

              <Link href="/chatbot" className="mascot-chat-cta">
                <span>Engage in deep dialogue</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cta-chevron"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            
            <div className="mascot-render-container">
              <div className="mascot-render-shadow" />
              <Mascot pose={mascotPose} size={150} interactive={true} />
            </div>
          </section>

          {/* B. Tactile Mood Sensing Pods */}
          <section className="glass-card mood-checkin-section">
            <div className="section-header-row">
              <div className="section-header-left">
                <h3 className="section-title">How are you feeling right now?</h3>
                <p className="section-subtitle">Tactile biofeedback logs directly to your calendar</p>
              </div>
              <Link href="/analysis" className="section-header-link">
                <span>Detailed Trends</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="link-arrow"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>

            <div className="mood-pods-grid">
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.label;
                return (
                  <button
                    key={mood.label}
                    onClick={() => handleMoodSelect(mood)}
                    className={`mood-pod-btn ${mood.label.toLowerCase()} ${isSelected ? "selected" : ""}`}
                  >
                    <div className="mood-pod-glow" />
                    <div className="mood-pod-content">
                      <span className="mood-pod-icon">{MOOD_ICONS[mood.label]}</span>
                      <span className="mood-pod-label">{mood.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* C. Zen Breathing Pod */}
          <section className={`glass-card breathing-pacer-card ${isBreathingActive ? "active" : ""} ${isBreathingActive ? breathingCycle : ""}`}>
            <div className="breathing-card-glow" />
            <div className="section-header-row">
              <div className="section-header-left">
                <h3 className="section-title">Autonomic Breathing Pacer</h3>
                <p className="section-subtitle">Synchronize your respiration baseline to soothe stress</p>
              </div>
              <Link href="/exercises" className="section-header-link">
                <span>Explore Exercises</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="link-arrow"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>

            <div className="breathing-pacer-layout">
              {/* Left Side: Stats & Instructions */}
              <div className="breathing-controls-column">
                <div className="breathing-params-row">
                  <div className="param-capsule">
                    <div className="param-icon-wrapper duration">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div className="param-text">
                      <span className="param-value">5 Min</span>
                      <span className="param-label">Duration</span>
                    </div>
                  </div>
                  <div className="param-capsule">
                    <div className="param-icon-wrapper technique">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className="param-text">
                      <span className="param-value">Box</span>
                      <span className="param-label">Technique</span>
                    </div>
                  </div>
                  <div className="param-capsule">
                    <div className="param-icon-wrapper pattern">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                    </div>
                    <div className="param-text">
                      <span className="param-value">4-7-8</span>
                      <span className="param-label">Pattern</span>
                    </div>
                  </div>
                </div>

                <div className="breathing-status-banner">
                  {isBreathingActive ? (
                    <div className={`status-pill ${breathingCycle}`}>
                      <span className="status-dot" />
                      {breathingCycle === "in" && "Breathe In (Expand)"}
                      {breathingCycle === "hold" && "Hold (Sustain)"}
                      {breathingCycle === "out" && "Breathe Out (Relax)"}
                    </div>
                  ) : (
                    <span className="status-idle-text">Ready to begin your session? Click start below.</span>
                  )}
                </div>

                <div className="breathing-actions-row">
                  <button
                    onClick={toggleBreathing}
                    className={`breathing-trigger-btn ${isBreathingActive ? "active" : ""}`}
                  >
                    {isBreathingActive ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        <span>Pause Session</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>Start Pacing</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="icon-control-btn"
                    title="Audio Guidance"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Side: Visualizing Orb */}
              <div className="breathing-orb-column">
                <div className="orb-wrapper">
                  <div className={`orb-wave outer ${isBreathingActive ? breathingCycle : ""}`} />
                  <div className={`orb-wave middle ${isBreathingActive ? breathingCycle : ""}`} />
                  <div className={`orb-core ${isBreathingActive ? breathingCycle : ""}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="orb-core-icon"
                    >
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10Z" />
                      <path d="M19 2c-3 3-7 4-11 5" />
                    </svg>
                  </div>
                  
                  {/* Floating particles */}
                  <div className="orb-particle p1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10Z"/></svg></div>
                  <div className="orb-particle p2"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10Z"/></svg></div>
                  <div className="orb-particle p3"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10Z"/></svg></div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: ANALYTICS HUD */}
        <div className="analytics-column animated-fade-in delay-2">
          
          {/* A. Resilience & Mood Trend Chart */}
          <section className="glass-card chart-card">
            <div className="section-header-row">
              <div className="section-header-left">
                <h3 className="section-title">
                  Resilience & Mood Trend
                  {isDemoMode && (
                    <span className="demo-badge-pill">
                      <span className="demo-dot" />
                      Demo Baseline
                    </span>
                  )}
                </h3>
                <p className="section-subtitle">Vagal tone & mental variance telemetry</p>
              </div>

              <div className="chart-header-actions">
                <Link href="/analysis" className="section-header-link icon-only" title="Open Detailed Analysis">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="link-arrow"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
                <div className="filter-pill-selector">
                  <button
                    onClick={() => setTrendFilter("7")}
                    className={`filter-btn ${trendFilter === "7" ? "active" : ""}`}
                  >
                    Last 7
                  </button>
                  <button
                    onClick={() => setTrendFilter("all")}
                    className={`filter-btn ${trendFilter === "all" ? "active" : ""}`}
                  >
                    All Logs
                  </button>
                </div>
              </div>
            </div>

            <div className="trend-chart-container">
              {trendPoints.length === 0 ? (
                <div className="empty-chart-fallback">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <p>Log a mood check-in to begin metrics tracking.</p>
                </div>
              ) : (
                <>
                  <svg
                    ref={trendSvgRef}
                    viewBox="0 0 500 240"
                    width="100%"
                    height="100%"
                    onMouseMove={handleTrendMouseMove}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="trend-chart-svg"
                  >
                    <defs>
                      <linearGradient id="premiumChartArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.00" />
                      </linearGradient>

                      <filter id="premiumGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Horizontal Guideline Grids */}
                    <line x1="55" y1="25" x2="475" y2="25" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 6" />
                    <text x="12" y="30" fontSize="10" fill="var(--text-secondary)" fontWeight="600">Flourish</text>

                    <line x1="55" y1="100" x2="475" y2="100" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 6" />
                    <text x="12" y="105" fontSize="10" fill="var(--text-secondary)" fontWeight="600">Balanced</text>

                    <line x1="55" y1="175" x2="475" y2="175" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 6" />
                    <text x="12" y="180" fontSize="10" fill="var(--text-secondary)" fontWeight="600">Vulnerable</text>

                    {/* Bezier Area Under the Line */}
                    <path d={trendPaths.area} fill="url(#premiumChartArea)" />

                    {/* Bezier Smooth Line */}
                    <path
                      d={trendPaths.line}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      filter="url(#premiumGlow)"
                      className="svg-draw-path"
                    />

                    {/* Anchor Nodes */}
                    {trendPoints.map((p, idx) => {
                      const isHovered = hoveredPointIndex === idx;
                      return (
                        <g key={idx}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 12 : 0}
                            fill="var(--color-primary)"
                            fillOpacity="0.15"
                            className="halo-ring"
                          />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 6 : 4.5}
                            fill="var(--bg-surface)"
                            stroke="var(--color-primary)"
                            strokeWidth={isHovered ? 3.5 : 2.5}
                            className="core-node"
                          />
                          {(() => {
                            const len = trendPoints.length;
                            const showLabel = 
                              len <= 7 || 
                              (len <= 14 && idx % 2 === 0) || 
                              (len > 14 && idx % 3 === 0);
                            if (!showLabel) return null;
                            return (
                              <text
                                x={p.x}
                                y="222"
                                fontSize="9"
                                fill="var(--text-secondary)"
                                textAnchor="middle"
                                fontWeight="600"
                              >
                                {p.log.date ? formatXLabel(p.log.date, allSameDay) : ""}
                              </text>
                            );
                          })()}
                        </g>
                      );
                    })}

                    {/* Vertical Cursor Tracker */}
                    {hoveredPointIndex !== null && trendPoints[hoveredPointIndex] && (
                      <line
                        x1={trendPoints[hoveredPointIndex].x}
                        y1="25"
                        x2={trendPoints[hoveredPointIndex].x}
                        y2="200"
                        stroke="var(--color-primary)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        pointerEvents="none"
                      />
                    )}
                  </svg>

                  {/* Floating Tooltip Bubble */}
                  {hoveredPointIndex !== null && trendPoints[hoveredPointIndex] && chartTooltipPos && (
                    <div
                      className="glass-card trend-chart-tooltip"
                      style={{
                        position: "absolute",
                        left: `${chartTooltipPos.x}px`,
                        top: `${chartTooltipPos.y}px`,
                      }}
                    >
                      <div className="tooltip-title">
                        {trendPoints[hoveredPointIndex].log.title.replace("Dashboard Mood Check-in: ", "")}
                      </div>
                      <div className="tooltip-date">
                        {trendPoints[hoveredPointIndex].log.date}
                      </div>
                      <div className="tooltip-preview">
                        {trendPoints[hoveredPointIndex].log.preview}
                      </div>
                      <div className="tooltip-resilience">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        <span>Resilience Power: {trendPoints[hoveredPointIndex].power}%</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* B. Mindfulness Mix (Donut Chart) */}
          <section className="glass-card donut-card">
            <div className="section-header-row">
              <div className="section-header-left">
                <h3 className="section-title">
                  Mindfulness Mix
                  {isDemoMode && (
                    <span className="demo-badge-pill">
                      <span className="demo-dot" />
                      Demo Baseline
                    </span>
                  )}
                </h3>
                <p className="section-subtitle">Logs breakdown across categories</p>
              </div>
              <Link href="/history" className="section-header-link icon-only" title="Browse Complete Logs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="link-arrow"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>

            <div className="donut-chart-layout">
              {/* Left Side: Interactive SVG Donut */}
              <div className="donut-svg-wrapper">
                {activeLogs.length === 0 ? (
                  <span className="empty-donut-text">Empty</span>
                ) : (
                  <>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" className="donut-svg">
                      {donutData.map((slice, idx) => {
                        const isHovered = hoveredSliceIndex === idx;
                        const r = 38;
                        const c = 2 * Math.PI * r;
                        return (
                          <circle
                            key={slice.label}
                            cx="50"
                            cy="50"
                            r={r}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth={isHovered ? 11.5 : 8.5}
                            strokeDasharray={`${slice.length} ${c - slice.length}`}
                            strokeDashoffset={donutDrawTrigger ? slice.strokeDashoffset : c}
                            strokeLinecap="round"
                            className="donut-segment"
                            onMouseEnter={() => setHoveredSliceIndex(idx)}
                            onMouseLeave={() => setHoveredSliceIndex(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Center stats HUD */}
                    <div className="donut-center-hud">
                      {activeDonutSlice ? (
                        <>
                          <span className="center-value" style={{ color: activeDonutSlice.color }}>
                            {activeDonutSlice.count}
                          </span>
                          <span className="center-label">
                            {activeDonutSlice.label.replace(" Logs", "")}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="center-value total">
                            {activeLogs.length}
                          </span>
                          <span className="center-label total">
                            Total Logs
                          </span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right Side: Detailed Legend List */}
              <div className="donut-legend-column">
                {donutData.map((slice, idx) => {
                  const isHovered = hoveredSliceIndex === idx;
                  return (
                    <div
                      key={slice.label}
                      onMouseEnter={() => setHoveredSliceIndex(idx)}
                      onMouseLeave={() => setHoveredSliceIndex(null)}
                      className={`legend-item ${isHovered ? "hovered" : ""}`}
                    >
                      <span className="legend-indicator-dot" style={{ backgroundColor: slice.color }} />
                      <div className="legend-text-zone">
                        <span className="legend-title">{slice.label}</span>
                        <span className="legend-meta">
                          {slice.count} logged ({Math.round(slice.percent)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* C. Streak Metrics Summary Card */}
          <Link href="/history" className="glass-card interactive-streak-summary">
            <div className="streak-summary-left">
              <span className="streak-eyebrow">Consistency Telemetry</span>
              <h4 className="streak-summary-heading">Active Mindfulness Streak</h4>
              <p className="streak-summary-description">
                You logged {activeLogs.length} activities this month. Maintain consistency to unlock evolved companion personalities!
              </p>
            </div>
            <div className="streak-summary-badge">
              <div className="badge-flame-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </div>
              <div className="badge-text-zone">
                <span className="badge-title">5 Days</span>
                <span className="badge-subtitle">Streak</span>
              </div>
            </div>
          </Link>

        </div>

      </div>

      {/* 3. Global CSS Layout & Design System Styling Inject */}
      <style jsx global>{`
        /* Premium Dashboard Container */
        .premium-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 10px 0 40px;
          position: relative;
          z-index: 10;
        }

        /* Global Header HUD */
        .dashboard-hud-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 20px;
          margin-bottom: 4px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .hud-greeting-zone {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hud-eyebrow-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .hud-title {
          font-size: 32px;
          font-weight: 600;
          font-family: var(--font-header);
          line-height: 1.25;
          margin: 0;
          color: var(--text-primary);
        }
        .hud-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }
        .hud-badges-zone {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hud-badge-capsule {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 18px;
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          box-shadow: var(--shadow-subtle);
          transition: all 0.25s ease;
        }
        .hud-badge-capsule.streak-capsule {
          border-color: rgba(192, 118, 90, 0.2);
          background: rgba(192, 118, 90, 0.05);
          cursor: pointer;
        }
        .hud-badge-capsule.streak-capsule:hover {
          border-color: var(--color-error);
          background: rgba(192, 118, 90, 0.08);
          transform: translateY(-2px);
        }

        /* Two-Column Grid */
        .premium-dashboard-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 28px;
          align-items: start;
        }
        .wellness-column, .analytics-column {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* Evolved Mascot Companion Card */
        .mascot-hero-card {
          position: relative;
          overflow: visible;
          background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(91, 127, 166, 0.08) 100%) !important;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 32px;
          align-items: center;
          min-height: 230px;
          padding: 32px !important;
        }
        .mascot-hero-glow {
          position: absolute;
          width: 250px;
          height: 250px;
          right: -30px;
          top: -30px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(169, 146, 196, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .mascot-hero-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 5;
        }
        .mascot-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mascot-level-badge {
          font-size: 9px;
          font-weight: 800;
          color: var(--color-primary);
          background: rgba(91, 127, 166, 0.12);
          border: 1px solid rgba(91, 127, 166, 0.25);
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .mascot-title-badge {
          font-size: 9px;
          font-weight: 800;
          color: var(--color-success);
          background: rgba(90, 148, 117, 0.12);
          border: 1px solid rgba(90, 148, 117, 0.25);
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .mascot-hero-heading {
          font-size: 24px;
          font-weight: 500;
          line-height: 1.3;
          margin: 0;
          color: var(--text-primary);
        }
        .mascot-hero-heading .highlight-text {
          color: var(--color-primary);
          font-weight: 700;
        }
        .mascot-hero-description {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
          max-width: 440px;
        }
        .state-highlight {
          color: var(--text-primary);
          font-weight: 600;
        }
        .mascot-speech-bubble {
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          padding: 12px 18px;
          border-radius: 18px;
          position: relative;
          margin-top: 8px;
          max-width: 440px;
          box-shadow: var(--shadow-subtle);
        }
        .bubble-pointer {
          position: absolute;
          width: 10px;
          height: 10px;
          background: var(--bg-surface);
          border-left: 1px solid var(--border-light);
          border-top: 1px solid var(--border-light);
          top: 50%;
          left: -6px;
          transform: translateY(-50%) rotate(-45deg);
        }
        .bubble-text {
          font-size: 12.5px;
          color: var(--text-primary);
          line-height: 1.45;
          margin: 0;
          font-style: italic;
        }
        .mascot-chat-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--color-primary);
          text-decoration: none;
          margin-top: 6px;
          align-self: flex-start;
          transition: all 0.25s ease;
        }
        .mascot-chat-cta:hover {
          color: var(--color-accent);
        }
        .mascot-chat-cta:hover .cta-chevron {
          transform: translateX(4px);
        }
        .cta-chevron {
          transition: transform 0.25s ease;
        }
        .mascot-render-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-right: 8px;
        }
        .mascot-render-shadow {
          position: absolute;
          bottom: 12px;
          width: 90px;
          height: 10px;
          background: rgba(0, 0, 0, 0.08);
          border-radius: 50%;
          filter: blur(4px);
          pointer-events: none;
        }
        html.dark .mascot-render-shadow {
          background: rgba(0, 0, 0, 0.3);
        }

        /* Tactile Mood Sensing Pods */
        .mood-checkin-section {
          background: var(--bg-surface) !important;
        }
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 16px;
        }
        .section-header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          font-family: var(--font-header);
          color: var(--text-primary);
          margin: 0;
        }
        .section-subtitle {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 0;
        }
        .section-header-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-primary);
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .section-header-link:hover {
          color: var(--color-accent);
        }
        .section-header-link:hover .link-arrow {
          transform: translateX(3px);
        }
        .section-header-link.icon-only {
          padding: 6px;
          border-radius: 50%;
          background: var(--bg-nav);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
        }
        .section-header-link.icon-only:hover {
          color: var(--color-primary);
          border-color: var(--color-primary);
          background: var(--bg-surface);
        }
        .link-arrow {
          transition: transform 0.25s ease;
        }
        .mood-pods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
        }
        .mood-pod-btn {
          position: relative;
          border: 1px solid var(--border-light);
          border-radius: 20px;
          background: var(--bg-surface);
          cursor: pointer;
          min-height: 52px;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mood-pod-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-hover);
        }
        .mood-pod-content {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 14px;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
          transition: color 0.25s;
        }
        .mood-pod-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: color 0.25s, transform 0.25s;
        }
        .mood-pod-btn:hover .mood-pod-icon {
          transform: scale(1.1);
        }
        .mood-pod-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.25s;
        }

        /* Specific Mood Color Maps */
        .mood-pod-btn.calm:hover, .mood-pod-btn.calm.selected {
          border-color: var(--color-success);
        }
        .mood-pod-btn.calm:hover .mood-pod-icon, .mood-pod-btn.calm.selected .mood-pod-icon {
          color: var(--color-success);
        }
        .mood-pod-btn.calm:hover .mood-pod-content, .mood-pod-btn.calm.selected .mood-pod-content {
          color: var(--color-success);
        }
        .mood-pod-btn.calm:hover .mood-pod-glow, .mood-pod-btn.calm.selected .mood-pod-glow {
          opacity: 1;
          background: radial-gradient(circle, rgba(90, 148, 117, 0.08) 0%, transparent 80%);
        }

        .mood-pod-btn.anxious:hover, .mood-pod-btn.anxious.selected {
          border-color: var(--color-accent);
        }
        .mood-pod-btn.anxious:hover .mood-pod-icon, .mood-pod-btn.anxious.selected .mood-pod-icon {
          color: var(--color-accent);
        }
        .mood-pod-btn.anxious:hover .mood-pod-content, .mood-pod-btn.anxious.selected .mood-pod-content {
          color: var(--color-accent);
        }
        .mood-pod-btn.anxious:hover .mood-pod-glow, .mood-pod-btn.anxious.selected .mood-pod-glow {
          opacity: 1;
          background: radial-gradient(circle, rgba(169, 146, 196, 0.08) 0%, transparent 80%);
        }

        .mood-pod-btn.stressed:hover, .mood-pod-btn.stressed.selected {
          border-color: var(--color-error);
        }
        .mood-pod-btn.stressed:hover .mood-pod-icon, .mood-pod-btn.stressed.selected .mood-pod-icon {
          color: var(--color-error);
        }
        .mood-pod-btn.stressed:hover .mood-pod-content, .mood-pod-btn.stressed.selected .mood-pod-content {
          color: var(--color-error);
        }
        .mood-pod-btn.stressed:hover .mood-pod-glow, .mood-pod-btn.stressed.selected .mood-pod-glow {
          opacity: 1;
          background: radial-gradient(circle, rgba(192, 118, 90, 0.08) 0%, transparent 80%);
        }

        .mood-pod-btn.sad:hover, .mood-pod-btn.sad.selected {
          border-color: var(--color-primary);
        }
        .mood-pod-btn.sad:hover .mood-pod-icon, .mood-pod-btn.sad.selected .mood-pod-icon {
          color: var(--color-primary);
        }
        .mood-pod-btn.sad:hover .mood-pod-content, .mood-pod-btn.sad.selected .mood-pod-content {
          color: var(--color-primary);
        }
        .mood-pod-btn.sad:hover .mood-pod-glow, .mood-pod-btn.sad.selected .mood-pod-glow {
          opacity: 1;
          background: radial-gradient(circle, rgba(91, 127, 166, 0.08) 0%, transparent 80%);
        }

        .mood-pod-btn.energetic:hover, .mood-pod-btn.energetic.selected {
          border-color: var(--color-secondary);
        }
        .mood-pod-btn.energetic:hover .mood-pod-icon, .mood-pod-btn.energetic.selected .mood-pod-icon {
          color: var(--color-secondary);
        }
        .mood-pod-btn.energetic:hover .mood-pod-content, .mood-pod-btn.energetic.selected .mood-pod-content {
          color: var(--color-secondary);
        }
        .mood-pod-btn.energetic:hover .mood-pod-glow, .mood-pod-btn.energetic.selected .mood-pod-glow {
          opacity: 1;
          background: radial-gradient(circle, rgba(125, 170, 143, 0.08) 0%, transparent 80%);
        }

        /* Breathing Pacer Card Layout */
        .breathing-pacer-card {
          position: relative;
          overflow: hidden;
          transition: all 0.5s ease;
        }
        .breathing-card-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.5s ease, background 0.5s ease;
          pointer-events: none;
        }
        .breathing-pacer-card.active.in .breathing-card-glow {
          opacity: 0.05;
          background: radial-gradient(circle at 80% 50%, var(--color-success) 0%, transparent 70%);
        }
        .breathing-pacer-card.active.hold .breathing-card-glow {
          opacity: 0.05;
          background: radial-gradient(circle at 80% 50%, var(--color-accent) 0%, transparent 70%);
        }
        .breathing-pacer-card.active.out .breathing-card-glow {
          opacity: 0.05;
          background: radial-gradient(circle at 80% 50%, var(--color-primary) 0%, transparent 70%);
        }
        .breathing-pacer-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 28px;
          align-items: center;
        }
        .breathing-controls-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .breathing-params-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .param-capsule {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 14px;
          background: var(--bg-nav);
          border: 1px solid var(--border-light);
        }
        .param-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 8px;
        }
        .param-icon-wrapper.duration {
          color: var(--color-success);
          background: rgba(90, 148, 117, 0.1);
        }
        .param-icon-wrapper.technique {
          color: var(--color-accent);
          background: rgba(169, 146, 196, 0.1);
        }
        .param-icon-wrapper.pattern {
          color: var(--color-primary);
          background: rgba(91, 127, 166, 0.1);
        }
        .param-text {
          display: flex;
          flex-direction: column;
        }
        .param-value {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.25;
        }
        .param-label {
          font-size: 8.5px;
          color: var(--text-secondary);
          line-height: 1.25;
          text-transform: uppercase;
        }
        .breathing-status-banner {
          min-height: 38px;
          display: flex;
          align-items: center;
        }
        .status-idle-text {
          font-size: 13px;
          color: var(--text-secondary);
          font-style: italic;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s;
          border: 1px solid transparent;
        }
        .status-pill.in {
          background-color: rgba(90, 148, 117, 0.12);
          color: var(--color-success);
          border-color: rgba(90, 148, 117, 0.2);
        }
        .status-pill.in .status-dot { background-color: var(--color-success); }

        .status-pill.hold {
          background-color: rgba(169, 146, 196, 0.12);
          color: var(--color-accent);
          border-color: rgba(169, 146, 196, 0.2);
        }
        .status-pill.hold .status-dot { background-color: var(--color-accent); }

        .status-pill.out {
          background-color: rgba(91, 127, 166, 0.12);
          color: var(--color-primary);
          border-color: rgba(91, 127, 166, 0.2);
        }
        .status-pill.out .status-dot { background-color: var(--color-primary); }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: statusPulse 1.2s infinite alternate ease-in-out;
        }
        @keyframes statusPulse {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.15); opacity: 1; }
        }
        .breathing-actions-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .breathing-trigger-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 20px;
          border: none;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          color: #FFFFFF;
          transition: all 0.2s;
          background: var(--color-success);
          box-shadow: 0 4px 12px rgba(90, 148, 117, 0.2);
        }
        .breathing-trigger-btn.active {
          background: var(--color-error);
          box-shadow: 0 4px 12px rgba(192, 118, 90, 0.2);
        }
        .breathing-trigger-btn:hover {
          opacity: 0.93;
        }
        .breathing-trigger-btn:active {
          transform: scale(0.97);
        }
        .icon-control-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-light);
          background: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-control-btn:hover {
          color: var(--color-primary);
          border-color: var(--color-primary);
          background: var(--bg-nav);
          transform: translateY(-1px);
        }

        /* Breathing Orb Visualizing Column */
        .breathing-orb-column {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .orb-wrapper {
          position: relative;
          width: 170px;
          height: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .orb-wave {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          transition: all 4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .orb-wave.outer {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(90, 148, 117, 0.08) 0%, transparent 70%);
          transform: scale(0.85);
          opacity: 0.4;
        }
        .orb-wave.outer.in {
          transform: scale(1.3);
          opacity: 0.9;
          background: radial-gradient(circle, rgba(90, 148, 117, 0.22) 0%, transparent 70%);
        }
        .orb-wave.outer.hold {
          transform: scale(1.3);
          opacity: 0.9;
          background: radial-gradient(circle, rgba(169, 146, 196, 0.25) 0%, transparent 70%);
        }
        .orb-wave.outer.out {
          transform: scale(0.85);
          opacity: 0.4;
          background: radial-gradient(circle, rgba(91, 127, 166, 0.2) 0%, transparent 70%);
        }

        .orb-wave.middle {
          width: 82%;
          height: 82%;
          border: 1.5px dashed var(--border-light);
          transform: scale(0.9);
        }
        .orb-wave.middle.in {
          transform: scale(1.2);
          border-color: rgba(90, 148, 117, 0.45);
        }
        .orb-wave.middle.hold {
          transform: scale(1.2);
          border-color: rgba(169, 146, 196, 0.55);
        }
        .orb-wave.middle.out {
          transform: scale(0.9);
          border-color: rgba(91, 127, 166, 0.35);
        }

        .orb-core {
          position: absolute;
          width: 78px;
          height: 78px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 2px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          box-shadow: var(--shadow-subtle);
          transition: all 4s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-secondary);
        }
        .orb-core.in {
          transform: scale(1.25);
          border-color: var(--color-success);
          box-shadow: 0 0 30px rgba(90, 148, 117, 0.35);
          color: var(--color-success);
        }
        .orb-core.hold {
          transform: scale(1.25);
          border-color: var(--color-accent);
          box-shadow: 0 0 40px rgba(169, 146, 196, 0.45);
          color: var(--color-accent);
        }
        .orb-core.out {
          transform: scale(0.95);
          border-color: var(--color-primary);
          box-shadow: 0 0 20px rgba(91, 127, 166, 0.25);
          color: var(--color-primary);
        }
        .orb-core-icon {
          transition: color 1s ease;
        }

        /* Floating Leaves */
        .orb-particle {
          position: absolute;
          pointer-events: none;
          animation: leafFloat 5.5s ease-in-out infinite alternate;
        }
        .orb-particle.p1 {
          top: 8px;
          right: -8px;
          transform: rotate(45deg);
          animation-delay: 0s;
        }
        .orb-particle.p2 {
          bottom: 12px;
          left: -12px;
          transform: rotate(-30deg);
          animation-delay: 1.3s;
        }
        .orb-particle.p3 {
          top: 95px;
          right: -20px;
          transform: rotate(15deg);
          animation-delay: 2.5s;
        }
        @keyframes leafFloat {
          0% { transform: translateY(0) rotate(15deg); }
          100% { transform: translateY(-7px) rotate(25deg); }
        }

        /* TELEMETRY ANALYTICS HUD */
        .chart-card {
          background: var(--bg-surface) !important;
        }
        .chart-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .filter-pill-selector {
          display: flex;
          background: var(--bg-nav);
          padding: 2.5px;
          border-radius: 10px;
          border: 1px solid var(--border-light);
        }
        .filter-btn {
          font-size: 11px;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          box-shadow: var(--shadow-subtle);
        }
        .trend-chart-container {
          position: relative;
          width: 100%;
          height: 235px;
        }
        .empty-chart-fallback {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .trend-chart-svg {
          overflow: visible;
        }

        /* Graph Draw Keyframes */
        .svg-draw-path {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: drawChart 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.1s;
        }
        @keyframes drawChart {
          to { stroke-dashoffset: 0; }
        }

        /* Nodes interactive styles */
        .halo-ring {
          transition: r 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .core-node {
          transition: all 0.2s;
        }

        /* Floating Tooltip Bubble */
        .trend-chart-tooltip {
          position: absolute;
          padding: 12px 16px !important;
          font-size: 12px;
          pointer-events: none;
          z-index: 100;
          width: 220px;
          border-radius: 16px !important;
          box-shadow: var(--shadow-hover) !important;
          animation: scaleBubble 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes scaleBubble {
          from { opacity: 0; transform: scale(0.9) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .tooltip-title {
          font-weight: 800;
          color: var(--color-primary);
          margin-bottom: 2px;
        }
        .tooltip-date {
          font-size: 9.5px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .tooltip-preview {
          line-height: 1.4;
          color: var(--text-primary);
          opacity: 0.9;
          margin-bottom: 8px;
        }
        .tooltip-resilience {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          color: var(--color-success);
          border-top: 1px solid var(--border-light);
          padding-top: 6px;
          font-size: 10.5px;
        }

        /* Demo badge pill */
        .demo-badge-pill {
          font-size: 9.5px;
          font-weight: 800;
          background-color: rgba(169, 146, 196, 0.12);
          color: var(--color-accent);
          padding: 3px 8px;
          border-radius: 10px;
          border: 1px solid rgba(169, 146, 196, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-left: 8px;
        }
        .demo-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: var(--color-accent);
          animation: demoPulse 1.2s infinite alternate ease-in-out;
        }

        /* Mindfulness Mix Donut */
        .donut-card {
          background: var(--bg-surface) !important;
        }
        .donut-chart-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: center;
        }
        .donut-svg-wrapper {
          position: relative;
          width: 170px;
          height: 170px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .donut-svg {
          transform: rotate(-90deg);
          overflow: visible;
        }
        .donut-segment {
          transition: stroke-width 0.2s ease, stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .donut-center-hud {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
        }
        .donut-center-hud .center-value {
          font-size: 20px;
          font-weight: 800;
          line-height: 1.1;
        }
        .donut-center-hud .center-value.total {
          font-size: 26px;
          color: var(--text-primary);
        }
        .donut-center-hud .center-label {
          font-size: 9.5px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .donut-center-hud .center-label.total {
          font-size: 10px;
          letter-spacing: 0.8px;
        }
        .donut-legend-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border: 1px solid transparent;
        }
        .legend-item.hovered {
          background-color: var(--bg-nav);
          border-color: var(--border-light);
        }
        .legend-indicator-dot {
          width: 10px;
          height: 10px;
          border-radius: 3.5px;
          flex-shrink: 0;
        }
        .legend-text-zone {
          display: flex;
          flex-direction: column;
        }
        .legend-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .legend-item.hovered .legend-title {
          color: var(--color-primary);
        }
        .legend-meta {
          font-size: 10px;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        /* Streak Summary Interactive Card */
        .interactive-streak-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px !important;
          background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(192, 118, 90, 0.06) 100%) !important;
          border: 1px solid var(--border-light) !important;
          cursor: pointer;
          gap: 16px;
        }
        .interactive-streak-summary:hover {
          border-color: rgba(192, 118, 90, 0.3) !important;
          box-shadow: var(--shadow-hover), 0 0 20px rgba(192, 118, 90, 0.08) !important;
        }
        .streak-summary-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .streak-eyebrow {
          font-size: 9.5px;
          font-weight: 800;
          color: var(--color-error);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .streak-summary-heading {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .streak-summary-description {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.45;
          margin: 0;
          max-width: 320px;
        }
        .streak-summary-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(192, 118, 90, 0.08);
          border: 1.5px solid rgba(192, 118, 90, 0.15);
          border-radius: 16px;
          padding: 10px 16px;
          min-width: 140px;
          transition: all 0.25s ease;
        }
        .interactive-streak-summary:hover .streak-summary-badge {
          border-color: rgba(192, 118, 90, 0.3);
          background: rgba(192, 118, 90, 0.12);
        }
        .badge-flame-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-error);
          background: rgba(192, 118, 90, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          transition: transform 0.25s ease;
        }
        .interactive-streak-summary:hover .badge-flame-icon {
          transform: scale(1.08) rotate(-5deg);
        }
        .badge-text-zone {
          display: flex;
          flex-direction: column;
        }
        .badge-title {
          font-size: 14.5px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .badge-subtitle {
          font-size: 9px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }

        /* Staggered Animations */
        .animated-fade-in {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .delay-1 { animation-delay: 0.12s; }
        .delay-2 { animation-delay: 0.24s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Breakpoints */
        @media (max-width: 1024px) {
          .premium-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard-hud-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .mascot-hero-card {
            grid-template-columns: 1fr !important;
            padding: 24px !important;
            gap: 20px;
          }
          .mascot-render-container {
            justify-content: flex-start;
            order: -1;
          }
          .bubble-pointer {
            top: -6px;
            left: 24px;
            border-left: 1px solid var(--border-light);
            border-top: 1px solid var(--border-light);
            border-right: none;
            border-bottom: none;
            transform: rotate(45deg);
          }
          .breathing-pacer-layout {
            grid-template-columns: 1fr !important;
            gap: 32px;
            text-align: center;
          }
          .breathing-params-row, .breathing-actions-row {
            justify-content: center;
          }
          .donut-chart-layout {
            grid-template-columns: 1fr !important;
            gap: 24px;
          }
          .interactive-streak-summary {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .streak-summary-badge {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

    </div>
  );
}
