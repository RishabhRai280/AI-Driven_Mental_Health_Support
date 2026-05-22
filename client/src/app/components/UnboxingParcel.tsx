"use client";

import React from "react";

interface UnboxingParcelProps {
  tapCount: number;
  isShaking: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function UnboxingParcel({ tapCount, isShaking, onClick }: UnboxingParcelProps) {
  // Crop window inside the 1536x1024 vector coordinates of Parcel (package).svg
  // Column 1 (Closed): ~120 to 550
  // Column 2 (Partially Open): ~560 to 990
  // Column 3 (Fully Open + Confetti): ~1010 to 1440
  let xOffset = 120;
  if (tapCount >= 5) {
    xOffset = 1010;
  } else if (tapCount >= 1) {
    xOffset = 560;
  }

  // Visual cues for remaining taps
  const remaining = Math.max(0, 5 - tapCount);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: tapCount >= 5 ? "default" : "pointer",
        padding: "10px",
      }}
      className={`parcel-unbox-wrapper ${isShaking ? "parcel-shake-anim" : ""} ${tapCount >= 5 ? "parcel-complete-state" : ""}`}
    >
      {/* Glow highlight behind the active parcel stage */}
      <div
        style={{
          position: "absolute",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: tapCount >= 5
            ? "radial-gradient(circle, rgba(169, 146, 196, 0.25) 0%, rgba(255,255,255,0) 70%)"
            : "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 1,
          pointerEvents: "none",
          transform: isShaking ? "scale(1.1)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
      />

      {/* Embedded Crop SVG Container */}
      <div
        style={{
          position: "relative",
          width: "260px",
          height: "320px",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        className="parcel-vector-container"
      >
        <svg
          viewBox={`${xOffset} 240 430 550`}
          width="100%"
          height="100%"
          style={{
            transition: "all 0.6s cubic-bezier(0.19, 1, 0.22, 1)",
            filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.16)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))",
          }}
        >
          {/* Load raw high-res master SVG file using crop coordinate mapping */}
          <image
            href="/Parcel (package).svg"
            x="0"
            y="0"
            width="1536"
            height="1024"
          />
        </svg>

        {/* Tactile remaining click prompt badges floating over the parcel */}
        {remaining > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "800",
              padding: "6px 14px",
              borderRadius: "20px",
              boxShadow: "0 6px 16px rgba(91,127,166,0.4)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              pointerEvents: "none",
              letterSpacing: "0.5px",
              animation: "bouncePrompt 2s infinite ease-in-out",
            }}
          >
            {remaining} TAPS REMAINING
          </div>
        )}
      </div>

      <style jsx global>{`
        .parcel-unbox-wrapper {
          user-select: none;
        }
        .parcel-vector-container:hover {
          transform: scale(1.05) translateY(-4px);
        }
        .parcel-unbox-wrapper:active .parcel-vector-container {
          transform: scale(0.96) translateY(2px);
        }
        .parcel-complete-state .parcel-vector-container {
          animation: floatComplete 3s infinite ease-in-out;
        }
        .parcel-complete-state .parcel-vector-container:hover {
          transform: scale(1) translateY(0);
        }
        .parcel-shake-anim {
          animation: wigglePack 0.16s infinite ease-in-out;
        }

        @keyframes wigglePack {
          0% { transform: rotate(0deg) scale(1.04); }
          25% { transform: rotate(-4deg) scale(1.04); }
          50% { transform: rotate(0deg) scale(1.04); }
          75% { transform: rotate(4deg) scale(1.04); }
          100% { transform: rotate(0deg) scale(1.04); }
        }

        @keyframes floatComplete {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }

        @keyframes bouncePrompt {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
