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
        border: "10px solid var(--color-error)", // Warm Terracotta border framing the entire viewport
        zIndex: 300,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px",
      }}
    >
      {/* Central Calm Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
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
          🚨 Crisis SOS Active Support
        </div>

        <h1
          style={{
            fontSize: "32px",
            textAlign: "center",
            fontFamily: "var(--font-header)",
            color: "var(--text-primary)",
            lineHeight: "1.3",
          }}
        >
          Please Pause & Breathe. You Are Safe Here.
        </h1>

        {/* Empathy hamster holding heart */}
        <Mascot
          pose="holding-heart"
          size={180}
          dialogue="I'm holding this warm heart right beside you. Let's get through this minute together."
          interactive={false}
        />

        {/* Calm reassuring disclaimer */}
        <p
          style={{
            fontSize: "15px",
            textAlign: "center",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            maxWidth: "540px",
          }}
        >
          Distress can feel overwhelming, but feelings always change. You do not have to carry this alone. Please access these completely free, confidential resources right now.
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
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              border: "1.5px solid var(--color-error)",
              backgroundColor: "rgba(192, 118, 90, 0.03)",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-error)" }}>988 Suicide & Crisis</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              Call or text 988 to connect immediately with sympathetic counselors. Free and private 24/7 support.
            </p>
            <a
              href="tel:988"
              className="btn-primary"
              style={{
                backgroundColor: "var(--color-error)",
                color: "#FFFFFF",
                fontSize: "14px",
                height: "44px",
                padding: 0,
              }}
            >
              Call 988
            </a>
          </div>

          {/* Helpline 2 */}
          <div
            className="glass-card"
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              border: "1.5px solid var(--color-primary)",
              backgroundColor: "rgba(91, 127, 166, 0.03)",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-primary)" }}>Crisis Text Line</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              Text HOME to 741741 to chat silently with a dedicated crisis responder in absolute privacy.
            </p>
            <a
              href="sms:741741?&body=HOME"
              className="btn-primary"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                fontSize: "14px",
                height: "44px",
                padding: 0,
              }}
            >
              Text HOME to 741741
            </a>
          </div>
        </div>

        {/* Personal Contacts list */}
        <div className="glass-card" style={{ width: "100%", padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>👥 Personal Support Circle</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>Dr. Emily Watson (Therapist)</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Direct counseling line</div>
              </div>
              <a href="tel:5550199" style={{ color: "var(--color-success)", fontWeight: "600", fontSize: "14px" }}>Call Doctor</a>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>Mom (Personal Trust Contact)</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Family urgent care</div>
              </div>
              <a href="tel:5550188" style={{ color: "var(--color-success)", fontWeight: "600", fontSize: "14px" }}>Call Mom</a>
            </div>
          </div>
        </div>

        {/* Breathing Practice & Exit action links */}
        <div style={{ display: "flex", gap: "16px", width: "100%", marginTop: "12px" }} className="sos-action-buttons">
          <Link
            href="/exercises"
            className="btn-secondary"
            style={{ flex: 1, borderColor: "var(--color-secondary)", color: "var(--color-secondary)", height: "48px" }}
          >
            🧘 Slow Breathing Pacer
          </Link>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{ flex: 1, backgroundColor: "var(--text-primary)", color: "var(--background)", height: "48px" }}
          >
            Exit Safety Screen
          </Link>
        </div>
      </div>

      <style jsx global>{`
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
