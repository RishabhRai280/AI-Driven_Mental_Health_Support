"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      {/* Universal Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="authenticated-content-wrapper">
        {/* Universal Header */}
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

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
