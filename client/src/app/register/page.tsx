"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Detect system theme or current body setup
    const isDark = document.documentElement.classList.contains("dark") || 
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "dark" : "light");

    // Listen to document-level class changes (e.g. from Header toggle button)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const classList = document.documentElement.classList;
          setTheme(classList.contains("dark") ? "dark" : "light");
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // Listen to media query changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const hasExplicitTheme = document.documentElement.classList.contains("dark") || 
        document.documentElement.classList.contains("light");
      if (!hasExplicitTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name || undefined);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background)",
        color: "var(--text-primary)",
        transition: "background-color 0.6s ease, color 0.6s ease",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Drifting Aura Bubbles for Dashboard Ambience */}
      <div
        className="calm-bubble bubble-1"
        style={{
          width: "500px",
          height: "500px",
          top: "-100px",
          right: "-150px",
          background: isDark 
            ? "radial-gradient(circle, rgba(169, 146, 196, 0.15) 0%, rgba(0,0,0,0) 70%)" 
            : "radial-gradient(circle, rgba(91, 127, 166, 0.12) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      <div
        className="calm-bubble bubble-2"
        style={{
          width: "600px",
          height: "600px",
          bottom: "-150px",
          left: "45%",
          background: isDark 
            ? "radial-gradient(circle, rgba(91, 127, 166, 0.12) 0%, rgba(0,0,0,0) 70%)" 
            : "radial-gradient(circle, rgba(125, 170, 143, 0.12) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Lightweight Navigation Header based on Dashboard Header style */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 40px",
          borderBottom: "1px solid var(--border-light)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 80,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
        </Link>

        {/* Theme Switcher Button exactly like Dashboard Header */}
        <button
          onClick={toggleTheme}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            border: "1.5px solid var(--border-light)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            boxShadow: "var(--shadow-subtle)",
          }}
          className="header-action-btn"
          title="Toggle Theme"
          type="button"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </nav>

      {/* Main Content Area: Split Two-Section Layout */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          width: "100%",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div className="split-layout-container">
          {/* Left Column: Premium Form Card with peeking mascot */}
          <div className="left-form-column">
            <div style={{ position: "relative", width: "100%", maxWidth: "460px" }}>
              {/* Peeking Waving Mascot Badge */}
              <div 
                style={{ 
                  position: "absolute",
                  top: "-70px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  pointerEvents: "auto",
                }}
              >
                <Mascot
                  pose="waving-hello"
                  size={130}
                  interactive={true}
                />
              </div>

              {/* Centered Glassmorphic Form Card */}
              <div
                className="glass-card auth-login-card"
                style={{
                  width: "100%",
                  padding: "48px 40px",
                  borderRadius: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1.5px solid var(--border-light)",
                  boxShadow: "var(--shadow-hover)",
                  marginTop: "30px", /* Make room for the peeking mascot */
                }}
              >
                {/* Header section inside card */}
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <h2
                    style={{
                      fontSize: "30px",
                      fontFamily: "var(--font-header)",
                      marginBottom: "8px",
                      fontWeight: "500",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Create Account
                  </h2>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "14.5px",
                      lineHeight: "1.5",
                    }}
                  >
                    Begin your path to mindfulness, calm reflection, and emotional balance today.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <label
                      htmlFor="name"
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "var(--color-primary)",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Preferred Name
                    </label>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          display: "flex",
                          alignItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ opacity: 0.8 }}
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <input
                        id="name"
                        type="text"
                        placeholder="Rishabh"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          height: "50px",
                          borderRadius: "14px",
                          paddingLeft: "48px",
                          backgroundColor: "var(--bg-surface)",
                          border: "1.5px solid var(--border-input)",
                          color: "var(--text-primary)",
                          width: "100%",
                          fontSize: "15px",
                          outline: "none",
                        }}
                        className="auth-input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "var(--color-primary)",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Email Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          display: "flex",
                          alignItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ opacity: 0.8 }}
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          height: "50px",
                          borderRadius: "14px",
                          paddingLeft: "48px",
                          backgroundColor: "var(--bg-surface)",
                          border: "1.5px solid var(--border-input)",
                          color: "var(--text-primary)",
                          width: "100%",
                          fontSize: "15px",
                          outline: "none",
                        }}
                        className="auth-input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "var(--color-primary)",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          display: "flex",
                          alignItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ opacity: 0.8 }}
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          height: "50px",
                          borderRadius: "14px",
                          paddingLeft: "48px",
                          paddingRight: "48px",
                          backgroundColor: "var(--bg-surface)",
                          border: "1.5px solid var(--border-input)",
                          color: "var(--text-primary)",
                          width: "100%",
                          fontSize: "15px",
                          outline: "none",
                        }}
                        className="auth-input-field"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="error-text animate-fade-in" style={{ padding: "12px 16px", borderRadius: "12px", backgroundColor: "rgba(192, 118, 90, 0.08)" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", lineHeight: "1.4" }}>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary-auth"
                    disabled={loading}
                  >
                    {loading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="spinner" />
                        <span>Aligning Mind...</span>
                      </div>
                    ) : (
                      <>
                        <span>Agree & Register</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                {/* Alternate Option link */}
                <div style={{ textAlign: "center", fontSize: "14.5px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Already have an account? </span>
                  <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: "600" }} className="auth-switch-link">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Journey Illustration Panel */}
          <div className="right-illustration-column">
            {/* Drifting subtle aura inside illustration container */}
            <div
              style={{
                position: "absolute",
                width: "400px",
                height: "400px",
                bottom: "10%",
                left: "-50px",
                background: "radial-gradient(circle, rgba(125, 170, 143, 0.12) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            
            <div className="illustration-card-container">
              {/* Header inside right panel */}
              <div style={{ textAlign: "center", maxWidth: "520px", marginBottom: "16px" }}>
                <h2 style={{ fontFamily: "var(--font-header)", fontSize: "28px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>
                  Your SereneMind Companions
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                  Meet Pandi, Ollie, Sparky, and Goldie. We are all standing right beside you on your path to mindfulness and peace.
                </p>
              </div>

              {/* Overlapping Mascot Scene */}
              <div className="mascots-scenic-platform">
                {/* Visual wood/lawn ground platform deck */}
                <div className="scenic-platform-base" />

                {/* Fireflies / Calm drifting particles */}
                <div className="firefly firefly-1" />
                <div className="firefly firefly-2" />
                <div className="firefly firefly-3" />
                <div className="firefly firefly-4" />

                {/* Pandi */}
                <div className="scenic-mascot-wrapper mascot-pandi" style={{ marginRight: "-28px", zIndex: 11 }}>
                  <div className="scenic-speech-bubble">
                    "A single step is the start of a beautiful journey."
                  </div>
                  <img src="/mascot/pandi-pandi-yoga.svg" className="scenic-mascot-img" alt="Pandi" />
                  <span className="scenic-mascot-label">Pandi</span>
                </div>

                {/* Ollie the Otter */}
                <div className="scenic-mascot-wrapper mascot-otter" style={{ marginRight: "-22px", zIndex: 12 }}>
                  <div className="scenic-speech-bubble">
                    "Jump on! Let's roll forward into our new path."
                  </div>
                  <img src="/mascot/otter-otter-skateboard.svg" className="scenic-mascot-img" alt="Ollie" />
                  <span className="scenic-mascot-label">Ollie</span>
                </div>

                {/* Sparky the Hamster */}
                <div className="scenic-mascot-wrapper mascot-sparky" style={{ marginRight: "-28px", zIndex: 13 }}>
                  <div className="scenic-speech-bubble">
                    "Breathe with us. We are so excited you are starting!"
                  </div>
                  <img src="/mascot/golden-hamster-golden-hamster-sitting-zen.svg" className="scenic-mascot-img" alt="Sparky" />
                  <span className="scenic-mascot-label">Sparky</span>
                </div>

                {/* Goldie the Pup */}
                <div className="scenic-mascot-wrapper mascot-goldie" style={{ zIndex: 10 }}>
                  <div className="scenic-speech-bubble">
                    "Welcome to SereneMind! I'm here to cheer you on."
                  </div>
                  <img src="/mascot/goldie-goldie-greeting.svg" className="scenic-mascot-img" alt="Goldie" />
                  <span className="scenic-mascot-label">Goldie</span>
                </div>
              </div>

              {/* Glassmorphic Quotes overlay */}
              <div className="quote-overlay-card" style={{ marginTop: "16px", width: "100%" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", fontStyle: "italic", margin: 0 }}>
                  "A beautiful space built to understand, comfort, and guide you. Sparky and friends are so excited to meet you."
                </p>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    backgroundColor: "rgba(90, 148, 117, 0.08)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontWeight: "500",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "14px",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 8.5C17 15 15 18 11 20z"/><path d="M19 2c-2.26 4.33-5.27 7.14-8 10"/></svg> Zero judgment. Absolute Serenity.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Beautiful Calming Footer aligned with Landing Page */}
      <footer
        style={{
          borderTop: "1px solid var(--border-light)",
          padding: "32px 24px",
          textAlign: "center",
          backgroundColor: "var(--bg-nav)",
          fontSize: "13.5px",
          color: "var(--text-secondary)",
          marginTop: "auto",
        }}
      >
        <p style={{ marginBottom: "8px", fontWeight: "500" }}>
          &copy; {new Date().getFullYear()} SereneMind. Built with absolute empathy and privacy.
        </p>
        <p style={{ maxWidth: "800px", margin: "0 auto", fontSize: "11.5px", opacity: 0.8, lineHeight: "1.6" }}>
          Disclaimer: SereneMind is an AI-driven support companion designed for emotional journaling and coping exercises. It is not a replacement for clinical therapy, psychiatric treatment, or emergency mental health services.
        </p>
      </footer>

      <style jsx global>{`
        .header-action-btn:hover {
          border-color: var(--color-primary) !important;
          color: var(--color-primary) !important;
          transform: translateY(-1px);
        }
        .header-action-btn:active {
          transform: translateY(0);
        }
        .auth-switch-link {
          color: var(--color-primary);
          font-weight: 600;
          text-decoration: none;
          position: relative;
          transition: color 0.3s ease;
        }
        .auth-switch-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: -2px;
          left: 0;
          background-color: var(--color-secondary);
          transform-origin: bottom right;
          transition: transform 0.25s ease-out;
        }
        .auth-switch-link:hover {
          color: var(--color-secondary) !important;
        }
        .auth-switch-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        .auth-input-field {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .auth-input-field:hover {
          border-color: var(--color-primary);
          opacity: 0.95;
        }
        .auth-input-field:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(91, 127, 166, 0.15) !important;
        }
        .btn-primary-auth {
          height: 50px;
          border-radius: 25px;
          font-size: 15px;
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          width: 100%;
          background-color: var(--color-primary);
          color: #ffffff;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(91, 127, 166, 0.25);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-primary-auth:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(91, 127, 166, 0.4);
          background-color: var(--color-primary);
          opacity: 0.96;
        }
        .btn-primary-auth:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .btn-primary-auth:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .calm-bubble { position: absolute; border-radius: 50%; pointer-events: none; }
        .bubble-1 { animation: float-bubble-1 25s ease-in-out infinite alternate; }
        .bubble-2 { animation: float-bubble-2 20s ease-in-out infinite alternate; }
        @keyframes float-bubble-1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(80px, -60px) scale(1.15); } }
        @keyframes float-bubble-2 { 0% { transform: translate(0, 0) scale(1.1); } 100% { transform: translate(-60px, 80px) scale(0.9); } }
        
        /* Two-section split styles */
        .split-layout-container {
          display: flex;
          width: 100%;
          min-height: calc(100vh - 89px);
        }
        .left-form-column {
          flex: 1 1 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px 40px;
          z-index: 2;
        }
        .right-illustration-column {
          flex: 1 1 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          background: linear-gradient(135deg, rgba(91, 127, 166, 0.12) 0%, rgba(125, 170, 143, 0.08) 100%);
          border-left: 1px solid var(--border-light);
          overflow: hidden;
          z-index: 2;
        }
        .illustration-card-container {
          width: 100%;
          max-width: 580px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .illustration-card-container:hover {
          transform: translateY(-8px);
        }
        /* Scenic mascot platform styles */
        .mascots-scenic-platform {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          position: relative;
          width: 100%;
          max-width: 580px;
          height: 280px;
          padding-bottom: 30px;
          margin-bottom: 15px;
        }
        .scenic-platform-base {
          position: absolute;
          bottom: 18px;
          left: 5%;
          right: 5%;
          height: 48px;
          border-radius: 50% / 20px;
          background: linear-gradient(180deg, var(--bg-surface) 0%, var(--border-light) 100%);
          box-shadow: 0 12px 28px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1);
          border: 1px solid var(--border-light);
          z-index: 5;
        }
        html.dark .scenic-platform-base {
          background: linear-gradient(180deg, rgba(42, 47, 56, 0.9) 0%, rgba(20, 22, 28, 0.9) 100%);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 12px 28px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .scenic-mascot-wrapper {
          position: relative;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 145px;
          height: 185px;
          z-index: 10;
        }
        .scenic-mascot-wrapper:hover {
          transform: scale(1.18) translateY(-14px);
          z-index: 30 !important;
        }
        .scenic-mascot-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.05));
          transition: filter 0.3s ease;
        }
        .scenic-mascot-wrapper:hover .scenic-mascot-img {
          filter: drop-shadow(0 12px 24px rgba(91, 127, 166, 0.3)) drop-shadow(0 0 12px rgba(167, 139, 250, 0.25));
        }
        .scenic-speech-bubble {
          position: absolute;
          bottom: 195px;
          background-color: rgba(18, 19, 38, 0.95);
          color: #EAE8E3;
          padding: 10px 14px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35), 0 0 15px rgba(167, 139, 250, 0.15);
          border: 1px solid rgba(167, 139, 250, 0.35);
          font-size: 11px;
          font-weight: 500;
          width: 170px;
          text-align: center;
          pointer-events: none;
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 40;
          backdrop-filter: blur(8px);
          line-height: 1.4;
        }
        .scenic-speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background-color: rgba(18, 19, 38, 0.95);
          border-right: 1px solid rgba(167, 139, 250, 0.35);
          border-bottom: 1px solid rgba(167, 139, 250, 0.35);
        }
        .scenic-mascot-wrapper:hover .scenic-speech-bubble {
          opacity: 1;
          transform: translateY(0);
        }
        .scenic-mascot-label {
          position: absolute;
          bottom: -22px;
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
          transition: all 0.3s ease;
          opacity: 0.8;
          text-transform: uppercase;
        }
        .scenic-mascot-wrapper:hover .scenic-mascot-label {
          opacity: 1;
          color: var(--color-primary);
          border-color: var(--color-primary);
          box-shadow: 0 4px 10px rgba(91, 127, 166, 0.1);
        }
        
        /* Drifting Fireflies */
        .firefly {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: rgba(167, 139, 250, 0.5);
          border-radius: 50%;
          filter: blur(1px);
          pointer-events: none;
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.8), 0 0 20px rgba(167, 139, 250, 0.4);
          z-index: 6;
        }
        .firefly-1 {
          top: 10%;
          left: 20%;
          animation: drift-firefly-1 18s ease-in-out infinite;
        }
        .firefly-2 {
          top: 30%;
          right: 15%;
          animation: drift-firefly-2 15s ease-in-out infinite;
        }
        .firefly-3 {
          bottom: 25%;
          left: 30%;
          animation: drift-firefly-3 20s ease-in-out infinite;
        }
        .firefly-4 {
          top: 50%;
          left: 45%;
          animation: drift-firefly-1 22s ease-in-out infinite alternate;
        }
        @keyframes drift-firefly-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(30px, -40px) scale(1.5); opacity: 0.9; }
          100% { transform: translate(-20px, -80px) scale(1); opacity: 0.3; }
        }
        @keyframes drift-firefly-2 {
          0% { transform: translate(0, 0) scale(1.2); opacity: 0.8; }
          50% { transform: translate(-50px, -20px) scale(0.8); opacity: 0.2; }
          100% { transform: translate(10px, -60px) scale(1.2); opacity: 0.8; }
        }
        @keyframes drift-firefly-3 {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0.2; }
          50% { transform: translate(40px, -30px) scale(1.4); opacity: 0.9; }
          100% { transform: translate(-10px, -10px) scale(0.8); opacity: 0.2; }
        }

        .quote-overlay-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          text-align: center;
        }
        html.dark .quote-overlay-card {
          background: rgba(42, 47, 56, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile Responsive adjustments */
        @media (max-width: 1023px) {
          .right-illustration-column {
            display: none;
          }
          .left-form-column {
            flex: 1 1 100%;
            padding: 80px 16px 40px;
          }
          .split-layout-container {
            min-height: calc(100vh - 89px);
          }
        }
      `}</style>
    </div>
  );
}



