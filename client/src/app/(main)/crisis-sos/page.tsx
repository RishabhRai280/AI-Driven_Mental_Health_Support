"use client";

import React from "react";
import Link from "next/link";
import Mascot from "../../components/Mascot";

export default function CrisisSOSPage() {
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
        padding: "60px 24px",
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

      {/* Central Calm Glassmorphic Container */}
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "700px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px",
          padding: "40px 32px",
          borderRadius: "28px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.05)",
          border: "1px solid var(--border-light)",
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 10,
          marginBottom: "40px",
          animation: "fadeIn 0.4s ease-out",
        }}
      >
        {/* Urgent header tag */}
        <div
          style={{
            backgroundColor: "rgba(192, 118, 90, 0.12)",
            border: "1px solid rgba(192, 118, 90, 0.2)",
            color: "var(--color-error)",
            padding: "8px 20px",
            borderRadius: "24px",
            fontSize: "14px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Crisis SOS Active Support
        </div>

        <h1
          style={{
            fontSize: "32px",
            textAlign: "center",
            fontFamily: "var(--font-header)",
            color: "var(--text-primary)",
            lineHeight: "1.3",
            margin: 0,
          }}
        >
          Please Pause & Breathe. You Are Safe Here.
        </h1>

        {/* Empathy Mascot with Pulse Glow */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "200px",
            height: "200px",
            margin: "8px 0",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(192, 118, 90, 0.25) 0%, rgba(192, 118, 90, 0) 70%)",
              filter: "blur(10px)",
              animation: "pulseMascotGlow 3s infinite ease-in-out",
            }}
          />
          <Mascot pose="holding-heart" size={180} interactive={false} />
        </div>

        {/* Calm reassuring disclaimer */}
        <p
          style={{
            fontSize: "15px",
            textAlign: "center",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            maxWidth: "540px",
            margin: 0,
          }}
        >
          Distress can feel overwhelming, but feelings always change. You do not
          have to carry this alone. Please access these completely free,
          confidential resources right now.
        </p>

        {/* Action Callout Box */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            width: "100%",
            marginTop: "12px",
          }}
          className="helplines-grid"
        >
          {/* Helpline 1 */}
          <div
            className="glass-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              border: "1px solid rgba(192, 118, 90, 0.2)",
              backgroundColor: "rgba(192, 118, 90, 0.04)",
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(192, 118, 90, 0.03)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(192, 118, 90, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(192, 118, 90, 0.03)";
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "var(--color-error)",
                margin: 0,
              }}
            >
              988 Suicide & Crisis
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: "1.5",
                margin: 0,
                flex: 1,
              }}
            >
              Call or text 988 to connect immediately with sympathetic
              counselors. Free and private 24/7 support.
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
              }}
            >
              Call 988
            </a>
          </div>

          {/* Helpline 2 */}
          <div
            className="glass-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              border: "1px solid rgba(91, 127, 166, 0.2)",
              backgroundColor: "rgba(91, 127, 166, 0.04)",
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(91, 127, 166, 0.03)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(91, 127, 166, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(91, 127, 166, 0.03)";
            }}
          >
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
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: "1.5",
                margin: 0,
                flex: 1,
              }}
            >
              Text HOME to 741741 to chat silently with a dedicated crisis
              responder in absolute privacy.
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

        {/* Breathing Practice & Exit action links */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
            marginTop: "12px",
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

      <style jsx global>{`
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
        .contact-call-btn:hover {
          background-color: rgba(90, 148, 117, 0.16) !important;
          transform: scale(1.03);
        }
        .contact-call-btn:active {
          transform: scale(0.98);
        }
        @media (max-width: 600px) {
          .helplines-grid {
            grid-template-columns: 1fr !important;
          }
          .sos-action-buttons {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
