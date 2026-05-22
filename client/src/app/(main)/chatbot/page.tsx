"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Mascot, { HamsterPose } from "../../components/Mascot";

interface Message {
  id: string;
  sender: "user" | "sparky";
  text: string;
  timestamp: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "sparky",
      text: "Hello! I'm Sparky, your SereneMind AI companion. Whether you want to vent, practice a coping mechanism, or just chat, I'm here for you.",
      timestamp: "10:00 AM",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [mascotPose, setMascotPose] = useState<HamsterPose>("waving-hello");
  const [mascotDialogue, setMascotDialogue] = useState("Let's talk! I'm listening.");
  const [isTyping, setIsTyping] = useState(false);
  const [showSafetyBanner, setShowSafetyBanner] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
    if (lower.includes("happy") || lower.includes("glad") || lower.includes("excited") || lower.includes("good")) {
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsgText = inputVal;
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    checkSafetyTriggers(userMsgText);

    // Swap mascot to cognitive head-scratching typing state
    setIsTyping(true);
    setMascotPose("head-scratching");
    setMascotDialogue("Let me think about that carefully...");

    // Generate companion response
    setTimeout(() => {
      setIsTyping(false);
      const companionReaction = getReactivePose(userMsgText);
      setMascotPose(companionReaction.pose);
      setMascotDialogue(companionReaction.dialogue);

      let sparkyReply = "I understand how you feel. Let's talk about it some more. What feels most supportive for you right now?";
      if (userMsgText.toLowerCase().includes("anxious")) {
        sparkyReply = "Feeling anxious is really uncomfortable. When anxiety hits, try to focus on physical anchors. Let's try our dashboard Breathing visualizer together, or tell me what is happening right now.";
      } else if (userMsgText.toLowerCase().includes("stress")) {
        sparkyReply = "Overwhelm comes when we try to solve everything at once. Let's take a deep breath, write a simple bulleted list of 2 tiny things you can do today, and let the rest sit.";
      } else if (userMsgText.toLowerCase().includes("sad")) {
        sparkyReply = "It's completely okay to feel sad. You don't have to put on a brave face. Just let the feelings be, and know that I am right here listening.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "sparky",
          text: sparkyReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
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
              <span style={{ fontSize: "24px" }}>⚠️</span>
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
          }}
        >
          <input
            type="text"
            placeholder="Type your feelings... (e.g. 'I feel anxious' or 'stress')"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              borderRadius: "24px",
              height: "48px",
            }}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: "24px", width: "48px", height: "48px", padding: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>

      {/* Right Column - Mascot Feedback Panel */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "18px", fontFamily: "var(--font-header)", marginBottom: "20px" }}>Sparky Companion</h3>
        <Mascot pose={mascotPose} size={180} dialogue={mascotDialogue} interactive={false} />

        <div style={{ marginTop: "32px", width: "100%" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>Sparky&apos;s Emotion Control</h4>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Sparky reacts automatically, but you can manually ask how he is feeling too:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={() => {
                setMascotPose("sitting-zen");
                setMascotDialogue("I am deep in meditation. Breathe in peace.");
              }}
              className="btn-secondary"
              style={{ padding: "8px", fontSize: "12px", borderRadius: "12px" }}
            >
              🧘 Zen
            </button>
            <button
              onClick={() => {
                setMascotPose("celebrating-success");
                setMascotDialogue("Let&apos;s celebrate our small mindfulness steps!");
              }}
              className="btn-secondary"
              style={{ padding: "8px", fontSize: "12px", borderRadius: "12px" }}
            >
              🎉 Happy
            </button>
            <button
              onClick={() => {
                setMascotPose("thinking-deeply");
                setMascotDialogue("Pondering. Emotional depth is a beautiful thing.");
              }}
              className="btn-secondary"
              style={{ padding: "8px", fontSize: "12px", borderRadius: "12px" }}
            >
              🧠 Thoughtful
            </button>
            <button
              onClick={() => {
                setMascotPose("sleeping-content");
                setMascotDialogue("All safe, cozy, and tucked in. Zzz...");
              }}
              className="btn-secondary"
              style={{ padding: "8px", fontSize: "12px", borderRadius: "12px" }}
            >
              💤 Resting
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          backgroundColor: var(--text-secondary);
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
