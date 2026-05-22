"use client";

import React, { useState, useEffect } from "react";
import Mascot, { HamsterPose } from "../../components/Mascot";

export default function JournalingPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [sentiment, setSentiment] = useState<"Neutral" | "Positive" | "Anxious" | "Stressed">("Neutral");
  const [mascotPose, setMascotPose] = useState<HamsterPose>("thinking-deeply");
  const [saveStatus, setSaveStatus] = useState("Draft");

  // Analyze sentiment in real-time based on textarea changes
  useEffect(() => {
    if (!content.trim()) {
      setSentiment("Neutral");
      setMascotPose("thinking-deeply");
      setSaveStatus("Draft");
      return;
    }

    setSaveStatus("Saving...");
    setMascotPose("head-scratching");

    // Real-time autosave mock
    const timer = setTimeout(() => {
      const lower = content.toLowerCase();
      let detectedSentiment: "Neutral" | "Positive" | "Anxious" | "Stressed" = "Neutral";

      if (lower.includes("happy") || lower.includes("glad") || lower.includes("joy") || lower.includes("peace") || lower.includes("gratitude")) {
        detectedSentiment = "Positive";
        setMascotPose("celebrating-success");
      } else if (lower.includes("anxious") || lower.includes("scared") || lower.includes("panic") || lower.includes("worry")) {
        detectedSentiment = "Anxious";
        setMascotPose("escaping-energy");
      } else if (lower.includes("stress") || lower.includes("angry") || lower.includes("tired") || lower.includes("heavy")) {
        detectedSentiment = "Stressed";
        setMascotPose("balancing-nut");
      } else {
        setMascotPose("sleeping-content"); // Peaceful saved pose
      }

      setSentiment(detectedSentiment);
      setSaveStatus("Saved successfully");
    }, 1200);

    return () => clearTimeout(timer);
  }, [content]);

  const handleSave = () => {
    setSaveStatus("Saving reflection...");
    setTimeout(() => {
      setSaveStatus("Saved to historical logs");
      setMascotPose("sleeping-content");
    }, 800);
  };

  const getSentimentStyle = () => {
    switch (sentiment) {
      case "Positive":
        return {
          backgroundColor: "rgba(90, 148, 117, 0.12)",
          color: "var(--color-success)",
          border: "1px solid rgba(90, 148, 117, 0.2)",
        };
      case "Anxious":
        return {
          backgroundColor: "rgba(169, 146, 196, 0.12)",
          color: "var(--color-accent)",
          border: "1px solid rgba(169, 146, 196, 0.2)",
        };
      case "Stressed":
        return {
          backgroundColor: "rgba(192, 118, 90, 0.12)",
          color: "var(--color-error)",
          border: "1px solid rgba(192, 118, 90, 0.2)",
        };
      default:
        return {
          backgroundColor: "rgba(91, 127, 166, 0.08)",
          color: "var(--color-primary)",
          border: "1px solid rgba(91, 127, 166, 0.2)",
        };
    }
  };

  const journalingPrompts = {
    Neutral: "What is one small detail from today that made you pause and smile?",
    Positive: "This is beautiful! What contributed most to these positive feelings today?",
    Anxious: "Can you list 3 concrete physical objects around you right now? Focus on anchoring.",
    Stressed: "If you could remove just one task from your plate today, what would it be?",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "32px",
        height: "calc(100vh - 144px)",
      }}
      className="journaling-layout"
    >
      {/* Left Column - Blank Writing Workspace */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "32px",
          height: "100%",
        }}
      >
        {/* Header Title Input */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <input
            type="text"
            placeholder="Today's Reflection Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: "22px",
              fontWeight: "600",
              fontFamily: "var(--font-header)",
              border: "none",
              borderBottom: "1.5px solid transparent",
              padding: "4px 0",
              backgroundColor: "transparent",
              borderRadius: 0,
              width: "70%",
            }}
            className="journal-title-input"
          />

          {/* Cloud Auto-save state indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: "500",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: saveStatus.includes("successfully") || saveStatus.includes("logs")
                  ? "var(--color-success)"
                  : saveStatus.includes("Saving")
                  ? "var(--color-accent)"
                  : "var(--text-secondary)",
              }}
            />
            {saveStatus}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "var(--border-light)" }} />

        {/* Large Editor Canvas */}
        <textarea
          placeholder="Start typing your heart out... (Autosave handles the rest)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            resize: "none",
            backgroundColor: "transparent",
            fontSize: "16px",
            lineHeight: "1.7",
            padding: 0,
            boxShadow: "none",
          }}
          className="journal-textarea"
        />

        {/* Action Bottom Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSave} className="btn-primary" style={{ padding: "12px 28px" }}>
            Save Reflection
          </button>
        </div>
      </div>

      {/* Right Column - Sentiment Analysis Panel */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "24px",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "18px", fontFamily: "var(--font-header)" }}>Reflection Insights</h3>

        {/* Mascot */}
        <Mascot pose={mascotPose} size={170} dialogue="Write freely, I'm here reflecting with you." interactive={false} />

        {/* Dynamic Sentiment Tags */}
        <div style={{ width: "100%" }}>
          <h4 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Detected Sentiment
          </h4>
          <div
            style={{
              padding: "10px",
              borderRadius: "16px",
              fontSize: "15px",
              fontWeight: "600",
              textAlign: "center",
              ...getSentimentStyle(),
            }}
          >
            {sentiment}
          </div>
        </div>

        {/* Interactive prompts */}
        <div
          style={{
            marginTop: "12px",
            backgroundColor: "var(--bg-nav)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "16px",
            textAlign: "left",
          }}
        >
          <h4 style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "6px" }}>
            Coping Spark Prompt
          </h4>
          <p style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
            {journalingPrompts[sentiment]}
          </p>
        </div>
      </div>

      <style jsx global>{`
        .journal-title-input:focus {
          border-bottom-color: var(--color-primary) !important;
          box-shadow: none !important;
        }
        .journal-textarea:focus {
          box-shadow: none !important;
        }
        @media (max-width: 960px) {
          .journaling-layout {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
