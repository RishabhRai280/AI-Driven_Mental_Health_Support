# UI/UX Wireframe & Design System Specifications

To establish a calming, intuitive, and premium user experience, this document outlines **SereneMind's** design tokens, typography, layout guidelines, and wireframe specifications.

---

## 1. Design System & Style Tokens

Our design approach utilizes a **Premium Glassmorphic Dark Mode**. The layout is designed to reduce sensory overload, featuring soft gradients, generous margins, rounded corners, and clear typography.

### 1.1. Color Palette (HSL System)
We avoid harsh, standard colors, preferring curated HSL values that evoke tranquil, steady emotional states.

```css
:root {
  /* Brand Backgrounds */
  --bg-primary: HSL(210, 30%, 8%);         /* Calming Deep Navy Slate */
  --bg-secondary: HSL(210, 25%, 15%);       /* Soft Card Slate */
  --bg-glass: HSL(210, 25%, 15%, 0.6);      /* Semi-transparent Glass card */
  
  /* Brand Accents */
  --accent-teal: HSL(175, 50%, 40%);        /* Healing Deep Teal */
  --accent-lavender: HSL(260, 45%, 75%);    /* Calming Soft Lavender */
  --accent-mint: HSL(150, 45%, 65%);        /* Reassuring Soft Mint */
  
  /* Safety Indicators */
  --crisis-red: HSL(355, 60%, 60%);         /* Empathetic Soft Coral Red */
  
  /* Typography Colors */
  --text-primary: HSL(0, 0%, 95%);          /* Clean, Soft Off-white */
  --text-secondary: HSL(210, 10%, 70%);     /* Muted Grey */
  
  /* Glassmorphism Borders */
  --border-glass: HSL(0, 0%, 100%, 0.08);   /* Micro-thin reflective border */
}
```

### 1.2. Design System Components
*   **Cards**: `.glass-card { background: var(--bg-glass); backdrop-filter: blur(12px); border: 1px solid var(--border-glass); border-radius: 20px; padding: 20px; }`
*   **Typography**: Using Google Font `Outfit` or `Inter` to provide thin, elegant letter spacing and rounder curves for an approachable aesthetic.

---

## 2. Screen Layouts & Wireframes

Here are the detailed wireframes of the three core screens designed to drive the SereneMind user journey.

````carousel
# Slide 1: Primary Dashboard
![SereneMind Dashboard](/Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/assets/serenemind_dashboard.png)
### Interactive Elements & Components
*   **Daily Mood Check-in Widget**: A high-fidelity circular dial with an interactive thumb. Users slide to log mood (1–10). Soft micro-animations update the emoji emoji and text status (e.g., *CALM*, *HAPPY*, *ANXIOUS*).
*   **Weekly Trend Sparkline**: Visualizes emotional balance fluctuations using a smooth cubic Bezier line with gradient fill beneath. Hovering reveals specific daily mood spikes.
*   **Mindfulness Audio Feed**: Custom grid displaying trending guided sessions (e.g., *Guided Sleep Meditation*, *Stress Relief Breathing*). Each thumbnail features a semi-transparent play button.
*   **AI Therapist Call-to-Action**: A full-width glassmorphic banner colored in Soft Lavender. Clicking launches the empathetic companion workspace immediately.

<!-- slide -->

# Slide 2: AI Therapist Chat
![SereneMind Chat Interface](/Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/assets/serenemind_chat.png)
### Interactive Elements & Components
*   **Conversational Bubbles**:
    *   *SereneAI responses*: Deep teal background with white text, positioned on the left. Includes sentiment analysis badges (e.g., `Anxious`, `Overwhelmed`) below.
    *   *User responses*: Soft lavender background with dark slate text, positioned on the right.
*   **Typing Indicator**: Features a triple-dot pulsing animation showing when the AI is processing thoughts.
*   **Emergency Crisis Overlay**: A prominent, bright coral red safety button `Get Crisis Support` fixed above the input bar. Tapping immediately launches the crisis escalation UI.
*   **Glassmorphic Input Bar**: Encased in a thin border featuring direct microphone recording, media attachment, and text entry actions.

<!-- slide -->

# Slide 3: Analytics & Emotional Maps
![SereneMind Analytics & Insights](/Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/assets/serenemind_analytics.png)
### Interactive Elements & Components
*   **Monthly Emotional Heatmap**: Grid-based representation of the user’s month. Days are color-coded by dominant logged emotions (Teal = Calm, Mint = Happy, Yellow = Neutral, Lavender = Stress, Purple = Anxiety).
*   **AI-Generated Triggers Card**: Text-based breakdown linking physical factors with emotions. Uses simple, actionable bullet points (e.g., *"Sleep quality has a 75% correlation with lower anxiety levels"*).
*   **Emotional Stacked Bar Chart**: Dynamic visual showing daily emotional shares over a rolling 4-week window, giving users deep insights into chronic mood shifts.
````
