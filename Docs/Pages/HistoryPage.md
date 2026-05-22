# High-Fidelity Wireframe: History & Summaries

This wireframe details the structural layout, color variables, and interactive behaviors for SereneMind's History and Summaries interface, enabling users to reflect on their emotional timeline and generate supportive AI progress narratives.

---

## 1. Page Information
* **Route**: `/history`
* **Layout Goal**: Provide a supportive, encouraging retrospective of the user's emotional journey. Focus on growth and tracking continuity without creating a pass/fail binary feeling.
* **Layout System**: 2-Column Dashboard Layout (`280px` fixed Left Sidebar + `1fr` main layout split into a Timeline Feed and an AI Summary sidebar).
* **Font Typography**: `Outfit` (Headers), `Inter` (Timeline text cards and lists).

---

## 2. Layout Structure Preview (Timeline Grid Shell)

```
+---------------------------------------------------------------------------------------------------------+
| [LOGO] SereneMind    |  History & Summaries          (Streak: [5 Days] [Bell Icon] [User Avatar Photo]) |
|                      |  "Your wellness timeline and cognitive summaries."                               |
| ---------------------+---------------------------------------------------------------------------------- |
|                      |                                                                                  |
|  SIDEBAR NAV         |  MAIN CONTENT PANEL (Grid: 2-Columns, Split: 60% / 40%)                          |
|  (Width: 280px)      |  - Gap: 24px, Padding: 40px                                                      |
|                      |                                                                                  |
|  [Home/Dashboard]    |  LEFT COLUMN: TIMELINE FEED (60%)      |  RIGHT COLUMN: AI SUMMARY PANEL (40%)    |
|  [Chatbot Companion] |  +-----------------------------------+  |  +------------------------------------+  |
|  [Journaling]        |  | [Icon: Pencil] May 22, 2026        |  |  | AI MONTHLY NARRATIVE              |  |
|  [History & Logs]    |  | "Evening Reflection"              |  |  | "Based on your reflections, your  |  |
|  [Mood Analysis]     |  | Tag: [Calm] Snippet: Walking...    |  |  | anxiety levels have decreased..." |  |
|  [Exercises]         |  +-----------------------------------+  |  |                                    |  |
|                      |  +-----------------------------------+  |  | Key Strength: Resilience          |  |
|                      |  | [Icon: Chat] May 21, 2026          |  |  |                                    |  |
|                      |  | "Mindful Dialog"                   |  |  | [Generate Narrative (Pill CTA)]   |  |
|                      |  | Tag: [Anxious] Snippet: Overwork...|  |  +------------------------------------+  |
|                      |  +-----------------------------------+  |                                          |
| -------------------- | --------------------------------------- |                                          |
|  [EMERGENCY SOS]     |                                                                                  |
|  (Terracotta border) |                                                                                  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Styling Specifications

### A. Unified Layout Grid
* **Global Grid Shell**: Utilizes the standard `280px` Left Sidebar and `72px` Top Authenticated Header featuring the **User Photo/Avatar** container.
* **Content Viewport split**:
  * Main Shell: `display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; padding: 40px; background-color: var(--bg-page); min-height: calc(100vh - 72px);` (Mobile screen query: swaps to `grid-template-columns: 1fr;` stacking the AI Summary above the timeline list).

---

### B. Timeline Feed (Left Column)
* **Layout**: `display: flex; flex-direction: column; gap: 20px;`.
* **Timeline Header**: `font-size: 20px; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;`.
* **Timeline Item Cards**:
  * **Card Style**: `.glass-card` structure. `display: flex; align-items: flex-start; gap: 20px; padding: 20px 24px; border-radius: 20px; background-color: var(--bg-surface); border: 1.5px solid var(--border-light) (#E0DDD7 / #3A3F48); transition: all 0.2s ease; cursor: pointer;`.
  * Hover state: Border turns defined, card gains light lift `translateY(-2px)`.
* **Inside Item Card Elements**:
  * **Session Type Icon Wrapper**:
    * Style: `width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`.
    * *Journal Item*: Background `#7DAA8F` at 10% opacity. Icon color `--color-secondary` (`#7DAA8F`) representing a Pencil vector.
    * *Chat Item*: Background `#5B7FA6` at 10% opacity. Icon color `--color-primary` (`#5B7FA6`) representing a Chat Bubble vector.
  * **Card Content Body**: `flex-grow: 1; display: flex; flex-direction: column; gap: 6px;`.
    * Title/Date Line: `display: flex; justify-content: space-between; align-items: center;`.
      * Title: `font-size: 16px; font-weight: 500; color: var(--text-primary);`.
      * Date Label: `font-size: 12px; color: var(--text-secondary);`.
    * **Mood Category Tag**:
      * Style: `align-self: flex-start; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; text-transform: capitalize; margin-top: 4px;`.
      * Tag colors map strictly to the circular check-in specifications (e.g. Calm Tag uses `#7DAA8F` at 15% opacity, Anxious Tag uses `#5B7FA6` at 15% opacity).
    * **Preview Text Snippet**: `font-size: 13px; line-height: 1.5; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px; margin-top: 4px;`.

---

### C. AI Summary Generator (Right Column - Sticky Panel)
* **Container**: `position: sticky; top: 96px; height: fit-content;`.
* **Summary Card Structure**:
  * Style: `.glass-card` layout. Padding `28px`, border-radius `24px`, background-color `var(--bg-surface)`, border `1.5px solid var(--border-light)`.
  * **Header Title**: `font-size: 18px; font-weight: 500; color: var(--text-primary); margin-bottom: 12px;`.
  * **Action Button (CTA)**:
    * Style: Pill shape. `width: 100%; height: 44px; border-radius: 22px; border: none; background-color: var(--color-primary) (#5B7FA6); color: #FFFFFF; font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.15s ease; margin-bottom: 24px;`.
    * Focus State: `outline: 2px solid var(--color-accent) (#A992C4); outline-offset: 2px;`.
    * On Press: `transform: scale(0.97); ease 100ms;`.
  * **AI Narrative Result Block**:
    * Style: `display: flex; flex-direction: column; gap: 16px; transition: opacity 0.3s;`.
    * Narrative Paragraphs:
      * Text: CBT-framed encouraging progress descriptions (e.g. `"You've shown a consistent reflective habit this month, utilizing grounding exercises on days when anxious patterns appeared."`).
      * Styling: `font-size: 14px; line-height: 1.6; color: var(--text-primary); font-weight: 400;`.
    * **Strength/Achievement Highlights Pill**:
      * Style: `display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 12px; background-color: rgba(90, 148, 117, 0.08); border: 1px solid var(--color-success) (#5A9475); margin-top: 8px;`.
      * Label Text: `"Core Strength: Reflective Growth"`, `font-size: 13px; font-weight: 500; color: var(--color-success) (#5A9475);`.
      * *Important*: Utilizes Deep Sage (`#5A9475`) instead of bright/alarmist success indicators, preventing binary "pass/fail" visual feedback.

---

## 4. Accessibility Specs (A11y)
* **Touch Targets**: All clickable timeline list items are at least `80px` tall. The monthly summary generator pill CTA button has a height of `44px` with clear spacing around interactive blocks.
* **Semantic Markups**: Timeline entries are wrapped in a semantic list structure (`<ul role="list">` and `<li role="listitem">`) to support screen readers.
* **Keyboard Navigation**:
  * Fully navigable index. Timeline items have `tabindex="0"`. Focus states highlighted with `:focus-visible`.
  * The Summary generator utilizes `aria-describedby` pointing to the AI Narrative output card to ensure updates are read aloud when re-generated (`aria-live="polite"`).
