"use client";

import React, { useState, useEffect, useRef } from "react";
import Mascot, { HamsterPose } from "../../components/Mascot";
import { api } from "../../lib/api";

export default function JournalingPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [sentiment, setSentiment] = useState<
    "Neutral" | "Positive" | "Anxious" | "Stressed"
  >("Neutral");
  const [mascotPose, setMascotPose] = useState<HamsterPose>("thinking-deeply");
  const [saveStatus, setSaveStatus] = useState("Draft");
  const currentJournalId = useRef<string | null>(null);

  // LLaMA dynamic reflection insight states
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiCopingStrategies, setAiCopingStrategies] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);

  // Coping strategies checklist state
  const [checkedStrategies, setCheckedStrategies] = useState<Record<number, boolean>>({});

  // Analyze sentiment in real-time + autosave draft to DB
  useEffect(() => {
    if (!content.trim()) {
      setSentiment("Neutral");
      setMascotPose("thinking-deeply");
      setSaveStatus("Draft");
      return;
    }

    setSaveStatus("Saving...");
    setMascotPose("head-scratching");

    const timer = setTimeout(async () => {
      const lower = content.toLowerCase();
      let detectedSentiment: "Neutral" | "Positive" | "Anxious" | "Stressed" =
        "Neutral";

      if (
        lower.includes("happy") ||
        lower.includes("glad") ||
        lower.includes("joy") ||
        lower.includes("peace") ||
        lower.includes("gratitude") ||
        lower.includes("great") ||
        lower.includes("refreshed")
      ) {
        detectedSentiment = "Positive";
        setMascotPose("celebrating-success");
      } else if (
        lower.includes("anxious") ||
        lower.includes("scared") ||
        lower.includes("panic") ||
        lower.includes("worry") ||
        lower.includes("fear")
      ) {
        detectedSentiment = "Anxious";
        setMascotPose("escaping-energy");
      } else if (
        lower.includes("stress") ||
        lower.includes("angry") ||
        lower.includes("tired") ||
        lower.includes("heavy") ||
        lower.includes("overwhelm")
      ) {
        detectedSentiment = "Stressed";
        setMascotPose("balancing-nut");
      } else {
        setMascotPose("sleeping-content");
      }

      setSentiment(detectedSentiment);

      // Autosave to DB as a draft (create new or update existing)
      try {
        setIsAnalyzing(true);
        let res;
        if (currentJournalId.current) {
          res = await api.put<{ success: boolean; journal: { id: string; summary?: string; copingStrategies?: string[]; mascotPose?: HamsterPose; sentiment?: string } }>(
            `/api/journals/${currentJournalId.current}`,
            {
              title: title || "Untitled Reflection",
              body: content,
            }
          );
        } else {
          res = await api.post<{ journal: { id: string; summary?: string; copingStrategies?: string[]; mascotPose?: HamsterPose; sentiment?: string } }>(
            "/api/journals",
            {
              title: title || "Untitled Reflection",
              body: content,
            }
          );
        }

        if (res.journal) {
          currentJournalId.current = res.journal.id;
          if (res.journal.summary) setAiSummary(res.journal.summary);
          if (res.journal.copingStrategies) setAiCopingStrategies(res.journal.copingStrategies);
          if (res.journal.mascotPose) setMascotPose(res.journal.mascotPose);
          if (res.journal.sentiment) setSentiment(res.journal.sentiment as any);
        }
        setSaveStatus("Autosaved successfully");
      } catch (err) {
        console.error("Autosave analysis failed:", err);
        setSaveStatus("Autosave failed");
      } finally {
        setIsAnalyzing(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [content, title]);

  // Speech Recognition Speech-to-text Dictator
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
      if ((window as any).currentJournalRecognition) {
        (window as any).currentJournalRecognition.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setMascotPose("thinking-deeply");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (e: any) => {
      console.error(e.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setContent(
          (prev) => prev + (prev ? " " : "") + transcript.trim() + ".",
        );
      }
    };

    (window as any).currentJournalRecognition = recognition;
    recognition.start();
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Please enter a title or write some notes before saving.");
      return;
    }

    setSaveStatus("Saving reflection...");
    setIsAnalyzing(true);

    try {
      let finalJournal;
      if (currentJournalId.current) {
        // Update existing journal
        const res = await api.put<{ success: boolean; journal: { id: string; summary?: string; copingStrategies?: string[]; mascotPose?: HamsterPose; sentiment?: string } }>(
          `/api/journals/${currentJournalId.current}`,
          {
            title: title.trim() || "Untitled Reflection",
            body: content.trim(),
          }
        );
        finalJournal = res.journal;
      } else {
        // Create new journal
        const res = await api.post<{ journal: { id: string; summary?: string; copingStrategies?: string[]; mascotPose?: HamsterPose; sentiment?: string } }>(
          "/api/journals",
          {
            title: title.trim() || "Untitled Reflection",
            body: content.trim() || "No reflection thoughts logged.",
          }
        );
        finalJournal = res.journal;
        currentJournalId.current = res.journal.id;
      }

      if (finalJournal) {
        if (finalJournal.summary) setAiSummary(finalJournal.summary);
        if (finalJournal.copingStrategies) setAiCopingStrategies(finalJournal.copingStrategies);
        if (finalJournal.mascotPose) setMascotPose(finalJournal.mascotPose);
        if (finalJournal.sentiment) setSentiment(finalJournal.sentiment as any);
      }

      // Also add to unified wellness timeline
      await api.post("/api/wellness", {
        type: "journal",
        title: title.trim() || "Untitled Reflection",
        preview:
          content.trim().slice(0, 180) || "No reflection thoughts logged.",
        sentiment: finalJournal?.sentiment || sentiment,
        refId: currentJournalId.current,
      });

      setSaveStatus("Saved to historical logs!");
      setMascotPose("sleeping-content");
      alert(
        `"${title.trim() || "Untitled Reflection"}" has been saved successfully to your Wellness Timeline!`,
      );

      // Reset for new entry
      setTitle("");
      setContent("");
      setAiSummary("");
      setAiCopingStrategies([]);
      currentJournalId.current = null;
    } catch (err) {
      console.error("Failed to save journal:", err);
      setSaveStatus("Save failed");
      alert("Could not save your journal entry. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentStyle = () => {
    switch (sentiment) {
      case "Positive":
        return {
          backgroundColor: "rgba(90, 148, 117, 0.12)",
          color: "var(--color-success)",
          border: "1px solid rgba(90, 148, 117, 0.2)",
        };
      case "Anxious":
        return {
          backgroundColor: "rgba(169, 146, 196, 0.12)",
          color: "var(--color-accent)",
          border: "1px solid rgba(169, 146, 196, 0.2)",
        };
      case "Stressed":
        return {
          backgroundColor: "rgba(192, 118, 90, 0.12)",
          color: "var(--color-error)",
          border: "1px solid rgba(192, 118, 90, 0.2)",
        };
      default:
        return {
          backgroundColor: "rgba(91, 127, 166, 0.08)",
          color: "var(--color-primary)",
          border: "1px solid rgba(91, 127, 166, 0.2)",
        };
    }
  };

  const journalingPrompts = {
    Neutral:
      "What is one small detail from today that made you pause and smile?",
    Positive:
      "This is beautiful! What contributed most to these positive feelings today?",
    Anxious:
      "Can you list 3 concrete physical objects around you right now? Focus on anchoring.",
    Stressed:
      "If you could remove just one task from your plate today, what would it be?",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "32px",
        height: "calc(100vh - 144px)",
      }}
      className="journaling-layout"
    >
      {/* Left Column - Blank Writing Workspace */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "32px",
          height: "100%",
        }}
      >
        {/* Header Title Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <input
            type="text"
            placeholder="Today's Reflection Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: "22px",
              fontWeight: "600",
              fontFamily: "var(--font-header)",
              border: "none",
              borderBottom: "1.5px solid transparent",
              padding: "4px 0",
              backgroundColor: "transparent",
              borderRadius: 0,
              width: "70%",
            }}
            className="journal-title-input"
          />

          {/* Cloud Auto-save state indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: "500",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor:
                  saveStatus.includes("successfully") ||
                  saveStatus.includes("logs") ||
                  saveStatus.includes("Saved")
                    ? "var(--color-success)"
                    : saveStatus.includes("Saving")
                      ? "var(--color-accent)"
                      : "var(--text-secondary)",
              }}
            />
            {saveStatus}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{ height: "1px", backgroundColor: "var(--border-light)" }}
        />

        {/* Large Editor Canvas */}
        <textarea
          placeholder="Start typing your heart out... (Autosave handles the rest, or click Dictate to speak your thoughts!)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            resize: "none",
            backgroundColor: "transparent",
            fontSize: "16px",
            lineHeight: "1.7",
            padding: 0,
            boxShadow: "none",
          }}
          className="journal-textarea"
        />

        {/* Action Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Reusable Voice Dictation module */}
          <button
            onClick={toggleVoiceInput}
            type="button"
            className="btn-secondary voice-dictate-pulse"
            style={{
              borderColor: isListening
                ? "var(--color-error)"
                : "var(--color-secondary)",
              color: isListening
                ? "var(--color-error)"
                : "var(--color-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              boxShadow: isListening
                ? "0 0 12px rgba(192, 118, 90, 0.2)"
                : "none",
              animation: isListening ? "pulse-mic 1.5s infinite" : "none",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isListening ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            {isListening
              ? "Listening (Click to Stop)..."
              : "Dictate Reflection"}
          </button>

          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ padding: "12px 28px" }}
          >
            Save Reflection
          </button>
        </div>
      </div>

      {/* Right Column - Sentiment Analysis Panel */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "24px",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "18px", fontFamily: "var(--font-header)" }}>
          Reflection Insights
        </h3>

        {/* Mascot */}
        <Mascot pose={mascotPose} size={170} interactive={false} />

        {/* Dynamic Sentiment Tags */}
        <div style={{ width: "100%" }}>
          <h4
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Detected Sentiment
          </h4>
          <div
            style={{
              padding: "10px",
              borderRadius: "16px",
              fontSize: "15px",
              fontWeight: "600",
              textAlign: "center",
              ...getSentimentStyle(),
            }}
          >
            {sentiment}
          </div>
        </div>

        {/* Interactive prompts / LLaMA dynamic CBT insights */}
        <div
          style={{
            marginTop: "12px",
            backgroundColor: "var(--bg-nav)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "16px",
            textAlign: "left",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {isAnalyzing && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", padding: "4px 0" }}>
              <div className="typing-dot" />
              <div className="typing-dot" style={{ animationDelay: "0.2s" }} />
              <div className="typing-dot" style={{ animationDelay: "0.4s" }} />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Analyzing with LLaMA...</span>
            </div>
          )}

          {aiSummary ? (
            <div>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--color-primary)",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                CBT Reflection Summary
              </h4>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.5",
                  color: "var(--text-primary)",
                  fontStyle: "italic",
                }}
              >
                "{aiSummary}"
              </p>
            </div>
          ) : (
            <div>
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  marginBottom: "6px",
                }}
              >
                Coping Spark Prompt
              </h4>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.5",
                  color: "var(--text-primary)",
                }}
              >
                {journalingPrompts[sentiment]}
              </p>
            </div>
          )}

          {aiCopingStrategies.length > 0 && (
            <div style={{ marginTop: "4px", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--color-secondary)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                Recommended Self-Care Checklist
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {aiCopingStrategies.map((strategy, idx) => {
                  const isChecked = !!checkedStrategies[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => setCheckedStrategies(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        backgroundColor: isChecked ? "rgba(90, 148, 117, 0.04)" : "rgba(255, 255, 255, 0.01)",
                        border: isChecked ? "1px solid rgba(90, 148, 117, 0.15)" : "1px solid var(--border-light)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      className="checklist-item-hover"
                    >
                      {/* Custom checkbox */}
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "6px",
                          border: isChecked ? "2px solid var(--color-success)" : "2px solid var(--border-input)",
                          backgroundColor: isChecked ? "var(--color-success)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                          flexShrink: 0
                        }}
                      >
                        {isChecked && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                          color: isChecked ? "var(--text-secondary)" : "var(--text-primary)",
                          textDecoration: isChecked ? "line-through" : "none",
                          transition: "all 0.2s ease",
                          textAlign: "left"
                        }}
                      >
                        {strategy}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-mic {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 0 16px rgba(192, 118, 90, 0.4);
          }
          100% {
            transform: scale(1);
          }
        }

        .journal-title-input:focus {
          border-bottom-color: var(--color-primary) !important;
          box-shadow: none !important;
        }
        .journal-textarea:focus {
          box-shadow: none !important;
        }
        .checklist-item-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .checklist-item-hover:hover {
          background-color: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(169, 146, 196, 0.3) !important;
          transform: translateY(-1px);
        }
        @media (max-width: 960px) {
          .journaling-layout {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
