"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Mascot, { HamsterPose, CompanionType } from "./components/Mascot";

export default function LandingPage() {
  // Hero Mood selector interactivity
  const [heroMood, setHeroMood] = useState<"Calm" | "Anxious" | "Stressed" | "Energetic">("Calm");

  const heroMascotPose = useMemo<HamsterPose>(() => {
    switch (heroMood) {
      case "Calm":
        return "sitting-zen";
      case "Anxious":
        return "holding-heart";
      case "Stressed":
        return "balancing-nut";
      case "Energetic":
        return "running-excited";
    }
  }, [heroMood]);

  const heroMascotDialogue = useMemo(() => {
    switch (heroMood) {
      case "Calm":
        return "Let's share this serene moment. Inhale peace, exhale noise.";
      case "Anxious":
        return "Heavy chest? Take my hand. We will pace your heart rate together.";
      case "Stressed":
        return "So many items to balance? Let's take a tiny step back and rest.";
      case "Energetic":
        return "Incredible energy! Let's channel it into something wonderful today!";
    }
  }, [heroMood]);

  // Companion Spirit Deck interactivity
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionType>("pandi");

  const companionDetails = useMemo(() => {
    const details: Record<
      CompanionType,
      { label: string; title: string; desc: string; dialogue: string; pose: HamsterPose }
    > = {
      pandi: {
        label: "Pandi the Panda",
        title: "Quiet & Pensive Guide",
        desc: "Ideal for deep journals, quiet pacing, and self-compassion mapping.",
        dialogue: "Let's explore your inner baseline in peace and silence.",
        pose: "sitting-zen",
      },
      goldie: {
        label: "Goldie the Pup",
        title: "Cheerfully Energetic Companion",
        desc: "Best for building positive streaks, celebrating daily habits, and active logging.",
        dialogue: "Yay! Every step forward is a victory. Let's do this!",
        pose: "celebrating-success",
      },
      otter: {
        label: "Playful Otter",
        title: "Calming & Stoic Partner",
        desc: "Focuses on balancing thoughts, screen limits, and stress management guides.",
        dialogue: "Ride the waves smoothly. Balance is a journey, not a destination.",
        pose: "lost-map",
      },
      "golden-hamster": {
        label: "Sparky the Hamster",
        title: "Balanced Coping Ally",
        desc: "A warm friend for crisis mediation, immediate box breathing, and quick check-ins.",
        dialogue: "Hi! I'm here to listen non-judgmentally whenever you need me.",
        pose: "waving-hello",
      },
    };
    return details[selectedCompanion];
  }, [selectedCompanion]);

  // Quick Breathing Practice Widget interactivity
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingStep, setBreathingStep] = useState<"in" | "hold" | "out">("in");
  const [breathingProgress, setBreathingProgress] = useState(0);

  useEffect(() => {
    if (!isBreathing) {
      setBreathingProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setBreathingProgress((prev) => {
        const next = prev + 1;
        if (next < 4) {
          setBreathingStep("in");
        } else if (next < 8) {
          setBreathingStep("hold");
        } else if (next < 12) {
          setBreathingStep("out");
        } else {
          return 0; // Reset loop
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing]);

  // Stress screener mockup interactivity
  const [screenerPressure, setScreenerPressure] = useState<number>(2); // 0 to 3
  const [screenerSleep, setScreenerSleep] = useState<number>(2); // 0 to 3

  const calculatedMockStress = useMemo(() => {
    const sum = screenerPressure + (3 - screenerSleep); // high pressure & low sleep = high stress
    return Math.max(1, Math.min(10, Math.round((sum / 6) * 9) + 1));
  }, [screenerPressure, screenerSleep]);

  return (
    <div className="landing-layout-wrapper">
      {/* BACKGROUND DECORATIONS */}
      <div className="glow-mesh-blobs">
        <div className="glow-blob-1" />
        <div className="glow-blob-2" />
        <div className="glow-blob-3" />
      </div>

      {/* TOP NAVIGATION HEADER */}
      <nav className="landing-navbar">
        <div className="nav-brand-container">
          <div className="nav-logo-box">S</div>
          <span className="nav-brand-text">
            Serene<span className="brand-accent-text">Mind</span>
          </span>
        </div>

        <div className="nav-actions-container">
          <Link href="/login" className="nav-text-anchor">
            Log In
          </Link>
          <Link href="/register" className="nav-cta-button">
            Get Started
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT SPACE */}
      <main className="landing-main-space">
        
        {/* HERO SECTION */}
        <header className="landing-hero-grid">
          {/* Left Column: Greeting & Description */}
          <div className="hero-content-column">
            <div className="hero-eyebrow-pill">
              Your Gentle Safe Space
            </div>
            
            <h1 className="hero-title-heading">
              Your Empathetic Companion for <span className="gradient-highlight-text">Mental Well-being</span>
            </h1>
            
            <p className="hero-paragraph-description">
              Explore calming activities, record reflective journals with automated sentiment feedback, and seek support in absolute safety with your interactive companion.
            </p>

            {/* Micro-interaction: Mood selector that drives mascot reactions */}
            <div className="hero-interactive-mood-selector">
              <span className="mood-selector-label">How is your mind pacing right now?</span>
              <div className="mood-tag-container">
                {(["Calm", "Anxious", "Stressed", "Energetic"] as const).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setHeroMood(mood)}
                    className={`mood-tag-pill ${heroMood === mood ? `active-${mood.toLowerCase()}` : ""}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-actions-container">
              <Link href="/register" className="hero-primary-cta">
                Begin Your Journey
              </Link>
              <Link href="/login" className="hero-secondary-cta">
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Interactive Mascot Card */}
          <div className="hero-mascot-column">
            <div className="hero-mascot-wrapper glass-card">
              <div className="mascot-card-aura" />
              <Mascot
                pose={heroMascotPose}
                dialogue={heroMascotDialogue}
                size={220}
                interactive={true}
                companionType="golden-hamster"
              />
              <div className="mascot-card-instructions">
                Hover or click me to interact!
              </div>
            </div>
          </div>
        </header>

        {/* COMPANION SPIRIT SHOWCASE */}
        <section className="landing-section-block animated-fade-in-scroll">
          <div className="section-title-zone">
            <h2 className="section-title-heading">Meet Your Coping Companions</h2>
            <p className="section-subtitle-text">Choose the spirit partner that best matches your diagnostic needs</p>
          </div>

          <div className="companion-showcase-container">
            {/* Left Column: Selective List Cards */}
            <div className="companion-cards-deck">
              {(["pandi", "goldie", "otter", "golden-hamster"] as const).map((comp) => {
                const isSelected = selectedCompanion === comp;
                const labels: Record<CompanionType, string> = {
                  pandi: "Pandi the Panda",
                  goldie: "Goldie the Pup",
                  otter: "Playful Otter",
                  "golden-hamster": "Sparky the Hamster",
                };
                const demeanors: Record<CompanionType, string> = {
                  pandi: "Quiet & Pensive",
                  goldie: "Cheerfully Energetic",
                  otter: "Calming & Stoic",
                  "golden-hamster": "Balanced Coping",
                };

                return (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setSelectedCompanion(comp)}
                    className={`companion-select-card glass-card ${isSelected ? "selected-companion-active" : ""}`}
                  >
                    <div className="companion-card-info-row">
                      <span className="companion-card-label">{labels[comp]}</span>
                      <span className="companion-card-badge">{demeanors[comp]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Feature Preview Area */}
            <div className="companion-featured-viewer glass-card">
              <div className="featured-viewer-content">
                <h3 className="featured-companion-name">{companionDetails.label}</h3>
                <span className="featured-companion-title">{companionDetails.title}</span>
                <p className="featured-companion-desc">{companionDetails.desc}</p>
                <div className="featured-chat-cta-row">
                  <Link href="/register" className="featured-chat-link">
                    Adopt this companion
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cta-chevron"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </div>
              </div>

              <div className="featured-viewer-model">
                <div className="viewer-model-aura" />
                <Mascot
                  pose={companionDetails.pose}
                  dialogue={companionDetails.dialogue}
                  size={160}
                  interactive={false}
                  companionType={selectedCompanion}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CORE APPLICATION PILLARS */}
        <section className="landing-section-block">
          <div className="section-title-zone">
            <h2 className="section-title-heading">A Scientific Approach to Wellness</h2>
            <p className="section-subtitle-text">SereneMind integrates physiological feedback and clinical guidelines</p>
          </div>

          <div className="pillars-grid-layout">
            <div className="pillar-glass-card glass-card">
              <div className="pillar-icon-box primary-tint">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="pillar-heading">Empathetic Dialogue</h3>
              <p className="pillar-body-text">
                Speak directly with your companion. Share thoughts, vent anxiety, or log reflections securely. Your companion responds contextually to guide you to calm ground.
              </p>
            </div>

            <div className="pillar-glass-card glass-card">
              <div className="pillar-icon-box secondary-tint">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 className="pillar-heading">Reflective Journals</h3>
              <p className="pillar-body-text">
                Log entries with automatic sentiment analysis. Read historical graphs that summarize your positive energy, cognitive distress indices, and dominant emotions.
              </p>
            </div>

            <div className="pillar-glass-card glass-card">
              <div className="pillar-icon-box accent-tint">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3 className="pillar-heading">Autonomic Grounding</h3>
              <p className="pillar-body-text">
                Activate the Zen Breathing Pacer to balance your vagal tone. Pacing cycles are calibrated to regulate heart-rate variability and calm hyperarousal instantly.
              </p>
            </div>
          </div>
        </section>

        {/* TWO-COLUMN WIDGETS DISPLAY: LIVE BREATHING PACER & INTERACTIVE SCREENER */}
        <section className="widgets-layout-grid">
          
          {/* A. LIVE INTERACTIVE BREATHING PACER DEMO */}
          <div className="glass-card interactive-breathing-demo">
            <div className="demo-header">
              <span className="demo-pill-label">Autonomic Breathing Demo</span>
              <h3 className="demo-title">Try Box Breathing Right Now</h3>
              <p className="demo-subtitle">Experience our rhythmic breathing pacer directly. Align your lungs with the expanding orb.</p>
            </div>

            <div className="breathing-orb-container">
              {/* Outer Glow Ring */}
              <div className={`breathing-ring ring-outer ${isBreathing ? `pacer-${breathingStep}` : ""}`} />
              <div className={`breathing-ring ring-middle ${isBreathing ? `pacer-${breathingStep}` : ""}`} />
              
              {/* Core Breathing Orb */}
              <div className={`breathing-core-orb ${isBreathing ? `pacer-${breathingStep}` : ""}`}>
                <span className="breathing-orb-prompt">
                  {isBreathing ? (
                    breathingStep === "in" ? "Inhale..." : breathingStep === "hold" ? "Hold..." : "Exhale..."
                  ) : (
                    "Ready"
                  )}
                </span>
              </div>
            </div>

            <div className="breathing-controls-row">
              <button
                type="button"
                onClick={() => setIsBreathing((prev) => !prev)}
                className={`breathing-action-btn ${isBreathing ? "active-running" : ""}`}
              >
                {isBreathing ? "Pause Grounding" : "Start Quick Breath"}
              </button>
            </div>
          </div>

          {/* B. INTERACTIVE SCREENER & DIAGNOSTIC MOCKUP */}
          <div className="glass-card interactive-screener-demo">
            <div className="demo-header">
              <span className="demo-pill-label">Autonomic Stress Screener</span>
              <h3 className="demo-title">Simulate Your Stress Index</h3>
              <p className="demo-subtitle">Answer the sample diagnostic points below to check your baseline level.</p>
            </div>

            <div className="screener-questions-box">
              {/* Question 1 */}
              <div className="screener-question-item">
                <span className="question-title">1. How intense is your cognitive load or deadline pressure?</span>
                <div className="screener-options-row">
                  {["Low", "Medium", "High", "Extreme"].map((lbl, val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScreenerPressure(val)}
                      className={`screener-option-btn ${screenerPressure === val ? "option-selected-error" : ""}`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="screener-question-item">
                <span className="question-title">2. Rate your sleep quality and replenishment today:</span>
                <div className="screener-options-row">
                  {["Poor", "Interrupted", "Normal", "Replenished"].map((lbl, val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScreenerSleep(val)}
                      className={`screener-option-btn ${screenerSleep === val ? "option-selected-success" : ""}`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated output HUD */}
            <div className="screener-result-hud">
              <div className="screener-gauge-container">
                <span className="gauge-label">Estimated Stress Index</span>
                <span className="gauge-value">{calculatedMockStress} / 10</span>
              </div>
              <div className="screener-recommendation-note">
                {calculatedMockStress > 6 ? (
                  <span className="note-text-danger">High stress detected. Grounding breathing recommended.</span>
                ) : (
                  <span className="note-text-healthy">Balanced baseline. Ready for calm reflection.</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* TELEMETRY ANALYTICS GRAPH PREVIEW */}
        <section className="landing-section-block">
          <div className="section-title-zone">
            <h2 className="section-title-heading">Insightful Telemetry Tracking</h2>
            <p className="section-subtitle-text">Review beautiful heart rate resilience graphs and journaling stats</p>
          </div>

          <div className="analytics-mock-wrapper glass-card">
            <div className="mock-graph-header">
              <div className="graph-header-left">
                <span className="graph-category">Autonomic Resilience Curve</span>
                <h4 className="graph-title">Heart Rate Variability Progression</h4>
              </div>
              <div className="graph-header-right">
                <span className="graph-metric-badge">Vagal Tone: 68%</span>
              </div>
            </div>

            {/* Clean SVG Bezier curve mockup */}
            <div className="mock-svg-chart-container">
              <svg viewBox="0 0 800 240" className="mock-svg-element">
                {/* Grid lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="800" y2="120" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="200" x2="800" y2="200" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 4" />

                 {/* Resilience curve line */}
                <path
                  d="M 50 160 C 120 160, 180 100, 250 100 C 320 100, 380 120, 450 120 C 520 120, 580 60, 650 60 C 690 60, 720 80, 750 80"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="4"
                  className="animated-draw-path"
                />
                
                {/* Glowing glow filters */}
                <path
                  d="M 50 160 C 120 160, 180 100, 250 100 C 320 100, 380 120, 450 120 C 520 120, 580 60, 650 60 C 690 60, 720 80, 750 80"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="8"
                  opacity="0.35"
                  filter="blur(4px)"
                />

                {/* Point markers */}
                <circle cx="50" cy="160" r="6" fill="var(--color-primary)" />
                <circle cx="250" cy="100" r="6" fill="var(--color-primary)" />
                <circle cx="450" cy="120" r="6" fill="var(--color-primary)" />
                <circle cx="650" cy="60" r="6" fill="var(--color-primary)" />
                <circle cx="750" cy="80" r="6" fill="var(--color-primary)" />

                {/* Label text */}
                <text x="50" y="230" fill="var(--text-secondary)" fontSize="12" textAnchor="middle">Mon</text>
                <text x="250" y="230" fill="var(--text-secondary)" fontSize="12" textAnchor="middle">Wed</text>
                <text x="450" y="230" fill="var(--text-secondary)" fontSize="12" textAnchor="middle">Fri</text>
                <text x="650" y="230" fill="var(--text-secondary)" fontSize="12" textAnchor="middle">Sun</text>
              </svg>
            </div>
          </div>
        </section>

        {/* CRISIS SUPPORT HELPLINE BANNER */}
        <section className="crisis-banner-ribbon">
          <div className="crisis-ribbon-content">
            <div className="crisis-ribbon-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="crisis-ribbon-details">
              <h4 className="crisis-ribbon-title">Need Immediate Professional Support?</h4>
              <p className="crisis-ribbon-description">
                If you are experiencing severe emotional distress or a personal safety emergency, please access direct professional crisis resources immediately.
              </p>
            </div>
          </div>
          <Link href="/crisis-sos" className="crisis-ribbon-cta">
            Access SOS Resources
          </Link>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="landing-footer-wrapper">
        <p className="footer-copyright-note">
          &copy; {new Date().getFullYear()} SereneMind. Dedicated to secure, empathetic, and private mental health support.
        </p>
        <p className="footer-legal-disclaimer">
          Disclaimer: SereneMind is an AI-driven grounding application designed to support emotional wellness, guided pacing, and habit journaling. It does not provide clinical diagnoses, medical treatments, or emergency healthcare services.
        </p>
      </footer>

      {/* COMPREHENSIVE CSS STYLESHEET */}
      <style jsx global>{`
        /* 1. Global Reset & Overrides */
        .landing-layout-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--background);
          color: var(--text-primary);
          overflow-x: hidden;
          position: relative;
        }

        /* 2. Glow Mesh Blobs background */
        .glow-mesh-blobs {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .glow-blob-1 {
          position: absolute;
          top: -150px;
          right: -100px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(91, 127, 166, 0.12) 0%, rgba(91, 127, 166, 0) 70%);
          filter: blur(80px);
          animation: floatAura1 25s infinite alternate ease-in-out;
        }
        .glow-blob-2 {
          position: absolute;
          top: 600px;
          left: -150px;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(125, 170, 143, 0.1) 0%, rgba(125, 170, 143, 0) 70%);
          filter: blur(80px);
          animation: floatAura2 20s infinite alternate ease-in-out;
        }
        .glow-blob-3 {
          position: absolute;
          bottom: 200px;
          right: -200px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(169, 146, 196, 0.08) 0%, rgba(169, 146, 196, 0) 70%);
          filter: blur(80px);
          animation: floatAura1 22s infinite alternate-reverse ease-in-out;
        }

        @keyframes floatAura1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-80px, 40px) scale(1.1); }
        }
        @keyframes floatAura2 {
          0% { transform: translate(0, 0) scale(1.1); }
          100% { transform: translate(60px, -60px) scale(0.9); }
        }

        /* 3. Top Navbar styling */
        .landing-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 60px;
          border-bottom: 1px solid var(--border-light);
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        html.dark .landing-navbar {
          background: rgba(30, 34, 40, 0.55);
        }
        .nav-brand-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-logo-box {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primary) 0%, #4a6c91 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(91, 127, 166, 0.35);
        }
        .nav-brand-text {
          font-family: var(--font-header);
          font-size: 22px;
          font-weight: 500;
          letter-spacing: -0.5px;
        }
        .brand-accent-text {
          color: var(--color-secondary);
        }
        .nav-actions-container {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nav-text-anchor {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: color 0.25s ease;
        }
        .nav-text-anchor:hover {
          color: var(--text-primary);
        }
        .nav-cta-button {
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          background-color: var(--color-primary);
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(91, 127, 166, 0.2);
          transition: all 0.25s ease;
        }
        .nav-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(91, 127, 166, 0.35);
        }

        /* 4. Hero layout */
        .landing-main-space {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 60px 40px;
          z-index: 10;
        }
        .landing-hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
          margin-bottom: 90px;
        }
        .hero-content-column {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .hero-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(125, 170, 143, 0.12);
          padding: 6px 16px;
          border-radius: 20px;
          color: var(--color-secondary);
          font-size: 14px;
          font-weight: 600;
          width: fit-content;
          border: 1px solid rgba(125, 170, 143, 0.2);
        }
        .hero-title-heading {
          font-size: 54px;
          line-height: 1.15;
          font-weight: 500;
          font-family: var(--font-header);
        }
        .gradient-highlight-text {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-paragraph-description {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Hero mood selector */
        .hero-interactive-mood-selector {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid var(--border-light);
          backdrop-filter: blur(8px);
        }
        html.dark .hero-interactive-mood-selector {
          background: rgba(42, 47, 56, 0.25);
        }
        .mood-selector-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .mood-tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .mood-tag-pill {
          padding: 8px 16px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mood-tag-pill:hover {
          transform: translateY(-1px);
          color: var(--text-primary);
        }
        .mood-tag-pill.active-calm {
          background: rgba(90, 148, 117, 0.12);
          border-color: var(--color-success);
          color: var(--color-success);
          box-shadow: 0 4px 12px rgba(90, 148, 117, 0.15);
        }
        .mood-tag-pill.active-anxious {
          background: rgba(169, 146, 196, 0.12);
          border-color: var(--color-accent);
          color: var(--color-accent);
          box-shadow: 0 4px 12px rgba(169, 146, 196, 0.15);
        }
        .mood-tag-pill.active-stressed {
          background: rgba(192, 118, 90, 0.12);
          border-color: var(--color-error);
          color: var(--color-error);
          box-shadow: 0 4px 12px rgba(192, 118, 90, 0.15);
        }
        .mood-tag-pill.active-energetic {
          background: rgba(125, 170, 143, 0.12);
          border-color: var(--color-secondary);
          color: var(--color-secondary);
          box-shadow: 0 4px 12px rgba(125, 170, 143, 0.15);
        }

        .hero-actions-container {
          display: flex;
          gap: 16px;
        }
        .hero-primary-cta {
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 14px;
          background-color: var(--color-primary);
          color: #FFFFFF;
          box-shadow: 0 6px 20px rgba(91, 127, 166, 0.25);
          transition: all 0.25s ease;
        }
        .hero-primary-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(91, 127, 166, 0.4);
        }
        .hero-secondary-cta {
          padding: 13px 31px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 14px;
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-light);
          color: var(--text-primary);
          transition: all 0.25s ease;
        }
        .hero-secondary-cta:hover {
          transform: translateY(-2px);
          background-color: var(--bg-nav);
          border-color: var(--text-secondary);
        }

        .hero-mascot-column {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-mascot-wrapper {
          padding: 50px 40px 40px;
          border-radius: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          box-shadow: var(--shadow-hover);
          overflow: visible;
          width: 100%;
          max-width: 380px;
        }

        .mascot-card-aura {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(167, 139, 250, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .mascot-card-instructions {
          margin-top: 24px;
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
          text-align: center;
        }

        /* 5. Section Blocks general styling */
        .landing-section-block {
          margin-bottom: 90px;
        }
        .section-title-zone {
          text-align: center;
          margin-bottom: 48px;
        }
        .section-title-heading {
          font-size: 36px;
          font-family: var(--font-header);
          font-weight: 500;
          margin-bottom: 12px;
        }
        .section-subtitle-text {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        /* 6. Companion Spirit Showcase */
        .companion-showcase-container {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 40px;
          align-items: stretch;
        }
        .companion-cards-deck {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .companion-select-card {
          width: 100%;
          padding: 20px 24px;
          border-radius: 20px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .companion-select-card:hover {
          transform: translateX(6px);
          background: rgba(255, 255, 255, 0.8);
        }
        html.dark .companion-select-card:hover {
          background: rgba(42, 47, 56, 0.6);
        }
        .selected-companion-active {
          border-color: var(--color-primary) !important;
          background: rgba(91, 127, 166, 0.08) !important;
          box-shadow: 0 4px 16px rgba(91, 127, 166, 0.15);
        }
        .companion-card-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .companion-card-label {
          font-family: var(--font-header);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .companion-card-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 10px;
          border-radius: 8px;
          background: var(--bg-nav);
          color: var(--text-secondary);
        }
        .selected-companion-active .companion-card-badge {
          background: rgba(91, 127, 166, 0.15);
          color: var(--color-primary);
        }

        .companion-featured-viewer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
          padding: 40px;
          position: relative;
          min-height: 320px;
        }
        .viewer-model-aura {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: radial-gradient(circle at center, rgba(125, 170, 143, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }
        .featured-viewer-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .featured-companion-name {
          font-size: 26px;
          font-family: var(--font-header);
          font-weight: 500;
        }
        .featured-companion-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-secondary);
          letter-spacing: 0.5px;
        }
        .featured-companion-desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .featured-chat-cta-row {
          margin-top: 8px;
        }
        .featured-chat-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-primary);
          transition: transform 0.2s;
        }
        .featured-chat-link:hover {
          transform: translateX(4px);
        }
        .cta-chevron {
          transition: transform 0.25s ease;
        }
        .featured-chat-link:hover .cta-chevron {
          transform: translateX(4px);
        }
        .featured-viewer-model {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        /* 7. Pillars Grid */
        .pillars-grid-layout {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .pillar-glass-card {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 32px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pillar-glass-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-hover);
        }
        .pillar-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        .pillar-icon-box.primary-tint {
          background: rgba(91, 127, 166, 0.12);
          color: var(--color-primary);
        }
        .pillar-icon-box.secondary-tint {
          background: rgba(125, 170, 143, 0.12);
          color: var(--color-secondary);
        }
        .pillar-icon-box.accent-tint {
          background: rgba(169, 146, 196, 0.12);
          color: var(--color-accent);
        }
        .pillar-heading {
          font-size: 22px;
          font-family: var(--font-header);
          font-weight: 500;
        }
        .pillar-body-text {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* 8. Widgets Grid Layout */
        .widgets-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 90px;
        }
        .demo-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .demo-pill-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-primary);
        }
        .demo-title {
          font-size: 24px;
          font-family: var(--font-header);
          font-weight: 500;
        }
        .demo-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* Interactive Breathing Pacer widget styling */
        .interactive-breathing-demo {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
        }
        .breathing-orb-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 240px;
          margin: 10px 0;
        }
        .breathing-core-orb {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 14px;
          z-index: 10;
          box-shadow: 0 8px 30px rgba(91, 127, 166, 0.25);
          transition: transform 3.8s ease-in-out, background 0.8s ease;
        }
        .breathing-orb-prompt {
          font-size: 13px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .breathing-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px dashed rgba(255, 255, 255, 0.5);
          pointer-events: none;
          z-index: 5;
          transition: transform 3.8s ease-in-out, border-color 0.8s ease;
        }
        .ring-outer {
          width: 200px;
          height: 200px;
          opacity: 0.3;
        }
        .ring-middle {
          width: 155px;
          height: 155px;
          opacity: 0.45;
        }

        /* Breathing State Animators */
        .breathing-core-orb.pacer-in {
          transform: scale(1.5);
          background: linear-gradient(135deg, var(--color-success) 0%, var(--color-secondary) 100%);
          box-shadow: 0 12px 40px rgba(90, 148, 117, 0.45);
        }
        .breathing-ring.ring-outer.pacer-in {
          transform: scale(1.4);
          border-color: var(--color-success);
        }
        .breathing-ring.ring-middle.pacer-in {
          transform: scale(1.45);
          border-color: var(--color-secondary);
        }

        .breathing-core-orb.pacer-hold {
          transform: scale(1.5);
          background: linear-gradient(135deg, var(--color-accent) 0%, #8b7ab6 100%);
          box-shadow: 0 12px 40px rgba(169, 146, 196, 0.45);
        }
        .breathing-ring.ring-outer.pacer-hold {
          transform: scale(1.4);
          border-color: var(--color-accent);
        }
        .breathing-ring.ring-middle.pacer-hold {
          transform: scale(1.45);
          border-color: var(--color-accent);
        }

        .breathing-core-orb.pacer-out {
          transform: scale(1.0);
          background: linear-gradient(135deg, var(--color-primary) 0%, #4a6c91 100%);
          box-shadow: 0 8px 24px rgba(91, 127, 166, 0.2);
        }
        .breathing-ring.ring-outer.pacer-out {
          transform: scale(1.0);
          border-color: var(--color-primary);
        }
        .breathing-ring.ring-middle.pacer-out {
          transform: scale(1.0);
          border-color: var(--color-primary);
        }

        .breathing-controls-row {
          display: flex;
          justify-content: center;
        }
        .breathing-action-btn {
          padding: 12px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          background: var(--bg-surface);
          border: 1.5px solid var(--border-light);
          color: var(--color-primary);
          transition: all 0.25s ease;
        }
        .breathing-action-btn:hover {
          transform: translateY(-1px);
          background: var(--bg-nav);
          border-color: var(--color-primary);
        }
        .breathing-action-btn.active-running {
          background: rgba(192, 118, 90, 0.1);
          color: var(--color-error);
          border-color: var(--color-error);
        }

        /* Interactive Diagnostic Screener widget styling */
        .interactive-screener-demo {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
        }
        .screener-questions-box {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin: 12px 0;
        }
        .screener-question-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .question-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .screener-options-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .screener-option-btn {
          padding: 8px 4px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          text-align: center;
          transition: all 0.2s ease;
        }
        .screener-option-btn:hover {
          border-color: var(--text-secondary);
        }
        .option-selected-error {
          border-color: var(--color-error) !important;
          background: rgba(192, 118, 90, 0.08) !important;
          color: var(--color-error) !important;
        }
        .option-selected-success {
          border-color: var(--color-success) !important;
          background: rgba(90, 148, 117, 0.08) !important;
          color: var(--color-success) !important;
        }

        .screener-result-hud {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-radius: 16px;
          background: var(--bg-nav);
          border: 1px solid var(--border-light);
          margin-top: 10px;
        }
        .screener-gauge-container {
          display: flex;
          flex-direction: column;
        }
        .gauge-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }
        .gauge-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .screener-recommendation-note {
          font-size: 12px;
          font-weight: 600;
        }
        .note-text-danger {
          color: var(--color-error);
        }
        .note-text-healthy {
          color: var(--color-success);
        }

        /* 9. Telemetry Analytics mockup */
        .analytics-mock-wrapper {
          padding: 40px;
        }
        .mock-graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .graph-category {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-primary);
          letter-spacing: 0.5px;
        }
        .graph-title {
          font-size: 20px;
          font-family: var(--font-header);
          font-weight: 500;
        }
        .graph-metric-badge {
          font-size: 13px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 12px;
          background: rgba(91, 127, 166, 0.12);
          color: var(--color-primary);
        }
        .mock-svg-chart-container {
          width: 100%;
          overflow: hidden;
        }
        .mock-svg-element {
          width: 100%;
          height: auto;
          display: block;
        }
        .animated-draw-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawChartPath 2.5s ease-out forwards;
        }
        @keyframes drawChartPath {
          to { stroke-dashoffset: 0; }
        }

        /* 10. Crisis SOS Ribbon */
        .crisis-banner-ribbon {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 2px solid var(--color-error);
          border-radius: 24px;
          padding: 32px 40px;
          background: rgba(192, 118, 90, 0.04);
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 50px;
        }
        .crisis-ribbon-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .crisis-ribbon-icon {
          flex-shrink: 0;
        }
        .crisis-ribbon-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .crisis-ribbon-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-error);
        }
        .crisis-ribbon-description {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 650px;
        }
        .crisis-ribbon-cta {
          padding: 12px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          background-color: var(--color-error);
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(192, 118, 90, 0.25);
          transition: all 0.25s ease;
        }
        .crisis-ribbon-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(192, 118, 90, 0.4);
        }

        /* 11. Footer */
        .landing-footer-wrapper {
          border-top: 1px solid var(--border-light);
          padding: 40px 60px;
          text-align: center;
          background-color: var(--bg-nav);
          font-size: 14px;
          color: var(--text-secondary);
          z-index: 10;
        }
        .footer-copyright-note {
          margin-bottom: 12px;
          fontWeight: 600;
          color: var(--text-primary);
        }
        .footer-legal-disclaimer {
          max-width: 850px;
          margin: 0 auto;
          font-size: 12px;
          line-height: 1.6;
        }

        /* 12. Responsive Breakpoints */
        @media (max-width: 1024px) {
          .landing-navbar {
            padding: 20px 40px;
          }
          .landing-hero-grid {
            grid-template-columns: 1fr;
            gap: 48px;
            text-align: center;
          }
          .hero-content-column {
            align-items: center;
          }
          .hero-interactive-mood-selector {
            align-items: center;
            width: 100%;
          }
          .mood-tag-container {
            justify-content: center;
          }
          .companion-showcase-container {
            grid-template-columns: 1fr;
          }
          .companion-select-card:hover {
            transform: translateY(-2px);
          }
          .pillars-grid-layout {
            grid-template-columns: 1fr;
          }
          .widgets-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .landing-navbar {
            padding: 16px 20px;
          }
          .landing-main-space {
            padding: 40px 20px;
          }
          .hero-title-heading {
            font-size: 38px;
          }
          .companion-featured-viewer {
            grid-template-columns: 1fr;
            padding: 24px;
            text-align: center;
          }
          .featured-viewer-content {
            align-items: center;
          }
          .screener-options-row {
            grid-template-columns: 1fr 1fr;
          }
          .screener-result-hud {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          .crisis-banner-ribbon {
            padding: 24px;
            text-align: center;
          }
          .crisis-ribbon-content {
            flex-direction: column;
          }
          .crisis-ribbon-cta {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
