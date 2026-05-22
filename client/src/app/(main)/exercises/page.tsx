"use client";

import React, { useState } from "react";
import Mascot from "../../components/Mascot";

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: "calming" | "focus" | "release";
  pose: "sitting-zen" | "escaping-energy" | "running-excited";
}

export default function ExercisePage() {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(240);
  const [breathingPhase, setBreathingPhase] = useState<"In" | "Hold" | "Out">("In");

  const exercises: Exercise[] = [
    {
      id: "1",
      title: "4-7-8 Deep Breathing Pacer",
      description: "An ancient pranayama technique designed to lower stress levels, settle anxiety flare-ups, and induce deep restful sleep.",
      duration: "4 min",
      category: "calming",
      pose: "sitting-zen",
    },
    {
      id: "2",
      title: "Muscle Release Pacing",
      description: "Tense and release specific muscle groups systematically to vent stress and high anxious pacing energy quickly.",
      duration: "5 min",
      category: "release",
      pose: "escaping-energy",
    },
    {
      id: "3",
      title: "Focus Momentum Run",
      description: "A quick cardio pacer accompanied by cognitive affirmations to spark motivation, focus, and drive.",
      duration: "8 min",
      category: "focus",
      pose: "running-excited",
    },
  ];

  // Simulated Breathing Player Intervals
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    let phaseTimer: NodeJS.Timeout;

    if (isPlaying && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);

      phaseTimer = setInterval(() => {
        setBreathingPhase((prev) => {
          if (prev === "In") return "Hold";
          if (prev === "Hold") return "Out";
          return "In";
        });
      }, 4000);
    }

    return () => {
      clearInterval(timer);
      clearInterval(phaseTimer);
    };
  }, [isPlaying, secondsLeft]);

  const handleStartExercise = (ex: Exercise) => {
    setActiveExercise(ex);
    setIsPlaying(true);
    setSecondsLeft(ex.id === "1" ? 240 : 300);
    setBreathingPhase("In");
  };

  const handleCloseModal = () => {
    setActiveExercise(null);
    setIsPlaying(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Intro header */}
      <section className="glass-card">
        <h2 style={{ fontSize: "24px", fontFamily: "var(--font-header)", marginBottom: "8px" }}>
          Empathetic Wellness Practices
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Explore curated, clinically-inspired physical coping paces to calm stress response mechanisms. Select a pacing practice to start Sparky&apos;s breathing visualizer.
        </p>
      </section>

      {/* Exercises List catalog */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="exercises-grid">
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className="glass-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              justifyContent: "space-between",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    backgroundColor:
                      ex.category === "calming"
                        ? "rgba(90, 148, 117, 0.12)"
                        : ex.category === "release"
                        ? "rgba(192, 118, 90, 0.12)"
                        : "rgba(169, 146, 196, 0.12)",
                    color:
                      ex.category === "calming"
                        ? "var(--color-success)"
                        : ex.category === "release"
                        ? "var(--color-error)"
                        : "var(--color-accent)",
                  }}
                >
                  {ex.category}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>{ex.duration}</span>
              </div>

              <h3 style={{ fontSize: "18px", fontFamily: "var(--font-header)" }}>{ex.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                {ex.description}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
              <Mascot pose={ex.pose} size={110} interactive={false} />
            </div>

            <button
              onClick={() => handleStartExercise(ex)}
              className="btn-primary"
              style={{ width: "100%", height: "46px" }}
            >
              Start Exercise
            </button>
          </div>
        ))}
      </div>

      {/* Full-screen Breathing Player Modal overlay */}
      {activeExercise && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(30, 34, 40, 0.95)", // Calm dark midnight overlay
            backdropFilter: "blur(12px)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            color: "#FFFFFF",
          }}
        >
          {/* Close button with large touch target */}
          <button
            onClick={handleCloseModal}
            style={{
              position: "absolute",
              top: "32px",
              right: "32px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s ease",
            }}
            className="modal-close-btn"
            title="Exit Practice"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Exercise Content Header */}
          <div style={{ textAlign: "center", maxWidth: "600px", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "28px", fontFamily: "var(--font-header)", color: "#FFFFFF", marginBottom: "12px" }}>
              {activeExercise.title}
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "15px" }}>
              Relax your shoulders, sink into your seat, and let Sparky pace your physical coping breathing triggers.
            </p>
          </div>

          {/* Central Pulsing Circles */}
          <div
            style={{
              position: "relative",
              width: "240px",
              height: "240px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "40px",
            }}
          >
            {/* Outer breathing circle with animations */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "rgba(125, 170, 143, 0.2)",
                transform: isPlaying ? (breathingPhase === "In" ? "scale(1.2)" : breathingPhase === "Hold" ? "scale(1.2)" : "scale(0.8)") : "scale(1)",
                transition: "transform 4s ease-in-out",
              }}
            />
            {/* Inner breathing circle */}
            <div
              style={{
                position: "absolute",
                width: "70%",
                height: "70%",
                borderRadius: "50%",
                backgroundColor: "rgba(169, 146, 196, 0.25)",
                transform: isPlaying ? (breathingPhase === "In" ? "scale(1.15)" : breathingPhase === "Hold" ? "scale(1.15)" : "scale(0.85)") : "scale(1)",
                transition: "transform 4s ease-in-out",
              }}
            />
            {/* Center mascot hamster pose */}
            <div
              style={{
                position: "absolute",
                width: "45%",
                height: "45%",
                backgroundColor: "#FFFFFF",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Mascot pose={activeExercise.pose} size={85} interactive={false} />
            </div>
          </div>

          {/* Breathing phase display */}
          {isPlaying && (
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  fontFamily: "var(--font-header)",
                  color: breathingPhase === "In" ? "var(--color-secondary)" : breathingPhase === "Out" ? "var(--color-primary)" : "var(--color-accent)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                }}
              >
                {breathingPhase === "In" ? "Breathe In" : breathingPhase === "Hold" ? "Hold..." : "Breathe Out"}
              </div>
              <div style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.6)" }}>
                Time remaining: {formatTime(secondsLeft)}
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary"
              style={{
                backgroundColor: isPlaying ? "rgba(255, 255, 255, 0.15)" : "var(--color-success)",
                color: "#FFFFFF",
                padding: "14px 36px",
                fontSize: "16px",
                fontWeight: "600",
                minWidth: "160px",
                height: "52px",
              }}
            >
              {isPlaying ? "Pause" : "Resume"}
            </button>
            <button
              onClick={handleCloseModal}
              className="btn-secondary"
              style={{
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "#FFFFFF",
                padding: "13px 35px",
                fontSize: "16px",
                fontWeight: "600",
                minWidth: "160px",
                height: "52px",
              }}
            >
              Finish Session
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .modal-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
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
