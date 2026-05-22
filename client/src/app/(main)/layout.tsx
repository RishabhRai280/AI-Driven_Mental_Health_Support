"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      {/* Universal Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div
        className={`authenticated-content-wrapper ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          // The transition is handled via class styling in globals.css
        }}
      >
        {/* Universal Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Content Page body */}
        <main
          style={{
            flex: 1,
            padding: "32px",
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
          }}
          className="authenticated-main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

