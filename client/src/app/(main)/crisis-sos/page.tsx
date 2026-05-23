"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Mascot from "../../components/Mascot";

export default function CrisisSOSPage() {
  const [breathText, setBreathText] = useState("Inhale...");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathText((prev) => (prev === "Inhale..." ? "Exhale..." : "Inhale..."));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--background)",
        zIndex: 300,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "50px 24px",
      }}
    >
      {/* Background glow spheres for soft visual relief */}
      <div className="ambient-glow ambient-glow-1" style={{ opacity: 0.18, zIndex: 1 }} />
      <div className="ambient-glow ambient-glow-2" style={{ opacity: 0.18, zIndex: 1 }} />
      <div className="ambient-glow ambient-glow-3" style={{ opacity: 0.18, zIndex: 1 }} />

      {/* Drifting animated bubbles */}
      <div className="floating-bubble bubble-1" style={{ zIndex: 1 }} />
      <div className="floating-bubble bubble-2" style={{ zIndex: 1 }} />
      <div className="floating-bubble bubble-3" style={{ zIndex: 1 }} />
      <div className="floating-bubble bubble-4" style={{ zIndex: 1 }} />

      {/* Main Grid Wrapper */}
      <div
        className="sos-grid"
        style={{
          width: "100%",
          maxWidth: "1150px",
          position: "relative",
          zIndex: 10,
          marginBottom: "40px",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {/* LEFT COLUMN: Calm & Reassurance */}
        <div
          className="glass-card left-sos-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 40px",
            borderRadius: "28px",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border-light)",
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(20px)",
            gap: "28px",
            textAlign: "center",
          }}
        >
          {/* Urgent header tag */}
          <div
            style={{
              backgroundColor: "rgba(192, 118, 90, 0.12)",
              border: "1px solid rgba(192, 118, 90, 0.2)",
              color: "var(--color-error)",
              padding: "8px 22px",
              borderRadius: "24px",
              fontSize: "13px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Crisis SOS Active Support
          </div>

          <h1
            style={{
              fontSize: "36px",
              fontFamily: "var(--font-header)",
              color: "var(--text-primary)",
              lineHeight: "1.3",
              margin: 0,
            }}
          >
            Please Pause & Breathe.<br />You Are Safe Here.
          </h1>

          {/* Empathy Mascot with Pulse Glow */}
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "220px",
              height: "220px",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(192, 118, 90, 0.25) 0%, rgba(192, 118, 90, 0) 70%)",
                filter: "blur(12px)",
                animation: "pulseMascotGlow 3s infinite ease-in-out",
              }}
            />
            <Mascot pose="holding-heart" size={190} interactive={false} />
          </div>

          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
              maxWidth: "480px",
              margin: 0,
            }}
          >
            Distress can feel overwhelming, but feelings always change. You do not
            have to carry this alone. 
          </p>

          {/* Interactive Grounding Breathing Widget */}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              className="breathing-circle-widget"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "2px solid rgba(91, 127, 166, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                className="breathing-glow-ball"
                style={{
                  position: "absolute",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(91, 127, 166, 0.1)",
                  animation: "breatheCycle 8s infinite ease-in-out",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--color-primary)",
                  zIndex: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {breathText}
              </span>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
              Follow the pacer to anchor yourself
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Resources & Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Section title */}
          <div style={{ paddingLeft: "8px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontFamily: "var(--font-header)",
                color: "var(--text-primary)",
                margin: "0 0 4px 0",
              }}
            >
              Confidential Help Lines
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
              Access completely free and secure support 24/7.
            </p>
          </div>

          {/* Helplines layout (Stacked) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* Helpline 1: 988 */}
            <div
              className="glass-card helpline-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                border: "1px solid rgba(192, 118, 90, 0.2)",
                backgroundColor: "rgba(192, 118, 90, 0.03)",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(192, 118, 90, 0.02)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "var(--color-error)",
                    margin: 0,
                  }}
                >
                  988 Suicide & Crisis Lifeline
                </h3>
                <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", backgroundColor: "rgba(192, 118, 90, 0.12)", color: "var(--color-error)", padding: "4px 10px", borderRadius: "12px" }}>
                  Call / Text
                </span>
              </div>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Call or text 988 to connect immediately with a trained crisis counselor. Free, confidential, and available 24/7.
              </p>
              <a
                href="tel:988"
                className="btn-primary"
                style={{
                  backgroundColor: "var(--color-error)",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "filter 0.2s ease, transform 0.1s ease",
                }}
              >
                Call 988 Now
              </a>
            </div>

            {/* Helpline 2: Crisis Text Line */}
            <div
              className="glass-card helpline-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                border: "1px solid rgba(91, 127, 166, 0.2)",
                backgroundColor: "rgba(91, 127, 166, 0.03)",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(91, 127, 166, 0.02)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "var(--color-primary)",
                    margin: 0,
                  }}
                >
                  Crisis Text Line
                </h3>
                <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", backgroundColor: "rgba(91, 127, 166, 0.12)", color: "var(--color-primary)", padding: "4px 10px", borderRadius: "12px" }}>
                  SMS Text
                </span>
              </div>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Text HOME to 741741 to connect with a crisis counselor over silent, secure text message. Available 24/7.
              </p>
              <a
                href="sms:741741?&body=HOME"
                className="btn-primary"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "filter 0.2s ease, transform 0.1s ease",
                }}
              >
                Text HOME to 741741
              </a>
            </div>
          </div>

          {/* Personal Contacts list */}
          <div className="glass-card" style={{ width: "100%", padding: "24px", borderRadius: "20px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--text-primary)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Personal Support Circle
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-light)",
                  paddingBottom: "10px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-primary)" }}>
                    Dr. Emily Watson (Therapist)
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}
                  >
                    Direct counseling line
                  </div>
                </div>
                <a
                  href="tel:5550199"
                  style={{
                    color: "var(--color-success)",
                    fontWeight: "600",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 14px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(90, 148, 117, 0.08)",
                    transition: "background-color 0.2s, transform 0.15s",
                    textDecoration: "none",
                  }}
                  className="contact-call-btn"
                >
                  Call Doctor
                </a>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-light)",
                  paddingBottom: "10px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-primary)" }}>
                    Mom (Personal Trust Contact)
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}
                  >
                    Family urgent care
                  </div>
                </div>
                <a
                  href="tel:5550188"
                  style={{
                    color: "var(--color-success)",
                    fontWeight: "600",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 14px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(90, 148, 117, 0.08)",
                    transition: "background-color 0.2s, transform 0.15s",
                    textDecoration: "none",
                  }}
                  className="contact-call-btn"
                >
                  Call Mom
                </a>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              width: "100%",
            }}
            className="sos-action-buttons"
          >
            <Link
              href="/exercises"
              className="btn-secondary"
              style={{
                flex: 1,
                borderColor: "var(--color-secondary)",
                color: "var(--color-secondary)",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle" }}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
              Slow Breathing Pacer
            </Link>
            <Link
              href="/dashboard"
              className="btn-primary"
              style={{
                flex: 1,
                backgroundColor: "var(--text-primary)",
                color: "var(--background)",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Exit Safety Screen
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .sos-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 32px;
        }
        @keyframes pulseMascotGlow {
          0% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.95;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.6;
          }
        }
        @keyframes breatheCycle {
          0% {
            transform: scale(0.85);
            box-shadow: 0 0 20px rgba(91, 127, 166, 0.15);
            background-color: rgba(91, 127, 166, 0.05);
          }
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 45px rgba(91, 127, 166, 0.35);
            background-color: rgba(91, 127, 166, 0.18);
          }
          100% {
            transform: scale(0.85);
            box-shadow: 0 0 20px rgba(91, 127, 166, 0.15);
            background-color: rgba(91, 127, 166, 0.05);
          }
        }
        .helpline-card:hover {
          transform: translateY(-4px);
        }
        .helpline-card:hover:nth-child(1) {
          box-shadow: 0 8px 30px rgba(192, 118, 90, 0.1) !important;
        }
        .helpline-card:hover:nth-child(2) {
          box-shadow: 0 8px 30px rgba(91, 127, 166, 0.1) !important;
        }
        .contact-call-btn:hover {
          background-color: rgba(90, 148, 117, 0.16) !important;
          transform: scale(1.03);
        }
        .contact-call-btn:active {
          transform: scale(0.98);
        }
        @media (max-width: 960px) {
          .sos-grid {
            grid-template-columns: 1fr !important;
            gap: 24px;
          }
          .sos-action-buttons {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
