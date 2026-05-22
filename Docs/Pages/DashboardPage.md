# High-Fidelity Wireframe: Main Dashboard

This wireframe details the structural, visual, and interactive specifications for the authenticated Main Dashboard page of SereneMind.

---

## 1. Page Information
* **Route**: `/dashboard`
* **Layout Goal**: Provide a grounding overview of the user's mental wellness, featuring immediate, low-friction entry points for care, self-reflection, and calming exercises.
* **Layout System**: 2-Column Responsive Layout (`280px` fixed Sidebar + `1fr` flexible Content Panel).
* **Font Typography**: `Outfit` for headers/titles, `Inter` for regular body content.

---

## 2. Layout Structure Preview (Grid & Flex System)

```
+---------------------------------------------------------------------------------------------------------+
| [LOGO] SereneMind    |  Dashboard                    (Streak: [5 Days] [Bell Icon] [User Avatar Photo]) |
|                      |  "You are in a safe space"                                                       |
| ---------------------+---------------------------------------------------------------------------------- |
|                      |                                                                                  |
|  SIDEBAR NAV         |  A. DAILY MOOD CHECK-IN                                                          |
|  (Width: 280px)      |  +----------------------------------------------------------------------------+  |
|                      |  | How are you feeling right now?                                             |  |
|  [Home/Dashboard]    |  |                                                                            |  |
|  [Chatbot Companion] |  |   (Anxious)     (Calm)      (Sad)     (Frustrated)     [Okay (Selected)]   |  |
|  [Journaling]        |  |    #5B7FA6       #7DAA8F     #A992C4      #C0765A         #7DAA8F (2px Bdr)  |  |
|  [History & Logs]    |  +----------------------------------------------------------------------------+  |
|  [Mood Analysis]     |                                                                                  |
|  [Exercises]         |  B. QUICK ACTIONS (Grid: 2-Columns)                                              |
|                      |  +-------------------------------------+ +-------------------------------------+  |
|                      |  | 💬 Start Empathetic Session         | | 📝 Write Today's Journal            |  |
|                      |  | "Chat with SereneAI in absolute     | | "Jot down your feelings, thoughts,  |  |
|                      |  | privacy and find calm guidance."    | | and reflections to release stress."  |  |
|                      |  |                 [Chat Now (Pill)]   | |               [Open Journal (Pill)]  |  |
|                      |  +-------------------------------------+ +-------------------------------------+  |
|                      |                                                                                  |
| -------------------- |  C. BREATHING BIOFEEDBACK (Pulsing Circle Element)                               |
|                      |  +----------------------------------------------------------------------------+  |
|                      |  |                                                                            |  |
|  [EMERGENCY SOS]     |  |                         ((((  PULSING PACER  ))))                           |  |
|  (Warm Terracotta,   |  |                         - 4s Cycle, Opacity Pulse                          |  |
|   1.5px Outline,     |  |                         - Sage Mist <-> Soft Lavender                      |  |
|   Custom Warning     |  |                                                                            |  |
|   Icon, 48px target) |  +----------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Specifications (Global & Component Layers)

### A. Universal Layout & Header (Top Bar)
* **Global Grid Shell**: `display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; background-color: var(--bg-page);`.
* **Universal Header (Authenticated)**:
  * Style: `height: 72px; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-nav-light) (#EEEBE4) / var(--bg-nav-dark) (#252B33); border-bottom: 1px solid var(--border-light) (#E0DDD7) (in Light Mode);`.
  * **Left Side - Page Title**:
    * Page Name: "Dashboard", `font-size: 20px; font-weight: 500; color: var(--text-primary);`.
    * Sub-label: "You are in a safe, private space", `font-size: 12px; color: var(--text-secondary);`.
  * **Right Side - User Context Actions**:
    * Flex-container `gap: 20px; align-items: center;`.
    * *Streak Pill*: `display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 16px; background-color: rgba(90, 148, 117, 0.1); border: 1px solid var(--color-success) (#5A9475); color: var(--color-success); font-size: 13px; font-weight: 500;`. Supports fire/streak graphic vector.
    * *Notification Indicator*: Accessible button (`44x44px`), bell icon, active badge dot using `--color-accent` (`#A992C4`).
    * *User Avatar Container (Photo)*:
      * Shape: Circular container `40x40px` dimensions.
      * Border: `1.5px solid var(--color-primary) (#5B7FA6)`.
      * Content: User-uploaded profile photo. If null, displays fallback: linear gradient background (Soft Lavender `#A992C4` to Heather Blue `#5B7FA6`) showing initials `"U"` in `#FFFFFF`, size `14px`, weight `500`.

---

### B. Universal Sidebar Navigation
* **Container**: `width: 280px; height: 100vh; position: sticky; top: 0; background-color: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; padding: 24px 16px; border-right: 1px solid var(--border-light) (#E0DDD7) (Light Mode only).`.
* **Top Navigation Links**:
  * Flex-container `display: flex; flex-direction: column; gap: 8px; width: 100%;`.
  * **Nav Item Styling**:
    * Base: `height: 48px; border-radius: 12px; display: flex; align-items: center; padding: 0 16px; gap: 12px; color: var(--text-primary); font-size: 15px; font-weight: 400; cursor: pointer; transition: all 0.2s;`.
    * Focus State: `:focus-visible { outline: 2px solid var(--color-primary); }`.
    * Active/Selected Item: Background `rgba(91, 127, 166, 0.1)` (10% Heather Blue opacity), left border line `4px solid var(--color-primary) (#5B7FA6)`, text color `--color-primary`, font-weight `500`.
* **Bottom Sidebar Section**:
  * **Emergency SOS Lifeline Action Button**:
    * Style: Fixed at bottom of nav links. `height: 48px; border-radius: 24px; border: 1.5px solid var(--color-error) (#C0765A); color: var(--color-error); background: transparent; font-weight: 500; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.15s ease;`.
    * On Press: `transform: scale(0.97); ease 100ms;`.
    * Icon: SVG caution triangle alert tint `--color-error` (`#C0765A`).

---

### C. Dashboard Specific Widgets

#### Widget A: Daily Mood Check-in Card
* **Card Style**: Glass card layout. Padding `28px; border-radius: 24px; background: var(--bg-surface); border: 1.5px solid var(--border-light);`.
* **Header Title**: "How are you feeling right now?", `font-size: 18px; font-weight: 500; margin-bottom: 20px; color: var(--text-primary);`.
* **Selectors Row**: `display: flex; gap: 16px; align-items: center; flex-wrap: wrap;`.
* **Mood Circular Buttons**:
  * Base: `width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid transparent; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; transition: all 0.25s ease; outline: none; position: relative;`.
  * Touch Area target: Visual is `56x56px` (exceeds the 44px standard).
  * **Visual Tints per Emotion**:
    * *Anxious*: Muted blue. Background `#5B7FA6` at 15% opacity. Hover: border `1.5px solid #5B7FA6`.
    * *Calm*: Soft green. Background `#7DAA8F` at 15% opacity. Hover: border `1.5px solid #7DAA8F`.
    * *Sad*: Muted purple. Background `#A992C4` at 15% opacity. Hover: border `1.5px solid #A992C4`.
    * *Frustrated*: Warm Terracotta. Background `#C0765A` at 15% opacity. Hover: border `1.5px solid #C0765A`.
    * *Okay (Selected state representation)*: Background `#7DAA8F` at 20% opacity. Border: `2px solid var(--color-secondary) (#7DAA8F)`. Included checkbox checkmark vector overlay on top right.

#### Widget B: Quick Actions (Grid Grid Layout)
* **Grid System**: `display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;` (Mobile: `grid-template-columns: 1fr;`).
* **Interactive Cards**:
  * Style: Glass card container. Border-radius `20px; padding: 24px; border: 1.5px solid var(--border-light); display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; transition: all 0.2s ease;`.
  * Hover translation: border-color deepens slightly, card rises `translateY(-3px)`.
  * **Chat Card Call-to-action**:
    * Headline: "💬 Chat Now", size `18px`, weight `500`. Text: "Start an empathetic private dialog.", size `14px`, color `--text-secondary`, margin `8px 0 16px 0`.
    * Pill Button: Fill `--color-primary` (`#5B7FA6`), White text, `border-radius: 20px; padding: 10px 20px; border: none; cursor: pointer; font-size: 14px; font-weight: 500;`. On click, routes to `/chatbot`.
  * **Journal Card Call-to-action**:
    * Headline: "📝 Daily Journal", size `18px`. Text: "Reflect and release your inner thoughts.", size `14px`.
    * Pill Button: Ghost Outline. Border `1.5px solid var(--color-secondary) (#7DAA8F)`, text color `--color-secondary`, `border-radius: 20px; padding: 10px 20px; background: transparent; cursor: pointer; font-size: 14px; font-weight: 500;`. Routes to `/journaling`.

#### Widget C: Breathing Biofeedback Pacer
* **Card Style**: Glass card structure. Padding `32px`, border-radius `24px`, margins `24px 0`, text-align `center`.
* **Header Title**: "Mindful Breathing Pacer", size `16px`, weight `500`, color `--text-secondary`.
* **Breathing Visual Pacer Center**:
  * Style: Central multi-layered nested rings expanding and contracting smoothly.
  * Ring 1 (Outer): `width: 140px; height: 140px; border-radius: 50%; background-color: var(--color-secondary) (#7DAA8F) at 25% opacity; transition: all 4s ease-in-out; margin: 24px auto; display: flex; align-items: center; justify-content: center; animation: breathe-outer 4s ease-in-out infinite alternate;`.
  * Ring 2 (Inner): `width: 90px; height: 90px; border-radius: 50%; background-color: var(--color-accent) (#A992C4) at 20% opacity; animation: breathe-inner 4s ease-in-out infinite alternate-reverse;`.
  * Keyframes definition:
    * `0%`: outer scale(1.0), inner scale(1.18);
    * `100%`: outer scale(1.18), inner scale(1.0);
* **Pacer Instructions Label**: Text "Breathe in... Hold... Breathe out...", size `15px`, weight `500`, color `--text-primary`.

---

## 4. Accessibility Specs (A11y)
* **Screen Reader Announcement**: The Mood selectors circular layout contains descriptive aria labels representing their current value (e.g. `aria-label="Mood: Calm. Button"`).
* **Keyboard Tab Route**: Sidebar links -> User Avatar -> Streak -> Notification -> Mood buttons -> Quick Actions -> Breathing pause control.
* **Reduced Motion Query**: Respects `prefers-reduced-motion: reduce`. Automatically pauses breathing ring expansions, substituting a very gentle periodic text opacity change.
