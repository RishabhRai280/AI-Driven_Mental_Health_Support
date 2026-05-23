"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export type HamsterPose =
  | "waving-hello"
  | "shy-peeking"
  | "holding-heart"
  | "sitting-zen"
  | "escaping-energy"
  | "balancing-nut"
  | "confused-question"
  | "head-scratching"
  | "thinking-deeply"
  | "sleeping-content"
  | "celebrating-success"
  | "carrying-basket"
  | "lost-map"
  | "holding-magnifying-glass"
  | "examining-closely"
  | "running-excited";

export type CompanionType = "golden-hamster" | "goldie" | "otter" | "pandi";

export interface MascotProps {
  pose: HamsterPose;
  dialogue?: string;
  size?: number;
  className?: string;
  interactive?: boolean;
  companionType?: CompanionType;
}

export default function Mascot({
  pose,
  dialogue,
  size = 200,
  className = "",
  interactive = true,
  companionType,
}: MascotProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [compType, setCompType] = useState<CompanionType>("golden-hamster");

  useEffect(() => {
    const cached = localStorage.getItem("serenemind-companion-type");
    if (cached) {
      setCompType(cached as CompanionType);
    }
  }, []);

  const activeCompanion = companionType || compType;

  // Map pose to a readable description or helper message
  const defaultBubbleText: Record<HamsterPose, string> = {
    "waving-hello": "Hi there! I'm your SereneMind buddy. How are you today?",
    "shy-peeking": "Welcome back! Don't worry, your secrets are completely safe with me.",
    "holding-heart": "Remember that you are worthy of care, kindness, and love. I'm right here.",
    "sitting-zen": "Breathe in... Breathe out. Let's find our center together.",
    "escaping-energy": "Whoosh! It's okay to feel energetic or a bit anxious. Let's shake it off!",
    "balancing-nut": "Trying to balance everything? Take it one tiny step at a time.",
    "confused-question": "Hmm? Tell me more, let's untangle this puzzle together.",
    "head-scratching": "Oh, interesting! Let me ponder on that for a second...",
    "thinking-deeply": "Let's reflect on this. What does your heart tell you?",
    "sleeping-content": "Yawn... All saved in the cloud. Take a deep, peaceful rest.",
    "celebrating-success": "Hurrah! You did it! Every small victory deserves a celebration!",
    "carrying-basket": "Look at all these memories we have gathered together!",
    "lost-map": "It's quiet here. Let's start a new journey whenever you are ready.",
    "holding-magnifying-glass": "Aha! I see patterns here. Let's look closer at your progress.",
    "examining-closely": "Ooh, this is a beautiful trend! Let's understand your mood fluctuations.",
    "running-excited": "Let's move and refresh! A little exercise does wonders for our minds!",
  };

  const bubbleText = dialogue || defaultBubbleText[pose] || "I'm right here with you.";

  // Dynamic file path routing based on selected companion type
  let imageSrc = `/mascot/golden-hamster-golden-hamster-${pose}.svg`;

  if (activeCompanion === "goldie") {
    let goldiePose = "greeting";
    if (pose === "waving-hello" || pose === "holding-heart" || pose === "lost-map") {
      goldiePose = "greeting";
    } else if (pose === "sitting-zen" || pose === "shy-peeking" || pose === "examining-closely") {
      goldiePose = "listening";
    } else if (pose === "escaping-energy" || pose === "running-excited") {
      goldiePose = "zooming";
    } else if (pose === "balancing-nut" || pose === "thinking-deeply" || pose === "holding-magnifying-glass") {
      goldiePose = "thinking";
    } else if (pose === "confused-question" || pose === "head-scratching") {
      goldiePose = "confused";
    } else if (pose === "sleeping-content") {
      goldiePose = "sleeping";
    } else if (pose === "celebrating-success") {
      goldiePose = "celebrating";
    } else if (pose === "carrying-basket") {
      goldiePose = "holding-bone";
    }
    imageSrc = `/mascot/goldie-goldie-${goldiePose}.svg`;
  } else if (activeCompanion === "otter") {
    let otterPose = "yoga";
    if (pose === "sitting-zen") {
      otterPose = "yoga";
    } else if (pose === "waving-hello" || pose === "celebrating-success") {
      otterPose = "confetti";
    } else if (pose === "shy-peeking") {
      otterPose = "lounging";
    } else if (pose === "holding-heart") {
      otterPose = "in-love";
    } else if (pose === "escaping-energy" || pose === "running-excited") {
      otterPose = "skateboard";
    } else if (pose === "balancing-nut") {
      otterPose = "clipboard";
    } else if (pose === "confused-question") {
      otterPose = "error";
    } else if (pose === "head-scratching") {
      otterPose = "dropped-the-db";
    } else if (pose === "thinking-deeply" || pose === "holding-magnifying-glass" || pose === "examining-closely") {
      otterPose = "brainstorming";
    } else if (pose === "sleeping-content") {
      otterPose = "hammock";
    } else if (pose === "carrying-basket") {
      otterPose = "picnic";
    } else if (pose === "lost-map") {
      otterPose = "cloudwatching";
    }
    imageSrc = `/mascot/otter-otter-${otterPose}.svg`;
  } else if (activeCompanion === "pandi") {
    let pandiPose = "yoga";
    if (pose === "sitting-zen") {
      pandiPose = "yoga";
    } else if (pose === "waving-hello" || pose === "celebrating-success" || pose === "holding-heart") {
      pandiPose = "lounging";
    } else if (pose === "shy-peeking") {
      pandiPose = "lounging";
    } else if (pose === "escaping-energy" || pose === "running-excited") {
      pandiPose = "skateboard";
    } else if (pose === "balancing-nut" || pose === "confused-question" || pose === "head-scratching") {
      pandiPose = "clipboard";
    } else if (pose === "thinking-deeply" || pose === "holding-magnifying-glass" || pose === "examining-closely") {
      pandiPose = "research-development";
    } else if (pose === "sleeping-content") {
      pandiPose = "hammock";
    } else if (pose === "carrying-basket") {
      pandiPose = "picnic";
    } else if (pose === "lost-map") {
      pandiPose = "cloudwatching";
    }
    imageSrc = `/mascot/pandi-pandi-${pandiPose}.svg`;
  }

  return (
    <div
      className={`mascot-container ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: interactive ? "pointer" : "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setClicked(false);
      }}
      onClick={() => interactive && setClicked((prev) => !prev)}
    >
      {/* Speech bubble */}
      {(hovered || clicked || dialogue) && (
        <div
          className="mascot-speech-bubble"
          style={{
            position: "absolute",
            bottom: `${size + 15}px`,
            backgroundColor: "rgba(18, 19, 38, 0.9)",
            color: "#EAE8E3",
            padding: "14px 18px",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(167, 139, 250, 0.15)",
            border: "1.5px solid rgba(167, 139, 250, 0.35)",
            fontSize: "13px",
            fontWeight: "500",
            maxWidth: "240px",
            textAlign: "center",
            zIndex: 10,
            animation: "fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            pointerEvents: "none",
            backdropFilter: "blur(12px)",
          }}
        >
          {bubbleText}
          {/* Bubble tail */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "14px",
              height: "14px",
              backgroundColor: "rgba(18, 19, 38, 0.9)",
              borderRight: "1.5px solid rgba(167, 139, 250, 0.35)",
              borderBottom: "1.5px solid rgba(167, 139, 250, 0.35)",
            }}
          />
        </div>
      )}

      {/* Mascot Image */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: "relative",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: hovered ? "scale(1.08) translateY(-4px)" : "scale(1)",
        }}
      >
        <Image
          src={imageSrc}
          alt={`SereneMind Mascot - ${pose}`}
          fill
          priority
          style={{
            objectFit: "contain",
            filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.05))",
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
