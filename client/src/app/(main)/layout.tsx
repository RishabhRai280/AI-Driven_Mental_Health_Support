"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Sidebar state in localStorage (sidebar preference is UI-only, not user data)
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🌀</div>
          <p style={{ color: "var(--text-secondary)" }}>Loading your space...</p>
        </div>
      </div>
    );
  }

  // Don't render children at all until we know the user is authenticated
  if (!user) return null;

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

