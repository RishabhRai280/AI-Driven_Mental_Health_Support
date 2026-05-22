# High-Fidelity Wireframe: Landing Page (Home)

This wireframe details the structural, color, and interactive specifications for SereneMind's public Landing Page, designed to establish a sense of safety and calm immediately upon arrival.

---

## 1. Page Information
* **Route**: `/`
* **Layout Goal**: Provide an open, welcoming, clutter-free entryway. Reduce visual noise to limit sensory overload for visitors.
* **Global Backgrounds**:
  * Light Mode: `--bg-page-light` (`#F4F1EC` Warm Parchment)
  * Dark Mode: `--bg-page-dark` (`#1E2228` Midnight Slate)
* **Font Typography**: `Outfit` for headings, `Inter` for body. Weights: `400` (body), `500` (headings).

---

## 2. Layout Structure Preview (Responsive Container: Max Width `1200px`)

```
+---------------------------------------------------------------------------------------------------------+
|  [SereneMind Logo]                                      [About] [Privacy]  [Login (Ghost)] [Register]   |
|  =====================================================================================================  |
|                                                                                                         |
|                                         HERO SECTION (Centered)                                         |
|                                         - Max-Width: 800px                                              |
|                                         - Padding-Top: 80px, Padding-Bottom: 64px                       |
|                                                                                                         |
|                                  Your Safe Space for Emotional Clarity                                  |
|                 A 24/7 empathetic AI companion and journaling system designed for your                  |
|                                       privacy and peace of mind.                                        |
|                                                                                                         |
|                                         [Start Free Session (Pill CTA)]                                 |
|                                                                                                         |
|  -----------------------------------------------------------------------------------------------------  |
|                                                                                                         |
|                                    FEATURES CONTAINER (Grid: 3-Columns)                                 |
|                                    - Gap: 24px, Max-Width: 1100px                                       |
|                                                                                                         |
|  +-------------------------------+ +-------------------------------+ +-------------------------------+  |
|  |       1. EMPATHETIC CHAT      | |     2. PRIVATE JOURNALING     | |       3. MOOD ANALYTICS       |  |
|  |  - Icon: ChatBubble (Blue)    | |  - Icon: Pencil (Sage Mist)   | |  - Icon: Trends (Lavender)    |  |
|  |  - Card: Glass card surface   | |  - Card: Glass card surface   | |  - Card: Glass card surface   |  |
|  |  - Text: Calming guidance.    | |  - Text: Secure, auto-saved.  | |  - Text: CBT insights.        |  |
|  +-------------------------------+ +-------------------------------+ +-------------------------------+  |
|                                                                                                         |
|  =====================================================================================================  |
|  [Disclaimer Footer: Muted gray, font-size: 12px, line-height: 1.6]                                     |
|  "SereneMind is not a replacement for professional medical treatment..."                                |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. High-Fidelity Styling Specifications

### A. Navigation Header
* **Layout**: `height: 72px; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; background-color: var(--bg-nav-light) (#EEEBE4); transition: background-color 0.6s ease;`.
* **Border**: Light mode has a `1px` bottom border (`color: #E0DDD7`). Dark mode navigation is borderless (`background-color: var(--bg-nav-dark) (#252B33)`).
* **Logo Brand**:
  * Brand Name: "SereneMind", Size `22px`, Weight `500`. Color `--text-primary` (`#2C2F35` / `#EAE8E3`).
* **Header Actions**:
  * Flex-container `gap: 16px`, `align-items: center`.
  * **Login Button**: Ghost Pill style. `padding: 10px 20px; border-radius: 20px; border: 1.5px solid var(--color-secondary) (#7DAA8F); color: var(--color-secondary); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;`.
  * **Register Button**: Primary Pill style. `padding: 11px 22px; border-radius: 20px; border: none; background-color: var(--color-primary) (#5B7FA6); color: #FFFFFF; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;`.

---

### B. Centered Hero Block
* **Layout**: `display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; max-width: 800px; margin: 0 auto; padding: 80px 24px 64px 24px;`.
* **Headline Text**: 
  * Font-Size: `44px` (Large display), Weight `500` (Gentle bold), Line-Height `1.2`.
  * Color: `--text-primary` (`#2C2F35` / `#EAE8E3`).
* **Subheading**:
  * Font-Size: `18px`, Weight `400` (Light regular), Line-Height `1.6`.
  * Color: `--text-secondary` (`#6B7280` / `#9CA3AF`).
  * Spacing: `margin-top: 16px; margin-bottom: 36px; max-width: 640px;`.
* **Start Button CTA**:
  * Style: Large Pill Shape. `padding: 16px 36px; border-radius: 28px; border: none; font-size: 18px; font-weight: 500; background-color: var(--color-primary) (#5B7FA6); color: #FFFFFF; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 4px 12px rgba(91, 127, 166, 0.15);`.

---

### C. Feature Highlights Container
* **Layout Grid**: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; padding: 0 24px 80px 24px;` (Responsive query: swaps to `grid-template-columns: 1fr;` on mobile screen viewports).
* **Card Component Style**:
  * Glass Card: `background-color: var(--bg-surface); border-radius: 24px; padding: 32px 24px; border: 1.5px solid rgba(224, 221, 215, 0.5) (Light Mode) / rgba(58, 63, 72, 0.5) (Dark Mode); display: flex; flex-direction: column; align-items: flex-start; text-align: left; transition: all 0.2s ease;`.
  * Hover state: Border turns slightly defined, light elevation translation (`transform: translateY(-4px);`).
* **Inside Card Elements**:
  * **Card Icon**: Encapsulated in circular background tag. `width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;`.
    * *Card 1 Tint*: Background `#5B7FA6` at 10% opacity. Icon color `--color-primary` (`#5B7FA6`).
    * *Card 2 Tint*: Background `#7DAA8F` at 10% opacity. Icon color `--color-secondary` (`#7DAA8F`).
    * *Card 3 Tint*: Background `#A992C4` at 10% opacity. Icon color `--color-accent` (`#A992C4`).
  * **Card Title**: `font-size: 20px; font-weight: 500; color: var(--text-primary); margin-bottom: 12px;`.
  * **Card Description**: `font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.6;`.

---

### D. Clinical Disclaimer Footer
* **Layout**: `width: 100%; border-top: 1px solid var(--border-color); padding: 48px 40px; background-color: var(--bg-nav); text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;`.
* **Disclaimer Content**:
  * Text: `"SereneMind is not a replacement for professional medical treatment, clinical therapy, or emergency crisis services. If you are experiencing severe distress or a life-threatening mental health emergency, please contact your local emergency services or a dedicated crisis lifeline immediately."`
  * Styling: `font-size: 12px; line-height: 1.6; font-weight: 400; color: var(--text-secondary) (#6B7280 / #9CA3AF); max-width: 720px; margin-bottom: 16px;`.
* **Copyright Label**: `font-size: 11px; color: var(--text-secondary); opacity: 0.8;`.

---

## 4. Interaction & Motion System
* **Button Hover Transitions**:
  * Hover: Opacity scales smoothly, button scales slightly `scale(1.02)`.
  * Active (Press): `transform: scale(0.97)` with 100ms ease. No bouncy or aggressive springs.
* **Scroll Fade-in**: Content components fade and slide up slightly (`opacity: 0` to `opacity: 1`, `translateY(15px)` to `translateY(0)`) over `600ms` with an ease-out timing curve as they enter the screen viewport.

---

## 5. Accessibility Specs (A11y)
* **Visual Landmark Tags**: Semantically utilizes standard HTML5 structured landmarks (`<header>`, `<main>`, `<section>`, `<footer>`).
* **Color Ratios**: Contrast matches standard WCAG 2.1 levels (minimum 4.5:1 for body and buttons).
* **Keyboard Tab Order**: Sequenced tab routing through navigation links, buttons, and individual cards. Custom outline highlights mapped strictly on `:focus-visible`.
* **Screen Reader Labels**: Core buttons contain descriptive aria instructions (e.g. `aria-label="Start free emotional clarity session"`).
