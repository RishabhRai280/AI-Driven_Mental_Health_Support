"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Mascot from "../../components/Mascot";
import { api, WellnessLog } from "../../lib/api";

interface LogItem {
  id: string;
  type: "chat" | "journal" | "exercise" | "mood";
  title: string;
  preview: string;
  date: string;
  sentiment?: string;
  refId?: string;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filter, setFilter] = useState<"all" | "chat" | "journal" | "exercise">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Form State for Adding new check-in
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<"chat" | "journal" | "exercise">(
    "journal",
  );
  const [formSentiment, setFormSentiment] = useState("Positive");
  const [formPreview, setFormPreview] = useState("");

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const startContentRef = useRef("");

  // Fetch wellness logs from DB on mount
  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await api.get<{ logs: WellnessLog[] }>("/api/wellness");
        setLogs(data.logs);
      } catch (err) {
        console.error("Failed to fetch wellness logs:", err);
        setLogs([]);
      }
    }
    fetchLogs();
  }, []);

  // Speech Recognition Speech-to-text dictation
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please try Google Chrome or Microsoft Edge.",
      );
      return;
    }

    if (isListening) {
      if ((window as any).currentHistoryRecognition) {
        (window as any).currentHistoryRecognition.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      startContentRef.current = formPreview;
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript.trim() + ". ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const sessionText = (finalTranscript + interimTranscript).trim();
      setFormPreview(
        startContentRef.current +
          (startContentRef.current ? " " : "") +
          sessionText
      );
    };

    (window as any).currentHistoryRecognition = recognition;
    recognition.start();
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPreview) {
      alert("Please fill in all the details.");
      return;
    }

    try {
      const newLog = await api.post<WellnessLog>("/api/wellness", {
        type: formType,
        title: formTitle,
        preview: formPreview,
        sentiment: formSentiment,
      });
      setLogs((prev) => [newLog, ...prev]);
      setFormTitle("");
      setFormPreview("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add log:", err);
      alert("Could not save this entry. Please try again.");
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      try {
        await api.delete(`/api/wellness/${id}`);
        setLogs((prev) => prev.filter((log) => log.id !== id));
        if (expandedChatId === id) {
          setExpandedChatId(null);
          setChatMessages([]);
        }
      } catch (err) {
        console.error("Failed to delete log:", err);
        alert("Could not delete this entry.");
      }
    }
  };

  const handleExpandChat = async (logId: string, refId?: string) => {
    if (expandedChatId === logId) {
      setExpandedChatId(null);
      setChatMessages([]);
      return;
    }

    if (!refId) return;

    setExpandedChatId(logId);
    setLoadingChat(true);
    setChatMessages([]);

    try {
      // Fetch conversation transcript for this session id
      const data = await api.get<{ messages: any[] }>(`/api/chats?sessionId=${refId}`);
      setChatMessages(data.messages);
    } catch (err) {
      console.error("Failed to load chat messages:", err);
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear your entire timeline? This cannot be undone.",
      )
    ) {
      try {
        await api.delete("/api/wellness");
        setLogs([]);
      } catch (err) {
        console.error("Failed to clear logs:", err);
        alert("Could not clear the timeline.");
      }
    }
  };

  const generateMonthlySummary = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      if (logs.length === 0) {
        setAiSummary(
          "No logs recorded this month yet! Start by recording a daily check-in or completing a breathing exercise.",
        );
        return;
      }
      const positiveCount = logs.filter(
        (l) => l.sentiment === "Positive",
      ).length;
      const stressedCount = logs.filter(
        (l) => l.sentiment === "Stressed" || l.sentiment === "Anxious",
      ).length;
      const journalCount = logs.filter((l) => l.type === "journal").length;
      const exerciseCount = logs.filter((l) => l.type === "exercise").length;

      setAiSummary(
        `Based on your ${logs.length} check-ins this period, Sparky notices you have logged ${positiveCount} positive moments, ${journalCount} journal reflections, and ${exerciseCount} exercises. ` +
          (stressedCount > 0
            ? `You navigated ${stressedCount} challenging moments with resilience. `
            : "") +
          "You are actively utilizing coping mechanisms and demonstrating healthy mindfulness. Keep pacing yourself daily!",
      );
    }, 1500);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("No logs to export!");
      return;
    }
    const headers = [
      "ID",
      "Type",
      "Title",
      "Preview Notes",
      "Date Logged",
      "Sentiment",
    ];
    const rows = logs.map((l) => [
      l.id,
      l.type,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.preview.replace(/"/g, '""')}"`,
      l.date,
      l.sentiment || "Neutral",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SereneMind_Wellness_Timeline_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIcon = (type: LogItem["type"]) => {
    switch (type) {
      case "chat":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              backgroundColor: "rgba(91, 127, 166, 0.12)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      case "journal":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              backgroundColor: "rgba(125, 170, 143, 0.12)",
              color: "var(--color-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
        );
      case "exercise":
        return (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              backgroundColor: "rgba(169, 146, 196, 0.12)",
              color: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        );
    }
  };

  const getSentimentTag = (sentiment?: string) => {
    if (!sentiment) return null;
    let bg = "rgba(91, 127, 166, 0.08)";
    let color = "var(--color-primary)";
    if (sentiment === "Positive") {
      bg = "rgba(90, 148, 117, 0.12)";
      color = "var(--color-success)";
    } else if (sentiment === "Stressed") {
      bg = "rgba(192, 118, 90, 0.12)";
      color = "var(--color-error)";
    } else if (sentiment === "Anxious") {
      bg = "rgba(169, 146, 196, 0.12)";
      color = "var(--color-accent)";
    }

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: bg,
          color: color,
        }}
      >
        {sentiment}
      </span>
    );
  };

  // Filter & Search computation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = filter === "all" || log.type === filter;
      const matchesSearch =
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.preview.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [logs, filter, searchQuery]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.25fr 0.75fr",
        gap: "32px",
      }}
      className="history-layout"
    >
      {/* Left Column - Logs Timeline list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header and Clear Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "22px",
                fontFamily: "var(--font-header)",
                fontWeight: 500,
              }}
            >
              Wellness Timeline
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              A historical archive of your self-care practices, chatbot
              sessions, and reflections.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                fontSize: "13px",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                padding: "8px 16px",
                borderRadius: "12px",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              className="add-timeline-btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {showAddForm ? "Close Form" : "Add Log Entry"}
            </button>
            {logs.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  fontSize: "13px",
                  color: "var(--color-error)",
                  background: "rgba(192, 118, 90, 0.08)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  transition: "all 0.2s",
                }}
                className="clear-history-btn"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Sliding glassmorphic form for adding logs */}
        {showAddForm && (
          <form
            onSubmit={handleAddLog}
            className="glass-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              border: "1.5px solid var(--color-primary)",
              background:
                "linear-gradient(145deg, var(--bg-surface) 0%, rgba(91, 127, 166, 0.02) 100%)",
              animation: "fadeIn 0.25s ease-out",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Record a Check-in Entry
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Log Activity Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Challenging Exam Pacing"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Activity Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                  >
                    <option value="journal">Reflection</option>
                    <option value="chat">Companion Chat</option>
                    <option value="exercise">Exercise</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Sentiment
                  </label>
                  <select
                    value={formSentiment}
                    onChange={(e) => setFormSentiment(e.target.value)}
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Anxious">Anxious</option>
                    <option value="Stressed">Stressed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description textarea with inline speech dictation */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  Log entry description / reflection thoughts
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  style={{
                    background: "none",
                    border: "none",
                    color: isListening
                      ? "var(--color-error)"
                      : "var(--color-primary)",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    animation: isListening ? "pulse-mic 1.5s infinite" : "none",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={isListening ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  {isListening ? "Listening (Stop)" : "Dictate"}
                </button>
              </div>
              <textarea
                placeholder={
                  isListening
                    ? "Listening... Speak now!"
                    : "What did you work on or how are you feeling? Sparky is listening..."
                }
                value={formPreview}
                onChange={(e) => setFormPreview(e.target.value)}
                disabled={isListening}
                required
                rows={3}
                style={{
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  border: isListening
                    ? "1.5px solid var(--color-error)"
                    : "1.5px solid var(--border-input)",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
                style={{ padding: "10px 20px", fontSize: "13px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "10px 24px", fontSize: "13px" }}
              >
                Submit Entry
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Actions Bar */}
        <div
          className="glass-card"
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Search history by title, contents, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "42px",
                fontSize: "14px",
                borderRadius: "14px",
                border: "1.5px solid var(--border-light)",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              { id: "all", label: "All Logs" },
              { id: "chat", label: "Companion Chats" },
              { id: "journal", label: "Reflections" },
              { id: "exercise", label: "Exercises" },
            ].map((tab) => {
              const isActive = filter === tab.id;
              const count = logs.filter(
                (l) => tab.id === "all" || l.type === tab.id,
              ).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: "none",
                    backgroundColor: isActive
                      ? "var(--color-primary)"
                      : "var(--bg-nav)",
                    color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  className="filter-tab-btn"
                >
                  {tab.label}
                  <span
                    style={{
                      fontSize: "11px",
                      opacity: isActive ? 0.9 : 0.6,
                      backgroundColor: isActive
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(0, 0, 0, 0.05)",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline list */}
        {filteredLogs.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: "64px 48px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            <Mascot
              pose={logs.length === 0 ? "lost-map" : "confused-question"}
              size={150}
              interactive={false}
            />
            <div>
              <h4
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                {logs.length === 0
                  ? "No Timeline Logs Yet"
                  : "No Matching Results"}
              </h4>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  maxWidth: "400px",
                  margin: "0 auto",
                  lineHeight: "1.5",
                }}
              >
                {logs.length === 0
                  ? "Your daily companion chats, check-ins, and deep breathing exercises will show up here automatically."
                  : "Try clearing your filters or testing a different search term to pull up your past wellness records."}
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "relative",
            }}
          >
            {filteredLogs.map((log) => {
              // Color border depending on activity type
              let typeBorderColor = "var(--color-primary)";
              if (log.type === "journal")
                typeBorderColor = "var(--color-secondary)";
              else if (log.type === "exercise")
                typeBorderColor = "var(--color-accent)";

              const isChatExp = log.type === "chat" && log.refId;
              return (
                <div
                  key={log.id}
                  className={`glass-card history-item-card ${isChatExp ? "interactive-chat-card" : ""}`}
                  onClick={() => isChatExp && handleExpandChat(log.id, log.refId)}
                  style={{
                    display: "flex",
                    gap: "18px",
                    padding: "20px 24px",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    borderLeft: `4px solid ${typeBorderColor}`,
                    position: "relative",
                    cursor: isChatExp ? "pointer" : "default",
                  }}
                >
                  {getIcon(log.type)}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <h4
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                          }}
                        >
                          {log.title}
                        </h4>
                        {log.type === "chat" && log.refId && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "var(--color-primary)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              backgroundColor: "rgba(91, 127, 166, 0.06)",
                              padding: "4px 8px",
                              borderRadius: "8px",
                              marginLeft: "10px",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedChatId === log.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}><polyline points="6 9 12 15 18 9"/></svg>
                            {expandedChatId === log.id ? "Hide Transcript" : "View Transcript"}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          fontWeight: "500",
                        }}
                      >
                        {log.date}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.5",
                      }}
                    >
                      {log.preview}
                    </p>
                    <div
                      style={{
                        marginTop: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {getSentimentTag(log.sentiment)}

                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-secondary)",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLog(log.id);
                        }}
                        className="delete-log-action"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        Remove
                      </button>
                    </div>

                    {expandedChatId === log.id && (
                      <div
                        style={{
                          marginTop: "16px",
                          borderTop: "1px solid var(--border-light)",
                          paddingTop: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          animation: "fadeIn 0.25s ease-out",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h5 style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                          Conversation Transcript
                        </h5>
                        
                        {loadingChat ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 0", color: "var(--text-secondary)", fontSize: "13px" }}>
                            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            Loading messages...
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div style={{ padding: "12px 0", color: "var(--text-secondary)", fontSize: "13px", fontStyle: "italic" }}>
                            No messages found in this chat session.
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                              maxHeight: "300px",
                              overflowY: "auto",
                              paddingRight: "6px",
                            }}
                          >
                            {chatMessages
                              .filter((msg, idx) => {
                                // Filter out initial welcome greetings from the companion
                                if (idx === 0 && msg.sender !== "user") {
                                  const text = (msg.text || "").toLowerCase();
                                  if (
                                    text.includes("wonderful to see you") ||
                                    text.includes("welcome") ||
                                    text.includes("how have you been") ||
                                    text.includes("happy to connect") ||
                                    text.includes("happy to see you") ||
                                    text.includes("since we last")
                                  ) {
                                    return false;
                                  }
                                }
                                return true;
                              })
                              .map((msg, idx) => {
                                const isUser = msg.sender === "user";
                              return (
                                <div
                                  key={msg.id || idx}
                                  style={{
                                    display: "flex",
                                    justifyContent: isUser ? "flex-end" : "flex-start",
                                    width: "100%",
                                  }}
                                >
                                  <div
                                    style={{
                                      maxWidth: "85%",
                                      padding: "10px 14px",
                                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                      backgroundColor: isUser ? "var(--bg-user-bubble)" : "var(--bg-surface)",
                                      border: isUser ? "none" : "1px solid var(--border-light)",
                                      boxShadow: "var(--shadow-subtle)",
                                      borderLeft: isUser ? "none" : "2.5px solid var(--color-secondary)",
                                    }}
                                  >
                                    <p style={{ fontSize: "13px", lineHeight: "1.45", color: "var(--text-primary)", margin: 0 }}>
                                      {msg.text}
                                    </p>
                                    <span
                                      style={{
                                        display: "block",
                                        fontSize: "10px",
                                        color: "var(--text-secondary)",
                                        marginTop: "4px",
                                        textAlign: isUser ? "right" : "left",
                                      }}
                                    >
                                      {msg.timestamp || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column - AI Monthly Summary builder panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h3
            style={{
              fontSize: "22px",
              fontFamily: "var(--font-header)",
              fontWeight: 500,
            }}
          >
            Companion Insights
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Let Sparky cross-reference your history logs to map behavioral
            trends.
          </p>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            border: "1px solid var(--border-light)",
            background:
              "linear-gradient(145deg, var(--bg-surface) 0%, rgba(90, 148, 117, 0.03) 100%)",
            boxShadow: aiSummary
              ? "0 8px 32px rgba(90, 148, 117, 0.08)"
              : "var(--shadow-subtle)",
            transition: "all 0.3s ease",
          }}
        >
          <Mascot
            pose={aiSummary ? "celebrating-success" : "carrying-basket"}
            size={160}
            interactive={false}
          />

          {!aiSummary ? (
            <div>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                AI Trend Synthesizer
              </h4>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  marginBottom: "20px",
                }}
              >
                Generate an empathetic summary analyzing emotional patterns and
                wellness progress across all completed check-ins.
              </p>
              <button
                onClick={generateMonthlySummary}
                className="btn-primary"
                style={{
                  backgroundColor: "var(--color-success)",
                  color: "#FFFFFF",
                  width: "100%",
                  height: "46px",
                }}
                disabled={generating || logs.length === 0}
              >
                {generating
                  ? "Synthesizing Insights..."
                  : "Generate AI Summary"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "left", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--color-success)",
                  fontWeight: "600",
                  fontSize: "13px",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg> Sparky&apos;s Evaluation
              </div>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--bg-nav)",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid var(--border-light)",
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.02)",
                }}
              >
                {aiSummary}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={handleExportCSV}
                  className="btn-primary"
                  style={{ width: "100%", height: "42px", fontSize: "14px" }}
                >
                  Export CSV Logs
                </button>
                <button
                  onClick={() => setAiSummary(null)}
                  className="btn-secondary"
                  style={{ width: "100%", height: "42px", fontSize: "14px" }}
                >
                  Clear Evaluation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .history-item-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary) !important;
          box-shadow: var(--shadow-hover) !important;
        }

        .clear-history-btn:hover {
          background-color: rgba(192, 118, 90, 0.15) !important;
          color: var(--color-error) !important;
        }

        .filter-tab-btn:hover {
          filter: brightness(0.95);
        }

        .delete-log-action:hover {
          color: var(--color-error) !important;
        }

        @keyframes pulse-mic {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
          }
        }

        @media (max-width: 900px) {
          .history-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
