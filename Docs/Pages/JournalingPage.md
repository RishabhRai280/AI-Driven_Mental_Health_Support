# High-Fidelity Wireframe: Journaling Workspace

This wireframe details the structural, typography, and interactive specifications for SereneMind's Journaling Workspace, focusing on distraction-free writing and soft AI sentiment integration.

---

## 1. Page Information
* **Route**: `/journaling`
* **Layout Goal**: Provide a completely calm, immersive writing environment that feels natural, reduces friction, and gives gentle real-time emotional feedback.
* **Layout System**: 3-Column Layout (`280px` fixed Left Sidebar + `1fr` flexible Writing Container + `260px` fixed Right Sentiment Panel).
* **Font Typography**: `Outfit` (Headers), `Inter` (Editor text body). Body Font-Size: `18px`, Line-Height: `1.6` (for comfortable cognitive processing).

---

## 2. Layout Structure Preview (distraction-Free Writer Grid)

```
+---------------------------------------------------------------------------------------------------------+
| [LOGO] SereneMind    |  Journaling Workspace         (Streak: [5 Days] [Bell Icon] [User Avatar Photo]) |
|                      |  "Reflect and express yourself freely."                                          |
| ---------------------+---------------------------------------------------------------------------------- |
|                      |                                                 |                                |
|  SIDEBAR NAV         |  WRITING WORKSPACE AREA                         |  AI SENTIMENT FEEDBACK         |
|  (Width: 280px)      |  - Date: Friday, May 22, 2026                   |  (Width: 260px, Borderless)    |
|                      |  - Autosave Status: [v Cloud Auto-saved]        |                                |
|  [Home/Dashboard]    |  ---------------------------------------------  |  Emotional Vibrancy:           |
|  [Chatbot Companion] |                                                 |  - Muted real-time tags.       |
|  [Journaling]        |  Title: Evening reflections                     |                                |
|  [History & Logs]    |                                                 |  +--------------------------+  |
|  [Mood Analysis]     |  Write what is on your mind today...            |  |    Calm (#7DAA8F at 15%) |  |
|  [Exercises]         |  I took a long walk in the park today. The air  |  +--------------------------+  |
|                      |  felt crisp and grounded. I felt a sense of     |  +--------------------------+  |
|                      |  stillness that has been missing lately.        |  |  Reflective (#5B7FA6 10%)|  |
|                      |                                                 |  +--------------------------+  |
|                      |                                                 |                                |
|                      |  (Distraction-free: No lines, borderless field) |                                |
| -------------------- | ----------------------------------------------- |                                |
|                      |  ACTIONS PANEL                                  |                                |
|  [EMERGENCY SOS]     |  +--------------------------------------------+ |                                |
|  (Terracotta border) |  |                      [Save & Finish (Pill)] | |                                |
|                      |  +--------------------------------------------+ |                                |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Styling Specifications

### A. Core Page & distraction-Free Shell
* **Unified Layout Grid**: Utilizes the standard `280px` Left Sidebar and `72px` Top Authenticated Header featuring the **User Photo/Avatar** container.
* **Workspace Columns**:
  * Outer Body: `display: grid; grid-template-columns: 280px 1fr 260px; min-height: 100vh; background-color: var(--bg-page);` (Mobile screen query: swaps to `grid-template-columns: 1fr;` hiding the right panel, stacking the elements vertically).

---

### B. Distraction-Free Text Editor (Center Panel)
* **Container Wrapper**: `display: flex; flex-direction: column; padding: 40px 48px; gap: 24px; overflow-y: auto; height: calc(100vh - 72px);`.
* **Editor Header Row**:
  * Style: `display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--border-light) (#E0DDD7); padding-bottom: 16px;`.
  * **Date Display**: `font-size: 15px; font-weight: 500; color: var(--text-secondary) (#6B7280 / #9CA3AF);`.
  * **Auto-save Status Indicator**:
    * Style: `display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: var(--color-success) (#5A9475); opacity: 0.9; transition: opacity 0.3s;`.
    * Icon: Circle checkmark vector indicator.
* **Writing Fields**:
  * **Title Input**:
    * Style: `width: 100%; border: none; background: transparent; font-size: 26px; font-weight: 500; font-family: var(--font-header); color: var(--text-primary); outline: none; margin-top: 16px;`.
    * Placeholder: `"Untitled reflection"`, color `var(--text-secondary)` at 40% opacity.
  * **Journal Body Area**:
    * Style: `width: 100%; flex-grow: 1; border: none; background: transparent; font-size: 18px; line-height: 1.65; font-family: var(--font-body); color: var(--text-primary); outline: none; resize: none; min-height: 320px;`.
    * Placeholders: `"What is on your mind today? Write freely..."`, color `var(--text-secondary)` at 50% opacity.
    * Cognitive Visual Rule: Absolutely no borders, underlines, or grids are visible inside the writing container. This provides a clean psychological space that mimics blank parchment.

---

### C. Real-Time AI Sentiment Panel (Right Column)
* **Container**: `width: 260px; height: 100vh; padding: 40px 24px; background-color: var(--bg-surface); display: flex; flex-direction: column; gap: 24px; border-left: 1px solid var(--border-light) (#E0DDD7) (Light Mode only).`.
* **Panel Title**: `font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 8px;`.
* **Dynamic Tags Stream**:
  * Style: Flex-container `display: flex; flex-direction: column; gap: 12px;`.
  * **Sentiment Tag Design**:
    * Base: `display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 16px; font-size: 14px; font-weight: 500; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); animation: fade-in-tag 0.5s ease;`.
  * **Exact Tag Color Tints (WCAG Compliant)**:
    * *Calm Tag*: Background `#7DAA8F` at 15% opacity, border `1px solid rgba(125, 170, 143, 0.3)`, text color `#1C4A36` (Light Mode) or `#7DAA8F` (Dark Mode).
    * *Reflective Tag*: Background `#5B7FA6` at 10% opacity, border `1px solid rgba(91, 127, 166, 0.3)`, text color `#1A3B5C` (Light Mode) or `#8EB5E0` (Dark Mode).
    * *Sad Tag*: Background `#A992C4` at 15% opacity, border `1px solid rgba(169, 146, 196, 0.3)`, text color `#4A2E6D` (Light Mode) or `#C7B4DF` (Dark Mode).
    * *Anxious Tag*: Background `#5B7FA6` at 15% opacity, border `1px solid rgba(91, 127, 166, 0.35)`, text color `#5B7FA6`.
    * *Frustrated Tag*: Background `#C0765A` at 15% opacity, border `1px solid rgba(192, 118, 90, 0.3)`, text color `#6E2D12` (Light Mode) or `#E5A88F` (Dark Mode).

---

### D. Actions Panel (Fixed Bottom Bar)
* **Layout**: `display: flex; justify-content: flex-end; padding: 16px 48px; border-top: 1px solid var(--border-light); background-color: var(--bg-page); position: sticky; bottom: 0; width: 100%;`.
* **Save & Finish Button**:
  * Style: Pill Shape CTA. `padding: 12px 28px; border-radius: 24px; border: none; font-size: 15px; font-weight: 500; background-color: var(--color-primary) (#5B7FA6); color: #FFFFFF; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 4px 12px rgba(91, 127, 166, 0.15);`.
  * On Press: `transform: scale(0.97); ease 100ms;`.
  * Keyboard Focus: `outline: 2px solid var(--color-accent) (#A992C4); outline-offset: 2px;`.

---

## 4. Accessibility Specs (A11y)
* **Aria Rules**:
  * The text area editor is explicitly wrapped in `<main>` with an `aria-label="Distraction-free journal editor"`.
  * Auto-save status element utilizes `aria-live="polite"` so users with assistive tech are aware of cloud synchronizations.
* **High Contrast**: Text matches contrast ratio specs. Muted dynamic sentiment tags contain supporting textual labels ensuring color is not the only signifier of emotion.
* **Keyboard Tab Route**: Sidebar links -> Universal Header actions -> Journal Title input -> Journal body text area -> Dynamic sentiment cards (tabbable for summary explanations) -> Save & Finish pill button -> SOS trigger.
