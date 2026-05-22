"use client";

import React, { useState } from "react";
import Mascot from "../../components/Mascot";

interface LogItem {
  id: string;
  type: "chat" | "journal" | "exercise";
  title: string;
  preview: string;
  date: string;
  sentiment?: string;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: "1",
      type: "chat",
      title: "Chat with Sparky",
      preview: "We discussed dealing with heavy academic deadlines and Sparky suggested pacing intervals.",
      date: "Yesterday at 4:32 PM",
      sentiment: "Neutral",
    },
    {
      id: "2",
      type: "journal",
      title: "Autosaved Evening Reflection",
      preview: "I completed a very difficult milestone today! Felt so incredibly happy and accomplished.",
      date: "May 20, 2026",
      sentiment: "Positive",
    },
    {
      id: "3",
      type: "exercise",
      title: "Dynamic Box Breathing",
      preview: "Completed a 5-minute breathing visualizer pacer to calm anxious heart beats.",
      date: "May 18, 2026",
      sentiment: "Anxious",
    },
    {
      id: "4",
      type: "journal",
      title: "Tense Work Meeting",
      preview: "Feeling highly overwhelmed by the massive amount of overlapping tasks. Need a long break.",
      date: "May 17, 2026",
      sentiment: "Stressed",
    },
  ]);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateMonthlySummary = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setAiSummary(
        "Based on your 4 logs this month, you are demonstrating great emotional resilience! You faced stress on May 17th but actively balanced it with breathing pacers on the 18th and completed a successful milestone on the 20th. Sparky notices your coping skills are improving immensely. Keep using daily pacing!"
      );
    }, 1500);
  };

  const getIcon = (type: LogItem["type"]) => {
    switch (type) {
      case "chat":
        return (
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(91, 127, 166, 0.12)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
        );
      case "journal":
        return (
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(125, 170, 143, 0.12)", color: "var(--color-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
        );
      case "exercise":
        return (
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(169, 146, 196, 0.12)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        );
    }
  };

  const getSentimentTag = (sentiment?: string) => {
    if (!sentiment) return null;
    let bg = "rgba(91, 127, 166, 0.08)";
    let color = "var(--color-primary)";
    if (sentiment === "Positive") {
      bg = "rgba(90, 148, 117, 0.12)";
      color = "var(--color-success)";
    } else if (sentiment === "Stressed") {
      bg = "rgba(192, 118, 90, 0.12)";
      color = "var(--color-error)";
    } else if (sentiment === "Anxious") {
      bg = "rgba(169, 146, 196, 0.12)";
      color = "var(--color-accent)";
    }

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: bg,
          color: color,
        }}
      >
        {sentiment}
      </span>
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: "32px",
      }}
      className="history-layout"
    >
      {/* Left Column - Logs Timeline list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)" }}>Wellness Logs Timeline</h3>
          <button
            onClick={() => setLogs([])}
            style={{
              fontSize: "13px",
              color: "var(--color-error)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Clear History
          </button>
        </div>

        {logs.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: "48px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Mascot pose="lost-map" size={160} dialogue="Hmm, our history logs look completely blank." interactive={false} />
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>No History Found</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Start a session or record today&apos;s feelings inside the journal space.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            {logs.map((log) => (
              <div
                key={log.id}
                className="glass-card history-item-card"
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "20px",
                  transition: "all 0.2s ease",
                }}
              >
                {getIcon(log.type)}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "600" }}>{log.title}</h4>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{log.date}</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {log.preview}
                  </p>
                  <div style={{ marginTop: "4px", display: "flex", gap: "8px" }}>
                    {getSentimentTag(log.sentiment)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column - AI Monthly Summary builder panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)" }}>AI Monthly Summary</h3>

        <div
          className="glass-card"
          style={{
            padding: "32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            border: "1.5px solid rgba(90, 148, 117, 0.2)",
            background: "linear-gradient(135deg, var(--bg-surface) 0%, rgba(90, 148, 117, 0.04) 100%)",
          }}
        >
          <Mascot
            pose={aiSummary ? "celebrating-success" : "carrying-basket"}
            size={160}
            dialogue={aiSummary ? "You are doing fantastic!" : "Ready to unpack your monthly insights?"}
            interactive={false}
          />

          {!aiSummary ? (
            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Build AI Mood Summary</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
                Generate an empathetic summary analyzing emotional patterns and wellness progress across all completed check-ins.
              </p>
              <button
                onClick={generateMonthlySummary}
                className="btn-primary"
                style={{ backgroundColor: "var(--color-success)", color: "#FFFFFF", width: "100%", height: "46px" }}
                disabled={generating || logs.length === 0}
              >
                {generating ? "Synthesizing Insights..." : "Generate AI Summary"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--color-success)",
                  fontWeight: "600",
                  fontSize: "14px",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                }}
              >
                <span>✨</span> AI Insight Ready
              </div>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-primary)", backgroundColor: "var(--bg-nav)", padding: "16px", borderRadius: "14px", border: "1px solid var(--border-light)" }}>
                {aiSummary}
              </p>
              <button
                onClick={() => setAiSummary(null)}
                className="btn-secondary"
                style={{ width: "100%", marginTop: "16px", height: "42px" }}
              >
                Clear Insight
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .history-item-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary) !important;
          box-shadow: var(--shadow-hover) !important;
        }
        @media (max-width: 900px) {
          .history-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
