"use client";

import React, { useState } from "react";
import Mascot from "../../components/Mascot";

interface CalendarDay {
  day: number;
  mood?: "Calm" | "Anxious" | "Stressed" | "Sad" | "Energetic";
  note: string;
}

export default function AnalysisPage() {
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);

  // 31 days mock calendar data for May
  const calendarData: CalendarDay[] = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    let mood: CalendarDay["mood"];
    let note = `Day ${dayNum}: General checks completed successfully.`;

    if ([2, 9, 16, 23, 30].includes(dayNum)) {
      mood = "Calm";
      note = `Day ${dayNum}: Practice breathing. Heart rate calm and centered.`;
    } else if ([4, 11, 18, 25].includes(dayNum)) {
      mood = "Anxious";
      note = `Day ${dayNum}: Anxiety spark. Practiced 5m box breathing successfully.`;
    } else if ([6, 13, 20, 27].includes(dayNum)) {
      mood = "Stressed";
      note = `Day ${dayNum}: Heavily stressed due to meeting deadlines. Shared dialogue with Sparky.`;
    } else if ([7, 14, 21, 28].includes(dayNum)) {
      mood = "Sad";
      note = `Day ${dayNum}: Low energy day. Wrote automated sentiment journal.`;
    } else {
      mood = "Energetic";
      note = `Day ${dayNum}: Full of positive momentum! Completed mindfulness walk.`;
    }

    return { day: dayNum, mood, note };
  });

  const getMoodColor = (mood?: CalendarDay["mood"]) => {
    switch (mood) {
      case "Calm":
        return "var(--color-success)"; // Sage Success
      case "Anxious":
        return "var(--color-accent)"; // Soft Lavender
      case "Stressed":
        return "var(--color-error)"; // Warm Terracotta
      case "Sad":
        return "var(--color-primary)"; // Heather Blue
      case "Energetic":
        return "var(--color-secondary)"; // Sage Mist
      default:
        return "var(--border-light)";
    }
  };

  // Stacked chart ratios
  const moodRatios = [
    { label: "Calm", percent: 25, color: "var(--color-success)" },
    { label: "Energetic", percent: 35, color: "var(--color-secondary)" },
    { label: "Sad", percent: 15, color: "var(--color-primary)" },
    { label: "Anxious", percent: 13, color: "var(--color-accent)" },
    { label: "Stressed", percent: 12, color: "var(--color-error)" },
  ];

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
        <section className="glass-card">
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)", marginBottom: "8px" }}>
            Monthly Mood Heatmap
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            Hover over any calendar block to read historical session notes and logs compiled for that date.
          </p>

          {/* 7-column Calendar Heatmap */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "10px",
            }}
          >
            {/* Headers */}
            {["S", "M", "T", "W", "T", "F", "S"].map((w, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  paddingBottom: "8px",
                }}
              >
                {w}
              </div>
            ))}

            {/* Empty days placeholder for calendar alignment */}
            <div />
            <div />
            <div />
            <div />
            <div />

            {/* Calendar Days */}
            {calendarData.map((d) => (
              <div
                key={d.day}
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
                style={{
                  aspectRatio: "1",
                  borderRadius: "10px",
                  backgroundColor: getMoodColor(d.mood),
                  opacity: 0.85,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: "2px solid transparent",
                }}
                className="heatmap-day-block"
              >
                {d.day}
              </div>
            ))}
          </div>

          {/* Color Legend keys */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "24px",
              justifyContent: "center",
            }}
          >
            {moodRatios.map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "4px",
                    backgroundColor: item.color,
                  }}
                />
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CSS-based Stacked Trend Chart Section */}
        <section className="glass-card">
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)", marginBottom: "16px" }}>
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
              marginBottom: "24px",
            }}
          >
            {moodRatios.map((item) => (
              <div
                key={item.label}
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: item.color,
                  height: "100%",
                }}
                title={`${item.label}: ${item.percent}%`}
              />
            ))}
          </div>

          {/* Detailed distribution list */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }} className="distribution-cols">
            {moodRatios.map((item) => (
              <div
                key={item.label}
                style={{
                  textAlign: "center",
                  border: "1px solid var(--border-light)",
                  padding: "12px",
                  borderRadius: "14px",
                  backgroundColor: "var(--bg-surface)",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: "600", color: item.color }}>{item.percent}%</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column - Mascot correlations analyzer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)" }}>Coping Analysis</h3>

        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px",
            textAlign: "center",
            gap: "20px",
            minHeight: "400px",
          }}
        >
          <Mascot
            pose="holding-magnifying-glass"
            size={180}
            dialogue={
              hoveredDay
                ? `Analyzing Day ${hoveredDay.day}! Note recorded successfully.`
                : "Hover over the heatmap blocks to inspect specific day parameters!"
            }
            interactive={false}
          />

          {hoveredDay ? (
            <div style={{ textAlign: "left", width: "100%", marginTop: "10px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: getMoodColor(hoveredDay.mood), marginBottom: "8px" }}>
                Day {hoveredDay.day} Insights:
              </h4>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  backgroundColor: "var(--bg-nav)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)", marginBottom: "4px" }}>
                  Mood state: {hoveredDay.mood || "None"}
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {hoveredDay.note}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "left", width: "100%", marginTop: "10px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "8px" }}>
                Sparky&apos;s Trend Report:
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Sparky notices you recorded the most stability during mid-week check-ins. Pacing exercises and mindful journals correspond directly with reductions in anxious flare-ups!
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .heatmap-day-block:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 10;
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
