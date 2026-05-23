"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Mascot, { HamsterPose } from "../../components/Mascot";
import { api, ChatMessage } from "../../lib/api";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  sender: "user" | "sparky";
  text: string;
  timestamp: string;
}

export default function ChatbotPage() {
  const [sessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sessionId,
      sender: "sparky",
      text: "Hello! I'm Sparky, your SereneMind AI companion. Whether you want to vent, practice a coping mechanism, or just chat, I'm here for you.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [mascotPose, setMascotPose] = useState<HamsterPose>("waving-hello");
  const [mascotDialogue, setMascotDialogue] = useState("Let's talk! I'm listening.");
  const [isTyping, setIsTyping] = useState(false);
  const [showSafetyBanner, setShowSafetyBanner] = useState(false);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);

  // Companion & Persona state from DB
  const [companionName, setCompanionName] = useState("Sparky");
  const [assignedPersonaName, setAssignedPersonaName] = useState("Beginner Wellness User");

  // Daily Self-Care Checklist state (synced with Exercises page)
  interface Habit {
    id: string;
    label: string;
    desc: string;
    color: string;
  }

  const DEFAULT_HABITS: Habit[] = [
    {
      id: "water",
      label: "Drink 2 Liters of Water",
      desc: "Hydrate brain tissues to diminish physical panic triggers.",
      color: "var(--color-primary)",
    },
    {
      id: "breathing",
      label: "Complete Guided Breathing Pacer",
      desc: "4-minute box breathing session to reset the autonomic nervous system.",
      color: "var(--color-success)",
    },
    {
      id: "screentime",
      label: "No Screen Time 1hr Before Bed",
      desc: "Keep blue light away to naturally induce deep REM sleep.",
      color: "var(--color-accent)",
    },
    {
      id: "outdoors",
      label: "30-Minute Outdoor Activity",
      desc: "Lowers cortisol levels and helps clear circulatory paths.",
      color: "var(--color-secondary)",
    },
    {
      id: "journal",
      label: "Log Evening Reflection Journal",
      desc: "Record emotional trends and receive sentiment metrics.",
      color: "var(--color-error)",
    },
  ];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load Adopted Mascot Name, computed Persona, and dynamic Welcome greeting on mount
  useEffect(() => {
    async function loadCompanionDetails() {
      try {
        const data = await api.get<{ mascot: { name: string } | null; assignedPersona: { persona_name: string } | null }>("/api/mascot");
        let mascotDisplayName = "Sparky";
        if (data.mascot) {
          setCompanionName(data.mascot.name);
          mascotDisplayName = data.mascot.name;
        }
        if (data.assignedPersona) {
          setAssignedPersonaName(data.assignedPersona.persona_name);
        }

        // Fetch dynamic LLaMA welcome greeting from backend
        try {
          const welcomeData = await api.post<{ reply: ChatMessage; pose: HamsterPose }>("/api/chats/welcome", { sessionId });
          if (welcomeData && welcomeData.reply) {
            setMessages([welcomeData.reply]);
            setMascotPose(welcomeData.pose || "waving-hello");
            setMascotDialogue(welcomeData.reply.text);
          }
        } catch (welcomeErr) {
          console.error("Failed to fetch dynamic welcome greeting, using fallback:", welcomeErr);
          setMessages([
            {
              id: "welcome",
              sessionId,
              sender: "sparky",
              text: `Hello! I'm ${mascotDisplayName}, your SereneMind AI companion. Whether you want to vent, practice a coping mechanism, or just chat, I'm here for you.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load companion details in chatbot:", err);
      }
    }
    loadCompanionDetails();
  }, [sessionId]);

  // Load habits checklist from LocalStorage on mount
  useEffect(() => {
    const savedCatalog = localStorage.getItem("sm_custom_habits_catalog");
    if (savedCatalog) {
      setHabits(JSON.parse(savedCatalog));
    } else {
      setHabits(DEFAULT_HABITS);
      localStorage.setItem("sm_custom_habits_catalog", JSON.stringify(DEFAULT_HABITS));
    }

    const today = new Date().toDateString();
    const stored = localStorage.getItem(`sm_daily_habits_${today}`);
    if (stored) {
      setCompletedHabits(JSON.parse(stored));
    }
  }, []);

  const handleToggleHabit = async (habitId: string, habitLabel: string) => {
    const today = new Date().toDateString();
    let updated: string[];
    const isAdding = !completedHabits.includes(habitId);

    if (isAdding) {
      updated = [...completedHabits, habitId];

      // Cheer and celebrate reactively in the chatbot!
      setMascotPose("celebrating-success");
      setMascotDialogue(`Hooray! You completed "${habitLabel}"! You're doing awesome at keeping up with your self-care checklist! 🎉`);

      // Log to backend wellness timeline
      try {
        await api.post("/api/wellness", {
          type: "exercise",
          title: `Daily Habit Completed: ${habitLabel}`,
          preview: `Completed the daily behavior milestone: "${habitLabel}". Positive habits trigger gradual behavioral changes.`,
          sentiment: "Positive",
        });
      } catch (err) {
        console.error("Failed to save habit log:", err);
      }
    } else {
      updated = completedHabits.filter((h) => h !== habitId);

      // Curious reaction when unchecking
      setMascotPose("confused-question");
      setMascotDialogue(`Ah, took back "${habitLabel}"? No worries, let's pace ourselves!`);
    }

    setCompletedHabits(updated);
    localStorage.setItem(`sm_daily_habits_${today}`, JSON.stringify(updated));
  };

  // Safety trigger checker
  const checkSafetyTriggers = (text: string) => {
    const triggers = ["suicide", "die", "hurt myself", "kill myself", "end my life", "self harm"];
    const matches = triggers.some((trigger) => text.toLowerCase().includes(trigger));
    if (matches) {
      setShowSafetyBanner(true);
      setMascotPose("holding-heart");
      setMascotDialogue("Please stay safe. Let me help you reach care immediately.");
    }
  };

  // Emotion-reactive mascot logic based on content
  const getReactivePose = (text: string): { pose: HamsterPose; dialogue: string } => {
    const lower = text.toLowerCase();
    if (lower.includes("anxious") || lower.includes("scared") || lower.includes("fear") || lower.includes("panic")) {
      return {
        pose: "escaping-energy",
        dialogue: "Breathe with me. We can let this tense anxiety float away.",
      };
    }
    if (lower.includes("stress") || lower.includes("overwhelmed") || lower.includes("busy") || lower.includes("pressure")) {
      return {
        pose: "balancing-nut",
        dialogue: "One small step at a time. Let's list what we can control.",
      };
    }
    if (lower.includes("sad") || lower.includes("lonely") || lower.includes("depressed") || lower.includes("cry")) {
      return {
        pose: "holding-heart",
        dialogue: "You are not alone. I'm right here holding space for you.",
      };
    }
    if (lower.includes("happy") || lower.includes("glad") || lower.includes("excited") || lower.includes("good") || lower.includes("refreshed")) {
      return {
        pose: "celebrating-success",
        dialogue: "Hooray! Hearing this fills my little heart with joy!",
      };
    }
    if (lower.includes("why") || lower.includes("how") || lower.includes("question") || lower.includes("confused")) {
      return {
        pose: "confused-question",
        dialogue: "Let's explore that mystery together! What do you think?",
      };
    }
    return {
      pose: "thinking-deeply",
      dialogue: "I am reflecting on what you said. Let's find your peace.",
    };
  };

  // Speech Recognition Speech-to-text dictation
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if ((window as any).currentChatRecognition) {
        (window as any).currentChatRecognition.stop();
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
      setMascotDialogue(`Listening... Speak your mind to ${companionName}!`);
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
        setInputVal((prev) => prev + (prev ? " " : "") + transcript.trim());
      }
    };

    (window as any).currentChatRecognition = recognition;
    recognition.start();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsgText = inputVal.trim();
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sessionId,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    checkSafetyTriggers(userMsgText);

    // Swap mascot to cognitive head-scratching typing state
    setIsTyping(true);
    setMascotPose("head-scratching");
    setMascotDialogue("Let me think about that carefully...");

    try {
      // 1. Post to unified chatbot reply endpoint
      const res = await api.post<{ reply: ChatMessage; pose: HamsterPose }>("/api/chats/reply", {
        sessionId,
        text: userMsgText,
      });

      setIsTyping(false);
      
      // 2. Add companion message
      setMessages((prev) => [...prev, res.reply]);
      
      // 3. Update Mascot state reactively from Groq
      setMascotPose(res.pose);
      
      // 4. Update Mascot dialogue bubble text
      setMascotDialogue(res.reply.text);

    } catch (err) {
      console.error("Chatbot API response error:", err);
      setIsTyping(false);
      setMascotPose("confused-question");
      setMascotDialogue("I had a little hiccup connecting, but I'm listening! Tell me more.");
      
      // Fallback local simulation in case of connection failure
      const fallbackResponse = getReactivePose(userMsgText);
      let sparkyReply = "I understand. I'm right here listening.";
      if (userMsgText.toLowerCase().includes("anxious")) {
        sparkyReply = "Feeling anxious is tough. Close your eyes, drop your shoulders, and breathe with me.";
      } else if (userMsgText.toLowerCase().includes("stress")) {
        sparkyReply = "Overwhelm comes when we carry too much. What is one tiny thing we can solve now?";
      }
      
      const fallbackMsg: ChatMessage = {
        id: Math.random().toString(),
        sessionId,
        sender: "sparky",
        text: sparkyReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      api.post("/api/chats", { sessionId, sender: "sparky", text: sparkyReply }).catch(console.error);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "32px",
        height: "calc(100vh - 144px)",
      }}
      className="chatbot-layout"
    >
      {/* Left Area - Chat Thread */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* Safety Takeover Banner */}
        {showSafetyBanner && (
          <div
            style={{
              backgroundColor: "rgba(192, 118, 90, 0.08)",
              borderBottom: "2px solid var(--color-error)",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-error)" }}>
                  Distress Safety Takeover Alert
                </h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Sparky has noticed triggers of deep distress. We want you to be completely safe.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link href="/crisis-sos" className="btn-primary" style={{ backgroundColor: "var(--color-error)", padding: "8px 16px", fontSize: "13px" }}>
                Access SOS
              </Link>
              <button
                onClick={() => setShowSafetyBanner(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Conversation Message List Area */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "14px 18px",
                    borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    backgroundColor: isUser ? "var(--bg-user-bubble)" : "var(--bg-surface)",
                    border: isUser ? "none" : "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-subtle)",
                  }}
                >
                  <p style={{ fontSize: "15px", lineHeight: "1.5", color: "var(--text-primary)" }}>{msg.text}</p>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      marginTop: "6px",
                      textAlign: isUser ? "right" : "left",
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
              <div
                style={{
                  padding: "14px 20px",
                  borderRadius: "20px 20px 20px 4px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div className="typing-dot" />
                <div className="typing-dot" style={{ animationDelay: "0.2s" }} />
                <div className="typing-dot" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            borderTop: "1px solid var(--border-light)",
            padding: "16px 24px",
            display: "flex",
            gap: "12px",
            backgroundColor: "var(--bg-nav)",
            alignItems: "center",
          }}
        >
          {/* Glowing Microphone voice input */}
          <button
            onClick={toggleVoiceInput}
            type="button"
            className="btn-secondary voice-chat-btn"
            style={{
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              borderColor: isListening ? "var(--color-error)" : "var(--color-primary)",
              color: isListening ? "var(--color-error)" : "var(--color-primary)",
              boxShadow: isListening ? "0 0 14px rgba(192, 118, 90, 0.3)" : "none",
              animation: isListening ? "pulse-mic-chat 1.5s infinite" : "none",
            }}
            title="Dictate message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isListening ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>

          <textarea
            placeholder={isListening ? "Listening... Speak now!" : "Type your feelings... (e.g. 'I feel anxious' or 'stress')"}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isListening}
            rows={Math.min(5, inputVal.split("\n").length || 1)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            style={{
              flex: 1,
              borderRadius: "16px",
              padding: "12px 16px",
              backgroundColor: isListening ? "var(--bg-nav)" : "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "1.5px solid var(--border-input)",
              outline: "none",
              resize: "none",
              minHeight: "48px",
              maxHeight: "150px",
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              lineHeight: "1.5",
              transition: "all 0.3s ease",
            }}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: "24px", width: "48px", height: "48px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>

      {/* Right Column - Mascot Feedback Panel & Daily Self-Care Checklist */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          overflowY: "auto",
          maxHeight: "calc(100vh - 144px)",
          paddingRight: "4px"
        }}
      >
        {/* Mascot Card */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "17px", fontFamily: "var(--font-header)", marginBottom: "16px", fontWeight: "600" }}>
            {companionName} Companion
          </h3>
          <Mascot pose={mascotPose} size={150} dialogue="" interactive={false} />

          {/* Dynamic Companion Mood Status Card */}
          {(() => {
            const getPoseDetails = (pose: string): { promise: string; bg: string; border: string; color: string } => {
              switch (pose) {
                case "waving-hello":
                  return { promise: "I am so incredibly happy you're here beside me.", bg: "rgba(79, 110, 138, 0.08)", border: "rgba(79, 110, 138, 0.25)", color: "#7FA3C1" };
                case "holding-heart":
                  return { promise: "You are deeply valued, and I'm right here holding you close.", bg: "rgba(224, 130, 131, 0.08)", border: "rgba(224, 130, 131, 0.25)", color: "#E08283" };
                case "sitting-zen":
                  return { promise: "Let's just take a quiet, calm moment together. No rush at all.", bg: "rgba(90, 148, 117, 0.08)", border: "rgba(90, 148, 117, 0.25)", color: "#5A9475" };
                case "escaping-energy":
                  return { promise: "I've always got your back. You are completely safe with me.", bg: "rgba(235, 151, 78, 0.08)", border: "rgba(235, 151, 78, 0.25)", color: "#EB974E" };
                case "balancing-nut":
                  return { promise: "You don't have to carry the whole world tonight. Let's just rest.", bg: "rgba(169, 146, 196, 0.08)", border: "rgba(169, 146, 196, 0.25)", color: "#A992C4" };
                case "confused-question":
                  return { promise: "I love hearing what's on your mind. Tell me everything.", bg: "rgba(245, 215, 110, 0.08)", border: "rgba(245, 215, 110, 0.25)", color: "#F5D76E" };
                case "celebrating-success":
                  return { promise: "I am so incredibly proud of you! You are doing amazing.", bg: "rgba(244, 208, 63, 0.08)", border: "rgba(244, 208, 63, 0.25)", color: "#F4D03F" };
                case "thinking-deeply":
                  return { promise: "I am listening to every word you say. You have my full attention.", bg: "rgba(107, 185, 240, 0.08)", border: "rgba(107, 185, 240, 0.25)", color: "#6BB9F0" };
                case "sleeping-content":
                  return { promise: "Rest warm and cozy. I'll be right here watching over you.", bg: "rgba(191, 85, 236, 0.08)", border: "rgba(191, 85, 236, 0.25)", color: "#BF55EC" };
                case "head-scratching":
                  return { promise: "Reflecting carefully on how to support you best.", bg: "rgba(149, 165, 166, 0.08)", border: "rgba(149, 165, 166, 0.25)", color: "#95A5A6" };
                default:
                  return { promise: "I am here with you, always and forever.", bg: "rgba(255, 255, 255, 0.04)", border: "var(--border-light)", color: "var(--text-secondary)" };
              }
            };
            const details = getPoseDetails(mascotPose);
            return (
              <div style={{ marginTop: "24px", width: "100%" }}>
                <h4 style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", textAlign: "left" }}>
                  {companionName}&apos;s Promise
                </h4>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    backgroundColor: details.bg,
                    border: `1.5px solid ${details.border}`,
                    boxShadow: "var(--shadow-subtle)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", flex: 1 }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: details.color,
                        transition: "color 0.4s ease",
                        textAlign: "left",
                        lineHeight: "1.4"
                      }}
                    >
                      &ldquo;{details.promise}&rdquo;
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", textAlign: "left" }}>
                      Always by your side
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Daily Self-Care Checklist Card */}
        <div
          className="glass-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", fontFamily: "var(--font-header)", fontWeight: "600" }}>
              Daily Self-Care
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
              {completedHabits.length}/{habits.length} Done
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div 
              style={{ 
                width: `${habits.length > 0 ? (completedHabits.length / habits.length) * 100 : 0}%`, 
                height: "100%", 
                backgroundColor: "var(--color-success)", 
                borderRadius: "3px",
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }} 
            />
          </div>

          {/* Checklist items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px", overflowY: "auto", maxHeight: "220px", paddingRight: "4px" }}>
            {habits.map((h) => {
              const isChecked = completedHabits.includes(h.id);
              return (
                <div 
                  key={h.id}
                  onClick={() => handleToggleHabit(h.id, h.label)}
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
                      border: isChecked ? `2px solid ${h.color || "var(--color-success)"}` : "2px solid var(--border-input)",
                      backgroundColor: isChecked ? (h.color || "var(--color-success)") : "transparent",
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

                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span 
                      style={{ 
                        fontSize: "13px", 
                        fontWeight: "500", 
                        color: isChecked ? "var(--text-secondary)" : "var(--text-primary)",
                        textDecoration: isChecked ? "line-through" : "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {h.label}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.3" }}>
                      {h.desc.length > 50 ? h.desc.slice(0, 50) + "..." : h.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              Need guided exercises?
            </span>
            <Link 
              href="/exercises" 
              style={{ 
                fontSize: "11px", 
                color: "var(--color-primary)", 
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Coping Center →
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-mic-chat {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); box-shadow: 0 0 14px rgba(192, 118, 90, 0.5); }
          100% { transform: scale(1); }
        }

        .checklist-item-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .checklist-item-hover:hover {
          background-color: rgba(255, 255, 255, 0.04) !important;
          border-color: var(--color-primary-light, rgba(169, 146, 196, 0.3)) !important;
          transform: translateY(-1px);
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-secondary);
          opacity: 0.4;
          animation: typing-indicator 1.2s infinite alternate;
        }
        @keyframes typing-indicator {
          from {
            opacity: 0.4;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        @media (max-width: 960px) {
          .chatbot-layout {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
