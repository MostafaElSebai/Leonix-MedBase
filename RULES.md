# Leonix-MedBase — UI Design Rules

> **⚠️ MANDATORY**: Read this file in full before building or modifying any component or page.
> Every design decision must conform to the rules below. No exceptions.

---

## 1. The Core Vibe

- **Aesthetic**: Clinical, premium, stable, and highly secure.
- **Feel**: Established, high-end enterprise software. Authoritative ("Leonix") + clean and accessible ("MedBase").
- **Spacing**: Open and breathable. Ample whitespace to prevent cognitive overload. Never crowd the UI.
- **Speed First**: This is a fast-paced internal tool. Every interaction must feel frictionless.

---

## 2. Color Palette — Use CSS Variables Only

Never hardcode hex values. Always use the CSS custom properties defined in `globals.css`.

| Role | CSS Variable | Hex | Tailwind Equivalent |
|---|---|---|---|
| **Primary Brand (Apex Cobalt)** | `--color-brand` | `#0F2C59` | `blue-950` / `slate-900` |
| **Primary Action (Surgical Blue)** | `--color-action` | `#2563EB` | `blue-600` |
| **Success / Active (Vitals Mint)** | `--color-success` | `#059669` | `emerald-600` |
| **App Background** | `--color-bg-app` | `#F8FAFC` | `slate-50` |
| **Card/Container Background** | `--color-bg-card` | `#FFFFFF` | `white` |
| **Primary Text** | `--color-text-primary` | `#0F172A` | `slate-900` |
| **Secondary/Muted Text** | `--color-text-muted` | `#64748B` | `slate-500` |
| **Border (Default)** | `--color-border` | `#E2E8F0` | `slate-200` |
| **Danger/Error** | `--color-danger` | `#DC2626` | `red-600` |
| **Warning** | `--color-warning` | `#D97706` | `amber-600` |

### Color Usage Rules
- `--color-brand`: Top-level navigation, logo, primary active states. **Never** use on body text or backgrounds.
- `--color-action`: **Only** for primary interactive elements: primary buttons, active links, form focus rings.
- `--color-success`: **Sparingly**. Success confirmations, active/online badges only.
- `--color-danger`: Error states, destructive actions only.

---

## 3. Typography

- **Font Family**: `Inter` (primary). Fallback: `Roboto`, then system sans-serif.
- **Body/Labels**: Regular (`font-normal`) for secondary text; Medium (`font-medium`) for labels and secondary data.
- **Primary Data Points** (doctor names, patient IDs, key metrics): Semibold (`font-semibold`).
- **Headings**: Bold (`font-bold`) only for page-level H1s.
- **Font Sizes**: Err on the side of slightly larger than standard web. Minimum `text-base` (16px) for any important data. `text-sm` is acceptable for muted/secondary info only.
- **Line Height**: Use `leading-snug` for headings and `leading-normal` for body copy.

---

## 4. Shape & Layout

### Border Radius — Structured, Not Soft
- **Cards & Containers**: `rounded-md` (6px). Structured and serious.
- **Buttons**: `rounded-md` (6px). Matches containers.
- **Input Fields**: `rounded-md` (6px).
- **Badges/Pills**: `rounded` (4px). Slightly sharper to convey data precision.
- **❌ NEVER use**: `rounded-full` (too casual) or `rounded-none` (too harsh).

### Shadows — Depth, Not Borders
- **Standard/Resting Card**: `shadow-sm`
- **Hovered Interactive Card (e.g., Kiosk card)**: `shadow-md`
- **Modals/Popovers**: `shadow-xl`
- **❌ NEVER use**: Thick, dark borders to separate containers. Use shadows instead.

### Layout
- **App Background**: Always `bg-slate-50` (maps to `--color-bg-app`).
- **Content containers**: White (`bg-white`), lifted with `shadow-sm`.
- **Single-column forms**: All data entry forms must be single-column to create a linear eye path.
- **Grid for Kiosk Cards**: 2–4 column grid depending on viewport.

---

## 5. Component Specifications

### Primary Button (`<Button variant="primary">`)
- Background: `--color-action` (`blue-600`)
- Text: White (`font-semibold`)
- Padding: `py-3 px-6` — large targets for fast-moving users
- Radius: `rounded-md`
- Hover: `blue-700` (slightly darker)
- Focus: `ring-2 ring-blue-600 ring-offset-2`
- Disabled: `opacity-50 cursor-not-allowed`

### Secondary Button (`<Button variant="secondary">`)
- Background: `white`
- Border: `1px solid --color-border` (`slate-200`)
- Text: `--color-text-primary`
- Hover: `bg-slate-50`

### Danger Button (`<Button variant="danger">`)
- Background: `--color-danger` (`red-600`)
- Text: White
- Hover: `red-700`

### Input Field (`<Input>`)
- Background: `white`
- Border: `border border-slate-200`
- Radius: `rounded-md`
- Padding: `py-3 px-4`
- Focus: `ring-2 ring-blue-600 border-transparent` — snaps visually to action color
- Label: **Above the input**, `font-medium text-sm text-slate-700`
- Error state: `border-red-500` + red helper text below

### PIN Input (`<PinInput>`)
- Large, prominent single-character boxes
- Monospace font
- Center-aligned digits
- Focus/active box: `ring-2 ring-blue-600`

### Kiosk Card (`<KioskCard>`)
- Size: Tall enough to tap easily (minimum `h-40`)
- Background: `white`
- Resting shadow: `shadow-sm`
- Hover shadow: `shadow-md` + slight `scale(1.02)` lift
- Top accent bar: 4px gradient from `--color-action` to a lighter blue
- Name: `font-semibold text-lg text-slate-900`
- Role/Specialty: `font-medium text-sm text-slate-500`
- Radius: `rounded-md`

### Badge (`<Badge>`)
- Success/Active: Green background (`emerald-100`), green text (`emerald-700`)
- Warning: Amber background (`amber-100`), amber text (`amber-700`)
- Error: Red background (`red-100`), red text (`red-700`)
- Neutral: Slate background (`slate-100`), slate text (`slate-600`)
- Radius: `rounded` (4px)
- Padding: `py-0.5 px-2`, `text-xs font-medium`

### Divider (`<Divider>`)
- 1px line, `bg-slate-200`
- Use for section separation within cards; never as a primary layout tool

---

## 6. Interaction & Motion Rules

- **Hover transitions**: All interactive elements must have `transition-all duration-150 ease-in-out` — fast and responsive.
- **No slow or decorative animations**: This is a professional tool, not a marketing site. No bounce, no spin, no elaborate entrance animations.
- **Loading states**: Use a simple spinner (`animate-spin`) or skeleton shimmer — never block the UI entirely.
- **Focus rings**: Every interactive element must have a visible focus ring for accessibility.

---

## 7. Accessibility

- Every interactive element must have a descriptive `aria-label` where the label is not obvious from visible text.
- Color alone must never convey meaning — pair color with an icon or text label.
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text/UI components.

---

## 8. Responsive Design — Mobile-First

This app **must work perfectly on mobile browsers** (phones, tablets) as well as desktop. Doctors may open it from their phones. Every page and component must be designed mobile-first and scale up.

### Breakpoint System
Use Tailwind's standard breakpoints. Always design for the smallest screen first, then add larger-screen overrides:

| Breakpoint | Min-width | Use case |
|---|---|---|
| (default) | 0px | Mobile phones (360px–639px) |
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets (iPad, etc.) |
| `lg` | 1024px | Laptops and small desktops |
| `xl` | 1280px | Full desktop |

### Grid & Layout Rules
- **Kiosk card grid**: `1 column` on mobile → `2 columns` at `sm` → `3 columns` at `lg` → `4 columns` at `xl`.
- **Page padding**: `px-4 py-6` on mobile → `px-8 py-12` at `md` and above. Never use fixed pixel padding on mobile.
- **Max-width containers**: Always cap content width (`max-w-5xl` or similar) and center with `mx-auto`.
- **Forms**: Single-column on all viewports (this is already the rule; enforce it especially on mobile).
- **No horizontal overflow**: Pages must never scroll horizontally on any viewport. Use `overflow-x: hidden` on the body if needed.

### Touch & Tap Targets
- **Minimum tap target size**: 44×44px on every interactive element — this is non-negotiable on mobile.
- **Spacing between tap targets**: At least 8px between adjacent buttons or links to prevent accidental mis-taps.
- **PIN Input cells**: On mobile, cells must be large enough to tap accurately. Minimum cell size: `3rem × 3.5rem` on mobile.
- **Kiosk cards**: Must be full-width on mobile (single column) so the entire card is an easy tap target.

### Typography on Mobile
- Page headings (`h1`): Scale down gracefully — use `text-2xl` on mobile, `text-3xl` or larger on `md+`.
- Body text: Never below `text-sm` (14px) on mobile. Use `text-base` (16px) as the minimum for primary data.
- **Do not rely on hover** to reveal important information — hover does not exist on touch screens.

### Navigation & Modals on Mobile
- **No fixed sidebars** on mobile — use a bottom sheet, drawer, or full-screen overlay instead.
- **Modals/dialogs**: Must be full-screen or nearly full-screen on mobile (≤`sm`). Avoid small centered modals that are hard to interact with.
- **Sticky headers**: If a sticky top nav is used, keep it slim (`h-14` max) to maximize content area on small screens.

### Component-Specific Mobile Rules
- **PinInput**: Automatically trigger `inputMode="numeric"` to open the numeric keyboard on mobile (already implemented — must be preserved).
- **Buttons inside cards**: On mobile, stack buttons vertically (`flex-col`) if they don't fit side-by-side.
- **Overflow text**: All names, labels, and data fields must use `text-ellipsis` + `overflow-hidden` + `whitespace-nowrap` (or `line-clamp`) to prevent layout breaks on narrow screens.

### Viewport Meta Tag
- The layout must include `<meta name="viewport" content="width=device-width, initial-scale=1" />`. This is the foundation of responsive rendering — verify it is present in `layout.tsx`.

---

## 9. What to NEVER Do

- ❌ Do not use extremely rounded pills (`rounded-full`) on cards or buttons.
- ❌ Do not use dark background cards or dark mode (clinical environment = light UI).
- ❌ Do not use decorative slow animations. Keep all motion under 200ms.
- ❌ Do not use small touch targets. Minimum 44px height on any tappable element.
- ❌ Do not use thick colored borders for layout separation — use shadows.
- ❌ Do not hardcode hex colors in components — reference CSS variables.
- ❌ Do not use more than 3 font weights on a single page.
- ❌ Do not use `rounded-none` — it's too aggressive for a clinical feel.
- ❌ Do not design only for desktop. Every layout must be tested mentally (or in browser DevTools) at 375px width before being considered complete.
- ❌ Do not use `hover:` as the sole mechanism to reveal information — it doesn't work on touch screens.
- ❌ Do not use fixed pixel widths on containers — always use percentages, `max-w-*`, or `w-full`.
- ❌ Do not create horizontal scroll — any component that causes overflow at mobile widths must be refactored.
