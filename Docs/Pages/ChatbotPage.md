# High-Fidelity Wireframe: Chatbot Companion

This wireframe details the visual layout, interaction rules, and style parameters for SereneMind's AI Chatbot Companion, providing a continuous, safe, and empathetic dialogue interface.

---

## 1. Page Information
* **Route**: `/chatbot`
* **Layout Goal**: Create an immersive, focused conversational interface. Minimize UI friction to let the user focus entirely on self-reflection and dialogue.
* **Layout System**: 2-Column Responsive Layout (`280px` fixed Sidebar + `1fr` flexible Chat Area).
* **Font Typography**: `Outfit` for headers, `Inter` for conversational bubbles and chat actions.

---

## 2. Layout Structure Preview (Grid & Continuous Flex System)

```
+---------------------------------------------------------------------------------------------------------+
| [LOGO] SereneMind    |  Chatbot Companion            (Streak: [5 Days] [Bell Icon] [User Avatar Photo]) |
|                      |  "A safe, private conversation"                                                  |
| ---------------------+---------------------------------------------------------------------------------- |
|                      |                                                                                  |
|  SIDEBAR NAV         |  CHAT CONTAINER VIEWPORT (Fills available screen space, scrollable flex stream)   |
|  (Width: 280px)      |  - Column padding: 32px 48px, Gap: 20px                                          |
|                      |                                                                                  |
|  [Home/Dashboard]    |  [Bot message bubble]                                                            |
|  [Chatbot Companion] |  +----------------------------------------------------------------------------+  |
|  [Journaling]        |  | Hello. I'm SereneAI, your empathetic companion. How are you feeling today? |  |
|  [History & Logs]    |  | (Style: Sage border on left, radius: 0 18px 18px 4px)                        |  |
|  [Mood Analysis]     |  +----------------------------------------------------------------------------+  |
|  [Exercises]         |                                                                                  |
|                      |                                                        [User message bubble]     |
|                      |                        +------------------------------------------------------+  |
|                      |                        | I've been feeling a bit overwhelmed by work lately. |  |
|                      |                        | (Style: Muted blue wash background, radius 18/18/4/18|  |
|                      |                        +------------------------------------------------------+  |
|                      |                                                                                  |
|                      |  [Pulsing typing indicator: 3 dots gently expanding/contracting]                 |
|                      |                                                                                  |
| -------------------- | -------------------------------------------------------------------------------- |
|                      |  INPUT ZONE (Fixed to bottom, borderless visual separation, height: 88px)        |
|                      |  +--------------------------------------------------------------+ +-----------+  |
|  [EMERGENCY SOS]     |  | Write what's on your mind...                                 | |    [>]    |  |
|  (Terracotta border) |  | (Pill-shaped, 1.5px Sage border, width: 100%)                | | (Send Pill) |  |
|                      |  +--------------------------------------------------------------+ +-----------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Styling Specifications

### A. Core Page & Shell
* **Unified Layout**: Utilizes the fixed `280px` Sidebar and standard `72px` Authenticated Header featuring the **User Photo/Avatar** in the top-right corner.
* **Chat Stream Viewport**:
  * Style: `display: flex; flex-direction: column; height: calc(100vh - 160px); overflow-y: auto; padding: 32px 48px; gap: 20px; scroll-behavior: smooth; background-color: var(--bg-page);`.
  * Visual Rule: There is **no visible boundary border** separating the chat bubble feed panel and the bottom typing input area. The conversation floats continuously over the background parchment or midnight slate.

---

### B. Conversational Chat Bubbles

#### Bot Message Bubble (Left Aligned)
* **Layout**: `max-width: 70%; align-self: flex-start; display: flex; flex-direction: column; margin-bottom: 8px;`.
* **Bubble Styling**:
  * **Border Radius**: `0 18px 18px 4px` (High curve, sharp corner bottom-left to anchor adjacent bot avatar visual cue).
  * **Left Accent Border**: `2px solid var(--bot-bubble-border) (#7DAA8F)` (Sage Mist). *This serves as a psychological anchor of the "safe voice."*
  * **Light Mode**: Background `#FFFFFF` (White), Primary Text `#2C2F35` (Charcoal).
  * **Dark Mode**: Background `--bg-surface-dark` (`#2A2F38` Soft Graphite), Primary Text `#EAE8E3` (Warm Cream).
  * Padding: `16px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);`.
* **Timestamp**: `font-size: 11px; color: var(--text-secondary); margin-top: 4px; padding-left: 4px;`.

#### User Message Bubble (Right Aligned)
* **Layout**: `max-width: 70%; align-self: flex-end; display: flex; flex-direction: column; margin-bottom: 8px;`.
* **Bubble Styling**:
  * **Border Radius**: `18px 18px 4px 18px` (High curve, sharp corner bottom-right).
  * **Light Mode**: Background `var(--bg-user-bubble-light)` (Heather Blue `#5B7FA6` at 13% opacity), Primary Text `#2C2F35` (Charcoal).
  * **Dark Mode**: Background `var(--bg-user-bubble-dark)` (`#3A5070` Night Blue), Primary Text `#EAE8E3` (Warm Cream).
  * Padding: `16px 20px;`.
* **Timestamp**: `font-size: 11px; color: var(--text-secondary); margin-top: 4px; align-self: flex-end; padding-right: 4px;`.

#### Typing Indicator Animation (Left Aligned)
* **Container**: `display: flex; gap: 6px; padding: 16px 20px; background-color: var(--bg-surface); border-radius: 0 18px 18px 4px; border-left: 2px solid var(--color-secondary); max-width: 80px; align-items: center; justify-content: center;`.
* **Pulsing Dots**: Three circular dots `8x8px`, colored `--text-secondary` (`#6B7280`).
* **Animation Specs**:
  * Keyframe: `animation: type-pulse 1.2s infinite ease-in-out;`.
  * Dot 1: `animation-delay: 0s;`.
  * Dot 2: `animation-delay: 0.2s;`.
  * Dot 3: `animation-delay: 0.4s;`.
  * Pulse transform: `0%, 100% { transform: scale(0.8); opacity: 0.4; } 50% { transform: scale(1.2); opacity: 1; }`.

---

### C. Bottom Input Panel
* **Container Wrapper**: `height: auto; min-height: 88px; padding: 16px 48px; background-color: var(--bg-page); display: flex; align-items: center; gap: 16px; position: sticky; bottom: 0; width: 100%;`.
* **Text Input Area (Dynamic Auto-Resizing Textarea)**:
  * Description: A multi-line textarea that automatically expands its height dynamically as the user types (handling both natural soft wrapping and manual line breaks), up to a max-height of `150px` after which a vertical scrollbar appears.
  * Style: `flex-grow: 1; min-height: 48px; max-height: 150px; height: auto; padding: 12px 24px; border-radius: 16px; font-size: 15px; font-family: inherit; background-color: var(--bg-surface); resize: none; transition: border-color 0.2s, box-shadow 0.2s;`.
  * Light Mode Border: `1.5px solid var(--color-secondary) (#7DAA8F)`.
  * Dark Mode Border: `1.5px solid #3A3F48`.
  * Focus State: `outline: none; border-color: var(--color-primary) (#5B7FA6); box-shadow: 0 0 0 3px rgba(91, 127, 166, 0.15);`.
  * Placeholder Text: `"Write what is on your mind..."`, color `--text-secondary`.
* **Send Action Button**:
  * Style: Circular pill shape. `width: 48px; height: 48px; border-radius: 50%; border: none; background-color: var(--color-primary) (#5B7FA6); color: #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease;`.
  * Icon: Standard Lucide Send/Arrow icon (`size: 20px`).
  * On Click Press: `transform: scale(0.95);` (100ms ease).

---

### D. Safety Pipeline Overlay (Emergency Takeover UI)
* **Trigger**: Initiated immediately when the semantic AI backend registers self-harm, severe crisis, or active risk phrases.
* **UI Action System**:
  * Chat Text Input: Disabled immediately (`pointer-events: none; opacity: 0.5; background-color: var(--bg-nav);`).
  * **Takeover Banner Overlay**:
    * Style: Slides smoothly from the bottom over the input zone. `display: flex; justify-content: space-between; align-items: center; background-color: var(--color-error) (#C0765A); border-radius: 20px; padding: 20px 32px; width: 100%; box-shadow: 0 8px 32px rgba(192, 118, 90, 0.2); animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);`.
    * Headline Text: `"We hear you, and you are not alone. Please let us help you find support right now."`, size `15px`, weight `500`, color `#FFFFFF`.
    * **Action Button**: `"Get Crisis Support"`. Pill button shape. `padding: 10px 24px; border-radius: 20px; border: none; background-color: #FFFFFF; color: var(--color-error) (#C0765A); font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.15s ease;`. On Press: `scale(0.97)`. Triggers immediate redirection to `/crisis-sos`.

---

## 4. Accessibility Specs (A11y)
* **Aria live Region**: The chat list container includes `aria-live="polite"` and `role="log"` to ensure screen readers automatically read new incoming bot messages without interrupting current focus.
* **Touch Target targets**: Send button circular dimension is `48x48px`, input text container matches standard bounds, and crisis banner CTA matches `44x44px` minimums.
* **Keyboard Tab Route**: Sidebar -> Active Header -> Chat Feed Bubbles (accessible sequentially via keyboard list tab) -> Bottom input field -> Send action button -> Emergency Takeover trigger.
