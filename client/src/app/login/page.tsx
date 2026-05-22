"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Mascot from "../components/Mascot";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        backgroundColor: "var(--background)",
      }}
      className="auth-split-layout"
    >
      {/* Left Column - Input Form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          className="glass-card"
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "40px",
            borderRadius: "28px",
          }}
        >
          {/* Logo & Subtext */}
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                S
              </div>
              <span
                style={{
                  fontFamily: "var(--font-header)",
                  fontSize: "18px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
              >
                SereneMind
              </span>
            </Link>
            <h2 style={{ fontSize: "28px", fontFamily: "var(--font-header)", marginBottom: "8px" }}>Welcome Back</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Enter your credentials to access your peaceful companion.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ height: "48px" }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ height: "48px" }}
              />
            </div>

            {error && (
              <div className="error-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ height: "48px", marginTop: "10px" }} disabled={loading}>
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>

          {/* Alternate Option link */}
          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Don&apos;t have an account? </span>
            <Link href="/register" style={{ color: "var(--color-primary)", fontWeight: "600" }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column - Peeking Hamster Mascot with soft Sage Mist bg */}
      <div
        style={{
          backgroundColor: "var(--bg-nav)",
          borderLeft: "1px solid var(--border-light)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
        className="auth-mascot-panel"
      >
        <Mascot pose="shy-peeking" size={260} dialogue="Pssst... Your details are highly encrypted and completely private here." />
        <div style={{ marginTop: "24px", textAlign: "center", maxWidth: "340px" }}>
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)", marginBottom: "8px" }}>Your Safe Haven</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
            Every check-in, chat transcript, and journal logs are stored locally and kept strictly confidential.
          </p>
        </div>
      </div>

      <style jsx global>{`
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
