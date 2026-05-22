"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Onboarding verification states
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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

  // Check onboarding status on mount or user change
  useEffect(() => {
    if (!user) {
      setCheckingOnboarding(false);
      return;
    }

    async function checkOnboardingStatus() {
      try {
        const data = await api.get<{ mascot: any | null; persona: any | null }>("/api/mascot");
        if (data.mascot && data.persona) {
          setHasCompletedOnboarding(true);
        } else {
          setHasCompletedOnboarding(false);
          // Redirect other routes to dashboard if onboarding is incomplete
          if (pathname !== "/dashboard") {
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Failed to check layout onboarding status:", err);
      } finally {
        setCheckingOnboarding(false);
      }
    }

    checkOnboardingStatus();
  }, [user]);

  // Show loading screen while checking auth and onboarding
  if (isLoading || checkingOnboarding) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
            <svg className="animate-spin-custom" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" stroke="var(--border-light)" strokeWidth="3" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
          <p style={{ color: "var(--text-secondary)" }}>Loading your space...</p>
        </div>
      </div>
    );
  }

  // Don't render children at all until we know the user is authenticated
  if (!user) return null;

  // Render a full-screen, sidebar-free, header-free canvas for onboarding unwrapping page
  if (!hasCompletedOnboarding) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow spheres */}
        <div className="ambient-glow ambient-glow-1" />
        <div className="ambient-glow ambient-glow-2" />
        <div className="ambient-glow ambient-glow-3" />
        <main
          style={{
            maxWidth: "800px",
            width: "100%",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          {children}
        </main>
      </div>
    );
  }

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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow spheres */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />
      <div className="ambient-glow ambient-glow-3" />
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

