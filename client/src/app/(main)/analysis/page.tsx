"use client";

import React, { useState, useEffect, useMemo } from "react";
import Mascot from "../../components/Mascot";

interface CalendarDay {
  day: number;
  mood?: "Calm" | "Anxious" | "Stressed" | "Sad" | "Energetic";
  note: string;
}

const DEFAULT_CALENDAR: CalendarDay[] = Array.from({ length: 31 }, (_, i) => {
  const dayNum = i + 1;
  let mood: CalendarDay["mood"];
  let note = `Day ${dayNum}: General daily check-in completed. Positive mental balance maintained.`;

  if ([2, 9, 16, 23, 30].includes(dayNum)) {
    mood = "Calm";
    note = `Day ${dayNum}: Practiced visual deep breathing. Heart rate is calm and centered. Slept 8 hours.`;
  } else if ([4, 11, 18, 25].includes(dayNum)) {
    mood = "Anxious";
    note = `Day ${dayNum}: Anxiety spark during peak hours. Practiced 5m box breathing pacing successfully.`;
  } else if ([6, 13, 20, 27].includes(dayNum)) {
    mood = "Stressed";
    note = `Day ${dayNum}: Heavily stressed due to meeting tight deadlines. Shared dialogue logs with Sparky.`;
  } else if ([7, 14, 21, 28].includes(dayNum)) {
    mood = "Sad";
    note = `Day ${dayNum}: Low energy day. Wrote an automated journal, focused on self-compassion.`;
  } else {
    mood = "Energetic";
    note = `Day ${dayNum}: Full of positive momentum! Completed a 30m outdoor mindfulness walk.`;
  }

  return { day: dayNum, mood, note };
});

export default function AnalysisPage() {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Form states for editing selected day
  const [editMood, setEditMood] = useState<CalendarDay["mood"]>("Calm");
  const [editNote, setEditNote] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mood-calendar");
    if (saved) {
      try {
        setDays(JSON.parse(saved));
      } catch (e) {
        setDays(DEFAULT_CALENDAR);
      }
    } else {
      setDays(DEFAULT_CALENDAR);
      localStorage.setItem("mood-calendar", JSON.stringify(DEFAULT_CALENDAR));
    }
  }, []);

  // Update form inputs when selectedDay changes
  useEffect(() => {
    if (selectedDay) {
      setEditMood(selectedDay.mood || "Calm");
      setEditNote(selectedDay.note);
    }
  }, [selectedDay]);

  const saveDays = (newDays: CalendarDay[]) => {
    setDays(newDays);
    localStorage.setItem("mood-calendar", JSON.stringify(newDays));
  };

  const handleUpdateDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;

    const updated = days.map((d) => {
      if (d.day === selectedDay.day) {
        return { ...d, mood: editMood, note: editNote };
      }
      return d;
    });

    saveDays(updated);
    setSelectedDay(null);
  };

  const handleResetCalendar = () => {
    if (window.confirm("Are you sure you want to reset your mood calendar to mock data?")) {
      saveDays(DEFAULT_CALENDAR);
      setSelectedDay(null);
    }
  };

  // Recalculate mood ratios in real-time!
  const moodRatios = useMemo(() => {
    if (days.length === 0) return [];
    
    const totals = { Calm: 0, Energetic: 0, Sad: 0, Anxious: 0, Stressed: 0 };
    days.forEach(d => {
      if (d.mood) totals[d.mood] += 1;
    });

    const list = [
      { label: "Calm", color: "var(--color-success)", desc: "Peaceful baseline" },
      { label: "Energetic", color: "var(--color-secondary)", desc: "High motivation" },
      { label: "Sad", color: "var(--color-primary)", desc: "Reflective space" },
      { label: "Anxious", color: "var(--color-accent)", desc: "Hyperactive alert" },
      { label: "Stressed", color: "var(--color-error)", desc: "Tight deadlines" },
    ];

    return list.map(item => {
      const count = totals[item.label as CalendarDay["mood"] & string] || 0;
      const percent = Math.round((count / days.length) * 100);
      return { ...item, percent };
    });
  }, [days]);

  // Recalculate stable baseline index in real-time! (Calm + Energetic share stable ratios)
  const baselinePercentage = useMemo(() => {
    if (days.length === 0) return 0;
    const stable = days.filter(d => d.mood === "Calm" || d.mood === "Energetic").length;
    return Math.round((stable / days.length) * 100);
  }, [days]);

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

  const handleDownloadReport = () => {
    if (days.length === 0) return;
    const fileContent = `SERENEMIND WELLNESS DIAGNOSTICS REPORT\nGenerated: ${new Date().toLocaleDateString()}\nBaseline Mindfulness Index: ${baselinePercentage}%\n\nTelemetry Logs:\n` 
      + days.map(d => `Day ${d.day}: Mood [${d.mood || "None"}] - Notes: ${d.note}`).join("\n");

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `SereneMind_Mood_Telemetry_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: "32px",
      }}
      className="analysis-layout"
    >
      {/* Left Column - Heatmap calendar + bar charts */}
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Heatmap Section */}
        <section className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "22px", fontFamily: "var(--font-header)", fontWeight: 500 }}>
                Monthly Mood Heatmap
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Hover to preview telemetry, and click on any block to modify diagnostic logs.
              </p>
            </div>
            <button
              onClick={handleResetCalendar}
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                background: "var(--bg-nav)",
                border: "1px solid var(--border-light)",
                padding: "6px 12px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Reset Data
            </button>
          </div>

          {/* 7-column Calendar Heatmap */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "12px",
              padding: "8px 0",
            }}
          >
            {/* Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  paddingBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {w}
              </div>
            ))}

            {/* Empty days placeholder for calendar alignment (May 2026 starts on Friday) */}
            <div />
            <div />
            <div />
            <div />
            <div />

            {/* Calendar Days */}
            {days.map((d) => {
              const color = getMoodColor(d.mood);
              const glowColor = getMoodGlow(d.mood);
              const isHovered = hoveredDay?.day === d.day;
              const isSelected = selectedDay?.day === d.day;
              
              return (
                <div
                  key={d.day}
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => setSelectedDay(d)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "14px",
                    backgroundColor: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    boxShadow: isSelected
                      ? `0 0 0 3px var(--color-primary), 0 8px 24px ${glowColor}`
                      : isHovered 
                      ? `0 8px 24px ${glowColor}, inset 0 0 0 2px rgba(255, 255, 255, 0.3)` 
                      : "none",
                    transform: isSelected 
                      ? "scale(1.1) translateY(-3px)" 
                      : isHovered ? "scale(1.15) translateY(-3px)" : "scale(1)",
                    border: isSelected 
                      ? "2px solid #FFFFFF" 
                      : isHovered ? "2px solid #FFFFFF" : "2px solid transparent",
                    zIndex: isSelected || isHovered ? 10 : 1,
                  }}
                  className="heatmap-day-block"
                >
                  {d.day}
                </div>
              );
            })}
          </div>

          {/* Color Legend keys */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "28px",
              justifyContent: "center",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-light)",
            }}
          >
            {moodRatios.map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "5px",
                    backgroundColor: item.color,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                />
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CSS-based Stacked Trend Chart Section */}
        <section className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)", marginBottom: "16px", fontWeight: 500 }}>
            Monthly Mood Distribution
          </h3>

          {/* Stacked Row Bar */}
          <div
            style={{
              display: "flex",
              height: "28px",
              borderRadius: "14px",
              overflow: "hidden",
              width: "100%",
              backgroundColor: "var(--border-light)",
              marginBottom: "28px",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            {moodRatios.map((item) => (
              <div
                key={item.label}
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: item.color,
                  height: "100%",
                  transition: "width 0.5s ease",
                }}
                title={`${item.label}: ${item.percent}%`}
              />
            ))}
          </div>

          {/* Detailed distribution list */}
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(5, 1fr)", 
              gap: "12px" 
            }} 
            className="distribution-cols"
          >
            {moodRatios.map((item) => (
              <div
                key={item.label}
                style={{
                  textAlign: "center",
                  border: "1.5px solid var(--border-light)",
                  padding: "16px 12px",
                  borderRadius: "16px",
                  backgroundColor: "var(--bg-surface)",
                  boxShadow: "var(--shadow-subtle)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                className="dist-card"
              >
                <div style={{ fontSize: "22px", fontWeight: "700", color: item.color }}>{item.percent}%</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginTop: "4px" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column - Mascot correlations analyzer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h3 style={{ fontSize: "22px", fontFamily: "var(--font-header)", fontWeight: 500 }}>
            Coping Diagnostics
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Empathetic mapping matching records to autonomic responses.
          </p>
        </div>

        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 24px",
            textAlign: "center",
            gap: "24px",
            background: "linear-gradient(145deg, var(--bg-surface) 0%, rgba(169, 146, 196, 0.02) 100%)",
            border: "1px solid var(--border-light)",
            minHeight: "500px",
            justifyContent: "space-between",
          }}
        >
          {selectedDay ? (
            /* Interactive Day Editor form */
            <form onSubmit={handleUpdateDay} style={{ width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--color-primary)" }}>
                  Edit Day {selectedDay.day} Telemetry
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                >
                  Cancel
                </button>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Select Day Mood</label>
                <select
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--border-input)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                >
                  <option value="Calm">Calm (Sage Success)</option>
                  <option value="Energetic">Energetic (Sage Mist)</option>
                  <option value="Sad">Sad (Heather Blue)</option>
                  <option value="Anxious">Anxious (Soft Lavender)</option>
                  <option value="Stressed">Stressed (Warm Terracotta)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Daily Diagnostic Notes</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={4}
                  required
                  style={{ fontSize: "14px" }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", height: "46px", fontSize: "14px", marginTop: "10px" }}
              >
                Save Day Logs
              </button>
            </form>
          ) : (
            /* Default Diagnostics HUD block */
            <>
              <Mascot
                pose={hoveredDay ? "examining-closely" : "holding-magnifying-glass"}
                size={180}
                dialogue={
                  hoveredDay
                    ? `Day ${hoveredDay.day} telemetry processed!`
                    : "Hover over heatmap blocks, or click one to edit logs!"
                }
                interactive={false}
              />

              {hoveredDay ? (
                <div style={{ textAlign: "left", width: "100%", marginTop: "10px" }}>
                  <div 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <h4 style={{ fontSize: "15px", fontWeight: "600", color: getMoodColor(hoveredDay.mood) }}>
                      Day {hoveredDay.day} Wellness Summary
                    </h4>
                    <span 
                      style={{ 
                        fontSize: "11px", 
                        fontWeight: "700", 
                        textTransform: "uppercase",
                        backgroundColor: "var(--bg-nav)", 
                        padding: "4px 8px", 
                        borderRadius: "8px",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-light)"
                      }}
                    >
                      May 2026
                    </span>
                  </div>
                  
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      backgroundColor: "var(--bg-nav)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span 
                        style={{ 
                          width: "8px", 
                          height: "8px", 
                          borderRadius: "50%", 
                          backgroundColor: getMoodColor(hoveredDay.mood) 
                        }} 
                      />
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-primary)" }}>
                        Mood State: {hoveredDay.mood}
                      </div>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                      {hoveredDay.note}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "left", width: "100%", marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-primary)" }}>
                      Sparky&apos;s Trend Insights
                    </h4>
                    <span 
                      style={{
                        fontSize: "11px",
                        backgroundColor: "rgba(90, 148, 117, 0.12)",
                        color: "var(--color-success)",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontWeight: "bold"
                      }}
                    >
                      Baseline: {baselinePercentage}% Stable
                    </span>
                  </div>
                  
                  <div 
                    style={{ 
                      padding: "18px", 
                      backgroundColor: "var(--bg-nav)", 
                      borderRadius: "16px", 
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                      Sparky notices your coping indexes. Practicing deep pacing breathing exercises and reflecting inside journal nodes directly improves your nervous stability percentage baseline.
                    </p>
                    <div style={{ height: "1px", backgroundColor: "var(--border-light)" }} />
                    <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>💡</span> Suggested practice: 4-7-8 Breathing
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleDownloadReport}
                className="btn-primary"
                style={{ width: "100%", height: "46px", fontSize: "14px" }}
              >
                Download Mood Report
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .heatmap-day-block:hover {
          z-index: 10;
        }

        .dist-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover) !important;
          border-color: var(--color-primary) !important;
        }

        @media (max-width: 900px) {
          .analysis-layout {
            grid-template-columns: 1fr !important;
          }
          .distribution-cols {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
