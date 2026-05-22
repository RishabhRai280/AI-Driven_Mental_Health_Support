"use client";

import React from "react";
import Link from "next/link";
import Mascot from "./components/Mascot";
import RotatingText from "./components/RotatingText";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      {/* Top Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 40px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(91, 127, 166, 0.3)",
            }}
          >
            S
          </div>
          <span
            style={{
              fontFamily: "var(--font-header)",
              fontSize: "20px",
              fontWeight: "500",
              letterSpacing: "-0.5px",
            }}
          >
            Serene<span style={{ color: "var(--color-secondary)" }}>Mind</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/login" style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-secondary)" }} className="nav-link">
            Log In
          </Link>
          <Link href="/register" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "1200px", margin: "0 auto", padding: "60px 40px 40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "60px",
            alignItems: "center",
            marginBottom: "80px",
          }}
          className="hero-grid"
        >
          {/* Left Column - Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              className="hero-rotating-row"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "26px",
                fontWeight: "600",
                width: "fit-content",
              }}
            >
              <span
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-header)",
                }}
              >
                Your
              </span>
              <span
                className="hero-rotating-pill"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "rgba(125, 170, 143, 0.12)",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  color: "var(--color-secondary)",
                  width: "fit-content",
                }}
              >
                <RotatingText
                  texts={["Safe Space", "Emotional Wellbeing", "Mental Wellness"]}
                  mainClassName="hero-rotating-text overflow-hidden"
                  staggerFrom="first"
                  initial={{ y: "45%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-45%" }}
                  staggerDuration={0.02}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 35, stiffness: 450 }}
                  rotationInterval={3000}
                  splitBy="words"
                  auto
                  loop
                />
              </span>
            </div>
            <h1
              style={{
                fontSize: "48px",
                lineHeight: "1.2",
                fontWeight: "500",
                fontFamily: "var(--font-header)",
                color: "var(--text-primary)",
              }}
            >
              Your Empathetic Companion for <span style={{ color: "var(--color-primary)" }}>Mental Well-being</span>
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                maxWidth: "600px",
              }}
            >
              Explore calming activities, record reflective journals with automated sentiment feedback, and seek support in absolute safety with our interactive hamster companion, Sparky.
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              <Link href="/register" className="btn-primary" style={{ padding: "14px 28px", fontSize: "16px" }}>
                Begin Your Journey
              </Link>
              <Link href="/login" className="btn-secondary" style={{ padding: "13px 27px", fontSize: "16px" }}>
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Column - Waving Hamster Mascot */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              className="glass-card"
              style={{
                padding: "40px",
                borderRadius: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "var(--shadow-hover)",
              }}
            >
              <Mascot pose="waving-hello" size={240} dialogue="Hi! I'm Sparky. Let's find your peace today." />
              <div
                style={{
                  marginTop: "20px",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                }}
              >
                Hover over me to say hello!
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Core Pillars Grid */}
        <section style={{ marginBottom: "80px" }}>
          <h2
            style={{
              fontSize: "32px",
              fontFamily: "var(--font-header)",
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            How SereneMind Helps You Heal
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "32px",
            }}
            className="pillars-grid"
          >
            {/* Pillar 1 */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)" }}>Empathetic Chatbot</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
                Chat with Sparky, an intelligent assistant trained to listen non-judgmentally and offer helpful evidence-based coping tools.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)" }}>Reflective Journaling</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
                Write your thoughts on a distraction-free writing space. Sparky analyzes sentiments and saves logs safely inside your feed.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)" }}>Mindful Exercises</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
                Participate in guided pacing. Use our real-time interactive breathing visualizer to calm your heart beat instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Siena-Border Crisis Ribbon */}
        <section
          style={{
            border: "2px solid var(--color-error)",
            borderRadius: "20px",
            padding: "24px",
            backgroundColor: "rgba(192, 118, 90, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "60px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "32px" }}>⚠️</span>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-error)" }}>Need Immediate Support?</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                If you are experiencing severe distress or a medical crisis, please access immediate professional helplines.
              </p>
            </div>
          </div>
          <Link href="/crisis-sos" className="btn-primary" style={{ backgroundColor: "var(--color-error)", color: "#FFFFFF" }}>
            Get Help Now
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-light)",
          padding: "40px",
          textAlign: "center",
          backgroundColor: "var(--bg-nav)",
          fontSize: "14px",
          color: "var(--text-secondary)",
        }}
      >
        <p style={{ marginBottom: "12px", fontWeight: "500" }}>
          &copy; {new Date().getFullYear()} SereneMind. Built with absolute empathy and privacy.
        </p>
        <p style={{ maxWidth: "800px", margin: "0 auto", fontSize: "12px", lineHeight: "1.6" }}>
          Disclaimer: SereneMind is an AI-driven support companion designed for emotional journaling and coping exercises. It is not a replacement for clinical therapy, psychiatric treatment, or emergency mental health services.
        </p>
      </footer>

      <style jsx global>{`
        .nav-link:hover {
          color: var(--text-primary) !important;
        }
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center;
          }
          .hero-grid div {
            align-items: center !important;
          }
          .pillars-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
