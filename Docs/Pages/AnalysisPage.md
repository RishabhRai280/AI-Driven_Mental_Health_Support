# High-Fidelity Wireframe: Mood Analysis

This wireframe details the structural, grid, and interactive specifications for SereneMind's Mood Analysis page, providing supportive emotional tracking via calendar heatmaps and stacked bar trends.

---

## 1. Page Information
* **Route**: `/analysis`
* **Layout Goal**: Provide visual cognitive reframing. Help users identify patterns, triggers, and wellness correlations without generating pass/fail anxieties or clinical detachment.
* **Layout System**: 2-Column Responsive Layout (`280px` fixed Left Sidebar + `1fr` main dashboard content stream).
* **Font Typography**: `Outfit` (Headers/Labels), `Inter` (Chart details and filters).

---

## 2. Layout Structure Preview (Analysis Grid Shell)

```
+---------------------------------------------------------------------------------------------------------+
| [LOGO] SereneMind    |  Mood Analysis                (Streak: [5 Days] [Bell Icon] [User Avatar Photo]) |
|                      |  "Visualizing your emotional patterns and healthy correlations."                 |
| ---------------------+---------------------------------------------------------------------------------- |
|                      |                                                                                  |
|  SIDEBAR NAV         |  A. TOP FILTERS (Flex pill tags: Gap: 12px)                                      |
|  (Width: 280px)      |  [ [Week] ]    [ [Month (Active)] ]    [ [Year] ]                                 |
|                      |                                                                                  |
|  [Home/Dashboard]    |  B. MONTHLY EMOTIONAL MAP (Mood Heatmap - 7 Column Calendar Grid)                |
|  [Chatbot Companion] |  +----------------------------------------------------------------------------+  |
|  [Journaling]        |  |  S     M     T     W     T     F     S                                       |  |
|  [History & Logs]    |  | [1]   [2]   [3]   [4]   [5]   [6]   [7]                                      |  |
|  [Mood Analysis]     |  | [Calm][Sad] [Anx] [Ok]  [Ok]  [Frus][Ok]                                     |  |
|  [Exercises]         |  +----------------------------------------------------------------------------+  |
|                      |                                                                                  |
|                      |  C. EMOTION TREND (Stacked Bar Graph)   |  D. AI INSIGHTS PANEL (Glass card)   |
|                      |  +------------------------------------+  |  +--------------------------------+  |
|                      |  | 100%| [ ]  [ ]  [ ]  [ ]           |  |  | "Your evening journals indicate|  |
|                      |  |  50%| [x]  [x]  [x]  [x]  (stacked)  |  |  | lower frustration on days with  |  |
| -------------------- |  |   0%| [o]  [o]  [o]  [o]           |  |  | progressive muscle relaxation."|  |
|  [EMERGENCY SOS]     |  |     Mon  Tue  Wed  Thu             |  |  +--------------------------------+  |
|  (Terracotta border) |  +------------------------------------+  |                                      |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Styling Specifications

### A. Unified Layout Grid
* **Global Grid Shell**: Utilizes the standard `280px` Left Sidebar and `72px` Top Authenticated Header featuring the **User Photo/Avatar** container in the top-right corner.
* **Content Viewport scroll**:
  * Main Shell: `display: flex; flex-direction: column; gap: 24px; padding: 40px; background-color: var(--bg-page); min-height: calc(100vh - 72px); overflow-y: auto;`.

---

### B. Top Date Filter Row (Flex Grid)
* **Layout**: `display: flex; gap: 12px; align-items: center; margin-bottom: 8px;`.
* **Pill Filters**:
  * Base: `padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; border: 1.5px solid var(--color-secondary) (#7DAA8F); color: var(--color-secondary); background: transparent;`.
  * Touch target: Meets the standard `44px` height criteria (actual height: `44px`).
  * Hover state: Background `rgba(125, 170, 143, 0.05)`, border-color deepens.
  * Active/Selected state: Background `rgba(125, 170, 143, 0.12)` (12% Sage Mist opacity), border `1.5px solid var(--color-secondary) (#7DAA8F)`, text color `--color-secondary`, font-weight `500`.

---

### C. Monthly Emotional Map (Calendar Heatmap)
* **Card Style**: Glass card layout. Padding `28px`, border-radius `24px`, background-color `var(--bg-surface)`, border `1.5px solid var(--border-light)`.
* **Header Title**: `font-size: 18px; font-weight: 500; color: var(--text-primary); margin-bottom: 20px;`.
* **Calendar Grid Shell**: `display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; width: 100%; max-width: 800px;`.
* **Grid Headings (S M T W T F S)**: `text-align: center; font-size: 13px; font-weight: 500; color: var(--text-secondary); padding-bottom: 8px;`.
* **Day Block Cells**:
  * Style: `aspect-ratio: 1 / 1; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 14px; font-weight: 500; transition: transform 0.2s; position: relative; cursor: pointer;`.
  * Visual Scale Hover: `transform: scale(1.06);`.
  * **Color Tint Mappings (15-20% Opacity Hex Codes)**:
    * *Anxious Cell*: Background `rgba(91, 127, 166, 0.15)` (15% Heather Blue), Text color `#1A3B5C`.
    * *Calm Cell*: Background `rgba(125, 170, 143, 0.15)` (15% Sage Mist), Text color `#1C4A36`.
    * *Sad Cell*: Background `rgba(169, 146, 196, 0.15)` (15% Soft Lavender), Text color `#4A2E6D`.
    * *Frustrated Cell*: Background `rgba(192, 118, 90, 0.15)` (15% Warm Terracotta), Text color `#6E2D12`.
    * *Okay/Neutral Cell*: Background `rgba(125, 170, 143, 0.2)` (20% Sage Mist), border `1.5px solid var(--color-secondary) (#7DAA8F)`, Text color `#1C4A36`.
    * *Empty/Unlogged Cell*: Background `transparent`, border `1.5px dashed var(--border-light)` (`#D8D5CF` / `#3A3F48`), Text color `var(--text-secondary)`.

---

### D. Multi-Column Stacked Charts & Insights Row
* **Grid Shell**: `display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; margin-top: 8px;` (Mobile query: `grid-template-columns: 1fr;`).
* **Stacked Trend Chart Card (Left)**:
  * Style: Glass card layout. Padding `24px`, border-radius `20px`, background-color `var(--bg-surface)`, border `1.5px solid var(--border-light)`.
  * Chart Element Layout: Flexible bars vertically stacked representing the fractional volume of daily emotion logs.
  * **Visual Chart Fill Faction (Desaturated Hex Stack)**:
    * *Joyous*: Deep Sage `#5A9475` (Success color)
    * *Calm*: Sage Mist `#7DAA8F` (Secondary color)
    * *Anxious*: Heather Blue `#5B7FA6` (Primary color)
    * *Frustrated*: Warm Terracotta `#C0765A` (Error color)
    * *Important Rule*: Stacked chart color combinations are desaturated to ensure the visual output does not invoke sensory fatigue or alarmism. No neon greens or firey alarmist reds are permitted.
* **AI Cognitive Insights Panel (Right)**:
  * Style: Glass card layout. Padding `24px`, border-radius `20px`, background-color `var(--bg-surface)`, border `1.5px solid var(--border-light)`.
  * Headline: `"Cognitive Insights"`, `font-size: 16px; font-weight: 500; color: var(--text-primary); margin-bottom: 12px;`.
  * Insight Content:
    * Paragraphs: `"Regular morning journaling correlates with a 14% decrease in your afternoon frustration logs over the past fortnight."` and `"Suggested Exercise: Progressive Muscle Relaxation appears to restore calm rapidly on days indicating high stress."`
    * Styling: `font-size: 14px; line-height: 1.6; color: var(--text-primary); font-weight: 400;`.
    * Highlight highlights: Correlation points highlighted in a desaturated success Deep Sage `#5A9475` text pill layout.

---

## 4. Accessibility Specs (A11y)
* **Never Color Alone**: Chart elements and heatmap cells always couple color indicators with textual fallback labels (visible on focus/hover, or readable via screen readers via explicit labels).
* **Keyboard Tab Route**: Sidebar -> Date Filters -> Heatmap Days (tabbable cells) -> Trend Stacked Bars (selectable for value metrics) -> AI insights -> SOS.
* **Heatmap Focus Details**: `:focus-visible` on day cells renders a thick `2px` Solid Heather Blue `#5B7FA6` bounding outline with an offset border spacing.
