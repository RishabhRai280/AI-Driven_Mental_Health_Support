# High-Fidelity Wireframe: Crisis SOS System

This wireframe details the structural layout, color variables, and cognitive grounding specifications for SereneMind's Crisis SOS page, providing an immediate, calming, and life-supportive interface.

---

## 1. Page Information
* **Route**: `/crisis-sos`
* **Layout Goal**: Provide rapid, clear, and reassuring access to crisis support. Avoid high-contrast alarmist designs (e.g. aggressive neon red blinking elements) that escalate cortisol and panic. The UI must act as an immediate emotional containment shelter.
* **Layout System**: Centered Full-Screen Takeover Grid (completely covers the standard navigation layout when activated, with a prominent exit block).
* **Font Typography**: `Outfit` (Headers), `Inter` (Helplines and body).

---

## 2. Layout Structure Preview (calming Takeover Shell)

```
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  FULL-SCREEN CRISIS EMERGENCY TAKEOVER                                                                  |
|  - Layout: Centered Glass Card, Width: 100% (Max 680px)                                                 |
|  - Border: 2px solid Warm Terracotta (#C0765A)                                                          |
|  - Padding: 48px                                                                                        |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                                      We're here for you.                                          |  |
|  |             Please take a slow, deep breath. You are in a safe, private space.                     |  |
|  |                                                                                                   |  |
|  |  A. IMMEDIATE DIRECT LIFELINES (Pill Buttons: Height: 48px, Gap: 16px)                             |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |  |                 [CALL EMERGENCY LIFELINE (Terracotta Fill, White Text)]                  |  |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |  |                 [TEXT CRISIS LINE (Terracotta Ghost Border, Sienna Text)]                   |  |  |
|  |  +---------------------------------------------------------------------------------------------+  |  |
|  |                                                                                                   |  |
|  |  B. YOUR PERSONAL SUPPORT CONTACTS                                                                |  |
|  |  [Icon: Heart] Dr. Evelyn Harper (Therapist)  ................................... [Call Icon]   |  |
|  |  [Icon: Heart] Sarah Jenkins (Primary Safe Contact) .............................. [Call Icon]   |  |
|  |                                                                                                   |  |
|  |  C. COPING & GROUNDING UTILITIES                                                                  |  |
|  |  "Quick 5-4-3-2-1 Technique: Name 5 things you can see around you right now..."                    |  |
|  |  [Start Mindful Breathing Pacer (Sage Mist Outline Ghost Pill)]                                   |  |
|  |                                                                                                   |  |
|  |  =============================================================================================    |  |
|  |  [Action: I am safe, return to dashboard (Ghost Secondary Pill, Sage Mist)]                       |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Styling Specifications

### A. Core Takeover Page Shell
* **Page Frame**: `display: flex; justify-content: center; align-items: center; min-height: 100vh; width: 100vw; padding: 24px; background-color: var(--bg-page);`.
* **takeover Card Container**:
  * Style: `.glass-card` layout with distinct safety borders. `width: 100%; max-width: 680px; padding: 48px 40px; border-radius: 32px; background-color: var(--bg-surface); box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; gap: 28px; transition: all 0.3s ease;`.
  * **Alert Border Specification**: `2px solid var(--color-error) (#C0765A)` (Warm Terracotta sienna). *The terracotta color communicates critical priority without triggering panic responses connected with pure primary red borders.*

---

### B. Direct Help Contact Actions

#### Button 1: Call Emergency Helpline
* **Action**: Initiates direct telephonic connection to the primary national crisis line (e.g. 988).
* **Style**: Pill Shape CTA. `width: 100%; height: 48px; border-radius: 24px; border: none; background-color: var(--color-error) (#C0765A); color: #FFFFFF; font-size: 16px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.15s ease;`.
* **On Press**: `transform: scale(0.97); ease 100ms;`.
* **Focus Outline**: `outline: 2px solid var(--color-accent) (#A992C4); outline-offset: 2px;`.

#### Button 2: Text Crisis Support Line
* **Action**: Launches SMS dialog connection text system.
* **Style**: Ghost Pill. `width: 100%; height: 48px; border-radius: 24px; border: 1.5px solid var(--color-error) (#C0765A); background: transparent; color: var(--color-error); font-size: 16px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.15s ease;`.
* **On Press**: `transform: scale(0.97);`.

---

### C. Personal Support Contacts List
* **Layout**: `display: flex; flex-direction: column; gap: 12px; margin-top: 8px;`.
* **Section Title**: `font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);`.
* **Contact Card Row**:
  * Style: `display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-radius: 16px; background-color: var(--bg-nav); border: 1px solid var(--border-light);`.
  * Name/Role: `display: flex; align-items: center; gap: 12px;`.
    * Icon: Heart vector tint `--color-accent` (`#A992C4`).
    * Label Text: `"Name (Role)"`, `font-size: 15px; font-weight: 500; color: var(--text-primary);`.
  * **Quick Dial Action Button**:
    * Style: Circular icon button. `width: 44px; height: 44px; border-radius: 50%; border: none; background-color: var(--color-secondary) (#7DAA8F) at 12% opacity; color: var(--color-secondary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;`.
    * Touch target size: Meets the strict `44x44px` physical touch grid size.
    * Focus and press effects configured.

---

### D. Grounding Coping Tools Panel
* **Layout Container**: `padding: 24px; border-radius: 20px; background-color: var(--bg-page); border: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 16px;`.
* **Header Title**: `"Coping & Grounding Tools"`, `font-size: 15px; font-weight: 500; color: var(--text-primary);`.
* **CBT 5-4-3-2-1 Coping Prompt**:
  * Text: `"Take a slow breath. Try the 5-4-3-2-1 Sensory technique: Focus on and identify 5 things you see, 4 things you can physically touch, 3 sounds you hear, 2 things you smell, and 1 positive affirmation."`
  * Styling: `font-size: 13.5px; line-height: 1.6; color: var(--text-secondary); font-weight: 400;`.
* **Start Breathing Pacer Trigger**:
  * Style: Ghost Pill. `align-self: flex-start; padding: 10px 20px; border-radius: 20px; border: 1.5px solid var(--color-secondary) (#7DAA8F); color: var(--color-secondary); background: transparent; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;`.
  * Action: Redirects user straight to `/exercises` launching the breathing modal state.

---

### E. Safety Dismiss Exit Strategy
* **Layout**: `margin-top: 12px; display: flex; justify-content: center; width: 100%;`.
* **Safe Return Button**:
  * Style: Ghost Pill button. `padding: 12px 32px; border-radius: 24px; border: 1px solid var(--color-secondary) (#7DAA8F); color: var(--color-secondary); background: transparent; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;`.
  * Visual Note: Intentionally kept discrete and secondary. The user must actively choose to select this to close out the crisis intervention.
  * On Click action: Restores normal dashboard page state and routing.

---

## 4. Accessibility Specs (A11y)
* **High Contrast Action**: The primary terracotta dialer buttons exceed a contrast ratio of `4.5:1` against the warm parchment card background.
* **Aria Role Landmark**: The full-screen layout has `role="dialog"` and `aria-modal="true"` to trap focus inside the emergency sequence until safe exit is clicked.
* **Keyboard Navigation Sequence**: Trap focus sequentially through Call emergency -> Text crisis -> Contact 1 call -> Contact 2 call -> Start breathing -> Safe return button. Keyboard outline explicitly highlighted via `:focus-visible`.
