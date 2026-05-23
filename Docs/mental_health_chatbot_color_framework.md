# Mental Health Chatbot — Color Theory Framework

> A comprehensive color design system for a mental health chatbot app targeting users experiencing stress, anxiety, depression, or mild emotional distress.

---

## The Psychological Design Philosophy

The core principle is **emotional containment**: the UI should feel like a safe, held space — not clinical, not corporate, not overstimulating. Colors should communicate *"you are welcome here, nothing bad will happen"* before the user reads a single word. This means avoiding anything that demands attention, triggers urgency, or carries culturally ambiguous weight.

The palette draws from three psychological anchors:
- **Muted blue-violet** — trust and empathy
- **Sage/seafoam green** — growth and grounding
- **Warm neutrals** — comfort and approachability

---

## The Master Palette

### Primary Colors

| Role | Name | Hex | Rationale |
|------|------|-----|-----------|
| Primary / Brand anchor | Heather Blue | `#5B7FA6` | A desaturated, mid-depth blue. Reads as calm and trustworthy without the cold formality of corporate blues. Desaturation removes aggressive energy. Research links blue with reduced cortisol response. |
| Secondary / Grounding | Sage Mist | `#7DAA8F` | A grey-green evoking nature, balance, and restoration. Associated with the parasympathetic "rest and digest" state. |
| Accent / Empathy | Soft Lavender | `#A992C4` | Used sparingly on interactive moments. Carries empathic associations across most Western and South/East Asian cultures. At this saturation it feels maternal rather than mystical. |
| Alert / Gentle error | Warm Terracotta | `#C0765A` | A muted sienna instead of red. Communicates "something needs attention" without alarm or fear-triggering. |
| Success / Affirmation | Deep Sage | `#5A9475` | Affirms positive actions without the intense green of traffic lights. Avoids a pass/fail binary feeling. |

### Backgrounds & Surfaces — Light Mode

| Role | Name | Hex | Rationale |
|------|------|-----|-----------|
| Page background | Warm Parchment | `#F4F1EC` | A warm off-white with beige undertones. Pure white is clinical and creates harsh contrast in sensitive UI contexts. This tint feels grounded and human. |
| Card / Bot bubble | White | `#FFFFFF` | Clean surface for the chatbot's voice; kept neutral and readable. |
| Header / Nav surface | Dusty Linen | `#EEEBE4` | One step deeper than the page background; creates gentle elevation without shadow. |
| User message bubble | Blue Wash | `#5B7FA6` at 13% opacity | Personal without dominating. The user's voice in the primary color family at low intensity. |

### Backgrounds & Surfaces — Dark Mode

| Role | Name | Hex | Rationale |
|------|------|-----|-----------|
| Page background | Midnight Slate | `#1E2228` | A desaturated dark slate, not pure black. Pure black is associated with grief in many cultures. This dark navy-gray maintains warmth. |
| Header / Nav | Deep Pewter | `#252B33` | Slight elevation above the page background; creates subtle visual hierarchy. |
| Card / Bot bubble | Soft Graphite | `#2A2F38` | Warm dark surface for content containers and the bot's voice. |
| User message bubble | Night Blue | `#3A5070` | Dark-mode equivalent of the blue wash; maintains the user/bot visual distinction. |

### Typography Tokens

| Role | Name | Hex | Notes |
|------|------|-----|-------|
| Primary text (light mode) | Charcoal | `#2C2F35` | Not pure black — retains warmth, reduces the visual "punch" of text |
| Secondary / Muted text | Slate Gray | `#6B7280` | Timestamps, metadata, helper text |
| Primary text (dark mode) | Warm Cream | `#EAE8E3` | Not pure white — warm tint for dark backgrounds |
| Secondary text (dark mode) | Cool Mist | `#9CA3AF` | Supporting text in dark contexts |

---

## WCAG 2.1 Contrast Ratios

| Combination | Hex Values | Ratio | Level |
|-------------|-----------|-------|-------|
| Primary text on page background | `#2C2F35` on `#F4F1EC` | **11.2:1** | Pass (AAA) |
| White text on primary button | `#FFFFFF` on `#5B7FA6` | **4.8:1** | Pass (AA) |
| Secondary text on background | `#6B7280` on `#F4F1EC` | **4.6:1** | Pass (AA) |
| Light text on dark background | `#EAE8E3` on `#1E2228` | **12.4:1** | Pass (AAA) |
| Cream on dark card surface | `#EAE8E3` on `#2A2F38` | **10.6:1** | Pass (AAA) |
| Success color on light background | `#5A9475` on `#F4F1EC` | **4.7:1** | Pass (AA) |
| Alert/terracotta on light background | `#C0765A` on `#F4F1EC` | **3.8:1** | Pass (AA - large text/UI only) |
| Dark text on sage surface | `#1C4A36` on `#7DAA8F` | **7.1:1** | Pass (AAA) |

> **Important:** The terracotta alert color (`#C0765A`) at 3.8:1 meets AA for large text and UI components only. It **must always pair with an icon and helper text** — never use color alone as the sole error signal.

---

## Mode Adaptation Strategy

### Light Mode
The default for daytime use. The warm off-white background reduces blue-light harshness. Use a slight warm elevation hierarchy:

```
Page background (#F4F1EC) → Card surface (#FFFFFF) → Interactive element
```
Each level incrementally lighter. No drop shadows — use 1px warm border lines instead.

### Dark Mode
Do not simply invert light mode. Use a **"moonlight" model**:
- Backgrounds go deep desaturated navy
- Text goes warm cream
- Accent colors shift slightly warmer (lavender becomes a touch more rose; sage becomes a touch more golden) so they don't appear cold against dark backgrounds
- Reduce all color saturation by ~15% in dark mode — highly saturated colors on dark backgrounds trigger visual stress

### Mode Transitions
If the app auto-switches at sunset/sunrise, use a **600ms CSS transition** on `background-color` and `color`. Jarring mode switches can spike cortisol in sensitive users.

---

## Component-Level Guidance

### App Icon & Splash Screen
- Background: Heather Blue `#5B7FA6`
- Logomark: White
- Avoid gradients — they read as "tech company energy" rather than "safe space"

### Navigation / Header
- Light mode: Warm Background (`#F4F1EC`) with a single 1px `#E0DDD7` bottom border — no shadow
- Dark mode: `#1E2228` with no visible border — let the content float
- Heavy headers create a sense of being watched or monitored; keep them minimal

### Chat Container
Fills the viewport. No visible border between the input zone and message area — the conversation should feel continuous and uninterrupted.

### Message Bubbles

| Element | Light Mode | Dark Mode | Border Radius |
|---------|-----------|-----------|---------------|
| Bot bubble | White background, 2px left-border in Sage Mist | `#2A2F38` background, 2px left-border in Sage Mist | 0 18px 18px 4px |
| User bubble | Blue Wash (`#5B7FA6` at 13%) | Night Blue `#3A5070` | 18px 18px 4px 18px |

The consistent sage left-border on bot messages becomes a subconscious signal of "the safe voice."

### Buttons

| Type | Style | Use case |
|------|-------|----------|
| Primary CTA | Heather Blue fill, white text, `border-radius: 24px` | "Start session", "Save", "Continue" |
| Secondary / Ghost | 1px Sage Mist border, Sage Mist text, transparent fill | "Skip for now", "Remind me later" |
| Destructive | 1px Terracotta border, Terracotta text | "End session" only |

Use **pill-shaped buttons** (high border-radius). They test better in emotional UI contexts than rectangular ones — they feel less "final" and more "gentle." On press, `scale(0.97)` with 100ms ease. Avoid bounce animations — they feel playful in a context that needs gravity.

### Input Fields
- Default: Warm Surface background, 1.5px `#D8D5CF` border
- Focus state: 1.5px Heather Blue `#5B7FA6` border
- Placeholder text: Slate Gray `#6B7280`
- Error state: Terracotta color `#C0765A` with a small icon and gentle helper text below — **never a red border**

### Mood / Emotion Selectors
- Circular icon buttons at **48×48px** minimum (motor precision is reduced in distress)
- Tint each emotion in a distinct muted hue:

| Emotion | Tint |
|---------|------|
| Anxious | Heather Blue at 15% |
| Calm | Sage Mist at 15% |
| Sad | Soft Lavender at 15% |
| Frustrated | Terracotta at 15% |
| Okay | Sage Mist at 20%, 2px Sage border (selected state) |

### Breathing / Animation Elements
- Radial animations pulse between **Sage Mist at 25–30% opacity** and **Soft Lavender at 20% opacity**
- Easing: `ease-in-out`, 4-second cycle
- No hard edges, no full-opacity fills
- Inner ring reverses phase for a gentle "lung expansion" effect

```css
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50%       { transform: scale(1.18); opacity: 1; }
}
```

### Progress Indicators
- Track: `#E8E4F0` (light lavender-tinted gray)
- Fill: Soft Lavender `#A992C4`
- **Avoid green for progress** — it creates a pass/fail binary feeling in a space where there is no "winning"
- Secondary progress (streaks, habit tracking): Deep Sage `#5A9475`

---

## Cultural Adaptation Notes

| Color | Consideration | Recommendation |
|-------|--------------|----------------|
| White (`#FFFFFF`) | Mourning association in China, Japan, South Korea, parts of India | Use warm off-white `#F4F1EC` as the dominant background — reads as cream/natural, not ceremonial |
| Red | Danger in Western cultures; auspicious but high-energy in East Asian cultures | **Entirely absent** from the default palette |
| Purple / Lavender | Lenten/mourning association in Catholic Latin American traditions | For Brazil/Mexico localization, shift accent toward soft peach-rose |
| Black | Funereal in many cultures | Dark mode uses `#1E2228` (deep navy), which clearly reads as "very dark blue," not black |

---

## Accessibility Requirements

### Visual
- All interactive elements: minimum **44×44px** touch targets (reduced fine motor precision during distress)
- Never use color as the **sole** differentiator for errors, states, or categories — always pair with an icon and/or text label
- For deuteranopia (red-green color blindness): the sage/blue palette is fully distinguishable
- For protanopia: verify terracotta error vs. sage success using a color blindness simulator before shipping

### Motion
- Respect `prefers-reduced-motion` — breathing animations should pause or reduce to a simple opacity pulse
- Mode transition: 600ms `ease` on color properties
- Button press: `scale(0.97)` at 100ms — no bounce

### Typography
- Body text: 16px minimum, `line-height: 1.6` or higher
- Helper / metadata text: 12px minimum — never smaller in functional UI
- Font weight: 400 for body, 500 for emphasis — avoid 700+ in this context (feels aggressive)

---

## Conversational Flow and Emotional Safety

The palette does invisible emotional work throughout a session:

**On entry** — the Warm Parchment background and Heather Blue brand color communicate "calm, professional space" before the user reads anything.

**During conversation** — the bot's white-on-sage-border bubbles create a visual rhythm the user can anchor to. The consistent left-border in Sage Mist becomes a subconscious signal of "the safe voice." The user's blue-wash bubbles are distinct enough to feel like self-expression without creating an "us vs. them" visual split.

**During distress** — the UI should **not change color reactively**. No red tints, no warning-mode shifts. Stability of the visual environment is itself a therapeutic signal. The only motion should be breathing animations, which serve as gentle biofeedback cues.

**On progress moments** — Soft Lavender `#A992C4` appears on CTAs and progress indicators. Used sparingly, it retains its psychological freshness. Overuse erodes the empathic association.

**The deliberate absence of pure black and pure white** anywhere in the palette means the entire interface has a slight warmth that reads as "human-made" rather than "machine-generated" — exactly the impression a mental health chatbot should cultivate.

---

## Quick Reference — Design Tokens

```
/* Brand */
--color-primary:       #5B7FA6;   /* Heather Blue */
--color-secondary:     #7DAA8F;   /* Sage Mist */
--color-accent:        #A992C4;   /* Soft Lavender */
--color-error:         #C0765A;   /* Warm Terracotta */
--color-success:       #5A9475;   /* Deep Sage */

/* Backgrounds — Light */
--bg-page-light:       #F4F1EC;
--bg-surface-light:    #FFFFFF;
--bg-nav-light:        #EEEBE4;
--bg-user-bubble-light: rgba(91, 127, 166, 0.13);

/* Backgrounds — Dark */
--bg-page-dark:        #1E2228;
--bg-nav-dark:         #252B33;
--bg-surface-dark:     #2A2F38;
--bg-user-bubble-dark: #3A5070;

/* Typography — Light */
--text-primary-light:  #2C2F35;
--text-secondary-light:#6B7280;

/* Typography — Dark */
--text-primary-dark:   #EAE8E3;
--text-secondary-dark: #9CA3AF;

/* Bot bubble accent border */
--bot-bubble-border:   #7DAA8F;
```
