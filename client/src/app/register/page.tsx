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

      {/* Main Content Area: Centered, Beautiful Glassmorphic layout */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          width: "100%",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "stretch",
            gap: "32px",
            width: "100%",
            maxWidth: "1000px",
          }}
          className="auth-main-layout"
        >
          {/* Left Side: Premium Centered Glassmorphic Form Card */}
          <div
            className="glass-card"
            style={{
              flex: "1 1 450px",
              maxWidth: "500px",
              padding: "40px",
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              backgroundColor: "var(--bg-surface)",
              border: "1.5px solid var(--border-light)",
              boxShadow: "var(--shadow-hover)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {/* Header section inside card */}
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontFamily: "var(--font-header)",
                  marginBottom: "8px",
                  fontWeight: "500",
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
                      strokeWidth="2"
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
                      borderRadius: "12px",
                      paddingLeft: "48px",
                      backgroundColor: "var(--bg-surface)",
                      border: "1.5px solid var(--border-input)",
                      color: "var(--text-primary)",
                      width: "100%",
                      fontSize: "15px",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
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
                      strokeWidth="2"
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
                      borderRadius: "12px",
                      paddingLeft: "48px",
                      backgroundColor: "var(--bg-surface)",
                      border: "1.5px solid var(--border-input)",
                      color: "var(--text-primary)",
                      width: "100%",
                      fontSize: "15px",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
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
                      strokeWidth="2"
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
                      borderRadius: "12px",
                      paddingLeft: "48px",
                      paddingRight: "48px",
                      backgroundColor: "var(--bg-surface)",
                      border: "1.5px solid var(--border-input)",
                      color: "var(--text-primary)",
                      width: "100%",
                      fontSize: "15px",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-text" style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(192, 118, 90, 0.08)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{
                  height: "50px",
                  borderRadius: "25px",
                  fontSize: "15px",
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontWeight: "600",
                  width: "100%",
                }}
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

          {/* Right Side: Interactive Mascot & Welcoming Aesthetic Panel */}
          <div
            className="glass-card"
            style={{
              flex: "1 1 350px",
              maxWidth: "400px",
              padding: "40px",
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg-surface)",
              border: "1.5px solid var(--border-light)",
              boxShadow: "var(--shadow-hover)",
              textAlign: "center",
              gap: "24px",
            }}
          >
            {/* The Unified Mascot Component */}
            <Mascot
              pose="waving-hello"
              size={200}
              dialogue="Welcome! I'm Sparky, and I can't wait to be friends and walk this path of calm together."
              interactive={true}
            />

            <div>
              <h3 style={{ fontSize: "22px", fontFamily: "var(--font-header)", marginBottom: "8px", fontWeight: "500" }}>
                We Listen Gently
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", lineHeight: "1.6" }}>
                No judgment, no pressure. Your pace is the perfect pace. Start your premium mental support dashboard today.
              </p>
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                backgroundColor: "rgba(90, 148, 117, 0.08)",
                padding: "8px 14px",
                borderRadius: "20px",
                fontWeight: "500",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 8.5C17 15 15 18 11 20z"/><path d="M19 2c-2.26 4.33-5.27 7.14-8 10"/></svg> Zero judgment. Absolute serenity.
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
          transition: color 0.2s ease;
        }
        .auth-switch-link:hover {
          color: var(--color-secondary) !important;
          text-decoration: underline;
        }
        .auth-input-field:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(91, 127, 166, 0.15) !important;
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
      `}</style>
    </div>
  );
}


