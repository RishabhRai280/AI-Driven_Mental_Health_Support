# High-Fidelity Wireframe: Login & Register Pages

This wireframe details the split-window authentication layout for the Login and Registration user interfaces, integrating the psychological color framework and precise responsive grid dimensions.

---

## 1. Page Information
* **Routes**: `/login` and `/register`
* **Layout Goal**: Provide a secure, grounding, and simple onboarding experience. Avoid corporate "coldness" and intense "urgency" prompts.
* **Global Backgrounds**:
  * Light Mode: `--bg-page-light` (`#F4F1EC` Warm Parchment)
  * Dark Mode: `--bg-page-dark` (`#1E2228` Midnight Slate)
* **Font Typography**: `Outfit` or `Inter`, weights: `400` (body), `500` (emphasis/headers).

---

## 2. Layout Structures (50/50 Split Viewports)

### A. Login Page Layout Preview (Route: `/login`)

```
+---------------------------------------------------------------------------------------------------------+
|  [SereneMind Logo]                                                             [Light/Dark Toggle]     |
|  +--------------------------------------------------+------------------------------------------------+  |
|  |                                                  |                                                |  |
|  |               LEFT PANEL: CONTENT                |              RIGHT PANEL: MASCOT               |  |
|  |               (50% Width, Padding: 48px)         |              (50% Width, Content Centered)     |  |
|  |                                                  |                                                |  |
|  |  [Title: Welcome Back]                           |  +------------------------------------------+  |  |
|  |  [Sub: Pause, breathe, and step inside.]         |  |                                          |  |  |
|  |                                                  |  |          MASCOT CONTAINER                |  |  |
|  |  [Email Input Field]                             |  |          - Width: 100% (Max 480px)       |  |  |
|  |  [Password Input Field]                          |  |          - Aspect-Ratio: 1 / 1           |  |  |
|  |                                                  |  |          - Style: Glass card overlay     |  |  |
|  |  [Actions: Primary Sign In Button (Pill)]        |  |          - Content: Peaceful AI Mascot   |  |  |
|  |  [Actions: Secondary Anonymous Ghost Button]     |  |                     (User Provided)       |  |  |
|  |                                                  |  |                                          |  |  |
|  |  [Switch Link: New here? Create account]         |  +------------------------------------------+  |  |
|  |                                                  |                                                |  |
|  +--------------------------------------------------+------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

### B. Registration Page Layout Preview (Route: `/register`)

```
+---------------------------------------------------------------------------------------------------------+
|  [SereneMind Logo]                                                             [Light/Dark Toggle]     |
|  +--------------------------------------------------+------------------------------------------------+  |
|  |                                                  |                                                |  |
|  |               LEFT PANEL: MASCOT                 |              RIGHT PANEL: CONTENT              |  |
|  |               (50% Width, Content Centered)      |              (50% Width, Padding: 48px)        |  |
|  |                                                  |                                                |  |
|  |  +------------------------------------------+    |  [Title: Begin Your Journey]                   |  |
|  |  |                                          |    |  [Sub: A gentle space for self-discovery.]     |  |
|  |  |          MASCOT CONTAINER                |    |                                                |  |
|  |  |          - Width: 100% (Max 480px)       |    |  [Full Name Input Field]                       |  |
|  |  |          - Aspect-Ratio: 1 / 1           |    |  [Email Input Field]                           |  |
|  |  |          - Style: Glass card overlay     |    |  [Password Input Field]                        |  |
|  |  |          - Content: Peaceful AI Mascot   |    |  [Focus Checkboxes / Initial Preference]       |  |
|  |  |                     (User Provided)       |    |                                                |  |
|  |  |                                          |    |  [Actions: Primary Sign Up Button (Pill)]      |  |
|  |  +------------------------------------------+    |                                                |  |
|  |                                                  |  [Switch Link: Already registered? Sign in]    |  |
|  +--------------------------------------------------+------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Styling Specifications

### General Shell Styles
* **Split Container**: `display: flex; min-height: 100vh; width: 100vw; flex-direction: row;` (Mobile query: switches to vertical stack `flex-direction: column;`).
* **Header / Top Bar**: Minimal fluid top bar, `height: 64px`, `position: absolute; width: 100%; top: 0; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; z-index: 10;`.
  * *Logo Type*: Font Outfit, Size `20px`, Weight `500`, Color `--text-primary-light` (`#2C2F35`) or `--text-primary-dark` (`#EAE8E3`).
  * *Light/Dark Mode Selector*: Accessible toggle switch button (`44x44px`), radius `50%`, background `transparent`, transition `600ms ease`.

---

### Component Specifications

#### A. Content Panels (Forms Column)
* **Layout**: `display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 48px 80px; width: 50%; max-width: 600px; margin: 0 auto;`.
* **Titles**: 
  * Header 1: `font-size: 32px; font-weight: 500; margin-bottom: 8px; color: var(--text-primary);`.
  * Subtext: `font-size: 16px; font-weight: 400; color: var(--text-secondary); margin-bottom: 32px; line-height: 1.5;`.
* **Inputs Container**: `width: 100%; display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px;`.
* **Input Fields**:
  * Style: `width: 100%; padding: 14px 16px; border-radius: 12px; font-size: 16px; transition: border-color 0.2s ease; background-color: var(--bg-surface);`.
  * Light Mode Border: `1.5px solid #D8D5CF`.
  * Dark Mode Border: `1.5px solid #3A3F48`.
  * Focus State: `outline: none; border-color: var(--color-primary) (#5B7FA6); box-shadow: 0 0 0 3px rgba(91, 127, 166, 0.15);`.
  * Placeholder Text: `color: var(--text-secondary) (#6B7280 / #9CA3AF);`.
* **Checkbox / Preference Selection (Registration)**:
  * Style: Multi-select custom pill tags (`padding: 8px 16px; border-radius: 20px; font-size: 14px; cursor: pointer; border: 1.5px solid var(--color-secondary); background: transparent; transition: all 0.2s ease;`).
  * Active tag: Background `--color-secondary` (`#7DAA8F` at 15% opacity), border 1.5px solid `--color-secondary` (`#7DAA8F`).
* **Error States**:
  * Input border does **NOT** turn red. It keeps the standard border style or soft indicator border.
  * An error helper block is rendered directly underneath: `display: flex; align-items: center; gap: 6px; color: var(--color-error) (#C0765A); font-size: 13px; font-weight: 400; margin-top: 6px;`.
  * Includes standard SVG warning alert icon (`size: 16px`).
* **Button Component Actions**:
  * **Primary CTA Button** ("Sign In" / "Create Account"):
    * Style: `width: 100%; height: 48px; border-radius: 24px; border: none; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;`.
    * Color: Fill `--color-primary` (`#5B7FA6`), Text `#FFFFFF`.
    * On Press: `transform: scale(0.97); ease 100ms;`.
    * Focus State: `outline: 2px solid var(--color-accent) (#A992C4); outline-offset: 2px;`.
  * **Secondary Button** ("Continue Anonymously"):
    * Style: Ghost button. `width: 100%; height: 48px; border-radius: 24px; border: 1.5px solid var(--color-secondary) (#7DAA8F); text-color: var(--color-secondary); background: transparent; transition: all 0.15s ease; cursor: pointer;`.
    * Focus State: Same outline rules.
    * On Press: `transform: scale(0.97); ease 100ms;`.
* **Switch Link**:
  * Style: `font-size: 14px; color: var(--text-secondary); margin-top: 24px; align-self: center;`.
  * Anchor Link tag: `color: var(--color-primary); font-weight: 500; text-decoration: underline; transition: color 0.2s; cursor: pointer;`.

---

#### B. Mascot Panels (Visual Column)
* **Layout**: `width: 50%; display: flex; justify-content: center; align-items: center; background-color: var(--bg-nav); padding: 48px;` (Dark Mode uses `--bg-nav-dark` `#252B33`).
* **Mascot Placeholder Wrapper**:
  * Style: `width: 100%; max-width: 480px; aspect-ratio: 1 / 1; border-radius: 32px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px; text-align: center; border: 2px dashed rgba(91, 127, 166, 0.25); background: var(--bg-surface); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);`.
  * Interior Text: `color: var(--text-secondary); font-size: 15px; font-weight: 400; line-height: 1.6;`.
  * Dynamic visual pacer: Features a very subtle pulsing light ring in the background using `--color-secondary` (`#7DAA8F` at 8% opacity) to provide grounding calm even during login.

---

## 4. Accessibility Specs (A11y)
* **Touch Targets**: All fields, checkboxes, toggle controls, and CTA buttons meet the minimum target spacing of `44x44px` (buttons are `48px`).
* **Aria Rules**:
  * Forms are wrapped in standard semantic HTML `<form>` tags.
  * Inputs contain explicit labels or `aria-label` tags corresponding to their visual helper text.
  * Error blocks have `role="alert"` and `aria-live="assertive"`.
* **Keyboard Navigation**: Fully tab-navigable index sequence (`tabindex="0"` on toggles, input boxes, checkboxes, buttons). Clear focus visibility borders configured via `focus-visible` styling variables.
