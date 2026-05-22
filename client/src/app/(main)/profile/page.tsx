"use client";

import React, { useState, useEffect, useMemo } from "react";
import Mascot, { HamsterPose } from "../../components/Mascot";

interface UserPersona {
  age: string;
  occupation: string;
  sleepHours: string;
  stressLevel: number;
   triggers: string[];
  selfCareScale: number;
  mentalGoal: string;
}

interface AdoptedMascot {
  name: string;
  eggType: string;
  initialPersonality: string;
  level: number;
  xp: number;
}

const AVATARS = [
  { id: "bird", emoji: "🐦", label: "Calm Serene Bird", bg: "rgba(91, 127, 166, 0.12)" },
  { id: "hamster", emoji: "🐹", label: "Happy Hamster", bg: "rgba(125, 170, 143, 0.12)" },
  { id: "koala", emoji: "🐨", label: "Zen Koala", bg: "rgba(169, 146, 196, 0.12)" },
  { id: "cheetah", emoji: "🐆", label: "Motivated Cheetah", bg: "rgba(192, 118, 90, 0.12)" },
];

export default function ProfilePage() {
  const [activeAvatar, setActiveAvatar] = useState("hamster");
  const [persona, setPersona] = useState<UserPersona>({
    age: "24",
    occupation: "Student / Developer",
    sleepHours: "7-8 hours",
    stressLevel: 6,
    triggers: ["Academic Pressure", "General Worries"],
    selfCareScale: 7,
    mentalGoal: "Achieve Calmer Baselines",
  });

  const [mascot, setMascot] = useState<AdoptedMascot | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form Temp State
  const [tempAge, setTempAge] = useState("");
  const [tempOccupation, setTempOccupation] = useState("");
  const [tempSleepHours, setTempSleepHours] = useState("");
  const [tempStress, setTempStress] = useState(5);
  const [tempSelfCare, setTempSelfCare] = useState(5);
  const [tempGoal, setTempGoal] = useState("");
  const [tempTriggers, setTempTriggers] = useState<string[]>([]);

  const availableTriggers = [
    "Academic Pressure",
    "Social Anxiety",
    "Work Burnout",
    "Insomnia",
    "Health Anxiety",
    "General Worries",
  ];

  // Load profile and mascot states from localStorage
  useEffect(() => {
    // 1. Load Persona
    const savedPersona = localStorage.getItem("user-persona");
    if (savedPersona) {
      try {
        const parsed = JSON.parse(savedPersona);
        setPersona(parsed);
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Load Avatar
    const savedAvatar = localStorage.getItem("user-avatar");
    if (savedAvatar) {
      setActiveAvatar(savedAvatar);
    }

    // 3. Load Mascot
    const savedMascot = localStorage.getItem("adopted-mascot");
    if (savedMascot) {
      try {
        setMascot(JSON.parse(savedMascot));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleEditClick = () => {
    setTempAge(persona.age);
    setTempOccupation(persona.occupation);
    setTempSleepHours(persona.sleepHours);
    setTempStress(persona.stressLevel);
    setTempSelfCare(persona.selfCareScale);
    setTempGoal(persona.mentalGoal);
    setTempTriggers([...persona.triggers]);
    setIsEditing(true);
  };

  const handleSavePersona = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserPersona = {
      age: tempAge,
      occupation: tempOccupation,
      sleepHours: tempSleepHours,
      stressLevel: tempStress,
      triggers: tempTriggers,
      selfCareScale: tempSelfCare,
      mentalGoal: tempGoal,
    };

    setPersona(updated);
    localStorage.setItem("user-persona", JSON.stringify(updated));
    setIsEditing(false);
    alert("Your SereneMind Mental Health Persona has been updated successfully!");
  };

  const handleAvatarChange = (avatarId: string) => {
    setActiveAvatar(avatarId);
    localStorage.setItem("user-avatar", avatarId);
  };

  const toggleTrigger = (trigger: string) => {
    if (tempTriggers.includes(trigger)) {
      setTempTriggers(tempTriggers.filter((t) => t !== trigger));
    } else {
      setTempTriggers([...tempTriggers, trigger]);
    }
  };

  // Behavior evolution engine based on logs
  const mascotEvolution = useMemo(() => {
    if (!mascot) return { level: 1, title: "Hatchling Bond", state: "Calm Observer", pose: "waving-hello" as HamsterPose, desc: "Still getting to know your habits." };

    // Fetch unified logs
    const savedLogs = localStorage.getItem("wellness-logs");
    let logsCount = 0;
    let positiveCount = 0;
    let stressedCount = 0;

    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        logsCount = parsed.length;
        positiveCount = parsed.filter((l: any) => l.sentiment === "Positive").length;
        stressedCount = parsed.filter((l: any) => l.sentiment === "Stressed" || l.sentiment === "Anxious").length;
      } catch (e) {
        console.error(e);
      }
    }

    // Dynamic level upgrades
    let currentLevel = 1;
    let title = "Mindful Hatchling";
    let state = "Gentle Observer";
    let pose: HamsterPose = "waving-hello";
    let desc = "Sparky is monitoring your baseline activities to stabilize pacing.";

    if (logsCount >= 6 || positiveCount >= 3) {
      currentLevel = 3;
      title = "Serenity Guardian";
      state = "Zen Master";
      pose = "sitting-zen";
      desc = "Evolved into Zen Master! Providing advanced cognitive balance shielding.";
    } else if (logsCount >= 3 || positiveCount >= 1) {
      currentLevel = 2;
      title = "Mindful Shield";
      state = "Uplifting Guide";
      pose = "celebrating-success";
      desc = "Upgraded to Level 2! Actively pacing anxiety sparks with you.";
    }

    // Stress adaptive state override
    if (stressedCount >= 2 && currentLevel < 3) {
      state = "Empathy Anchor";
      pose = "holding-heart";
      desc = "Noticed overlapping stressors in logs. Sparky shifted into Empathy Anchor!";
    }

    return { level: currentLevel, title, state, pose, desc };
  }, [mascot]);

  const currentAvatar = AVATARS.find((a) => a.id === activeAvatar) || AVATARS[1];

  // Clinical Insights Generator
  const clinicalInsights = useMemo(() => {
    const sleepRisk = persona.sleepHours.includes("<5") || persona.sleepHours.includes("5-6");
    const stressRisk = persona.stressLevel >= 7;
    const triggersCount = persona.triggers.length;

    let level = "Balanced Baseline";
    let color = "var(--color-success)";
    let desc = "Your baseline sleep and self-care commitment indicate steady nervous system regulation. Continue deep box breathing pacers.";

    if (sleepRisk && stressRisk) {
      level = "Hyperarousal Spark Warning";
      color = "var(--color-error)";
      desc = "Sleep debt (<6h) coupled with high stress risks autonomic hyperarousal. Highly recommend pacing with 4-7-8 Breathing exercises and journaling daily.";
    } else if (stressRisk || triggersCount >= 3) {
      level = "Elevated Autonomic Stress";
      color = "var(--color-accent)";
      desc = "Elevated stress triggers detected. Sparky recommends setting structural boundaries. Complete a chatbot coping conversation twice this week.";
    }

    return { level, color, desc };
  }, [persona]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "32px",
      }}
      className="profile-layout"
    >
      {/* Left Column - Avatar & Mascot Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Avatar Card */}
        <div
          className="glass-card"
          style={{
            padding: "24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: currentAvatar.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              boxShadow: "var(--shadow-subtle)",
              border: "3.5px solid var(--color-primary)",
            }}
          >
            {currentAvatar.emoji}
          </div>

          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "600" }}>Rishabh Rai</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{persona.occupation}</p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--border-light)", width: "100%" }} />

          {/* Profile Picture Avatar Selection Grid */}
          <div style={{ width: "100%" }}>
            <h4 style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "10px", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Select Avatar
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {AVATARS.map((av) => {
                const isSelected = activeAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => handleAvatarChange(av.id)}
                    style={{
                      height: "44px",
                      borderRadius: "10px",
                      border: isSelected ? "2.5px solid var(--color-primary)" : "1.5px solid var(--border-light)",
                      backgroundColor: isSelected ? "var(--bg-user-bubble)" : "var(--bg-surface)",
                      fontSize: "20px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    title={av.label}
                  >
                    {av.emoji}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mascot partnership card */}
        {mascot ? (
          <div
            className="glass-card"
            style={{
              padding: "24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              border: "1.5px solid var(--color-secondary)",
              background: "linear-gradient(145deg, var(--bg-surface) 0%, rgba(125, 170, 143, 0.02) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "baseline" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-secondary)", textTransform: "uppercase" }}>
                Active Bond
              </span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>
                LVL {mascotEvolution.level}
              </span>
            </div>

            <Mascot pose={mascotEvolution.pose} size={110} dialogue="" interactive={false} />

            <div>
              <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                {mascot.name}
              </h4>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  backgroundColor: "rgba(125, 170, 143, 0.12)",
                  color: "var(--color-success)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  display: "inline-block",
                  marginTop: "2px",
                }}
              >
                {mascotEvolution.state}
              </span>
            </div>

            <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              {mascotEvolution.desc}
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              No Mascot Adopted yet. Go to your Dashboard to choose and hatch your Egg!
            </p>
          </div>
        )}
      </div>

      {/* Right Column - Persona questionnaire and Clinical Reports */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Clinically Insights widget */}
        <section
          className="glass-card"
          style={{
            padding: "24px",
            borderLeft: `5px solid ${clinicalInsights.color}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              Autonomic Telemetry Assessment
            </h4>
            <span style={{ fontSize: "12px", fontWeight: "700", color: clinicalInsights.color, textTransform: "uppercase" }}>
              {clinicalInsights.level}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {clinicalInsights.desc}
          </p>
        </section>

        {/* Persona telemetry intake/edit section */}
        <section className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-header)", fontWeight: 500 }}>
                Validated Mental Health Persona
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                Detailed telemetry factors that configure SereneMind AI diagnostics models.
              </p>
            </div>
            {!isEditing && (
              <button onClick={handleEditClick} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "10px" }}>
                Edit Persona
              </button>
            )}
          </div>

          {isEditing ? (
            /* Editing form */
            <form onSubmit={handleSavePersona} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Age</label>
                  <input
                    type="number"
                    value={tempAge}
                    onChange={(e) => setTempAge(e.target.value)}
                    required
                    style={{ fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Occupation / Focus</label>
                  <input
                    type="text"
                    value={tempOccupation}
                    onChange={(e) => setTempOccupation(e.target.value)}
                    required
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Typical Sleep Hours</label>
                  <select
                    value={tempSleepHours}
                    onChange={(e) => setTempSleepHours(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1.5px solid var(--border-input)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  >
                    <option value="<5 hours">&lt;5 hours (Risk level)</option>
                    <option value="5-6 hours">5-6 hours (Moderate debt)</option>
                    <option value="7-8 hours">7-8 hours (Balanced range)</option>
                    <option value="8+ hours">8+ hours (High replenishment)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Mental Health Focus Goal</label>
                  <select
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1.5px solid var(--border-input)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  >
                    <option value="Reduce Panic Sparks">Reduce Panic Sparks</option>
                    <option value="Achieve Calmer Baselines">Achieve Calmer Baselines</option>
                    <option value="Build Self-Compassion">Build Self-Compassion</option>
                    <option value="Gain Focus Momentum">Gain Focus Momentum</option>
                  </select>
                </div>
              </div>

              {/* Sliders */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Typical Stress Level: <strong style={{ color: "var(--color-error)" }}>{tempStress}/10</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={tempStress}
                    onChange={(e) => setTempStress(Number(e.target.value))}
                    style={{ cursor: "pointer", height: "6px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Self-Care Commitment: <strong style={{ color: "var(--color-success)" }}>{tempSelfCare}/10</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={tempSelfCare}
                    onChange={(e) => setTempSelfCare(Number(e.target.value))}
                    style={{ cursor: "pointer", height: "6px" }}
                  />
                </div>
              </div>

              {/* Triggers Checklist */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Active Anxious Triggers
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {availableTriggers.map((tr) => {
                    const active = tempTriggers.includes(tr);
                    return (
                      <button
                        type="button"
                        key={tr}
                        onClick={() => toggleTrigger(tr)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: active ? "2.5px solid var(--color-accent)" : "1.5px solid var(--border-light)",
                          backgroundColor: active ? "rgba(169, 146, 196, 0.08)" : "var(--bg-surface)",
                          color: active ? "var(--color-accent)" : "var(--text-secondary)",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {tr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            /* Review Panel */
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Age</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "4px" }}>{persona.age} Years</div>
                </div>
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Sleep Pattern</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "4px" }}>{persona.sleepHours}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Autonomic Stress Level</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-error)", marginTop: "4px" }}>{persona.stressLevel} / 10</div>
                </div>
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Self-Care Commitment</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-success)", marginTop: "4px" }}>{persona.selfCareScale} / 10</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px" }}>Primary Health Goal</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-primary)" }}>{persona.mentalGoal}</div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px" }}>Identified Anxiety Triggers</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {persona.triggers.map((tr) => (
                    <span
                      key={tr}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "14px",
                        backgroundColor: "var(--bg-nav)",
                        border: "1px solid var(--border-light)",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                      }}
                    >
                      ⚠️ {tr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .profile-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
