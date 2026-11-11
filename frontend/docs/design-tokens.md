# Design Tokens & System Specification

> Generated using the **Apple Design Skill** (improvement mode) and **Beautiful Shadows**, customized for a warm artisanal cafe experience.
> Incorporates the client's custom brand request: **"Background color should be a light yellow-brown gradient, with the brown also kept light and airy."**

---

## 1. Design Philosophy & Point of View

### The Human Experience
The aesthetic reflects an artisanal morning cafe: the gentle warmth of dawn light filtering through timber-framed windows, the aroma of freshly ground blonde beans, and the delicate crema crowning an espresso.
Rather than cold generic grays or high-saturation purples, the interface employs an organic, tactile harmony:
- **Light Theme**: A serene, radiant light yellow-brown gradient base (`#FAF3E0` to `#EFE3D0`), topped with pristine warm milk-foam card surfaces (`#FFFFFF` / `#FCFAF7`), and rich espresso text (`#221A15`) achieving well over 12:1 contrast.
- **Dark Theme**: Intimate, candle-lit evening cafe atmosphere with roasted espresso-wood hues and warm foam typography.
- **Signature Visual Element**: **"Crema Halo & Amber Glow"** — subtle layered ambient lighting with warm amber rim highlights and multi-layered neutral elevation (derived from Apple HIG materials and the `beautiful-shadows` specification).
- **Physical Motion**: Apple fluid interface dynamics (critically damped springs for state changes, natural momentum for sheets and cards, GSAP ScrollTrigger timelines for cinematic storytelling) with complete graceful degradation under `prefers-reduced-motion`.

---

## 2. Color Palette & Roles

All colors are exposed as CSS custom variables (`--color-*`) with automatic system dark-mode switching and manual override capability.

### 2.1 Light Mode (Daytime Roastery)

| Token Name | CSS Variable | Hex / Value | Semantic Role & Contrast |
|---|---|---|---|
| **Background Start** | `--bg-gradient-start` | `#FAF4E6` | Soft morning light yellow-ivory |
| **Background Mid** | `--bg-gradient-mid` | `#F6EBD9` | Light creamy honey tone |
| **Background End** | `--bg-gradient-end` | `#EFE2CF` | Soft, light warm milk-chocolate brown |
| **Surface Primary** | `--surface-primary` | `#FFFFFF` | Solid card & content surface (13.5:1 text contrast) |
| **Surface Secondary** | `--surface-secondary` | `#F8F2E8` | Recessed containers, input fills, subtle pills |
| **Surface Translucent** | `--surface-translucent` | `rgba(255, 252, 247, 0.82)`| Floating navigation with `backdrop-filter: blur(20px)` |
| **Text Primary** | `--text-primary` | `#231A14` | Deep roasted espresso (> 12:1 WCAG AAA) |
| **Text Secondary** | `--text-secondary` | `#635345` | Warm mocha description text (> 4.8:1 WCAG AA) |
| **Text Tertiary** | `--text-tertiary` | `#8C7A6B` | Captions, timestamps, disabled markers (> 3.2:1) |
| **Brand Primary** | `--brand-primary` | `#7C4624` | Warm espresso amber (buttons, active states; > 5.5:1) |
| **Brand Hover** | `--brand-hover` | `#66371B` | Pressed state (10% darker) |
| **Brand Light** | `--brand-light` | `#F5EBE1` | Subtle brand tint for badges and selected chips |
| **Accent Gold** | `--accent-gold` | `#B87B3E` | Caramel honey accent for stars, awards, badges |
| **Destructive** | `--color-destructive` | `#C93B2B` | Apple-style ruby red for delete & cancel (> 4.6:1) |
| **Success** | `--color-success` | `#2E7D32` | Forest matcha green for confirmations |
| **Border Subdued** | `--border-subdued` | `rgba(60, 40, 20, 0.08)` | Subtle internal dividers |
| **Border Normal** | `--border-normal` | `rgba(60, 40, 20, 0.14)` | Card outlines, button borders, inputs |
| **Border Focus** | `--border-focus` | `#7C4624` | High-visibility 2px focus ring |

### 2.2 Dark Mode (Evening Roastery)

| Token Name | CSS Variable | Hex / Value | Semantic Role & Contrast |
|---|---|---|---|
| **Background Start** | `--bg-gradient-start` | `#1A1512` | Deep charcoal espresso |
| **Background Mid** | `--bg-gradient-mid` | `#17120F` | Midnight roast |
| **Background End** | `--bg-gradient-end` | `#120E0C` | Ground bean dark base |
| **Surface Primary** | `--surface-primary` | `#241E1A` | Elevated dark timber card surface |
| **Surface Secondary** | `--surface-secondary` | `#2F2620` | Secondary surface / chips |
| **Surface Translucent** | `--surface-translucent` | `rgba(28, 23, 19, 0.82)` | Translucent navbar |
| **Text Primary** | `--text-primary` | `#FDFBF7` | Warm steamed milk foam (> 13:1) |
| **Text Secondary** | `--text-secondary` | `#C8BDB2` | Oat cream secondary text (> 6:1) |
| **Text Tertiary** | `--text-tertiary` | `#94877B` | Muted footnote |
| **Brand Primary** | `--brand-primary` | `#D98A50` | Luminous caramel amber (> 5:1 on dark) |
| **Brand Hover** | `--brand-hover` | `#EAA368` | Lighter on hover |
| **Border Subdued** | `--border-subdued` | `rgba(255, 245, 235, 0.08)` | Internal dark dividers |
| **Border Normal** | `--border-normal` | `rgba(255, 245, 235, 0.15)`| Dark card borders |

---

## 3. Typography Scale & Optical Roles

Following Apple WWDC *The Details of UI Typography*: tracking (letter-spacing) tightens as optical size increases, and leading (line-height) is inversely proportional to heading size.

```css
/* Typography Scale */
--font-display:    clamp(2.5rem, 5vw, 4rem) / 1.05; letter-spacing: -0.03em; font-weight: 700;
--font-title-1:    2rem (32px) / 1.15;              letter-spacing: -0.02em; font-weight: 700;
--font-title-2:    1.5rem (24px) / 1.25;            letter-spacing: -0.015em; font-weight: 600;
--font-title-3:    1.25rem (20px) / 1.3;            letter-spacing: -0.01em; font-weight: 600;
--font-headline:   1rem (16px) / 1.4;               letter-spacing: -0.005em; font-weight: 600;
--font-body:       1rem (16px) / 1.5;               letter-spacing: 0em;      font-weight: 400;
--font-callout:    0.9375rem (15px) / 1.45;         letter-spacing: 0em;      font-weight: 500;
--font-subhead:    0.875rem (14px) / 1.4;           letter-spacing: 0.005em;  font-weight: 400;
--font-footnote:   0.8125rem (13px) / 1.35;         letter-spacing: 0.01em;   font-weight: 400;
--font-caption:    0.75rem (12px) / 1.3;            letter-spacing: 0.015em;  font-weight: 500;
```

---

## 4. Spacing, Safe Areas & Interactive Target Sizes

- **Base Unit**: 4px baseline grid (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`).
- **Touch Target Rule**: Strict adherence to Apple HIG rule — **minimum 44 × 44 CSS pixels** for all interactive targets (buttons, links, icon controls, quantity selectors, pagination/tabs).
- **Safe Areas**: Native support for iOS notch/dynamic island using `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`, and `env(safe-area-inset-right)`.

---

## 5. Radii & Surface Elevation (Beautiful Shadows)

- `--radius-sm`: `8px` (badges, chips, quantity controls)
- `--radius-md`: `12px` (standard input fields, small buttons)
- `--radius-lg`: `16px` (content cards, dropdown menus)
- `--radius-xl`: `24px` (sheets, dialogs, showcase cards)
- `--radius-full`: `9999px` (pill filters, avatars, capsule CTA buttons)

### Elevation Shadows (from `beautiful-shadows` skill)
- **Beautiful sm** (controls, pills):
  `0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`
- **Beautiful md** (standard cards, popovers):
  `0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06), 0px 3px 3px -1.5px rgba(0,0,0,0.06), 0px 6px 6px -3px rgba(0,0,0,0.06), 0px 12px 12px -6px rgba(0,0,0,0.06), 0px 24px 24px -12px rgba(0,0,0,0.06)`
- **Beautiful lg** (hero media, sheets, modals):
  `0 2.8px 2.2px rgba(0,0,0,0.034), 0 6.7px 5.3px rgba(0,0,0,0.048), 0 12.5px 10px rgba(0,0,0,0.06), 0 22.3px 17.9px rgba(0,0,0,0.072), 0 41.8px 33.4px rgba(0,0,0,0.086), 0 100px 80px rgba(0,0,0,0.12)`

---

## 6. One Signature Element: "Crema Halo & Ambient Glow"

A custom styling token combining an ultra-fine warm-gold inner perimeter light with subtle warm caramel diffusion:
```css
.crema-halo {
  box-shadow: 
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
    0 0 0 1px rgba(184, 123, 62, 0.18),
    0 8px 24px -4px rgba(124, 70, 36, 0.12);
}
```

---

## 7. Motion Tokens (Apple HIG Springs & Cinematic GSAP)

- **Touch Press Feedback**: instant response on pointerdown (`active:scale-[0.97] transition-transform duration-100 ease-out`).
- **Modal / Sheet Spring**: response `0.35s`, damping `0.85` (momentum-aware settle).
- **GSAP Reveal Ease**: `power3.out`, duration `0.85s`.
- **GSAP Scrub Smoothness**: `scrub: 1.0` to `1.2`.
- **Accessibility Guarantee**: When `prefers-reduced-motion: reduce` is detected, all 3D transforms, parallax, video scrubbing, and pin triggers are converted to static layouts with clean 150ms opacity fades.

