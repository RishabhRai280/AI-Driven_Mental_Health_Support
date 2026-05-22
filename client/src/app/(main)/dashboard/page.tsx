"use client";

import React, { useState } from "react";
import Link from "next/link";
import Mascot, { HamsterPose } from "../../components/Mascot";

type Mood = "Calm" | "Anxious" | "Stressed" | "Sad" | "Energetic";

export default function DashboardPage() {
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

  const handleMoodSelect = (moodItem: typeof moods[0]) => {
    setSelectedMood(moodItem.label);
    setMascotPose(moodItem.pose);
  };

  const toggleBreathing = () => {
    if (isBreathingActive) {
      setIsBreathingActive(false);
      setBreathingText("Click Start to practice");
      setMascotPose("waving-hello");
    } else {
      setIsBreathingActive(true);
      setMascotPose("sitting-zen");
      setBreathingText("Breathe in... Hold... Breathe out...");
      // Simulate pacer intervals
      let count = 0;
      const interval = setInterval(() => {
        if (!isBreathingActive) {
          count++;
          if (count % 3 === 0) setBreathingText("Breathe in... (Expand)");
          else if (count % 3 === 1) setBreathingText("Hold... (Sustain)");
          else setBreathingText("Breathe out... (Relax)");
        }
      }, 4000);
      (window as any).breathingInterval = interval;
    }
  };

  React.useEffect(() => {
    return () => {
      if ((window as any).breathingInterval) {
        clearInterval((window as any).breathingInterval);
      }
    };
  }, []);

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
          <h2 style={{ fontSize: "30px", fontFamily: "var(--font-header)" }}>
            Welcome back, Rishabh
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px" }}>
            Hope you are having a peaceful day. Sparky is here to support you. Select your current mood below to check in!
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
