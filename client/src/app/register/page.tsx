"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  const isDark = theme === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "0.95fr 1.05fr",
        backgroundImage: isDark 
          ? "url('/images/zen-mascot-dark.png')" 
          : "url('/images/zen-mascot-light.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
        transition: "background-image 0.600s ease"
      }}
      className="auth-split-layout"
    >
      {/* Giant Soft Floating Calming Aura Bubbles in Background */}
      <div
        className="calm-bubble bubble-1"
        style={{
          width: "500px",
          height: "500px",
          top: "-100px",
          right: "-150px",
          background: isDark 
            ? "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%)" 
            : "radial-gradient(circle, rgba(91, 127, 166, 0.15) 0%, rgba(0,0,0,0) 70%)",
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
            : "radial-gradient(circle, rgba(125, 170, 143, 0.15) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Left Column - Starry Garden Panel with Illustrated Hamster */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "48px 40px",
          position: "relative",
          zIndex: 10,
        }}
        className="auth-mascot-panel"
      >

        {/* Absolute speech bubble positioned exactly above illustrated hamster's head */}
        <div
          style={{
            position: "absolute",
            top: "28%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: isDark ? "rgba(18, 19, 38, 0.85)" : "rgba(255, 255, 255, 0.9)",
            color: isDark ? "#EAE8E3" : "#2C2F35",
            padding: "14px 18px",
            borderRadius: "18px",
            boxShadow: isDark 
              ? "0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(167, 139, 250, 0.1)" 
              : "0 10px 30px rgba(0, 0, 0, 0.05), 0 0 15px rgba(91, 127, 166, 0.05)",
            border: isDark 
              ? "1.5px solid rgba(167, 139, 250, 0.3)" 
              : "1.5px solid rgba(91, 127, 166, 0.25)",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "260px",
            textAlign: "center",
            zIndex: 15,
            pointerEvents: "none",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            transition: "all 0.600s ease"
          }}
          className="sway-speech-bubble"
        >
          Welcome! I'm Sparky, and I can't wait to be friends and walk this path of calm together.
          {/* Bubble tail pointer */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "14px",
              height: "14px",
              backgroundColor: isDark ? "rgba(18, 19, 38, 0.85)" : "rgba(255, 255, 255, 0.9)",
              borderRight: isDark ? "1.5px solid rgba(167, 139, 250, 0.3)" : "1.5px solid rgba(91, 127, 166, 0.25)",
              borderBottom: isDark ? "1.5px solid rgba(167, 139, 250, 0.3)" : "1.5px solid rgba(91, 127, 166, 0.25)",
              transition: "all 0.600s ease"
            }}
          />
        </div>

        {/* Floating panel subtext overlay */}
        <div style={{ textAlign: "center", maxWidth: "380px", zIndex: 11 }}>
          <h3 style={{ fontSize: "22px", fontFamily: "var(--font-header)", marginBottom: "8px", fontWeight: "500", color: isDark ? "#FFFFFF" : "#2C2F35" }}>We Listen Gently</h3>
          <p style={{ color: isDark ? "#EAE8E3" : "#4B5563", fontSize: "14.5px", lineHeight: "1.6", fontWeight: "500", textShadow: isDark ? "0 2px 4px rgba(0,0,0,0.5)" : "0 1px 2px rgba(255,255,255,0.8)" }}>
            No judgment, no pressure. Your pace is the perfect pace. Start your premium mental support dashboard today.
          </p>
        </div>
      </div>

      {/* Right Column - Input Form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          position: "relative",
          zIndex: 10,
          background: isDark
            ? "linear-gradient(to left, rgba(17, 18, 34, 0.85) 0%, rgba(17, 18, 34, 0.6) 70%, rgba(17, 18, 34, 0) 100%)"
            : "linear-gradient(to left, rgba(244, 241, 236, 0.9) 0%, rgba(244, 241, 236, 0.6) 70%, rgba(244, 241, 236, 0) 100%)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "48px 40px",
            borderRadius: "28px",
            backgroundColor: isDark ? "rgba(18, 19, 38, 0.75)" : "rgba(255, 255, 255, 0.85)",
            border: isDark 
              ? "2.5px solid rgba(167, 139, 250, 0.25)" 
              : "2.5px solid rgba(91, 127, 166, 0.3)",
            boxShadow: isDark 
              ? "0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 0px rgba(124, 58, 237, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)" 
              : "0 20px 40px rgba(0, 0, 0, 0.05), 0 8px 0px rgba(91, 127, 166, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
          className="auth-card-hover"
        >
          {/* Logo & Subtext */}
          <div style={{ marginBottom: "36px", textAlign: "center" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  backgroundColor: isDark ? "#7c3aed" : "#5B7FA6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "15px",
                  boxShadow: isDark 
                    ? "0 0 12px rgba(124, 58, 237, 0.5)" 
                    : "0 0 12px rgba(91, 127, 166, 0.3)",
                  transition: "background-color 0.4s ease"
                }}
              >
                S
              </div>
              <span
                style={{
                  fontFamily: "var(--font-header)",
                  fontSize: "20px",
                  fontWeight: "500",
                  color: isDark ? "#FFFFFF" : "#2C2F35",
                  letterSpacing: "-0.5px",
                }}
              >
                Serene<span style={{ color: isDark ? "#a78bfa" : "#5B7FA6" }}>Mind</span>
              </span>
            </Link>
            <h2 style={{ fontSize: "28px", fontFamily: "var(--font-header)", marginBottom: "8px", fontWeight: "500", color: isDark ? "#FFFFFF" : "#2C2F35" }}>Create Account</h2>
            <p style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: "14px", lineHeight: "1.5" }}>
              Begin your path to mindfulness, calm reflection, and emotional balance.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label
                htmlFor="name"
                style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  color: isDark ? "rgba(167, 139, 250, 0.9)" : "rgba(91, 127, 166, 0.95)", 
                  letterSpacing: "0.3px" 
                }}
              >
                Preferred Name
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(167, 139, 250, 0.6)" : "rgba(91, 127, 166, 0.7)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    background: isDark ? "rgba(15, 16, 28, 0.6)" : "rgba(255, 255, 255, 0.9)",
                    border: isDark 
                      ? "1.5px solid rgba(167, 139, 250, 0.15)" 
                      : "1.5px solid rgba(91, 127, 166, 0.18)",
                    color: isDark ? "#FFFFFF" : "#2C2F35",
                    width: "100%",
                    fontSize: "15px",
                    outline: "none"
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
                  color: isDark ? "rgba(167, 139, 250, 0.9)" : "rgba(91, 127, 166, 0.95)", 
                  letterSpacing: "0.3px" 
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(167, 139, 250, 0.6)" : "rgba(91, 127, 166, 0.7)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    background: isDark ? "rgba(15, 16, 28, 0.6)" : "rgba(255, 255, 255, 0.9)",
                    border: isDark 
                      ? "1.5px solid rgba(167, 139, 250, 0.15)" 
                      : "1.5px solid rgba(91, 127, 166, 0.18)",
                    color: isDark ? "#FFFFFF" : "#2C2F35",
                    width: "100%",
                    fontSize: "15px",
                    outline: "none"
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
                  color: isDark ? "rgba(167, 139, 250, 0.9)" : "rgba(91, 127, 166, 0.95)", 
                  letterSpacing: "0.3px" 
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(167, 139, 250, 0.6)" : "rgba(91, 127, 166, 0.7)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    background: isDark ? "rgba(15, 16, 28, 0.6)" : "rgba(255, 255, 255, 0.9)",
                    border: isDark 
                      ? "1.5px solid rgba(167, 139, 250, 0.15)" 
                      : "1.5px solid rgba(91, 127, 166, 0.18)",
                    color: isDark ? "#FFFFFF" : "#2C2F35",
                    width: "100%",
                    fontSize: "15px",
                    outline: "none"
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
                    alignItems: "center"
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(167, 139, 250, 0.6)" : "rgba(91, 127, 166, 0.7)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(167, 139, 250, 0.6)" : "rgba(91, 127, 166, 0.7)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-text" style={{ padding: "8px 12px", borderRadius: "10px", backgroundColor: "rgba(192, 118, 90, 0.08)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-3d-gamified"
              style={{
                height: "50px",
                borderRadius: "14px",
                fontSize: "15px",
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontWeight: "600",
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
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
          <div style={{ marginTop: "28px", textAlign: "center", fontSize: "14px" }}>
            <span style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>Already have an account? </span>
            <Link href="/login" style={{ color: isDark ? "#a78bfa" : "#5B7FA6", fontWeight: "600" }} className="auth-switch-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Calming background breathing transition */
        .calm-bg-animate {
          background: ${isDark 
            ? "linear-gradient(135deg, #111222 0%, rgba(139, 92, 246, 0.05) 50%, #111222 100%)"
            : "linear-gradient(135deg, #F4F1EC 0%, rgba(91, 127, 166, 0.05) 50%, #F4F1EC 100%)"};
          background-size: 200% 200%;
          animation: aurora-drift 15s ease-in-out infinite alternate;
        }

        @keyframes aurora-drift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        /* Calming Bubbles Drifting */
        .bubble-1 {
          animation: float-bubble-1 25s ease-in-out infinite alternate;
        }
        .bubble-2 {
          animation: float-bubble-2 20s ease-in-out infinite alternate;
        }

        @keyframes float-bubble-1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(80px, -60px) scale(1.15); }
        }
        @keyframes float-bubble-2 {
          0% { transform: translate(0, 0) scale(1.1); }
          100% { transform: translate(-60px, 80px) scale(0.9); }
        }

        /* Floating speech bubble gentle sway */
        .sway-speech-bubble {
          animation: bubble-sway 6s ease-in-out infinite alternate;
        }

        @keyframes bubble-sway {
          0% { transform: translate(-50%, 0) rotate(0deg); }
          100% { transform: translate(-50%, -6px) rotate(0.5deg); }
        }

        /* Glassmorphic elements transitions */
        .auth-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: ${isDark 
            ? "0 25px 50px rgba(0, 0, 0, 0.45), 0 12px 0px rgba(124, 58, 237, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)" 
            : "0 25px 50px rgba(0, 0, 0, 0.08), 0 12px 0px rgba(91, 127, 166, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)"} !important;
        }

        .auth-input-field {
          border: 2px solid ${isDark ? "rgba(167, 139, 250, 0.18)" : "rgba(91, 127, 166, 0.22)"} !important;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        }
        .auth-input-field:focus {
          border-color: ${isDark ? "#a78bfa" : "#5B7FA6"} !important;
          background: ${isDark ? "rgba(15, 16, 28, 0.85)" : "rgba(255, 255, 255, 1)"} !important;
          box-shadow: ${isDark 
            ? "0 4px 12px rgba(167, 139, 250, 0.15), inset 0 2px 4px rgba(0,0,0,0.2)" 
            : "0 4px 12px rgba(91, 127, 166, 0.1), inset 0 2px 4px rgba(0,0,0,0.05)"} !important;
          transform: translateY(-1px);
        }

        .btn-3d-gamified {
          background-color: ${isDark ? "#7c3aed" : "#5B7FA6"};
          box-shadow: ${isDark ? "#5b21b6" : "#3d5671"} 0px 8px 0px 0px;
          transition: all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1);
          letter-spacing: 1.5px;
        }

        .btn-3d-gamified:hover {
          transform: translateY(2px);
          box-shadow: ${isDark ? "#5b21b6" : "#3d5671"} 0px 6px 0px 0px;
        }

        .btn-3d-gamified:active {
          transform: translateY(8px);
          box-shadow: ${isDark ? "#5b21b6" : "#3d5671"} 0px 0px 0px 0px;
          transition: 100ms;
        }

        /* Spinner for loading button */
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

        .auth-switch-link {
          transition: color 0.2s ease;
        }
        .auth-switch-link:hover {
          color: ${isDark ? "#c084fc" : "#7DAA8F"} !important;
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .auth-split-layout {
            grid-template-columns: 1fr !important;
          }
          .auth-mascot-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

