"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Mascot from "../../components/Mascot";
import { api, CalendarDay } from "../../lib/api";

type Mood = "Calm" | "Energetic" | "Sad" | "Anxious" | "Stressed";

const moodValues: Record<Mood, number> = {
  Calm: 5,
  Energetic: 4,
  Sad: 3,
  Anxious: 2,
  Stressed: 1,
};

// Client-side mock calendar generation if database contains no logged days
function generateMockCalendar(month: number, year: number): Record<number, CalendarDay> {
  const mockData: Record<number, CalendarDay> = {};
  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
  const limitDay = isCurrentMonth ? today.getDate() - 1 : 28; // Fill up to yesterday if current month, else fill first 28 days

  const moodPool: Mood[] = [
    "Calm", "Energetic", "Calm", "Anxious", "Calm", "Stressed", 
    "Sad", "Calm", "Energetic", "Calm", "Anxious", "Calm", 
    "Sad", "Calm", "Energetic", "Calm"
  ];
  
  const notesPool = [
    "Had a peaceful morning walk. Very productive session.",
    "Felt motivated and energized today, completed two major tasks.",
    "Quiet day. Practiced slow breathing in the afternoon.",
    "A bit worried about the upcoming review. Slept slightly late.",
    "Balanced day. Enjoyed a hot cup of tea and wrote in my journal.",
    "Tough workload today. Felt tight in my chest during the meeting.",
    "Felt a bit low and reflective today. Spent time reading.",
    "Excellent progress today. Felt balanced and focused.",
    "Had a fun catch-up with an old friend. Mood was elevated.",
    "Felt very centered. Sparky's advice helped me unwind.",
    "Felt somewhat restless in the evening, but meditated before bed.",
    "A calming cup of tea and a light stroll. Very restorative.",
    "Quiet evening reflecting on recent wins. Peaceful vibe.",
    "Highly focused study block. Felt in control and stable.",
    "Full of energy today, went for a run in the afternoon.",
    "Deeply relaxed today. Felt content with my current pacing."
  ];

  for (let d = 1; d <= limitDay; d++) {
    const seed = (d * 17 + month * 31 + year * 7) % moodPool.length;
    mockData[d] = {
      day: d,
      mood: moodPool[seed],
      note: notesPool[seed],
    };
  }
  return mockData;
}

export default function AnalysisPage() {
  const [calendar, setCalendar] = useState<Record<number, CalendarDay>>({});
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Form states for editing selected day
  const [dayMoodEdit, setDayMoodEdit] = useState<CalendarDay["mood"] | "">("");
  const [dayNoteEdit, setDayNoteEdit] = useState("");

  // Voice Input State
  const [isListening, setIsListening] = useState(false);

  // Active month/year navigation state
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  // Interactive line chart states
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [trendTooltipPos, setTrendTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const trendSvgRef = useRef<SVGSVGElement | null>(null);

  // Interactive donut chart states
  const [hoveredDonutLabel, setHoveredDonutLabel] = useState<string | null>(null);

  // Mount detection state for SVG self-drawing transitions
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch calendar from DB when navigated month or year changes
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const data = await api.get<{
          days: CalendarDay[];
          month: number;
          year: number;
        }>(`/api/calendar?month=${currentMonth}&year=${currentYear}`);
        const calMap: Record<number, CalendarDay> = {};

        // If the database has zero logged days for this month, pre-seed with realistic mock data
        const hasAnyLogs = data.days.some((d) => d.mood !== null);
        if (!hasAnyLogs) {
          const mocks = generateMockCalendar(currentMonth, currentYear);
          data.days.forEach((d) => {
            if (mocks[d.day]) {
              calMap[d.day] = mocks[d.day];
            } else {
              calMap[d.day] = d;
            }
          });
        } else {
          data.days.forEach((d) => {
            calMap[d.day] = d;
          });
        }

        setCalendar(calMap);
      } catch (err) {
        console.error("Failed to fetch mood calendar:", err);
      }
    }
    fetchCalendar();
  }, [currentMonth, currentYear]);

  // Update form inputs when selectedDay changes
  useEffect(() => {
    if (selectedDay !== null) {
      const dayData = calendar[selectedDay];
      setDayMoodEdit(dayData?.mood || "");
      setDayNoteEdit(dayData?.note || "");
    }
  }, [selectedDay, calendar]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
    setHoveredTrendIdx(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
    setHoveredTrendIdx(null);
  };

  const handleResetToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
    setSelectedDay(null);
    setHoveredTrendIdx(null);
  };

  const handleDaySave = async () => {
    if (selectedDay === null) return;
    try {
      await api.put(`/api/calendar/${selectedDay}`, {
        mood: dayMoodEdit || null,
        note: dayNoteEdit,
        month: currentMonth,
        year: currentYear,
      });
      setCalendar((prev) => ({
        ...prev,
        [selectedDay]: {
          day: selectedDay,
          mood: (dayMoodEdit as any) || null,
          note: dayNoteEdit,
        },
      }));
      setSelectedDay(null);
      setDayMoodEdit("");
      setDayNoteEdit("");
    } catch (err) {
      console.error("Failed to save calendar day:", err);
      alert("Could not save. Please try again.");
    }
  };

  // Speech Recognition Speech-to-text dictation
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please try Google Chrome or Microsoft Edge.",
      );
      return;
    }

    if (isListening) {
      if ((window as any).currentAnalysisRecognition) {
        (window as any).currentAnalysisRecognition.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setDayNoteEdit(
          (prev) => prev + (prev ? " " : "") + transcript.trim() + ".",
        );
      }
    };

    (window as any).currentAnalysisRecognition = recognition;
    recognition.start();
  };

  const handleUpdateDay = (e: React.FormEvent) => {
    e.preventDefault();
    handleDaySave();
  };

  const handleResetCalendar = () => {
    if (window.confirm("Are you sure you want to clear your mood calendar?")) {
      setCalendar({});
      setHoveredTrendIdx(null);
    }
  };

  // Date math for selected month
  const firstDayIndex = useMemo(() => {
    return new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun, 6 = Sat
  }, [currentMonth, currentYear]);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentMonth, currentYear]);

  // Derive a cleaned array containing only the valid days for the active month
  const activeMonthDays = useMemo(() => {
    const arr: CalendarDay[] = [];
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = calendar[dayNum];
      arr.push(d || { day: dayNum, mood: null, note: "" });
    }
    return arr;
  }, [calendar, daysInMonth]);

  // Recalculate mood ratios in real-time
  const moodRatios = useMemo(() => {
    if (activeMonthDays.length === 0) return [];

    const totals = { Calm: 0, Energetic: 0, Sad: 0, Anxious: 0, Stressed: 0 };
    activeMonthDays.forEach((d) => {
      if (d.mood) totals[d.mood as keyof typeof totals] += 1;
    });

    const list = [
      { label: "Calm", color: "var(--color-success)", desc: "Peaceful baseline" },
      { label: "Energetic", color: "var(--color-secondary)", desc: "High motivation" },
      { label: "Sad", color: "var(--color-primary)", desc: "Reflective space" },
      { label: "Anxious", color: "var(--color-accent)", desc: "Hyperactive alert" },
      { label: "Stressed", color: "var(--color-error)", desc: "Tight deadlines" },
    ];

    const loggedDaysCount = activeMonthDays.filter((d) => d.mood).length;

    return list.map((item) => {
      const count = totals[item.label as keyof typeof totals] || 0;
      const percent = loggedDaysCount > 0 ? Math.round((count / loggedDaysCount) * 100) : 0;
      return { ...item, count, percent };
    });
  }, [activeMonthDays]);

  // Recalculate stable baseline index in real-time
  const baselinePercentage = useMemo(() => {
    const loggedDays = activeMonthDays.filter((d) => d.mood);
    if (loggedDays.length === 0) return 0;
    const stable = loggedDays.filter(
      (d) => d.mood === "Calm" || d.mood === "Energetic",
    ).length;
    return Math.round((stable / loggedDays.length) * 100);
  }, [activeMonthDays]);

  const getMoodColor = (mood?: CalendarDay["mood"]) => {
    switch (mood) {
      case "Calm":
        return "var(--color-success)";
      case "Anxious":
        return "var(--color-accent)";
      case "Stressed":
        return "var(--color-error)";
      case "Sad":
        return "var(--color-primary)";
      case "Energetic":
        return "var(--color-secondary)";
      default:
        return "var(--border-light)";
    }
  };

  const getMoodGlow = (mood?: CalendarDay["mood"]) => {
    switch (mood) {
      case "Calm":
        return "rgba(90, 148, 117, 0.4)";
      case "Anxious":
        return "rgba(169, 146, 196, 0.4)";
      case "Stressed":
        return "rgba(192, 118, 90, 0.4)";
      case "Sad":
        return "rgba(91, 127, 166, 0.4)";
      case "Energetic":
        return "rgba(125, 170, 143, 0.4)";
      default:
        return "transparent";
    }
  };

  // Line Chart SVG Coordinate Calculations
  const trendPoints = useMemo(() => {
    const points: { x: number; y: number; day: number; mood: string; note: string; score: number }[] = [];
    const loggedDays = activeMonthDays.filter((d) => d.mood !== null);
    if (loggedDays.length === 0) return [];

    const svgWidth = 500;
    const svgHeight = 160;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 25;
    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    loggedDays.forEach((d) => {
      const x = paddingLeft + ((d.day - 1) / (daysInMonth - 1)) * plotWidth;
      const score = moodValues[d.mood as Mood] || 3;
      const y = svgHeight - paddingBottom - ((score - 1) / 4) * plotHeight;
      points.push({ x, y, day: d.day, mood: d.mood!, note: d.note || "", score });
    });

    return points;
  }, [activeMonthDays, daysInMonth]);

  const trendPaths = useMemo(() => {
    if (trendPoints.length === 0) return { line: "", area: "" };
    if (trendPoints.length === 1) {
      const p = trendPoints[0];
      return {
        line: `M ${p.x} ${p.y} L ${p.x + 1} ${p.y}`,
        area: `M ${p.x} ${p.y} L ${p.x + 1} ${p.y} L ${p.x + 1} 135 L ${p.x} 135 Z`,
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

    const svgHeight = 160;
    const paddingBottom = 25;
    const chartBaseline = svgHeight - paddingBottom;
    const area = `${d} L ${trendPoints[trendPoints.length - 1].x} ${chartBaseline} L ${trendPoints[0].x} ${chartBaseline} Z`;

    return { line: d, area };
  }, [trendPoints]);

  const handleTrendMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (trendPoints.length === 0 || !trendSvgRef.current) return;
    const rect = trendSvgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

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

    setHoveredTrendIdx(closestIdx);

    const scaleY = 160 / rect.height;
    const tipX = trendPoints[closestIdx].x / scaleX + 12;
    const tipY = trendPoints[closestIdx].y / scaleY - 50;
    setTrendTooltipPos({ x: tipX, y: tipY });
  };

  // Donut Chart Segment Calculations
  const donutSlices = useMemo(() => {
    let accumulatedPercent = 0;
    const r = 50;
    const circumference = 2 * Math.PI * r;

    return moodRatios.map((item) => {
      const offset = -(accumulatedPercent / 100) * circumference;
      const length = (item.percent / 100) * circumference;
      accumulatedPercent += item.percent;
      return {
        ...item,
        strokeDasharray: `${length} ${circumference}`,
        strokeDashoffset: offset,
      };
    });
  }, [moodRatios]);

  const totalLoggedDays = useMemo(() => {
    return activeMonthDays.filter((d) => d.mood !== null).length;
  }, [activeMonthDays]);

  const dominantMood = useMemo(() => {
    if (activeMonthDays.length === 0) return "None";
    const counts = { Calm: 0, Energetic: 0, Sad: 0, Anxious: 0, Stressed: 0 };
    let hasLogs = false;
    activeMonthDays.forEach((d) => {
      if (d.mood) {
        counts[d.mood as Mood]++;
        hasLogs = true;
      }
    });
    if (!hasLogs) return "None";
    let maxVal = -1;
    let dominant: string = "Calm";
    Object.keys(counts).forEach((k) => {
      if (counts[k as Mood] > maxVal) {
        maxVal = counts[k as Mood];
        dominant = k;
      }
    });
    return dominant;
  }, [activeMonthDays]);

  const handleDownloadReport = () => {
    if (activeMonthDays.length === 0) return;
    const monthName = new Date(currentYear, currentMonth - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const fileContent =
      `SERENEMIND WELLNESS DIAGNOSTICS REPORT\n` +
      `Month: ${monthName}\n` +
      `Generated: ${new Date().toLocaleDateString()}\n` +
      `Baseline Mindfulness Index: ${baselinePercentage}%\n\n` +
      `Telemetry Logs:\n` +
      activeMonthDays
        .map(
          (d) => `Day ${d.day}: Mood [${d.mood || "None"}] - Notes: ${d.note || "No logs"}`,
        )
        .join("\n");

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `SereneMind_Mood_Telemetry_${monthName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const hoveredDonutLabelData = useMemo(() => {
    if (!hoveredDonutLabel) return null;
    return moodRatios.find((m) => m.label === hoveredDonutLabel) || null;
  }, [hoveredDonutLabel, moodRatios]);

  // Autonomic wave resonance properties based on active mood
  const activeMood = useMemo(() => {
    if (hoveredDay?.mood) return hoveredDay.mood;
    if (selectedDay && calendar[selectedDay]?.mood) return calendar[selectedDay].mood;
    return dominantMood as Mood | "None";
  }, [hoveredDay, selectedDay, calendar, dominantMood]);

  const resonanceStyles = useMemo(() => {
    switch (activeMood) {
      case "Calm":
        return { color: "var(--color-success)", duration: "4.8s", borderStyle: "solid", desc: "Parasympathetic Vagal Tone Coherent" };
      case "Energetic":
        return { color: "var(--color-secondary)", duration: "3.2s", borderStyle: "solid", desc: "Balanced Sympathetic Pacing" };
      case "Sad":
        return { color: "var(--color-primary)", duration: "7.0s", borderStyle: "solid", desc: "Reflective Somatic Hypo-arousal" };
      case "Anxious":
        return { color: "var(--color-accent)", duration: "1.8s", borderStyle: "dashed", desc: "Autonomic Hyper-alert Shivers" };
      case "Stressed":
        return { color: "var(--color-error)", duration: "1.2s", borderStyle: "dashed", desc: "Elevated Cortisol Pressure Waves" };
      default:
        return { color: "var(--border-light)", duration: "9.0s", borderStyle: "solid", desc: "Steady Neural Baseline" };
    }
  }, [activeMood]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: "24px",
      }}
      className="analysis-layout"
    >
      {/* Left Column - Heatmap calendar + Line chart + Telemetry Metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Heatmap Section (Compact with cascade mount) */}
        <section className="glass-card animate-fade-in" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontFamily: "var(--font-header)",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Monthly Mood Heatmap
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "2px 0 0 0" }}>
                Click cells to edit records.
              </p>
            </div>

            {/* Navigation Switchers */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-nav)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                className="nav-arrow-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-header)",
                  fontWeight: "600",
                  minWidth: "90px",
                  textAlign: "center",
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  userSelect: "none",
                }}
              >
                {new Date(currentYear, currentMonth - 1).toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <button
                onClick={handleNextMonth}
                aria-label="Next Month"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-nav)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                className="nav-arrow-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                onClick={handleResetToToday}
                style={{
                  fontSize: "11px",
                  color: "var(--color-primary)",
                  background: "transparent",
                  border: "1.5px solid var(--color-primary)",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                className="nav-today-btn"
              >
                Today
              </button>

              <button
                onClick={handleResetCalendar}
                style={{
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  background: "var(--bg-nav)",
                  border: "1px solid var(--border-light)",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                className="nav-reset-btn"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Calendar Day Grid (Constrained Width with Staggered Cascades) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              maxWidth: "340px",
              margin: "0 auto",
            }}
          >
            {/* Weekday headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "8px",
                textAlign: "center",
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                <div
                  key={dayName}
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    paddingBottom: "2px",
                    userSelect: "none",
                  }}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "8px",
              }}
            >
              {/* Dynamic starting placeholders before Day 1 */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div
                  key={`start-placeholder-${idx}`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-nav)",
                    opacity: 0.1,
                    border: "1.5px dashed var(--border-light)",
                  }}
                />
              ))}

              {/* Real Calendar days with Staggered Cascades */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
                const d = calendar[dayNum];
                const mood = d?.mood as CalendarDay["mood"] | undefined;
                const color = getMoodColor(mood);
                const glowColor = getMoodGlow(mood);
                const isHovered = hoveredDay?.day === dayNum;
                const isSelected = selectedDay === dayNum;

                return (
                  <div
                    key={dayNum}
                    onMouseEnter={() =>
                      setHoveredDay(d ?? { day: dayNum, mood: null, note: "" })
                    }
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay(dayNum)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "10px",
                      backgroundColor: mood ? color : "var(--bg-nav)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: mood ? "#FFFFFF" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      boxShadow: isSelected
                        ? `0 0 0 3px var(--color-primary), 0 4px 12px ${glowColor || "rgba(0,0,0,0.08)"}`
                        : isHovered
                          ? `0 4px 12px ${glowColor || "rgba(0,0,0,0.08)"}, inset 0 0 0 2px rgba(255, 255, 255, 0.25)`
                          : "none",
                      transform: isSelected
                        ? "scale(1.06) translateY(-1px)"
                        : isHovered
                          ? "scale(1.1) translateY(-1px)"
                          : "scale(1)",
                      border: isSelected
                        ? "2px solid #FFFFFF"
                        : isHovered
                          ? "2px solid #FFFFFF"
                          : "1px solid var(--border-light)",
                      zIndex: isSelected || isHovered ? 10 : 1,
                      animationDelay: `${dayNum * 0.015}s`,
                    }}
                    className="heatmap-day-block"
                  >
                    {dayNum}
                  </div>
                );
              })}

              {/* Dynamic ending placeholders to fill standard row padding */}
              {Array.from({
                length:
                  (firstDayIndex + daysInMonth) % 7 === 0
                    ? 0
                    : 7 - ((firstDayIndex + daysInMonth) % 7),
              }).map((_, idx) => (
                <div
                  key={`end-placeholder-${idx}`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-nav)",
                    opacity: 0.1,
                    border: "1.5px dashed var(--border-light)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Color Legend (Simplified) */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "16px",
              justifyContent: "center",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-light)",
            }}
          >
            {moodRatios.map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "3px",
                    backgroundColor: item.color,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    fontWeight: "600",
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  backgroundColor: "var(--bg-nav)",
                  border: "1px solid var(--border-light)",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                }}
              >
                Empty
              </span>
            </div>
          </div>
        </section>

        {/* Daily Mood Dynamics (Self-drawing Bezier Chart Card) */}
        <section className="glass-card" style={{ padding: "20px", position: "relative" }}>
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontFamily: "var(--font-header)",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Daily Mood Dynamics
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "11px", margin: "2px 0 10px 0" }}>
              Cubic bezier wellness index trend. Hover nodes to inspect projection grids.
            </p>
          </div>

          {trendPoints.length > 0 ? (
            <div style={{ position: "relative", width: "100%", height: "160px" }}>
              <svg
                ref={trendSvgRef}
                width="100%"
                height="100%"
                viewBox="0 0 500 160"
                preserveAspectRatio="none"
                onMouseMove={handleTrendMouseMove}
                onMouseLeave={() => setHoveredTrendIdx(null)}
                style={{ overflow: "visible", cursor: "crosshair" }}
              >
                <defs>
                  <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Y-axis grid lines & labels */}
                {[1, 2, 3, 4, 5].map((val) => {
                  const yVal = 160 - 25 - ((val - 1) / 4) * 115;
                  const label =
                    val === 5 ? "Calm" : val === 4 ? "Energetic" : val === 3 ? "Sad" : val === 2 ? "Anxious" : "Stressed";
                  return (
                    <g key={val}>
                      <line
                        x1="45"
                        y1={yVal}
                        x2="480"
                        y2={yVal}
                        stroke="var(--border-light)"
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                      />
                      <text
                        x="35"
                        y={yVal + 3}
                        textAnchor="end"
                        fill="var(--text-secondary)"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="var(--font-header)"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Area under curve (fade-in) */}
                {trendPaths.area && isMounted && (
                  <path d={trendPaths.area} fill="url(#trendAreaGrad)" className="trend-area-path" />
                )}

                {/* Curve line (self-drawing animation) */}
                {trendPaths.line && isMounted && (
                  <path
                    d={trendPaths.line}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="trend-line-path"
                  />
                )}

                {/* Horizontal & Vertical Crosshair Grid Guides */}
                {hoveredTrendIdx !== null && trendPoints[hoveredTrendIdx] && (
                  <>
                    {/* Vertical guideline */}
                    <line
                      x1={trendPoints[hoveredTrendIdx].x}
                      y1={trendPoints[hoveredTrendIdx].y}
                      x2={trendPoints[hoveredTrendIdx].x}
                      y2="135"
                      stroke={getMoodColor(trendPoints[hoveredTrendIdx].mood as any)}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.75"
                      style={{ pointerEvents: "none" }}
                    />
                    {/* Horizontal guideline */}
                    <line
                      x1="45"
                      y1={trendPoints[hoveredTrendIdx].y}
                      x2={trendPoints[hoveredTrendIdx].x}
                      y2={trendPoints[hoveredTrendIdx].y}
                      stroke={getMoodColor(trendPoints[hoveredTrendIdx].mood as any)}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.75"
                      style={{ pointerEvents: "none" }}
                    />
                  </>
                )}

                {/* Data point nodes */}
                {trendPoints.map((pt, idx) => {
                  const isHovered = hoveredTrendIdx === idx;
                  const dotColor = getMoodColor(pt.mood as any);
                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 7.5 : 4.5}
                      fill={isHovered ? "#FFFFFF" : dotColor}
                      stroke={isHovered ? dotColor : "#FFFFFF"}
                      strokeWidth="2"
                      style={{
                        transition: "r 0.15s, fill 0.15s, stroke 0.15s",
                        pointerEvents: "none",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {hoveredTrendIdx !== null && trendPoints[hoveredTrendIdx] && trendTooltipPos && (
                <div
                  style={{
                    position: "absolute",
                    left: `${trendTooltipPos.x}px`,
                    top: `${trendTooltipPos.y}px`,
                    backgroundColor: "var(--bg-surface)",
                    border: "1.5px solid var(--border-light)",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    boxShadow: "var(--shadow-hover)",
                    pointerEvents: "none",
                    zIndex: 100,
                    width: "160px",
                    transform: "translateX(-50%)",
                    transition: "left 0.1s ease, top 0.1s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    Day {trendPoints[hoveredTrendIdx].day} Logging
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: getMoodColor(trendPoints[hoveredTrendIdx].mood as any),
                      }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>
                      {trendPoints[hoveredTrendIdx].mood}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      margin: 0,
                      lineHeight: "1.3",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {trendPoints[hoveredTrendIdx].note || "No notes registered."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                height: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px dashed var(--border-light)",
                borderRadius: "12px",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Log your mood to populate the trend tracker.
            </div>
          )}

          {/* Autonomic Health Telemetry Cards HUD (Concentric Micro Metrics) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginTop: "20px",
              borderTop: "1px solid var(--border-light)",
              paddingTop: "20px",
            }}
          >
            {/* Card 1: Vagal Tone Index Circular progress */}
            <div
              style={{
                backgroundColor: "var(--bg-nav)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "14px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                textAlign: "center",
                transition: "transform 0.2s, border-color 0.2s",
              }}
              className="telemetry-hud-card"
            >
              <div style={{ position: "relative", width: "48px", height: "48px" }}>
                <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-light)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3.5"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - baselinePercentage / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "var(--text-primary)",
                  }}
                >
                  {baselinePercentage}%
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>Vagal Tone</span>
                <span style={{ fontSize: "10px", color: "var(--text-secondary)", lineHeight: "1.2" }}>Mindfulness index</span>
              </div>
            </div>

            {/* Card 2: Dominant Autonomic State with pulsing dot */}
            <div
              style={{
                backgroundColor: "var(--bg-nav)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "14px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                textAlign: "center",
                justifyContent: "center",
                transition: "transform 0.2s, border-color 0.2s",
              }}
              className="telemetry-hud-card"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: getMoodColor(dominantMood as any),
                    boxShadow: `0 0 8px ${getMoodColor(dominantMood as any)}`,
                  }}
                  className="pulsing-state-dot"
                />
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-primary)" }}>
                  {dominantMood}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>Dominant Mood</span>
                <span style={{ fontSize: "10px", color: "var(--text-secondary)", lineHeight: "1.2" }}>Primary resonance</span>
              </div>
            </div>

            {/* Card 3: Logging consistency progress track */}
            <div
              style={{
                backgroundColor: "var(--bg-nav)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "14px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                textAlign: "center",
                justifyContent: "center",
                transition: "transform 0.2s, border-color 0.2s",
              }}
              className="telemetry-hud-card"
            >
              <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>
                {totalLoggedDays} <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "500" }}>/ {daysInMonth}</span>
              </div>
              <div style={{ width: "80%", height: "6px", backgroundColor: "var(--border-light)", borderRadius: "3px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(totalLoggedDays / daysInMonth) * 100}%`,
                    background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
                    borderRadius: "3px",
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>Consistency</span>
                <span style={{ fontSize: "10px", color: "var(--text-secondary)", lineHeight: "1.2" }}>Log ratio</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column - Companion diagnostics + Donut chart */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Companion HUD Card */}
        <section
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
            gap: "16px",
            minHeight: "340px",
            justifyContent: "space-between",
          }}
        >
          {selectedDay ? (
            /* Interactive Day Editor form */
            <form
              onSubmit={handleUpdateDay}
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "var(--color-primary)",
                    margin: 0,
                  }}
                >
                  Edit Day {selectedDay} Telemetry
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px",
                  }}
                >
                  Cancel
                </button>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Select Day Mood
                </label>
                <select
                  value={dayMoodEdit ?? ""}
                  onChange={(e) => setDayMoodEdit(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--border-input)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    outline: "none",
                    fontSize: "13px",
                  }}
                >
                  <option value="Calm">Calm (Sage Success)</option>
                  <option value="Energetic">Energetic (Sage Mist)</option>
                  <option value="Sad">Sad (Heather Blue)</option>
                  <option value="Anxious">Anxious (Soft Lavender)</option>
                  <option value="Stressed">Stressed (Warm Terracotta)</option>
                </select>
              </div>

              {/* Notes input with inline Speech Dictation */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      margin: 0,
                    }}
                  >
                    Daily Diagnostic Notes
                  </label>
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    style={{
                      background: "none",
                      border: "none",
                      color: isListening ? "var(--color-error)" : "var(--color-primary)",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      animation: isListening ? "pulse-mic 1.5s infinite" : "none",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill={isListening ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                    {isListening ? "Listening" : "Dictate"}
                  </button>
                </div>
                <textarea
                  value={dayNoteEdit}
                  onChange={(e) => setDayNoteEdit(e.target.value)}
                  disabled={isListening}
                  rows={3}
                  required
                  style={{
                    fontSize: "13px",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    outline: "none",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    transition: "all 0.3s ease",
                    border: isListening
                      ? "1.5px solid var(--color-error)"
                      : "1.5px solid var(--border-input)",
                    resize: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: "100%",
                  height: "40px",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                Save Day Logs
              </button>
            </form>
          ) : (
            /* Default Diagnostics HUD block */
            <>
              {/* Sparky Mascot (Float Animation) */}
              <div
                style={{
                  position: "relative",
                  width: "140px",
                  height: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  animation: "floating-sparky 4s ease-in-out infinite",
                }}
              >
                <Mascot
                  pose={hoveredDay ? "examining-closely" : "holding-magnifying-glass"}
                  size={110}
                  interactive={false}
                />
              </div>

              {hoveredDay ? (
                <div
                  style={{
                    textAlign: "left",
                    width: "100%",
                    marginTop: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: getMoodColor(hoveredDay.mood),
                        margin: 0,
                      }}
                    >
                      Day {hoveredDay.day} Wellness Summary
                    </h4>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        backgroundColor: "var(--bg-nav)",
                        padding: "3px 6px",
                        borderRadius: "6px",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      {new Date(currentYear, currentMonth - 1).toLocaleString("default", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: "var(--bg-nav)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: getMoodColor(hoveredDay.mood),
                        }}
                      />
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "12px",
                          color: "var(--text-primary)",
                        }}
                      >
                        Mood State: {hoveredDay.mood || "No Entry"}
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.4",
                        margin: 0,
                        fontStyle: hoveredDay.note ? "normal" : "italic",
                      }}
                    >
                      {hoveredDay.note || "No diagnostic notes logged."}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "left",
                    width: "100%",
                    marginTop: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "var(--color-primary)",
                        margin: 0,
                      }}
                    >
                      Sparky&apos;s Trend Insights
                    </h4>
                    <span
                      style={{
                        fontSize: "10px",
                        backgroundColor: "rgba(90, 148, 117, 0.12)",
                        color: "var(--color-success)",
                        padding: "3px 8px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      {resonanceStyles.desc}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "var(--bg-nav)",
                      borderRadius: "10px",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.4",
                        margin: 0,
                      }}
                    >
                      Sparky maps physiological markers. Practice 4-7-8 breathing cycles inside your exercises panel to shift logs towards vagal stabilization curves.
                    </p>
                    <div
                      style={{
                        height: "1px",
                        backgroundColor: "var(--border-light)",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-primary)",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: 0.9 }}
                      >
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                      </svg>{" "}
                      Focus: 4-7-8 Breathing
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleDownloadReport}
                className="btn-primary"
                style={{ width: "100%", height: "40px", fontSize: "13px" }}
              >
                Download Mood Report
              </button>
            </>
          )}
        </section>

        {/* Mood Distribution Breakdown (Donut Chart Card - Centered, scaled up, legend below) */}
        <section className="glass-card" style={{ padding: "20px" }}>
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontFamily: "var(--font-header)",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Mood Distribution Analytics
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "11px", margin: "2px 0 16px 0" }}>
              Percentage share of logged moods. Hover slices.
            </p>
          </div>

          {totalLoggedDays > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                width: "100%",
              }}
            >
              {/* SVG Donut Chart (Scaled up to align end) */}
              <div style={{ position: "relative", width: "240px", height: "240px", flexShrink: 0 }}>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 140 140"
                  style={{ transform: "rotate(-90deg)", overflow: "visible" }}
                >
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredDonutLabel === slice.label;
                    return (
                      <circle
                        key={slice.label}
                        cx="70"
                        cy="70"
                        r="45"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 24 : 18}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        onMouseEnter={() => setHoveredDonutLabel(slice.label)}
                        onMouseLeave={() => setHoveredDonutLabel(null)}
                        style={{
                          transition: "stroke-width 0.2s, opacity 0.2s",
                          cursor: "pointer",
                          opacity: hoveredDonutLabel && !isHovered ? 0.6 : 1,
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Central text in the donut hole */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  {hoveredDonutLabelData ? (
                    <>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: hoveredDonutLabelData.color,
                        }}
                      >
                        {hoveredDonutLabelData.label}
                      </div>
                      <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)" }}>
                        {hoveredDonutLabelData.percent}%
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)" }}>
                        {totalLoggedDays}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Days
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Legend breakdown list (Positioned below pie chart) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  width: "100%",
                }}
              >
                {donutSlices.map((item) => {
                  const isHovered = hoveredDonutLabel === item.label;
                  return (
                    <div
                      key={item.label}
                      onMouseEnter={() => setHoveredDonutLabel(item.label)}
                      onMouseLeave={() => setHoveredDonutLabel(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-light)",
                        backgroundColor: isHovered ? "var(--bg-nav)" : "var(--bg-surface)",
                        transition: "all 0.2s",
                        cursor: "pointer",
                        transform: isHovered ? "translateY(-1px)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: item.color,
                          }}
                        />
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-primary)" }}>
                          {item.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: isHovered ? item.color : "var(--text-secondary)",
                        }}
                      >
                        {item.percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: "140px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px dashed var(--border-light)",
                borderRadius: "12px",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              No distribution data logged.
            </div>
          )}
        </section>      </div>

      <style jsx global>{`
        /* Entrance stagger-fade animation for calendar cells */
        @keyframes stagger-fade {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .heatmap-day-block {
          animation: stagger-fade 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards;
          opacity: 0;
        }

        .heatmap-day-block:hover {
          z-index: 10;
        }

        /* SVG Line drawing animation */
        @keyframes draw-path {
          from {
            stroke-dashoffset: 3000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .trend-line-path {
          stroke-dasharray: 3000;
          stroke-dashoffset: 3000;
          animation: draw-path 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* SVG Area fade-in animation */
        @keyframes fade-area {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .trend-area-path {
          animation: fade-area 1.5s ease-out 0.4s forwards;
          opacity: 0;
        }

        /* Floating mascot keyframes */
        @keyframes floating-sparky {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        /* Indicator dot breathing animation */
        @keyframes pulse-indicator {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.18);
          }
        }
        .pulsing-state-dot {
          animation: pulse-indicator 2.2s ease-in-out infinite;
        }

        .telemetry-hud-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary) !important;
          box-shadow: var(--shadow-subtle);
        }

        .nav-arrow-btn:hover {
          background-color: var(--border-light) !important;
          border-color: var(--text-secondary) !important;
          color: var(--color-primary) !important;
          transform: scale(1.05);
        }
        .nav-arrow-btn:active {
          transform: scale(0.95);
        }
        .nav-today-btn:hover {
          background-color: rgba(91, 127, 166, 0.08) !important;
          transform: scale(1.02);
        }
        .nav-today-btn:active {
          transform: scale(0.97);
        }
        .nav-reset-btn:hover {
          background-color: var(--border-light) !important;
          border-color: var(--text-secondary) !important;
          color: var(--color-error) !important;
          transform: scale(1.02);
        }
        .nav-reset-btn:active {
          transform: scale(0.97);
        }

        @keyframes pulse-mic {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
          }
        }

        @media (max-width: 900px) {
          .analysis-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
