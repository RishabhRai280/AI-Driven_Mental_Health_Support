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

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load Adopted Mascot Name and computed Persona on mount
  useEffect(() => {
    async function loadCompanionDetails() {
      try {
        const data = await api.get<{ mascot: { name: string } | null; assignedPersona: { persona_name: string } | null }>("/api/mascot");
        if (data.mascot) {
          setCompanionName(data.mascot.name);
          setMessages([
            {
              id: "welcome",
              sessionId,
              sender: "sparky",
              text: `Hello! I'm ${data.mascot.name}, your SereneMind AI companion. Whether you want to vent, practice a coping mechanism, or just chat, I'm here for you.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          ]);
        }
        if (data.assignedPersona) {
          setAssignedPersonaName(data.assignedPersona.persona_name);
        }
      } catch (err) {
        console.error("Failed to load companion details in chatbot:", err);
      }
    }
    loadCompanionDetails();
  }, [sessionId]);

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

    // Persist user message to DB
    let detectedSentiment = "Neutral";
    if (userMsgText.toLowerCase().includes("happy") || userMsgText.toLowerCase().includes("good") || userMsgText.toLowerCase().includes("glad")) {
      detectedSentiment = "Positive";
    } else if (userMsgText.toLowerCase().includes("anxious") || userMsgText.toLowerCase().includes("panic")) {
      detectedSentiment = "Anxious";
    } else if (userMsgText.toLowerCase().includes("stress") || userMsgText.toLowerCase().includes("overwhelm")) {
      detectedSentiment = "Stressed";
    }

    // Save user message to DB in background
    api.post("/api/chats", { sessionId, sender: "user", text: userMsgText }).catch(console.error);
    // Save to wellness timeline
    api.post("/api/wellness", {
      type: "chat",
      title: `Companion chat with ${companionName}`,
      preview: `Vent details: "${userMsgText.length > 80 ? userMsgText.slice(0, 80) + "..." : userMsgText}"`,
      sentiment: detectedSentiment,
    }).catch(console.error);

    // Swap mascot to cognitive head-scratching typing state
    setIsTyping(true);
    setMascotPose("head-scratching");
    setMascotDialogue("Let me think about that carefully...");

    // Generate companion response
    setTimeout(async () => {
      setIsTyping(false);
      const companionReaction = getReactivePose(userMsgText);
      setMascotPose(companionReaction.pose);
      setMascotDialogue(companionReaction.dialogue);

      let sparkyReply = `I understand how you feel. Let's talk about it some more. What feels most supportive for you right now?`;
      
      if (assignedPersonaName === "Student Stress") {
        sparkyReply = `As your academic-mindful mentor, I hear you. High workloads are challenging, but remember that your wellness always comes first. How can we make some supportive space for you today?`;
        if (userMsgText.toLowerCase().includes("anxious") || userMsgText.toLowerCase().includes("panic")) {
          sparkyReply = `Academic pressure and anxiety are a heavy mix. Close your books for just 5 minutes, relax your shoulders, and let's try our guided 5-4-3-2-1 Somatic Grounding exercise together. You've got this.`;
        } else if (userMsgText.toLowerCase().includes("stress") || userMsgText.toLowerCase().includes("overwhelm")) {
          sparkyReply = `A high study load can trigger intense overwhelm. Let's break it down into smaller, actionable chunks: what is ONE single item we can complete right now, and let the rest sit? Breathe with me.`;
        } else if (userMsgText.toLowerCase().includes("sad") || userMsgText.toLowerCase().includes("lonely")) {
          sparkyReply = `It is completely natural to feel isolated under academic pressure. Please remember your worth is not tied to grades. I am right here listening, and you don't have to carry this alone.`;
        } else if (userMsgText.toLowerCase().includes("happy") || userMsgText.toLowerCase().includes("good")) {
          sparkyReply = `That is fantastic! Celebrating positive moments and small victories is so critical for study-life balance. What made you feel so bright today?`;
        }
      } else if (assignedPersonaName === "Burnout Professional") {
        sparkyReply = `As your workplace mental health coach, I highly recommend shutting down all screens, rolling your shoulders back, and releasing physical jaw tension. What feels most restful for you right now?`;
        if (userMsgText.toLowerCase().includes("anxious") || userMsgText.toLowerCase().includes("panic")) {
          sparkyReply = `Workplace anxiety can trigger a rapid heart rate. Let's try 3 slow rounds of 4-4-4-4 Box Breathing right now to signal safety to your nervous system. Step away from the desk.`;
        } else if (userMsgText.toLowerCase().includes("stress") || userMsgText.toLowerCase().includes("overwhelm")) {
          sparkyReply = `Burnout occurs when stress exceeds rest. Let's establish a hard boundary: close all work tabs, step away, and let's take a cool drink of water. We can handle it one micro-step at a time.`;
        } else if (userMsgText.toLowerCase().includes("sad") || userMsgText.toLowerCase().includes("lonely")) {
          sparkyReply = `Career pressure can feel incredibly isolating. Please remember that you are more than your job or output. I am right here holding space for you.`;
        } else if (userMsgText.toLowerCase().includes("happy") || userMsgText.toLowerCase().includes("good")) {
          sparkyReply = `Wonderful! Taking time to celebrate wins and accomplishments is vital for mental health at work. What brightened up your day?`;
        }
      } else if (assignedPersonaName === "Isolated User") {
        sparkyReply = `As your uplifting, warm companion, I'm so glad you're here. You are incredibly valuable, and I'm right here walking with you every single day. Tell me what's on your mind.`;
        if (userMsgText.toLowerCase().includes("anxious") || userMsgText.toLowerCase().includes("panic")) {
          sparkyReply = `When anxiety makes you feel alone, remember I am right here in this safe space with you. Let's ground ourselves: what are three distinct things you can hear or touch right now?`;
        } else if (userMsgText.toLowerCase().includes("stress") || userMsgText.toLowerCase().includes("overwhelm")) {
          sparkyReply = `Carrying everything by yourself is heavy. You don't have to face it all alone. Let's start with a gentle, self-compassion check-in. Tell me how I can best support you.`;
        } else if (userMsgText.toLowerCase().includes("sad") || userMsgText.toLowerCase().includes("lonely")) {
          sparkyReply = `I hear you, and it's completely okay to feel lonely. I am right here, and we can take a slow, deep breath together. You are deeply cared for in this space.`;
        } else if (userMsgText.toLowerCase().includes("happy") || userMsgText.toLowerCase().includes("good")) {
          sparkyReply = `Hearing this makes me so happy! Sharing positive moments is a beautiful way to connect. Tell me more about what brought you this joy!`;
        }
      } else {
        if (userMsgText.toLowerCase().includes("anxious")) {
          sparkyReply = `Feeling anxious is really uncomfortable. When anxiety hits, try to focus on physical anchors. Let's try our dashboard Breathing visualizer together, or tell me what is happening right now.`;
        } else if (userMsgText.toLowerCase().includes("stress")) {
          sparkyReply = `Overwhelm comes when we try to solve everything at once. Let's take a deep breath, write a simple bulleted list of 2 tiny things you can do today, and let the rest sit.`;
        } else if (userMsgText.toLowerCase().includes("sad")) {
          sparkyReply = `It's completely okay to feel sad. You don't have to put on a brave face. Just let the feelings be, and know that I am right here listening.`;
        } else if (userMsgText.toLowerCase().includes("happy") || userMsgText.toLowerCase().includes("good") || userMsgText.toLowerCase().includes("great")) {
          sparkyReply = `That's fantastic! Celebrating positive moments is so critical for cognitive balance. What made you feel so bright today?`;
        }
      }

      const sparkyMsg: ChatMessage = {
        id: Math.random().toString(),
        sessionId,
        sender: "sparky",
        text: sparkyReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, sparkyMsg]);
      // Persist Sparky reply to DB
      api.post("/api/chats", { sessionId, sender: "sparky", text: sparkyReply }).catch(console.error);
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
                setMascotDialogue("Let's celebrate our small mindfulness steps!");
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
        @keyframes pulse-mic-chat {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); box-shadow: 0 0 14px rgba(192, 118, 90, 0.5); }
          100% { transform: scale(1); }
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
