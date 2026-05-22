"use client";

import React, { useState, useEffect, useMemo } from "react";
import Mascot, { HamsterPose } from "../../components/Mascot";
import { useAuth } from "../../context/AuthContext";
import { api, MascotData, PersonaData } from "../../lib/api";

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
}

const AVATARS = [
  { id: "bird", label: "Calm Serene Bird", initials: "SB", bg: "rgba(91, 127, 166, 0.9)" },
  { id: "hamster", label: "Happy Hamster", initials: "RC", bg: "rgba(125, 170, 143, 0.9)" },
  { id: "koala", label: "Zen Koala", initials: "ZK", bg: "rgba(169, 146, 196, 0.9)" },
  { id: "cheetah", label: "Motivated Cheetah", initials: "MC", bg: "rgba(192, 118, 90, 0.9)" },
];

export default function ProfilePage() {
  const { user } = useAuth();

  const [activeAvatar, setActiveAvatar] = useState("hamster");
  const [persona, setPersona] = useState<UserPersona>({
    age: "24",
    occupation: "Student / Developer",
    sleepHours: "7-8 hours",
    stressLevel: 5,
    triggers: ["Academic Pressure", "General Worries"],
    selfCareScale: 6,
    mentalGoal: "Achieve Calmer Baselines",
  });

  const [mascot, setMascot] = useState<AdoptedMascot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dbLogs, setDbLogs] = useState<any[]>([]);

  // Form Temp State
  const [tempAge, setTempAge] = useState("");
  const [tempOccupation, setTempOccupation] = useState("");
  const [tempSleepHours, setTempSleepHours] = useState("");
  const [tempGoal, setTempGoal] = useState("");
  const [tempTriggers, setTempTriggers] = useState<string[]>([]);

  // Interactive diagnostic questionnaire states (choices 0 to 3)
  const [stressAnswers, setStressAnswers] = useState<number[]>([1, 1, 1, 1]);
  const [careAnswers, setCareAnswers] = useState<number[]>([2, 1, 1, 1]);

  // Additional parameters temp state
  const [waterIntake, setWaterIntake] = useState("1-2 Liters");
  const [screenTime, setScreenTime] = useState("5-8 Hours");
  const [socialContext, setSocialContext] = useState("Neutral Connection");
  const [physicalActivity, setPhysicalActivity] = useState("Light Walking / Yoga");

  const availableTriggers = [
    "Academic Pressure",
    "Social Anxiety",
    "Work Burnout",
    "Insomnia",
    "Health Anxiety",
    "General Worries",
  ];

  // Load profile and mascot states directly from DB
  useEffect(() => {
    async function loadDBProfile() {
      try {
        const data = await api.get<{ mascot: MascotData | null; persona: PersonaData | null }>("/api/mascot");
        
        if (data.persona) {
          // Parse dynamic tags from triggers
          const triggersList = data.persona.triggers || [];
          setPersona({
            age: String(data.persona.age),
            occupation: data.persona.occupation,
            sleepHours: data.persona.sleepHours,
            stressLevel: data.persona.stressLevel,
            selfCareScale: data.persona.selfCareScale,
            mentalGoal: data.persona.mentalGoal,
            triggers: triggersList,
          });

          // Set temp state default
          setTempAge(String(data.persona.age));
          setTempOccupation(data.persona.occupation);
          setTempSleepHours(data.persona.sleepHours);
          setTempGoal(data.persona.mentalGoal);
          
          // Parse water, screen time, social context, physical activity
          const water = triggersList.find(t => t.startsWith("water:"))?.replace("water:", "") || "1-2 Liters";
          const screen = triggersList.find(t => t.startsWith("screentime:"))?.replace("screentime:", "") || "5-8 Hours";
          const social = triggersList.find(t => t.startsWith("social:"))?.replace("social:", "") || "Neutral Connection";
          const activity = triggersList.find(t => t.startsWith("activity:"))?.replace("activity:", "") || "Light Walking / Yoga";
          
          setWaterIntake(water);
          setScreenTime(screen);
          setSocialContext(social);
          setPhysicalActivity(activity);

          // Clean triggers (filter out composite parameters)
          const baseTriggers = triggersList.filter(t => !t.startsWith("water:") && !t.startsWith("screentime:") && !t.startsWith("social:") && !t.startsWith("activity:"));
          setTempTriggers(baseTriggers);
        }

        if (data.mascot) {
          setMascot({
            name: data.mascot.name,
            eggType: data.mascot.eggType,
            initialPersonality: data.mascot.personality,
            level: data.mascot.level,
          });
        }

        // Fetch wellness logs directly from DB to calculate evolution status
        const logsData = await api.get<{ logs: any[] }>("/api/wellness");
        setDbLogs(logsData.logs || []);
      } catch (e) {
        console.error("Failed to load user credentials profile:", e);
      }
    }
    loadDBProfile();

    const savedAvatar = localStorage.getItem("user-avatar");
    if (savedAvatar) {
      setActiveAvatar(savedAvatar);
    }
  }, []);

  // Calculated dynamic levels
  const calculatedStress = useMemo(() => {
    const sum = stressAnswers.reduce((a, b) => a + b, 0);
    return Math.max(1, Math.min(10, Math.round((sum / 12) * 9) + 1));
  }, [stressAnswers]);

  const calculatedSelfCare = useMemo(() => {
    const sum = careAnswers.reduce((a, b) => a + b, 0);
    return Math.max(1, Math.min(10, Math.round((sum / 12) * 9) + 1));
  }, [careAnswers]);

  const handleEditClick = () => {
    setTempAge(persona.age);
    setTempOccupation(persona.occupation);
    setTempSleepHours(persona.sleepHours);
    setTempGoal(persona.mentalGoal);
    
    const baseTriggers = persona.triggers.filter(t => !t.startsWith("water:") && !t.startsWith("screentime:") && !t.startsWith("social:") && !t.startsWith("activity:"));
    setTempTriggers(baseTriggers);
    
    setIsEditing(true);
  };

  const handleSavePersona = async (e: React.FormEvent) => {
    e.preventDefault();

    // Embed diagnostic telemetry parameters cleanly into triggers array
    const compositeTriggers = [
      ...tempTriggers,
      `water:${waterIntake}`,
      `screentime:${screenTime}`,
      `social:${socialContext}`,
      `activity:${physicalActivity}`,
    ];

    const updated: UserPersona = {
      age: tempAge,
      occupation: tempOccupation,
      sleepHours: tempSleepHours,
      stressLevel: calculatedStress,
      triggers: compositeTriggers,
      selfCareScale: calculatedSelfCare,
      mentalGoal: tempGoal,
    };

    try {
      await api.post("/api/mascot/persona", {
        age: parseInt(tempAge),
        occupation: tempOccupation,
        sleepHours: tempSleepHours,
        stressLevel: calculatedStress,
        selfCareScale: calculatedSelfCare,
        mentalGoal: tempGoal,
        triggers: compositeTriggers,
      });

      setPersona(updated);
      setIsEditing(false);
      alert("Your SereneMind Mental Health Persona has been successfully updated in the PostgreSQL database!");
    } catch (err) {
      console.error("Failed to save persona:", err);
      alert("Could not update profile in the database. Please try again.");
    }
  };

  const handleAvatarChange = (avatarId: string) => {
    setActiveAvatar(avatarId);
    localStorage.setItem("user-avatar", avatarId);
    // Dispatches storage event so Header component re-evaluates avatar initials background color
    window.dispatchEvent(new Event("storage"));
  };

  const toggleTrigger = (trigger: string) => {
    if (tempTriggers.includes(trigger)) {
      setTempTriggers(tempTriggers.filter((t) => t !== trigger));
    } else {
      setTempTriggers([...tempTriggers, trigger]);
    }
  };

  // Behavior evolution engine based on real DB logs
  const mascotEvolution = useMemo(() => {
    if (!mascot) return { level: 1, title: "Hatchling Bond", state: "Calm Observer", pose: "waving-hello" as HamsterPose, desc: "Still getting to know your habits." };

    const logsCount = dbLogs.length;
    const positiveCount = dbLogs.filter((l: any) => l.sentiment === "Positive").length;
    const stressedCount = dbLogs.filter((l: any) => l.sentiment === "Stressed" || l.sentiment === "Anxious").length;

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

    if (stressedCount >= 2 && currentLevel < 3) {
      state = "Empathy Anchor";
      pose = "holding-heart";
      desc = "Noticed overlapping stressors in logs. Sparky shifted into Empathy Anchor!";
    }

    return { level: currentLevel, title, state, pose, desc };
  }, [mascot, dbLogs]);

  const currentAvatar = AVATARS.find((a) => a.id === activeAvatar) || AVATARS[1];

  // Clinical Insights Generator
  const clinicalInsights = useMemo(() => {
    const sleepRisk = persona.sleepHours.includes("<5") || persona.sleepHours.includes("5-6");
    const stressRisk = persona.stressLevel >= 7;
    const cleanTriggers = persona.triggers.filter(t => !t.startsWith("water:") && !t.startsWith("screentime:") && !t.startsWith("social:") && !t.startsWith("activity:"));
    const triggersCount = cleanTriggers.length;

    let level = "Balanced Baseline";
    let color = "var(--color-success)";
    let desc = "Your baseline sleep and self-care commitment indicate steady nervous system regulation. Continue deep box breathing pacers.";

    if (sleepRisk && stressRisk) {
      level = "Hyperarousal Spark Warning";
      color = "var(--color-error)";
      desc = "Sleep debt Coupled with high stress risks autonomic hyperarousal. Highly recommend pacing with 4-7-8 Breathing exercises and journaling daily.";
    } else if (stressRisk || triggersCount >= 3) {
      level = "Elevated Autonomic Stress";
      color = "var(--color-accent)";
      desc = "Elevated stress triggers detected. Sparky recommends setting structural boundaries. Complete a chatbot coping conversation twice this week.";
    }

    return { level, color, desc };
  }, [persona]);

  // Clean elements parsed from composite triggers for view panel
  const parsedWater = useMemo(() => persona.triggers.find(t => t.startsWith("water:"))?.replace("water:", "") || "1-2 Liters", [persona.triggers]);
  const parsedScreen = useMemo(() => persona.triggers.find(t => t.startsWith("screentime:"))?.replace("screentime:", "") || "5-8 Hours", [persona.triggers]);
  const parsedSocial = useMemo(() => persona.triggers.find(t => t.startsWith("social:"))?.replace("social:", "") || "Neutral Connection", [persona.triggers]);
  const parsedActivity = useMemo(() => persona.triggers.find(t => t.startsWith("activity:"))?.replace("activity:", "") || "Light Walking / Yoga", [persona.triggers]);
  const parsedCleanTriggers = useMemo(() => persona.triggers.filter(t => !t.startsWith("water:") && !t.startsWith("screentime:") && !t.startsWith("social:") && !t.startsWith("activity:")), [persona.triggers]);

  const updateStressChoice = (qIdx: number, val: number) => {
    const copy = [...stressAnswers];
    copy[qIdx] = val;
    setStressAnswers(copy);
  };

  const updateCareChoice = (qIdx: number, val: number) => {
    const copy = [...careAnswers];
    copy[qIdx] = val;
    setCareAnswers(copy);
  };

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
              fontWeight: "800",
              color: "#FFFFFF",
              fontSize: "36px",
              boxShadow: "var(--shadow-subtle)",
              border: "3.5px solid var(--color-primary)",
            }}
          >
            {currentAvatar.initials}
          </div>

          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{user?.displayName || "Ranjeet choudhary"}</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{persona.occupation}</p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--border-light)", width: "100%" }} />

          {/* Profile Picture Avatar Selection Grid */}
          <div style={{ width: "100%" }}>
            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "10px", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
                      fontSize: "14px",
                      fontWeight: "700",
                      color: isSelected ? "var(--color-primary)" : "var(--text-primary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    title={av.label}
                  >
                    {av.initials}
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
            <form onSubmit={handleSavePersona} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

              {/* Stress Questions */}
              <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-error)" }}>
                  Autonomic Stress Diagnostic Questionnaire
                </h4>
                {[
                  "1. Feel unable to control important life events?",
                  "2. Feel nervous, stressed, or hyperaroused?",
                  "3. Struggle to sleep or turn off circular worries?",
                  "4. Feel physically fatigued, tight-chested, or tense?"
                ].map((q, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>{q}</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {["Never", "Rarely", "Often", "Always"].map((label, val) => {
                        const selected = stressAnswers[idx] === val;
                        return (
                          <button
                            type="button"
                            key={val}
                            onClick={() => updateStressChoice(idx, val)}
                            style={{
                              padding: "6px",
                              borderRadius: "6px",
                              fontSize: "10px",
                              fontWeight: "600",
                              cursor: "pointer",
                              border: selected ? "2px solid var(--color-error)" : "1px solid var(--border-light)",
                              backgroundColor: selected ? "rgba(192, 118, 90, 0.08)" : "var(--bg-surface)",
                              color: selected ? "var(--color-error)" : "var(--text-secondary)",
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Self Care Questions */}
              <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-success)" }}>
                  Self-Care Dedication Questionnaire
                </h4>
                {[
                  "1. Practice deliberate breathing, pacing, or stretching?",
                  "2. Log your active mood or write reflective journals?",
                  "3. Set boundaries between work/study pressure and rest?",
                  "4. Seek wellness guides or use companion coping tools?"
                ].map((q, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>{q}</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {["Never", "Rarely", "Moderately", "Highly"].map((label, val) => {
                        const selected = careAnswers[idx] === val;
                        return (
                          <button
                            type="button"
                            key={val}
                            onClick={() => updateCareChoice(idx, val)}
                            style={{
                              padding: "6px",
                              borderRadius: "6px",
                              fontSize: "10px",
                              fontWeight: "600",
                              cursor: "pointer",
                              border: selected ? "2px solid var(--color-success)" : "1px solid var(--border-light)",
                              backgroundColor: selected ? "rgba(125, 170, 143, 0.08)" : "var(--bg-surface)",
                              color: selected ? "var(--color-success)" : "var(--text-secondary)",
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional parameters */}
              <div className="glass-card" style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Daily Water Intake
                  </label>
                  <select value={waterIntake} onChange={(e) => setWaterIntake(e.target.value)}>
                    <option value="Under 1 Liter">Under 1 Liter</option>
                    <option value="1-2 Liters">1-2 Liters</option>
                    <option value="2-3 Liters">2-3 Liters</option>
                    <option value="Over 3 Liters">Over 3 Liters</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Screen Time Exposure
                  </label>
                  <select value={screenTime} onChange={(e) => setScreenTime(e.target.value)}>
                    <option value="Under 2 Hours">Under 2 Hours</option>
                    <option value="2-5 Hours">2-5 Hours</option>
                    <option value="5-8 Hours">5-8 Hours</option>
                    <option value="Over 8 Hours">Over 8 Hours</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Social Context Support
                  </label>
                  <select value={socialContext} onChange={(e) => setSocialContext(e.target.value)}>
                    <option value="Feeling Isolated">Feeling Isolated</option>
                    <option value="Neutral Connection">Neutral Connection</option>
                    <option value="Strong Support Network">Strong Support Network</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Physical Activity Rate
                  </label>
                  <select value={physicalActivity} onChange={(e) => setPhysicalActivity(e.target.value)}>
                    <option value="Sedentary baseline">Sedentary baseline</option>
                    <option value="Light Walking / Yoga">Light Walking / Yoga</option>
                    <option value="Heavy Workout / Cardio">Heavy Workout / Cardio</option>
                  </select>
                </div>
              </div>

              {/* Questionnaire score calculations indicators */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "rgba(192,118,90,0.12)", color: "var(--color-error)", padding: "4px 10px", borderRadius: "10px" }}>
                  Stress Score: {calculatedStress} / 10
                </span>
                <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "rgba(125,170,143,0.12)", color: "var(--color-success)", padding: "4px 10px", borderRadius: "10px" }}>
                  Self-Care Index: {calculatedSelfCare} / 10
                </span>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Daily Water Intake</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "4px" }}>{parsedWater}</div>
                </div>
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Screen Time Exposure</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "4px" }}>{parsedScreen}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Social Support Context</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "4px" }}>{parsedSocial}</div>
                </div>
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Physical Activity Rate</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "4px" }}>{parsedActivity}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px" }}>Primary Health Goal</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-primary)" }}>{persona.mentalGoal}</div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px" }}>Identified Anxiety Triggers</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {parsedCleanTriggers.map((tr) => (
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
                      {tr}
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
