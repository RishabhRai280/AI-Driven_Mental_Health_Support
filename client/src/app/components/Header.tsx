"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Header({ onToggleSidebar, isSidebarCollapsed, onToggleCollapse }: HeaderProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Detect system theme or current body setup
    const isDark = document.documentElement.classList.contains("dark") || 
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Your Dashboard";
      case "/chatbot":
        return "AI Coping Companion";
      case "/journaling":
        return "Reflective Journaling Space";
      case "/history":
        return "Timeline & Past Logs";
      case "/analysis":
        return "Insights & Trends";
      case "/exercises":
        return "Recommended Wellness Practices";
      case "/crisis-sos":
        return "Crisis SOS Calm Care";
      default:
        return "SereneMind Space";
    }
  };

  return (
    <header
      style={{
        height: "80px",
        backgroundColor: "var(--background)",
        borderBottom: "1px solid var(--border-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 80,
      }}
    >
      {/* Mobile Toggle Button & Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mobile-hamburger-btn"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "6px",
              display: "none", // Controlled in media query CSS
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        )}

        <h1
          style={{
            fontSize: "22px",
            fontWeight: "500",
            fontFamily: "var(--font-header)",
            color: "var(--text-primary)",
          }}
        >
          {getPageTitle()}
        </h1>
      </div>

      {/* Top Bar Actions (Streak, Theme, Notification, Profile) */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Streak Pill - Beautiful Sage Success color */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(90, 148, 117, 0.12)",
            border: "1px solid rgba(90, 148, 117, 0.2)",
            color: "var(--color-success)",
            padding: "8px 14px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: "0 2px 8px rgba(90, 148, 117, 0.05)",
          }}
          title="Daily Streak! Keep it up."
        >
          <span>🐹</span>
          <span>5 Day Streak</span>
        </div>

        {/* Theme Toggle Button */}
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
          }}
          className="header-action-btn"
          title="Toggle Theme"
        >
          {theme === "light" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          )}
        </button>

        {/* Notifications Icon with popover */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
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
              position: "relative",
              transition: "all 0.2s ease",
            }}
            className="header-action-btn"
            title="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {/* Notification Badge indicator */}
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--color-error)",
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                right: 0,
                width: "280px",
                backgroundColor: "var(--bg-surface)",
                border: "1.5px solid var(--border-light)",
                borderRadius: "16px",
                boxShadow: "var(--shadow-hover)",
                padding: "16px",
                zIndex: 90,
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>Notifications</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "13px", color: "var(--text-primary)", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
                  <strong>🐹 Sparky says:</strong> Let&apos;s complete a short breathing exercise today!
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Daily journal reminder: Don&apos;t forget to check in on your feelings.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 40x40px Circular Avatar */}
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "var(--color-primary)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
            fontSize: "14px",
            border: "2px solid var(--bg-surface)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}
          title="User Profile"
        >
          RR
        </div>
      </div>

      <style jsx global>{`
        .header-action-btn:hover {
          border-color: var(--color-primary) !important;
          color: var(--color-primary) !important;
          transform: translateY(-1px);
        }
        .header-action-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 1024px) {
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
        @media (max-width: 600px) {
          header {
            padding: 0 16px !important;
          }
          h1 {
            font-size: 18px !important;
          }
        }
      `}</style>
    </header>
  );
}
