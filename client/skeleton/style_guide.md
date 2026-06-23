StowitAll
One vault. Every password. Zero excuses.
Production-Ready Style Guide & Design System
Version 1.0

1. Visual Theme & Core Aesthetic

StowitAll inhabits the aesthetic of Modern Magitech / Industrial Arcanum — a seamless collision of clean, functional digital UI and the ancient, runic craft of a secret wizarding ministry deep beneath a modern city. Picture a master smith who has replaced hammers and bellows with gradient-lit interfaces and SVG particle effects, but whose workspace still smells faintly of forge smoke and old parchment.

Concept in One Sentence
The application should feel like a high-security vault designed by a guild of wizard-engineers: precise, powerful, and just a little bit dangerous.

Tone & Voice
•	Written at a 12th-grade vocabulary level — intelligent, but never stuffy.
•	Casual and witty throughout. A user who hits an error should feel amused, not anxious.
•	Active voice. Labels name what a control does, not what it is.
•	Consistent vocabulary across the entire application (a button that says "Forge" produces a toast that says "Forged").

Target Environment
•	Optimized exclusively for desktop viewports: standard 1080p up to 1440p monitors.
•	Layouts must use CSS flexbox and/or grid to adapt smoothly to window resizing — no fixed pixel widths on containers.
•	Mobile is out of scope for v1.
2. Color Palette & Design Tokens

All six tokens below are mathematically locked to guarantee WCAG AA compliance (minimum 4.5:1 contrast ratio for standard text; 3:1 for large text and UI components) against the Deep Slate background. Developers must reference the CSS custom property names — never hard-code hex values directly into component styles.

CSS Token	Hex Value	Swatch	Intended Use	Semantic Name
--color-bg-main	#1A222A		Primary app canvas, dashboard panels, page backgrounds.	Deep Slate
--color-primary	#2D6A4F		Container borders, accents, success states, nav elements.	Imperial Forest Green
--color-secondary	#E0A96D		Headers, active states, runic accents, high-vis labels.	Burnished Brass / Gold
--color-glow-safe	#52B788		Button inner glows, active lock indicators, hover states.	Magical Aura Green
--color-bg-error	#221E1F		Error page canvas background only.	Dungeon Wrought-Iron / Charcoal
--color-accent-error	#E63946		Error alerts, validation failures, ember glow on error page.	Smoldering Ember Red

Usage Rules
•	--color-bg-main is the universal page canvas. Do not use it as a text color.
•	--color-secondary (Brass/Gold) is reserved for headers, active states, and decorative runic accents only. Do not use it for body copy on dark backgrounds — verify contrast before applying.
•	--color-glow-safe is for glow effects and interactive feedback only, not static decorative color.
•	--color-bg-error and --color-accent-error are strictly isolated to the Error Page. They must not appear on any other page.
•	Dark Moss variants (dark desaturated greens in the #1E2D24–#243B2A range) may be used for card/panel backgrounds to add depth without competing with --color-primary. No additional CSS token is required — apply them as one-off panel styles.

CSS Token Declaration
:root {
  --color-bg-main:      #1A222A;
  --color-primary:      #2D6A4F;
  --color-secondary:    #E0A96D;
  --color-glow-safe:    #52B788;
  --color-bg-error:     #221E1F;
  --color-accent-error: #E63946;
}
3. Typography & Hierarchy

Two font families only. No exceptions. Load both from Google Fonts.

Role	Specification
Display / Structural Headers	font-family: 'Cinzel', 'Cormorant Garamond', Georgia, serif  |  font-weight: 700  |  color: var(--color-secondary)
UI Controls, Forms & Body	font-family: 'Inter', system-ui, sans-serif  |  font-weight: 400  |  color: #FFFFFF
Data Tables & Metadata	font-family: 'Inter', system-ui, sans-serif  |  font-weight: 400  |  font-size: 0.875rem  |  color: #FFFFFF

Type Scale
Element	Size / Weight / Family
Page Title (e.g., "The Vault")	2.5rem / 700 / Cinzel
Section Header (h2)	1.75rem / 700 / Cinzel
Sub-Header (h3)	1.25rem / 600 / Cinzel
Navigation Labels & Button Text	0.9375rem / 500 / Inter
Form Labels & Input Text	0.9375rem / 400 / Inter
Body / Descriptive Copy	1rem / 400 / Inter
Metadata (dates, timestamps)	0.8125rem / 400 / Inter
Error Body Copy	1rem / 400 / Inter (same as body)

Key Rules
•	All structural page headers render in Cinzel / Cormorant Garamond — color: var(--color-secondary).
•	All UI function text (buttons, labels, nav, forms) renders in Inter — color: #FFFFFF.
•	Never render Cinzel at sizes below 0.85rem. It becomes illegible at small sizes.
•	Line-height for body copy: 1.6. Line-height for headers: 1.2.
4. UI Components & Programmatic Textures

4.1 Background Etchings
All primary page panels (background canvas) feature a subtle low-opacity geometric and runic overlay via an inline SVG data URI pattern. The overlay should feel like etched stone or engraved metalwork — visible only on close inspection, never competing with content.

background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'
  width='60' height='60' viewBox='0 0 60 60'%3E
  %3Cpath d='M30 0 L60 30 L30 60 L0 30 Z M30 10 L50 30 L30 50 L10 30 Z'
  fill='none' stroke='%232D6A4F' stroke-width='1' stroke-opacity='0.15'/%3E
%3C/svg%3E");

4.2 The "Brushed Metal" Button
All interactive action buttons use this treatment. The base texture is a CSS linear gradient simulating brushed metal; the inner glow provides the magical-aura feedback.

button.forge-btn {
  background: linear-gradient(145deg, #3d4852, #242b32);
  border: 1px solid var(--color-secondary);
  border-radius: 4px;
  box-shadow: inset 0 0 8px var(--color-glow-safe), 0 4px 6px rgba(0,0,0,0.3);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  padding: 0.5rem 1.25rem;
}
button.forge-btn:hover {
  box-shadow: inset 0 0 14px var(--color-glow-safe), 0 0 10px var(--color-glow-safe);
  cursor: pointer;
}

💡  Destructive actions (Delete) use var(--color-accent-error) in place of var(--color-glow-safe) for the inner glow only — the brushed metal base texture remains unchanged.

4.3 Form Inputs
All text fields, search bars, and form controls share a single visual treatment:
•	Background: #242b32 (a shade darker than the page canvas).
•	Border: 1px solid var(--color-primary) at rest; 1px solid var(--color-secondary) on focus.
•	Border-radius: 4px.
•	Text: Inter, 0.9375rem, #FFFFFF.
•	Placeholder text: Inter, 0.9375rem, #888888.
•	Focus outline: 0 0 6px var(--color-glow-safe) — never use the browser default blue outline.

4.4 Navigation Elements
Navigation tabs and footer links follow these rules:
•	Font: Inter, 500 weight, 0.9375rem, #FFFFFF at rest.
•	Hover state: color shifts to var(--color-secondary); a 2px underline in var(--color-glow-safe) appears below the label.
•	Active/current page: color var(--color-secondary), underline always visible, no pointer cursor.
•	The Date-Time Group (top-right on all authenticated pages) renders in Inter, 0.8125rem, var(--color-secondary). It is display-only — no interactive state.

4.5 Iconography Specifications
All icons are rendered via clean, inline SVG markup — no raster images, no icon fonts.

Icon / Asset	Specification
App Logo / Anvil Mark	Minimalist industrial anvil silhouette in crisp vectors. Enveloped by an SVG glow filter (feGaussianBlur) simulating a magical aura. Color: var(--color-primary) fill, var(--color-glow-safe) for the glow layer.
Security / Password Keys	Standard key silhouette where the bit/teeth are replaced with sharp geometric runic patterns. Color: var(--color-secondary).
Vault Door Status	Multi-layered iron vault door with a central locking ring. Ring color: dim var(--color-primary) when locked → var(--color-glow-safe) at full brightness when successfully unlocked. Implement as an SVG fill transition.

💡  Never use emoji as UI icons. Never substitute stock icon library assets for these three core icons — they are part of the brand identity.
5. Page-by-Page Specifications

All authenticated pages (Home, Create, Profile, Vault, Contact Us) share the Deep Slate canvas and the standard color palette. The Login/Sign-Up page and the Error page have specific overrides called out below.

5.1 Login / Sign-Up Page (Two States, One Component)
This is a single-component page rendered in two distinct states — Login State and Sign-Up State. The two states toggle back and forth via the "I do not have an account" / "I have an account" controls.

Element	Specification
Page canvas	var(--color-bg-main). No etched background pattern — keep this page clean and focused.
Logo / Brand block	StowitAll in Cinzel, var(--color-secondary). Slogan beneath in Inter, italic, #FFFFFF.
Form container	Centered card, max-width 420px, padding 2rem. Border: 1px solid var(--color-primary). Border-radius: 6px. Background: Dark Moss panel (#1E2D24).
Form inputs	Standard input treatment (see §4.3). Fields: email, password (Login) | email, first name, last name, username, password, confirm password (Sign-Up).
Submit button	Full-width forge-btn (see §4.2). Label: "Submit". On successful login/signup, triggers the smoky page transition (see §6.1).
State-toggle control	Small Inter text link at bottom-left of the form card. "I do not have an account" / "I have an account". Color: var(--color-secondary). No button chrome — plain text with underline on hover.

5.2 Home Page
Element	Specification
Canvas	var(--color-bg-main) with etched background pattern (see §4.1).
Header bar	Full-width. Left: "User Profile" link (nav treatment, §4.4). Center: StowitAll logo/wordmark. Right: Date-Time Group (§4.4). Border-bottom: 1px solid var(--color-primary).
Hero block	Large StowitAll wordmark in Cinzel, var(--color-secondary). Slogan below in Inter italic, #FFFFFF.
Quatrain / body copy	A short, witty 4-line verse about what StowitAll does. Inter, 1rem, #FFFFFF, centered. This copy must be written in the brand voice (§1).
"Password Creation Room" CTA	Full-width forge-btn spanning the content column. Prominent. Label: "Password Creation Room".
Secondary nav row	"Contact Us" (bottom-left) | "My Vault" (center) | "Log Out" (bottom-right). Standard nav treatment.

5.3 Create Page ("The Password Creation Room")
This page contains the primary workflow area and the password generation widget, "The Grand Crucible." See §6.2 for the Crucible animation specification.

Element	Specification
Canvas	var(--color-bg-main) with etched background pattern.
Header bar	Left: StowitAll wordmark. Right: Date-Time Group. Border-bottom: 1px solid var(--color-primary).
Page title	"The Password Creation Room" in Cinzel, var(--color-secondary), centered.
Action button row	Three forge-btns in a row: "New" | "Edit" | "Delete". "Delete" uses the error-glow variant (§4.2 note).
Search/input fields	"Password Name" and "Company Name" labeled input fields. Standard input treatment (§4.3).
Grand Crucible widget	Explicitly labeled "The Grand Crucible." Contains parameter controls ("Components") and the Forge button. See §6.2 for full animation spec.
Footer nav	"Contact Us" (left) | "Home" (center) | "Log Out" (right). Standard nav treatment.

5.4 Vault Page ("The Vault")
Element	Specification
Canvas	var(--color-bg-main) with etched background pattern.
Header bar	"Home" link (top-left) | StowitAll wordmark (center) | Date-Time Group (top-right).
Page title	"The Vault" — large Cinzel display treatment, var(--color-secondary).
Column headers	"Password" | "Site Name" | "Date Created" — Inter, bold, 500, var(--color-secondary). A 1px var(--color-primary) border below.
Action row	"Search" | "Edit" | "Delete" forge-btns. Delete uses error-glow variant.
Data rows	Alternating subtle Dark Moss / Deep Slate row shading for readability. Inter, 0.9375rem, #FFFFFF.
Vault door icon	Vault status icon (§4.5) in top-right of the data area. Glows green when vault is open/unlocked.

5.5 Profile Page
Element	Specification
Canvas	var(--color-bg-main) with etched background pattern.
Header	StowitAll wordmark (center) | Date-Time Group (top-right).
Form fields	Read-only display by default: First Name, Last Name, Username, Email, Password (masked). Standard input treatment (§4.3) — inputs appear locked/dimmed until Edit is triggered.
"Save" & "Edit" buttons	Side-by-side forge-btns. "Save" only becomes active after "Edit" is clicked.
Footer nav	"Contact Us" (left) | "Home" (center) | "Log Out" (right).

5.6 Contact Us Page
A minimal informational page. No form submission — display only.

Element	Specification
Canvas	var(--color-bg-main) with etched background pattern.
Header	Username (top-left) | StowitAll wordmark (center) | Date-Time Group (top-right).
Navigation shortcut	"Home" forge-btn centered below the header bar. Provides a quick escape without scrolling to the footer.
Intro copy	Short, warm opening line in brand voice. Inter, 1rem, #FFFFFF. Example: "Here are some ways that you can contact us. Please feel free to reach out anytime."
Contact entries	Label-value pairs: Email, Phone, GitHub, LinkedIn. Label: Inter, bold, var(--color-secondary). Value: Inter, #FFFFFF, underlined on hover for links. Render as styled anchor tags.
No footer nav required	The "Home" button in the header area serves as the primary exit. A footer "Home" link may be added for consistency — developer discretion.

5.7 Error Page
The Error Page deliberately breaks from the standard palette to create a dungeon atmosphere. It is the only page where var(--color-bg-error) and var(--color-accent-error) appear.

Element	Specification
Canvas	var(--color-bg-error) (#221E1F). No etched background pattern — replace with a CSS linear-gradient simulating rough stone blocks and wrought-iron textures (dark grays, #3A3535 striations).
Ambient ember glow	A slow CSS radial-gradient pulse positioned in the lower third of the viewport. Color: var(--color-accent-error) at ~15% opacity, fading to transparent. Animation: 3-4 second ease-in-out loop. Simulates distant firelight bleeding through prison bars.
StowitAll header	Standard wordmark in Cinzel, var(--color-secondary). Slogan in Inter below. Date-Time Group top-right.
Primary error message	Cinzel or bold Inter, large. var(--color-accent-error) for the dramatic first sentence. Example: "Error: Thou hast broken the Ancient Laws of computer applications and have been sent to the DUNGEON!"
"Just Kidding!" block	Separate panel below the dramatic error. Inter, #FFFFFF. Contains the sincere apology message.
"Home" button	Single forge-btn at bottom-right. Uses var(--color-accent-error) for the border and glow in place of the standard green, consistent with the dungeon palette.
💡  The "Just Kidding!" block must always follow the dramatic message. The apology is sincere — the tone should land as genuinely sorry after the theatrical setup, not dismissive.
6. Animations, Transitions & State Changes

6.1 Macro Page Transitions (The Smoky Veil)
Full-screen smoky transitions are reserved exclusively for high-impact moments. Overusing them on routine navigation would diminish their effect and create friction.

Triggers (Three only)
•	System Authentication — successful Login.
•	Session Disconnect — Logout.
•	Successful New Password Generation — after the Forge sequence completes (see §6.2).

Visual Execution
•	A full-viewport canvas overlay activates at 0% opacity and fades to 100% over ~150ms.
•	The overlay holds for ~150ms (total duration: ~300ms including fade-out).
•	An SVG particle or CSS smoke texture animates opacity across the overlay — dark green-gray, semi-transparent particles suggesting forge smoke.
•	The fade clears to reveal the next page as if it materialized out of thin air.
•	Respect prefers-reduced-motion: remove the overlay entirely and perform an instant page switch for users with this preference set.

6.2 The Grand Crucible — Forge Animation Sequence
The password generation area is labeled "The Grand Crucible." Parameter inputs are labeled "Components." The generation button is labeled "Forge."

The Four-Act Swirl Sequence
•	Act I — Components Set: The user fills in their Components (length, character types, etc.) and clicks "Forge."
•	Act II — The Swirl: A localized CSS/SVG animation activates within the output field. Alphanumeric characters and symbols flash rapidly, spinning and morphing in a green smoky SVG vortex filter (feGaussianBlur + feTurbulence). Duration: ~400ms.
•	Act III — Resolution: The chaotic movement abruptly halts. The green smoke clears. The final, solid credential drops into steady alignment in the output field.
•	Act IV — Smoky Veil: The macro page transition (§6.1) fires immediately after the credential resolves, marking the completion of the forge event.

💡  The Forge animation must be cancellable — if the user presses Escape or clicks outside the Crucible during Act II, the animation completes instantly and reveals whatever credential was last computed.
💡  Respect prefers-reduced-motion: skip Acts II and III entirely, displaying the credential immediately.

6.3 Micro-Interactions
Interaction	Specification
Button hover	box-shadow expands from 8px to 14px inner glow (var(--color-glow-safe)). 0.2s ease transition. No scale or translate transforms.
Button active/click	Inner glow pulses to full brightness for 100ms, then returns to hover state.
Input focus	Border transitions from var(--color-primary) to var(--color-secondary). Outer glow: 0 0 6px var(--color-glow-safe). 0.15s ease.
Nav link hover	Color shifts to var(--color-secondary). 2px underline in var(--color-glow-safe) slides in from left. 0.2s ease.
Vault door icon unlock	SVG fill of the locking ring transitions from dim var(--color-primary) to full var(--color-glow-safe). 0.4s ease. No bounce.
Error ember pulse	Radial gradient opacity oscillates between 10% and 20% on a 3.5s ease-in-out loop. Subtle — it should read as ambient light, not an alert.
7. Layout, Spacing & Grid

All layouts use CSS flexbox or grid. No fixed pixel widths on containers. The goal is a layout that feels intentional and spacious — not cluttered — while adapting cleanly to window resizing.

Spacing Scale
Token / Usage	Value
Base unit	4px
Component internal padding (sm)	8px (2 × base)
Component internal padding (md)	16px (4 × base)
Section spacing between major blocks	32px (8 × base)
Page-level outer padding (left/right)	48px (12 × base)
Page-level outer padding (top/bottom)	32px (8 × base)
Max content column width	960px — center-aligned with auto margins

Structural Layout Rules
•	Header bar: fixed height 64px. Position: sticky top. z-index above content panels.
•	Footer nav: fixed height 52px. Position: sticky bottom. z-index above content panels.
•	Main content area: flex-grow: 1; overflow-y: auto. Fills the space between header and footer bars.
•	All major content panels carry a 1px solid var(--color-primary) border and a 6px border-radius.
•	Never rely on overflow: hidden to contain floated content — use flex/grid clearance.
8. Accessibility Standards

•	All text meets WCAG AA contrast minimums. Color tokens are locked to compliant values (§2).
•	All interactive elements (buttons, inputs, links) must have visible :focus-visible styles. Use the glow-safe box-shadow — never suppress outline without replacing it.
•	All SVG icons must include a descriptive aria-label attribute. Purely decorative SVGs use aria-hidden="true".
•	Form inputs must be associated with a <label> element via htmlFor / id pairing. Placeholder text is not a substitute for a label.
•	The smoky transition overlay must set aria-hidden="true" while active so screen readers skip it.
•	Color alone must never be the sole indicator of state — always pair a color change with a text label, icon, or border change.
•	prefers-reduced-motion must be respected for all animations (§6.1, §6.2, §6.3).
9. In-World Terminology Glossary

The following terms are part of the StowitAll brand voice. Developers and copywriters must use these labels consistently across all UI strings, error messages, tooltips, and marketing copy.

StowitAll Term	Plain-English Meaning
The Grand Crucible	The password generation widget on the Create page.
Components	The parameter inputs inside The Grand Crucible (length, character sets, etc.).
Forge / Forged	The act of generating a new password / the confirmation state after generation.
The Vault	The password storage and retrieval page.
The Password Creation Room	The Create page — the full page housing The Grand Crucible and CRUD controls.
The Smoky Veil	The full-screen page transition animation.
Date-Time Group	The live timestamp displayed in the top-right corner of all authenticated pages.

