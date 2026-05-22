"use client";

import React, { useState, useEffect } from "react";
import Mascot from "../../components/Mascot";

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: "calming" | "focus" | "release";
  pose: "sitting-zen" | "escaping-energy" | "running-excited";
  cycles: number; // in seconds per phase
}

export default function ExercisePage() {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(240);
  const [breathingPhase, setBreathingPhase] = useState<"In" | "Hold" | "Out">("In");
  const [phaseCounter, setPhaseCounter] = useState(4); // 4 seconds count down per phase
  const [congratsMsg, setCongratsMsg] = useState<string | null>(null);

  const exercises: Exercise[] = [
    {
      id: "1",
      title: "4-7-8 Deep Breathing Pacer",
      description: "An ancient pranayama technique designed to lower stress levels, settle anxiety flare-ups, and induce deep, restful sleep.",
      duration: "4 min",
      category: "calming",
      pose: "sitting-zen",
      cycles: 4,
    },
    {
      id: "2",
      title: "Muscle Release Pacing",
      description: "Tense and release specific muscle groups systematically to vent stress and high anxious pacing energy quickly.",
      duration: "5 min",
      category: "release",
      pose: "escaping-energy",
      cycles: 5,
    },
    {
      id: "3",
      title: "Focus Momentum Run",
      description: "A quick cardio pacer accompanied by cognitive affirmations to spark motivation, focus, and drive.",
      duration: "8 min",
      category: "focus",
      pose: "running-excited",
      cycles: 6,
    },
  ];

  // Breathing intervals pacer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let tickTimer: NodeJS.Timeout;

    if (isPlaying && secondsLeft > 0) {
      // Main session countdown
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Auto complete session!
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
            // Transition phase
            setBreathingPhase((currentPhase) => {
              if (currentPhase === "In") {
                setPhaseCounter(7); // Hold phase cycle (7s in 4-7-8, or generic)
                return "Hold";
              }
              if (currentPhase === "Hold") {
                setPhaseCounter(8); // Out phase cycle (8s in 4-7-8, or generic)
                return "Out";
              }
              setPhaseCounter(4); // Reset In phase cycle (4s)
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
  }, [isPlaying, secondsLeft]);

  const handleStartExercise = (ex: Exercise) => {
    setActiveExercise(ex);
    setIsPlaying(true);
    setSecondsLeft(ex.id === "1" ? 240 : ex.id === "2" ? 300 : 480);
    setBreathingPhase("In");
    setPhaseCounter(4);
    setCongratsMsg(null);
  };

  const handleFinishSession = () => {
    if (!activeExercise) return;

    // 1. Generate new wellness entry for History & Logs
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " at " + now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newLog = {
      id: String(Date.now()),
      type: "exercise",
      title: `Completed ${activeExercise.title}`,
      preview: `Successfully completed a full pacing session using the ${activeExercise.title}. Breathing cycles restored autonomic baselines and reduced cognitive noise.`,
      date: formattedDate,
      sentiment: "Positive",
    };

    // 2. Load past logs and prepend new exercise log
    const savedLogs = localStorage.getItem("wellness-logs");
    let currentLogs = [];
    if (savedLogs) {
      try {
        currentLogs = JSON.parse(savedLogs);
      } catch (e) {
        currentLogs = [];
      }
    }
    
    localStorage.setItem("wellness-logs", JSON.stringify([newLog, ...currentLogs]));

    // 3. Set congratulatory toast
    setCongratsMsg(`Excellent job completing the ${activeExercise.title}! Sparky has logged this practice inside your Wellness Timeline.`);
    setActiveExercise(null);
    setIsPlaying(false);

    // Auto clear congrats alert after 6 seconds
    setTimeout(() => {
      setCongratsMsg(null);
    }, 6000);
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

  const getPhaseInstruction = () => {
    switch (breathingPhase) {
      case "In":
        return "Slowly expand your lungs... breathe in the calm";
      case "Hold":
        return "Relax your shoulders... suspend and quiet your mind";
      case "Out":
        return "Gently sigh it all out... release the heavy tension";
      default:
        return "Find your natural posture";
    }
  };

  const getPhaseColor = () => {
    switch (breathingPhase) {
      case "In":
        return "var(--color-secondary)";
      case "Hold":
        return "var(--color-accent)";
      case "Out":
        return "var(--color-primary)";
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Dynamic Success Congratulations notification banner */}
      {congratsMsg && (
        <div
          className="glass-card"
          style={{
            padding: "20px",
            border: "1.5px solid var(--color-success)",
            background: "linear-gradient(135deg, var(--bg-surface) 0%, rgba(90, 148, 117, 0.08) 100%)",
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
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-success)", marginBottom: "4px" }}>
              Practice Completed!
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
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

      {/* Intro header */}
      <section className="glass-card" style={{ padding: "28px" }}>
        <h2 style={{ fontSize: "24px", fontFamily: "var(--font-header)", marginBottom: "8px", fontWeight: 500 }}>
          Recommended Wellness Practices
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.6" }}>
          Explore curated, clinically-inspired physical coping paces to calm autonomic nervous systems and restore heart-rate variability. Select a practice below to launch Sparky&apos;s breathing visualizer.
        </p>
      </section>

      {/* Exercises List catalog */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="exercises-grid">
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
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      backgroundColor: theme.bg,
                      color: theme.color,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {ex.category}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>
                    {ex.duration}
                  </span>
                </div>

                <h3 style={{ fontSize: "19px", fontFamily: "var(--font-header)", fontWeight: 500 }}>
                  {ex.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5", minHeight: "68px" }}>
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
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.01)"
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

      {/* Full-screen Breathing Player Modal overlay */}
      {activeExercise && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "radial-gradient(circle at center, #22262f 0%, #12151b 100%)",
            background: "radial-gradient(circle at center, #252b36 0%, #11141a 100%)", // Calm dark midnight overlay
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Exercise Content Header */}
          <div style={{ textAlign: "center", maxWidth: "600px", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "30px", fontFamily: "var(--font-header)", color: "#FFFFFF", marginBottom: "12px", fontWeight: 500 }}>
              {activeExercise.title}
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "15px", lineHeight: "1.6" }}>
              Relax your shoulders, sink into your posture, and sync your breathing mechanism with Sparky&apos;s wellness orb.
            </p>
          </div>

          {/* Central Pulsing Circles */}
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
                background: "radial-gradient(circle, rgba(125, 170, 143, 0.25) 0%, rgba(125, 170, 143, 0.02) 100%)",
                transform: isPlaying 
                  ? (breathingPhase === "In" ? "scale(1.2)" : breathingPhase === "Hold" ? "scale(1.2)" : "scale(0.85)") 
                  : "scale(1)",
                transition: "transform 4s cubic-bezier(0.4, 0, 0.2, 1)",
                filter: "drop-shadow(0 0 24px rgba(125, 170, 143, 0.15))",
              }}
            />
            {/* Inner breathing circle */}
            <div
              style={{
                position: "absolute",
                width: "75%",
                height: "75%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(169, 146, 196, 0.25) 0%, rgba(169, 146, 196, 0.02) 100%)",
                transform: isPlaying 
                  ? (breathingPhase === "In" ? "scale(1.12)" : breathingPhase === "Hold" ? "scale(1.12)" : "scale(0.88)") 
                  : "scale(1)",
                transition: "transform 4s cubic-bezier(0.4, 0, 0.2, 1)",
                filter: "drop-shadow(0 0 16px rgba(169, 146, 196, 0.1))",
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
                transition: "transform 0.3s ease",
              }}
              className="breathing-orb-center"
            >
              <Mascot pose={activeExercise.pose} size={90} interactive={false} />
            </div>

            {/* Micro Tick Indicator inside orb */}
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
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                {phaseCounter}s
              </div>
            )}
          </div>

          {/* Breathing phase display */}
          {isPlaying && (
            <div style={{ textAlign: "center", marginBottom: "40px", minHeight: "92px" }}>
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
                {breathingPhase === "In" ? "Breathe In" : breathingPhase === "Hold" ? "Hold" : "Breathe Out"}
              </div>
              <p style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.8)", fontStyle: "italic", marginBottom: "12px", minHeight: "24px" }}>
                {getPhaseInstruction()}
              </p>
              <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)", fontWeight: "500" }}>
                Time Remaining: {formatTime(secondsLeft)}
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div style={{ display: "flex", gap: "20px" }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary breathe-control-btn"
              style={{
                backgroundColor: isPlaying ? "rgba(255, 255, 255, 0.12)" : "var(--color-success)",
                border: isPlaying ? "1.5px solid rgba(255, 255, 255, 0.2)" : "none",
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

        @media (max-width: 900px) {
          .exercises-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
