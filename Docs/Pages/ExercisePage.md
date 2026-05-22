# High-Fidelity Wireframe: Recommended Exercises

This wireframe details the structural, interactive, and player specifications for SereneMind's Recommended Exercises page, enabling users to explore mindfulness routines and utilize the visual breathing pacer.

---

## 1. Page Information
* **Route**: `/exercises`
* **Layout Goal**: Provide actionable emotional regulation. Calm users through low-barrier grounding routines and physical biofeedback tools.
* **Layout System**: 2-Column Responsive Layout (`280px` fixed Left Sidebar + `1fr` main dashboard content area).
* **Font Typography**: `Outfit` (Headers/Titles), `Inter` (Exercise catalogs and player buttons).

---

## 2. Layout Structure Preview (Exercises Grid Shell)

```
+---------------------------------------------------------------------------------------------------------+
| [LOGO] SereneMind    |  Recommended Exercises        (Streak: [5 Days] [Bell Icon] [User Avatar Photo]) |
|                      |  "Empower your mind with grounding routines."                                    |
| ---------------------+---------------------------------------------------------------------------------- |
|                      |                                                                                  |
|  SIDEBAR NAV         |  A. RECOMMENDATION BANNER (Glass card with soft Sage Mist tint)                  |
|  (Width: 280px)      |  +----------------------------------------------------------------------------+  |
|                      |  | 🌟 Recommendation based on your journals: Box Breathing (5 Mins)            |  |
|  [Home/Dashboard]    |  | "Try this grounding Box Breathing to lower stress."   [Begin Now (Pill)]   |  |
|  [Chatbot Companion] |  +----------------------------------------------------------------------------+  |
|  [Journaling]        |                                                                                  |
|  [History & Logs]    |  B. EXERCISE CATALOG (Grid Layout: Gap: 20px)                                    |
|  [Mood Analysis]     |  +---------------------------+ +---------------------------+ +-----------------+  |
|  [Exercises]         |  | 1. Box Breathing          | | 2. Progressive Relaxation | | 3. Five Senses  |  |
|                      |  | - Time: 5 mins            | | - Time: 8 mins            | | - Time: 3 mins  |  |
|                      |  | - Icon: Ring (Blue Tint)  | | - Icon: Body (Sage Tint)  | | - Icon: Eye     |  |
|                      |  |    [Begin Exercise (Pill)]| |    [Begin Exercise (Pill)]| |   [Begin (Pill)]|  |
|                      |  +---------------------------+ +---------------------------+ +-----------------+  |
| -------------------- | -------------------------------------------------------------------------------- |
|                      |  C. ACTIVE BREATHING PLAYER MODAL (Full-screen overlay on launch)               |
|                      |  +----------------------------------------------------------------------------+  |
|  [EMERGENCY SOS]     |  |                            (((( PULSING RING ))))                          |  |
|  (Terracotta border) |  |                                                                            |  |
|                      |  |                     Text: "Breathe in... Hold... Breathe out..."           |  |
|                      |  |                                                                            |  |
|                      |  |                     [Play Icon]      [Pause Icon]       [Stop/Exit]        |  |
|                      |  +----------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Styling Specifications

### A. Unified Layout Grid
* **Global Grid Shell**: Utilizes the standard `280px` Left Sidebar and `72px` Top Authenticated Header featuring the **User Photo/Avatar** container in the top-right corner.
* **Content Viewport scroll**:
  * Main Shell: `display: flex; flex-direction: column; gap: 28px; padding: 40px; background-color: var(--bg-page); min-height: calc(100vh - 72px); overflow-y: auto;`.

---

### B. Dynamic Onboarding Recommendation Banner
* **Card Style**: Glass card structure with soft psychological tints. `display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; border-radius: 24px; border: 1.5px solid rgba(125, 170, 143, 0.4); background: rgba(125, 170, 143, 0.08) (8% Sage Mist opacity);`.
* **Content Layout**: `display: flex; flex-direction: column; gap: 6px; max-width: 70%;`.
  * Highlight Label: `"🌟 Recommended For You Today"`, `font-size: 13px; font-weight: 500; text-transform: uppercase; color: var(--color-secondary) (#7DAA8F);`.
  * Banner Title: `"Box Breathing (5 Mins)"`, `font-size: 20px; font-weight: 500; color: var(--text-primary);`.
  * Supporting Text: `"Based on your evening journal logs indicating elevated stress, we suggest a quick Box Breathing routine to anchor your awareness."`, `font-size: 14px; line-height: 1.5; color: var(--text-secondary);`.
* **Action Call-to-action Button**:
  * Style: Pill Shape. `padding: 12px 28px; border-radius: 24px; border: none; background-color: var(--color-primary) (#5B7FA6); color: #FFFFFF; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; flex-shrink: 0;`.
  * On Press: `transform: scale(0.97); ease 100ms;`.
  * Trigger: Immediately launches the Full-Screen Active Breathing Player Modal.

---

### C. Exercise Catalog Grid
* **Grid System**: `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 8px;`.
* **Catalog Card component**:
  * Style: Glass card layout. `display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: 24px; border-radius: 20px; background-color: var(--bg-surface); border: 1.5px solid var(--border-light); height: 200px; transition: all 0.2s ease;`.
  * Hover Elevation: border deepens, card rises `translateY(-3px)`.
* **Inside Card Elements**:
  * **Card Icon**: Encapsulated in circular layout. `width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center;`.
    * *Breathing Category*: Background `#5B7FA6` at 10% opacity, icon color `--color-primary` (`#5B7FA6`).
    * *Somatic Category*: Background `#7DAA8F` at 10% opacity, icon color `--color-secondary` (`#7DAA8F`).
  * **Card Text Meta**:
    * Title: `font-size: 16px; font-weight: 500; color: var(--text-primary); margin-top: 12px;`.
    * Duration Label: `font-size: 12px; color: var(--text-secondary); margin-top: 4px;`.
  * **Action Button**:
    * Style: Ghost Pill. `width: 100%; height: 38px; border-radius: 19px; border: 1.5px solid var(--color-secondary) (#7DAA8F); color: var(--color-secondary); background: transparent; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; margin-top: 16px; display: flex; align-items: center; justify-content: center;`.
    * On Press: `scale(0.97)`.

---

### D. Active Breathing Player (Full-Screen Modal Overlay)
* **Trigger**: Activated when any exercise's "Begin" action is clicked.
* **Layout Frame**: `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(30, 34, 40, 0.95) (Midnight Slate overlay); backdrop-filter: blur(8px); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 100; animation: fade-in 0.3s ease;`.
* **Visual Breathing Pacer**:
  * Outer Pulsing Ring: `width: 180px; height: 180px; border-radius: 50%; background-color: var(--color-secondary) (#7DAA8F) at 30% opacity; display: flex; align-items: center; justify-content: center; transition: all 4s ease-in-out; animation: breathe-outer 4s ease-in-out infinite alternate;`.
  * Inner Ring: `width: 120px; height: 120px; border-radius: 50%; background-color: var(--color-accent) (#A992C4) at 20% opacity; animation: breathe-inner 4s ease-in-out infinite alternate-reverse;`.
* **Dynamic Instruction Subtitle**:
  * Text: `"Breathe in... Hold... Breathe out..."`
  * Styling: `font-size: 20px; font-weight: 500; color: #EAE8E3 (Warm Cream text); margin-top: 36px; text-align: center; height: 24px;`.
* **Player Action Controls**:
  * Flex-container `display: flex; gap: 24px; align-items: center; margin-top: 48px;`.
  * **Play/Pause Toggle Button**:
    * Style: Circular icon card button. `width: 56px; height: 56px; border-radius: 50%; border: none; background-color: var(--color-primary) (#5B7FA6); color: #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease;`.
    * Focus State: `outline: 2px solid var(--color-accent) (#A992C4); outline-offset: 2px;`.
    * On Press: `transform: scale(0.95);`.
  * **Stop / Close Button**:
    * Style: Ghost Circular. `width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid #EAE8E3; background: transparent; color: #EAE8E3; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease;`.
    * On Press: `scale(0.95)`. Immediately dismisses the modal, halting animations.

---

## 4. Accessibility Specs (A11y)
* **Trap Keyboard Focus**: When player modal launches, tab focus is strictly trapped inside: Play/Pause -> Stop/Exit. Normal navigation is disabled.
* **Aria Role Attributes**: Active player is marked with `role="dialog"` and `aria-modal="true"`.
* **Motion Preferences**: Breathing ring expansions scale-downs honor `prefers-reduced-motion: reduce`, changing instead to a slow opacity fade-in/out transition (`opacity: 0.3` to `opacity: 0.7`) to prevent triggers for users prone to vestibular issues.
* **Touch Targets**: All controls, including catalog action items, meet the `44x44px` target size (active buttons are `56px`).
