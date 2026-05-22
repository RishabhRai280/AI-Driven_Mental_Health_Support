# Master UI/UX & High-Fidelity Wireframe Index

This document serves as the master design system specification, structural blueprint, and central index for **SereneMind's** high-fidelity textual page wireframes. 

All layouts strictly adhere to the psychological principles, hex color tokens, and accessibility guidelines defined in the [Color Theory Framework](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/mental_health_chatbot_color_framework.md).

---

## 1. Global Layout Specifications

The SereneMind Next.js application enforces two standardized layout systems to guarantee visual consistency and reduce cognitive load for users.

### A. The Split-Screen Authentication Layout (Login & Registration)
Designed for `/login` and `/register` to present a clean, supportive, and balanced onboarding environment.
* **Layout Rule**: 50/50 horizontal viewport split (`display: flex; min-height: 100vh; width: 100vw; flex-direction: row;`).
* **Column 1 (Login: Input Left | Register: Mascot Left)**: Takes up exactly `50%` of the viewport width. Focuses entirely on clear input fields with spacious margins (`padding: 48px 80px`).
* **Column 2 (Login: Mascot Right | Register: Input Right)**: Takes up exactly `50%` of the viewport width. Displays the comforting visual mascot inside a peaceful glass card container (`aspect-ratio: 1 / 1; max-width: 480px`).
* **Mobile Breakpoint**: Swaps to a simple single-column vertical layout (`flex-direction: column`) stacking the content panels naturally, prioritizing form input accessibility.

### B. The Universal Authenticated Layout (Logged-In Pages)
Designed for all user-centric dashboard and care pages (`/dashboard`, `/chatbot`, `/journaling`, `/history`, `/analysis`, `/exercises`).
* **Sidebar Column Navigation**: Fixed `280px` width. Sticky positioning (`position: sticky; top: 0; height: 100vh;`). Houses primary navigation pill items and encapsulates the critical, high-visibility **Emergency SOS Lifeline Action Button** at the bottom (themed in sienna Warm Terracotta `#C0765A`).
* **Top Header Component**: Fixed `72px` height. Displays page status tags on the left, and anchors the **User Photo/Avatar** circular frame container (`40x40px`, with initials fallback) in the top-right corner alongside notifications and wellness streak counters.
* **Main Content Area**: Flexible width container (`1fr`). Fully responsive, using a standard `24px` grid padding with smooth scroll capabilities and glassmorphism cards.

---

## 2. Spacing & Typography Foundations

* **Grid Spacing System**:
  * Page Padding: `24px` (mobile) to `40px` (desktop grids).
  * Component Gaps: `12px` (inline selectors), `16px` (form inputs), `24px` (card catalog grids).
  * Card Margins: `20px` to `28px` padding with `20px` border-radius curves.
* **Typography Scale**:
  * Primary Font: `Outfit` (Headings, titles, badges). Weights: `500` (emphasis/headers), `400` (supporting lines). *Avoid heavy weights (700+) to prevent aggressive tone.*
  * Body Font: `Inter` (Inputs, text blocks, conversations). Weights: `400` (body copy), `500` (emphasized metadata). Minimum size is `14px` (meta), `16px` (standard copy), `18px` (journal editor).
  * Line-height: `1.6` or greater for comfortable text layout.

---

## 3. High-Fidelity Page Wireframes Index

The application's structural pages are fully specified as high-fidelity blueprints containing explicit HSL colors, responsive layout instructions, interactive hover/active scales, accessibility mappings, and ASCII layout diagrams. Select a file to view its exact specification:

1.  **[Landing Page (Home)](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/LandingPage.md)**
    *   *Public Route*: `/`
    *   *Core Focus*: Gentle onboarding entryway, 3-column glassmorphic feature cards, Outfit headers, clinical emergency disclaimer footer.
2.  **[Login / Register](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/LoginRegisterPage.md)**
    *   *Auth Routes*: `/login` & `/register`
    *   *Core Focus*: The dual-inverse split layout. Left input / Right mascot for Login, Left mascot / Right input for Registration. Features accessible inputs and Terracotta error guides.
3.  **[Main Dashboard](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/DashboardPage.md)**
    *   *User Route*: `/dashboard`
    *   *Core Focus*: Main entry hub integrating the Sidebar and Avatar Header. Daily Mood check-in buttons with exact framework opacity tags, quick actions, and the biofeedback breathing animation.
4.  **[Chatbot Interface](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/ChatbotPage.md)**
    *   *User Route*: `/chatbot`
    *   *Core Focus*: Borderless conversational viewport. Bot bubbles with left Sage Mist boundaries, User bubbles with Blue Wash/Night Blue fills, typing pacing dots, and safety overlay takeovers.
5.  **[Journaling Workspace](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/JournalingPage.md)**
    *   *User Route*: `/journaling`
    *   *Core Focus*: Distraction-free blank parchment editor, real-time autosave indicators, and a right-hand AI sentiment tag board using designated opacity hues.
6.  **[History & Summaries](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/HistoryPage.md)**
    *   *User Route*: `/history`
    *   *Core Focus*: Timeline lists using custom session icons and mood tags, paired with a sticky AI summary generator outputting narrative paragraphs utilizing Deep Sage highlights.
7.  **[Mood Analysis](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/AnalysisPage.md)**
    *   *User Route*: `/analysis`
    *   *Core Focus*: 7-column calendar mood heatmap with distinct HSL opacity values, stacked emotion bar charts (Joy, Calm, Anxiety, Frustration), and cognitive correlation tags.
8.  **[Crisis SOS System](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/CrisisSOSPage.md)**
    *   *Emergency Route*: `/crisis-sos`
    *   *Core Focus*: Full-screen modal takeover with a solid sienna Warm Terracotta border. prominent dial actions for lines, personal safe contacts lists, somatic breathing triggers, and exit routes.
9.  **[Recommended Exercises](file:///Users/rishabhrai/Coding/AI-Driven_Mental_Health_Support/Docs/Pages/ExercisePage.md)**
    *   *User Route*: `/exercises`
    *   *Core Focus*: Personalized exercise suggestion banner, filterable mindfulness catalogs, and the active Breathing Player full-screen modal trapping focus on key breathing pacer animations.

---

## 4. Master Design Tokens Cheat Sheet

For engineering speed and absolute brand accuracy, reference the following CSS design variables from `globals.css` when building elements:

```css
:root {
  /* Core Psychology Framework Brand Colors */
  --color-primary:        #5B7FA6;  /* Heather Blue: Calm brand anchor */
  --color-secondary:      #7DAA8F;  /* Sage Mist: Grounding nature accent */
  --color-accent:         #A992C4;  /* Soft Lavender: Empathy triggers */
  --color-error:          #C0765A;  /* Warm Terracotta: Safe warnings */
  --color-success:        #5A9475;  /* Deep Sage: Supportive affirmations */

  /* Light Mode Surface Backgrounds */
  --bg-page-light:        #F4F1EC;  /* Warm Parchment: distraction-free canvas */
  --bg-surface-light:     #FFFFFF;  /* Card white */
  --bg-nav-light:         #EEEBE4;  /* Dusty Linen: Navigation elevation */
  --bg-user-bubble-light: rgba(91, 127, 166, 0.13); /* User chat blue wash */

  /* Dark Mode Surface Backgrounds ("Moonlight Model") */
  --bg-page-dark:         #1E2228;  /* Midnight Slate: Soft navy slate */
  --bg-nav-dark:          #252B33;  /* Deep Pewter navigation */
  --bg-surface-dark:      #2A2F38;  /* Soft Graphite card bubble */
  --bg-user-bubble-dark:  #3A5070;  /* Night Blue user chat wash */

  /* Typography Colors */
  --text-primary-light:   #2C2F35;  /* Charcoal: Soft light mode text */
  --text-secondary-light: #6B7280;  /* Slate Gray: helper text */
  --text-primary-dark:    #EAE8E3;  /* Warm Cream: Soft dark mode text */
  --text-secondary-dark:  #9CA3AF;  /* Cool Mist: dark helper text */

  /* Bot message safety border */
  --bot-bubble-border:    #7DAA8F;  /* Sage Mist left line */
}
```
