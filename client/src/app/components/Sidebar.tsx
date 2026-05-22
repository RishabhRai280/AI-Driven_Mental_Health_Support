"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
      ),
    },
    {
      name: "Smart Chatbot",
      path: "/chatbot",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      ),
    },
    {
      name: "Journal Workspace",
      path: "/journaling",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      ),
    },
    {
      name: "History & Logs",
      path: "/history",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ),
    },
    {
      name: "Mood Analysis",
      path: "/analysis",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
      ),
    },
    {
      name: "Exercises",
      path: "/exercises",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      ),
    },
    {
      name: "Profile & Persona",
      path: "/profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`mobile-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 90,
          display: isOpen ? "block" : "none",
        }}
      />

      {/* Main Sidebar Panel */}
      <aside className={`app-sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        {/* Brand Logo Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            marginBottom: "32px",
            padding: isCollapsed ? "0" : "0 8px",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? "0" : "10px",
            }}
            title={isCollapsed ? "SereneMind Dashboard" : undefined}
          >
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
                flexShrink: 0,
              }}
            >
              S
            </div>
            {!isCollapsed && (
              <span
                style={{
                  fontFamily: "var(--font-header)",
                  fontSize: "20px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                Serene<span style={{ color: "var(--color-secondary)" }}>Mind</span>
              </span>
            )}
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="mobile-close-btn"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "4px",
                display: "none",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  gap: isCollapsed ? "0" : "12px",
                  padding: isCollapsed ? "12px" : "12px 16px",
                  borderRadius: "14px",
                  fontSize: "15px",
                  fontWeight: "500",
                  color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "rgba(91, 127, 166, 0.08)" : "transparent",
                  transition: "all 0.2s ease",
                }}
                className="sidebar-item"
              >
                <span
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span style={{ whiteSpace: "nowrap", transition: "opacity 0.2s" }}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Log Out Option */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to log out of SereneMind?")) {
                logout();
              }
            }}
            title={isCollapsed ? "Log Out" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: isCollapsed ? "0" : "12px",
              padding: isCollapsed ? "12px" : "12px 16px",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: "500",
              color: "var(--color-error)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
              width: "100%",
            }}
            className="sidebar-item logout-item"
          >
            <span
              style={{
                color: "var(--color-error)",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            {!isCollapsed && (
              <span style={{ whiteSpace: "nowrap" }}>
                Log Out
              </span>
            )}
          </button>
        </nav>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--border-light)",
            margin: "20px 0",
          }}
        />

        {/* SOS Button Area */}
        <div style={{ padding: "0 4px", display: "flex", justifyContent: "center" }}>
          <Link
            href="/crisis-sos"
            onClick={onClose}
            title="CRISIS SOS"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isCollapsed ? "0" : "8px",
              padding: isCollapsed ? "12px" : "14px",
              borderRadius: "16px",
              backgroundColor: "transparent",
              border: "2px solid var(--color-error)",
              color: "var(--color-error)",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(192, 118, 90, 0.05)",
              width: isCollapsed ? "44px" : "100%",
              height: isCollapsed ? "44px" : "auto",
              flexShrink: 0,
            }}
            className={`sos-btn ${isCollapsed ? "collapsed-sos" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {!isCollapsed && "CRISIS SOS"}
          </Link>
        </div>

        {/* Desktop Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="desktop-collapse-toggle-btn"
            title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "12px 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              borderRadius: "12px",
              marginTop: "12px",
              width: "100%",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
                  <span style={{ fontSize: "14px", fontWeight: "500", whiteSpace: "nowrap" }}>Collapse Panel</span>
                </>
              )}
            </div>
          </button>
        )}
      </aside>

      <style jsx global>{`
        .desktop-collapse-toggle-btn:hover {
          color: var(--color-primary) !important;
          background-color: rgba(91, 127, 166, 0.05) !important;
        }

        .sidebar-item:hover {
          color: var(--color-primary) !important;
          background-color: rgba(91, 127, 166, 0.05) !important;
          transform: translateY(-1px);
        }

        .logout-item:hover {
          color: var(--color-error) !important;
          background-color: rgba(192, 118, 90, 0.08) !important;
          transform: translateY(-1px);
        }

        @media (max-width: 1024px) {
          .desktop-collapse-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
