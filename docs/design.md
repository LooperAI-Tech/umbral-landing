# Umbral - Complete Design System Reference

> This document captures **every design detail** from the Umbral codebase: colors, typography, spacing, components, layouts, animations, and patterns. Use this as the single source of truth when applying the Umbral design system to new projects or pages.

---

## Table of Contents

1. [Theme & Color System](#1-theme--color-system)
2. [Typography](#2-typography)
3. [Spacing & Sizing](#3-spacing--sizing)
4. [Border Radius](#4-border-radius)
5. [Shadows & Glows](#5-shadows--glows)
6. [Gradients](#6-gradients)
7. [Borders](#7-borders)
8. [Component Library](#8-component-library)
9. [Layout System](#9-layout-system)
10. [Navigation Patterns](#10-navigation-patterns)
11. [Chat Interface](#11-chat-interface)
12. [Form Patterns](#12-form-patterns)
13. [Loading & Skeleton States](#13-loading--skeleton-states)
14. [Animations & Transitions](#14-animations--transitions)
15. [Responsive Breakpoints](#15-responsive-breakpoints)
16. [Scrollbar Styling](#16-scrollbar-styling)
17. [Utility Classes](#17-utility-classes)
18. [Icon System](#18-icon-system)
19. [Authentication Pages](#19-authentication-pages)
20. [Design Tokens Summary](#20-design-tokens-summary)

---

## 1. Theme & Color System

Umbral uses a **dark-first** theme with a terminal/futuristic aesthetic. All CSS variables are defined in `frontend/app/globals.css` under `:root`.

### 1.1 Base Surfaces

| Token | Value | Usage |
|---|---|---|
| `--background` | `#0A0F1A` | Page background (deep dark blue-black) |
| `--foreground` | `#F1F5F9` | Primary text (soft white) |
| `--card` | `#111827` | Card backgrounds, sidebar |
| `--card-foreground` | `#F1F5F9` | Card text |
| `--popover` | `#111827` | Dropdown/popover backgrounds |
| `--popover-foreground` | `#F1F5F9` | Popover text |
| `--secondary` | `#1F2937` | Elevated surfaces, muted backgrounds |
| `--secondary-foreground` | `#F1F5F9` | Secondary surface text |
| `--muted` | `#1F2937` | Muted elements background |
| `--muted-foreground` | `#94A3B8` | Muted/secondary text |
| `--accent` | `#1E293B` | Hover backgrounds, accent surfaces |
| `--accent-foreground` | `#F1F5F9` | Accent surface text |
| `--bg-terminal` | `#0D1321` | Terminal/code block backgrounds |

### 1.2 Brand Colors

| Token (Tailwind class) | Value | Usage |
|---|---|---|
| `--color-brand-skyblue` | `#0EA5E9` | Primary brand, actions, active states |
| `--color-brand-skyblue-light` | `#38BDF8` | Hover states |
| `--color-brand-skyblue-dark` | `#0284C7` | Active/pressed states |
| `--color-community-yellow` | `#FCD34D` | Secondary accent, highlights |
| `--color-community-yellow-light` | `#FDE68A` | Yellow hover |
| `--color-community-yellow-dark` | `#FBBF24` | Yellow active |
| `--color-community-blue` | `#3B82F6` | Links, community branding |
| `--color-community-blue-light` | `#60A5FA` | Blue hover |
| `--color-neon-cyan` | `#22D3EE` | Terminal elements, accent gradient |
| `--color-neon-yellow` | `#FACC15` | Neon highlight elements |

### 1.3 Semantic / Primary Colors

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#0EA5E9` | Primary actions, brand CTA |
| `--primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--destructive` | `#F87171` | Error states, danger actions |
| `--ring` | `#0EA5E9` | Focus ring color |

### 1.4 Status Colors

| Token (Tailwind class) | Value | Usage |
|---|---|---|
| `--color-status-planned` | `#64748B` | Gray — Planned status |
| `--color-status-progress` | `#FCD34D` | Yellow — In Progress |
| `--color-status-completed` | `#4ADE80` | Green — Completed |
| `--color-status-blocked` | `#F87171` | Red — Blocked |
| `--color-status-active` | `#0EA5E9` | Blue — Active |

### 1.5 Chart Colors

| Token | Value |
|---|---|
| `--chart-1` | `#0EA5E9` (Sky Blue) |
| `--chart-2` | `#FCD34D` (Yellow) |
| `--chart-3` | `#4ADE80` (Green) |
| `--chart-4` | `#3B82F6` (Blue) |
| `--chart-5` | `#F87171` (Red) |

### 1.6 Sidebar Colors

| Token | Value |
|---|---|
| `--sidebar` | `#111827` |
| `--sidebar-foreground` | `#F1F5F9` |
| `--sidebar-primary` | `#0EA5E9` |
| `--sidebar-primary-foreground` | `#FFFFFF` |
| `--sidebar-accent` | `#1E293B` |
| `--sidebar-accent-foreground` | `#F1F5F9` |
| `--sidebar-border` | `rgba(148, 163, 184, 0.1)` |
| `--sidebar-ring` | `#0EA5E9` |

---

## 2. Typography

### 2.1 Font Families

```css
--font-body: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace;
--font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
```

Loaded via Next.js `next/font/google` in `layout.tsx`:

```tsx
const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-display", subsets: ["latin"] });
```

Also imported in CSS as fallback:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
```

### 2.2 Font Weights

| Weight | Value | Usage |
|---|---|---|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Navigation items, labels |
| Semibold | 600 | Card titles, section headers, buttons |
| Bold | 700 | Page titles, hero text, stat values |

### 2.3 Font Size Scale (Tailwind)

| Class | Usage | Context |
|---|---|---|
| `text-[10px]` | Micro text | Keyboard shortcuts, timestamps, tech tags |
| `text-xs` | Small text | Badges, labels, secondary info, status text |
| `text-sm` | Default body | Card descriptions, form labels, nav items |
| `text-base` | Card titles | Project names, section titles |
| `text-lg` | Dialog titles | Modal headers |
| `text-2xl` | Page titles | Dashboard heading, section headers |
| `text-3xl` | Large display | Stats values, auth page titles |
| `text-4xl md:text-5xl lg:text-6xl` | Hero titles | Landing pages |

### 2.4 Font Usage Patterns

- **Body text**: `font-sans` (Inter) — descriptions, paragraphs, navigation labels
- **Monospace**: `font-mono` (JetBrains Mono) — display IDs, badges, timestamps, inputs, terminal text, tech tags, status labels, keyboard shortcuts, stats values
- **Display**: `font-display` (Space Grotesk) — hero titles, page titles, brand text

### 2.5 Text Colors

| Class | Value | Usage |
|---|---|---|
| `text-foreground` | `#F1F5F9` | Primary text |
| `text-muted-foreground` | `#94A3B8` | Secondary/muted text |
| `text-brand-skyblue` | `#0EA5E9` | Active labels, links, brand text |
| `text-community-blue` | `#3B82F6` | Paths, links |
| `text-status-completed` | `#4ADE80` | Success text, positive trends |
| `text-status-blocked` | `#F87171` | Error text, negative trends |
| `text-status-progress` | `#FCD34D` | Warning text |
| `text-gradient-brand` | Gradient clip | Brand headlines (custom CSS class) |

---

## 3. Spacing & Sizing

### 3.1 Content Padding

| Context | Class |
|---|---|
| Main content area | `p-4 md:p-6 lg:p-8` |
| Card internal | `p-4`, `p-5`, `p-6` |
| Sidebar sections | `p-3`, `p-4` |
| Chat messages area | `p-4` |
| Chat input area | `p-3`, `p-4` |
| Dialog content | `p-6` |

### 3.2 Gaps

| Context | Class |
|---|---|
| Small elements | `gap-1`, `gap-1.5` |
| Button contents / tags | `gap-2` |
| Nav items / form groups | `gap-3` |
| Card sections | `gap-4` |
| Page sections | `gap-6` |
| Card component internal | `gap-6` (built into Card) |

### 3.3 Max-Width Containers

| Class | Usage |
|---|---|
| `max-w-md` | Auth forms (448px) |
| `max-w-2xl` | Narrow content |
| `max-w-3xl` | Medium content |
| `max-w-4xl` | Wide content |
| `max-w-7xl mx-auto` | Full-width sections |

### 3.4 Component Heights

| Component | Size |
|---|---|
| Header bar | `h-14` (56px) |
| Sidebar | `h-screen` (full viewport) |
| Button default | `h-9` (36px) |
| Button sm | `h-8` (32px) |
| Button lg | `h-10` (40px) |
| Icon button | `size-9` (36px) |
| Icon button sm | `size-8` (32px) |
| Icon button lg | `size-10` (40px) |
| Input | `h-9` (36px) |
| Chat FAB | `w-14 h-14` (56px) |
| Progress bar | `h-2` (8px) |
| Early access progress | `h-0.5` (2px) |
| Textarea min | `min-h-[40px]` |
| Textarea max | `max-h-[120px]` |

### 3.5 Icon Sizes

| Class | Usage |
|---|---|
| `w-2 h-2` | Status dots |
| `w-3 h-3` | Traffic light dots, badge icons |
| `w-4 h-4` | Default icon size (nav, buttons, stats) |
| `w-5 h-5` | Larger nav icons, section icons |
| `w-6 h-6` | Chat FAB icon, prominent icons |

### 3.6 Sidebar Width

| Component | Width |
|---|---|
| Main sidebar | `w-64` (256px) |
| Chat session sidebar | `w-56` (224px) |
| Chat side panel | `w-[400px] max-w-[90vw]` |
| Chat context panel | `w-72` (288px) |

---

## 4. Border Radius

Base radius: `--radius: 0.625rem` (10px)

| Token | Computed Value |
|---|---|
| `--radius-sm` | `calc(var(--radius) - 4px)` → 6px |
| `--radius-md` | `calc(var(--radius) - 2px)` → 8px |
| `--radius-lg` | `var(--radius)` → 10px |
| `--radius-xl` | `calc(var(--radius) + 4px)` → 14px |
| `--radius-2xl` | `calc(var(--radius) + 8px)` → 18px |

Usage in components:

| Component | Radius |
|---|---|
| Card | `rounded-xl` |
| Button | `rounded-md` |
| Input | `rounded-md` |
| Badge | `rounded-full` |
| Terminal header | `rounded-t-lg` |
| Dialog | `rounded-lg` |
| Status dots | `rounded-full` |
| Tech tags | `rounded`, `rounded-md` |
| Scrollbar thumb | `rounded-[3px]` (via CSS) |

---

## 5. Shadows & Glows

| Token | Value | Usage |
|---|---|---|
| `--shadow-glow` | `0 0 20px rgba(14, 165, 233, 0.3)` | Blue glow on hover (primary) |
| `--shadow-glow-yellow` | `0 0 20px rgba(252, 211, 77, 0.3)` | Yellow glow on hover (accent) |
| `shadow-sm` | Tailwind default | Card base shadow |
| `shadow-xs` | Tailwind default | Input shadow |
| `shadow-md` | Tailwind default | Dropdown menus |
| `shadow-lg` | Tailwind default | Modals, side panels, toasts |

Usage patterns:
- Cards: `shadow-sm` base, `hover:shadow-glow` on hover via `.glow-hover`
- Buttons: `hover:shadow-[var(--shadow-glow)]` for primary, `hover:shadow-[var(--shadow-glow-yellow)]` for accent
- Chat FAB: `shadow-glow hover:shadow-lg`
- Side panels: `shadow-lg`

---

## 6. Gradients

### 6.1 Defined Gradients

| Token | Value | Usage |
|---|---|---|
| `--gradient-brand` | `linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)` | Primary CTA buttons, brand elements |
| `--gradient-accent` | `linear-gradient(135deg, #0EA5E9 0%, #22D3EE 100%)` | Accent progress bars |
| `--gradient-warm` | `linear-gradient(135deg, #FCD34D 0%, #0EA5E9 100%)` | Warm accent elements |
| `--gradient-card` | `linear-gradient(180deg, rgba(14, 165, 233, 0.05) 0%, transparent 100%)` | Subtle card overlay |
| `--gradient-glow` | `radial-gradient(ellipse at center, rgba(14, 165, 233, 0.3) 0%, transparent 70%)` | Glow hover effect overlay |

### 6.2 Gradient Usage

- **Gradient button**: `bg-[image:var(--gradient-brand)]` with `text-white`
- **Gradient text**: `.text-gradient-brand` — uses `background-clip: text` with `-webkit-text-fill-color: transparent`
- **Progress bar (brand)**: `bg-[image:var(--gradient-brand)]`
- **Progress bar (accent)**: `bg-[image:var(--gradient-accent)]`
- **Chat FAB**: `bg-gradient-to-br from-brand-skyblue to-community-blue`

---

## 7. Borders

### 7.1 Border Colors

| Token | Value | Usage |
|---|---|---|
| `--border` | `rgba(148, 163, 184, 0.2)` | Default borders |
| `--input` | `rgba(148, 163, 184, 0.2)` | Input borders |
| `--border-subtle` | `rgba(148, 163, 184, 0.1)` | Subtle dividers (sidebar, terminal) |
| `--border-accent` | `rgba(14, 165, 233, 0.5)` | Accent borders |
| `--border-glow` | `#0EA5E9` | Glow state borders |

### 7.2 Border Patterns

| Context | Class |
|---|---|
| Card borders | `border border-border` |
| Sidebar border | `border-r border-sidebar-border` |
| Header bottom | `border-b border-border` |
| Terminal block | `border border-[var(--border-subtle)]` |
| Divider lines | `border-border` |
| User message | `border border-brand-skyblue/30` |
| Assistant message | `border border-border` |
| Input focus | `focus-visible:border-brand-skyblue` |
| Card hover | `hover:border-border/50` |

---

## 8. Component Library

### 8.1 Button

**File**: `frontend/components/ui/button.tsx`
**Library**: CVA (class-variance-authority)

#### Variants

| Variant | Classes | Description |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[var(--shadow-glow)]` | Solid sky blue |
| `gradient` | `bg-[image:var(--gradient-brand)] text-white font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98]` | Brand gradient with scale effect |
| `secondary` | `bg-transparent border border-brand-skyblue text-brand-skyblue hover:bg-brand-skyblue/10 hover:shadow-[var(--shadow-glow)]` | Outlined sky blue |
| `ghost` | `bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground` | Minimal, no border |
| `accent` | `bg-community-yellow text-gray-900 font-semibold hover:bg-community-yellow-dark hover:shadow-[var(--shadow-glow-yellow)]` | Yellow CTA |
| `destructive` | `bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20` | Red/danger |
| `outline` | `border border-border bg-transparent hover:bg-accent hover:text-foreground` | Neutral outlined |
| `link` | `text-brand-skyblue underline-offset-4 hover:underline` | Text link style |

#### Sizes

| Size | Classes |
|---|---|
| `default` | `h-9 px-4 py-2 has-[>svg]:px-3` |
| `sm` | `h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs` |
| `lg` | `h-10 rounded-md px-6 has-[>svg]:px-4` |
| `icon` | `size-9` |
| `icon-sm` | `size-8` |
| `icon-lg` | `size-10` |

#### Base Classes
```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
transition-all duration-200
disabled:pointer-events-none disabled:opacity-50
focus-visible:ring-ring/50 focus-visible:ring-[3px]
cursor-pointer
```

### 8.2 Badge

**File**: `frontend/components/ui/badge.tsx`

#### Variants

| Variant | Classes |
|---|---|
| `default` | `border-transparent bg-primary/20 text-primary` |
| `secondary` | `border-transparent bg-secondary text-secondary-foreground` |
| `destructive` | `border-transparent bg-destructive/20 text-destructive` |
| `outline` | `text-foreground border-border` |
| `success` | `border-transparent bg-status-completed/20 text-status-completed` |
| `warning` | `border-transparent bg-status-progress/20 text-status-progress` |
| `info` | `border-transparent bg-brand-skyblue/20 text-brand-skyblue` |

#### Base Classes
```
inline-flex items-center justify-center rounded-full border px-2.5 py-0.5
text-xs font-medium font-mono w-fit whitespace-nowrap shrink-0
gap-1 transition-colors overflow-hidden
```

### 8.3 Card

**File**: `frontend/components/ui/card.tsx`

| Sub-component | Classes |
|---|---|
| `Card` | `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm transition-all duration-200 hover:border-border/50` |
| `CardHeader` | `@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6` |
| `CardTitle` | `leading-none font-semibold text-foreground` |
| `CardDescription` | `text-muted-foreground text-sm` |
| `CardContent` | `px-6` |
| `CardFooter` | `flex items-center px-6 [.border-t]:pt-6` |
| `CardAction` | `col-start-2 row-span-2 row-start-1 self-start justify-self-end` |

### 8.4 Input

**File**: `frontend/components/ui/input.tsx`

```
Base: h-9 w-full min-w-0 rounded-md border border-border bg-background
      px-3 py-1 text-base md:text-sm shadow-xs font-mono
      transition-all duration-200 outline-none
      placeholder:text-muted-foreground

Focus: focus-visible:border-brand-skyblue
       focus-visible:ring-brand-skyblue/30
       focus-visible:ring-[3px]

Invalid: aria-invalid:ring-destructive/20
         aria-invalid:border-destructive

Disabled: disabled:pointer-events-none
          disabled:cursor-not-allowed
          disabled:opacity-50
```

### 8.5 Textarea

**File**: `frontend/components/ui/textarea.tsx`

```
Base: flex field-sizing-content min-h-16 w-full rounded-md border
      bg-transparent px-3 py-2 text-base md:text-sm shadow-xs
      transition-[color,box-shadow] outline-none

Focus: focus-visible:border-ring
       focus-visible:ring-ring/50
       focus-visible:ring-[3px]
```

### 8.6 Progress Bar

**File**: `frontend/components/ui/progress.tsx`

```
Container: relative h-2 w-full overflow-hidden rounded-full bg-secondary

Bar variants:
  default: bg-primary
  brand:   bg-[image:var(--gradient-brand)]
  accent:  bg-[image:var(--gradient-accent)]

Bar animation: transition-all duration-500 ease-out
```

### 8.7 Terminal Header

**File**: `frontend/components/ui/terminal-header.tsx`

```
Container: flex items-center gap-3 px-4 py-2
           bg-[var(--bg-terminal)] border-b border-[var(--border-subtle)]
           rounded-t-lg

Traffic lights: flex gap-1.5
  Red:    w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500
  Yellow: w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500
  Green:  w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500

Path format: font-mono text-xs
  "umbral"  → text-brand-skyblue
  ":"       → text-muted-foreground
  path      → text-community-blue
  "$"       → text-muted-foreground
  command   → text-foreground

Status dot:
  online:  w-2 h-2 rounded-full bg-status-completed animate-pulse
  loading: w-2 h-2 rounded-full bg-status-progress animate-pulse
  offline: w-2 h-2 rounded-full bg-status-blocked
```

### 8.8 Tabs

**File**: `frontend/components/ui/tabs.tsx`

```
TabsList: inline-flex items-center gap-1 border-b border-border

TabsTrigger:
  Base: inline-flex items-center justify-center px-4 py-2 text-sm
        font-medium font-mono transition-colors border-b-2 -mb-px cursor-pointer
  Active:   text-brand-skyblue border-brand-skyblue
  Inactive: text-muted-foreground border-transparent
            hover:text-foreground hover:border-muted-foreground/30

TabsContent: mt-4
```

### 8.9 Toast

**File**: `frontend/components/ui/toast.tsx`

```
Container: fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm

Toast item: flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
            backdrop-blur-sm animate-in slide-in-from-right-5
            font-mono text-sm

Variants:
  default: border-border bg-card text-foreground
  success: border-status-completed/30 bg-status-completed/10 text-status-completed
  error:   border-destructive/30 bg-destructive/10 text-destructive
  warning: border-status-progress/30 bg-status-progress/10 text-status-progress

Auto-dismiss: 4000ms
```

### 8.10 Dialog

**File**: `frontend/components/ui/dialog.tsx`

```
Overlay: fixed inset-0 z-50 bg-black/50
         animate-in/animate-out fade transitions

Content: bg-background fixed top-[50%] left-[50%] z-50
         translate-x-[-50%] translate-y-[-50%]
         w-full max-w-[calc(100%-2rem)] sm:max-w-lg
         rounded-lg border p-6 shadow-lg duration-200
         animate-in/animate-out zoom + fade transitions

Header: flex flex-col gap-2 text-center sm:text-left
Footer: flex flex-col-reverse gap-2 sm:flex-row sm:justify-end
Title: text-lg leading-none font-semibold
Description: text-muted-foreground text-sm
```

### 8.11 Select

**File**: `frontend/components/ui/select.tsx`

```
Trigger: flex w-fit items-center justify-between gap-2
         rounded-md border bg-transparent px-3 py-2 text-sm
         whitespace-nowrap shadow-xs
         data-[size=default]:h-9 data-[size=sm]:h-8
         focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]

Content: bg-popover text-popover-foreground rounded-md border shadow-md
         z-50 min-w-[8rem] overflow-auto
         animate-in/animate-out zoom + fade + slide transitions

Item: flex w-full cursor-default items-center gap-2
      rounded-sm py-1.5 pr-8 pl-2 text-sm
      focus:bg-accent focus:text-accent-foreground
```

### 8.12 Dropdown Menu

**File**: `frontend/components/ui/dropdown-menu.tsx`

```
Content: bg-popover text-popover-foreground z-50
         min-w-[8rem] rounded-md border p-1 shadow-md
         animate transitions

Item: flex cursor-default items-center gap-2
      rounded-sm px-2 py-1.5 text-sm
      focus:bg-accent focus:text-accent-foreground
      data-[variant=destructive]:text-destructive

Separator: bg-border -mx-1 my-1 h-px
Label: px-2 py-1.5 text-sm font-medium
Shortcut: text-muted-foreground ml-auto text-xs tracking-widest
```

### 8.13 Tooltip

**File**: `frontend/components/ui/tooltip.tsx`

```
Content: bg-foreground text-background z-50 w-fit
         rounded-md px-3 py-1.5 text-xs text-balance
         animate-in/animate-out transitions

Arrow: bg-foreground fill-foreground z-50 size-2.5
       translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]

Delay: 0ms (instant)
```

### 8.14 Skeleton

**File**: `frontend/components/ui/skeleton.tsx`

```
Base: bg-accent animate-pulse rounded-md
```

### 8.15 Separator

**File**: `frontend/components/ui/separator.tsx`

```
Horizontal: bg-border shrink-0 h-px w-full
Vertical:   bg-border shrink-0 h-full w-px
```

### 8.16 ScrollArea

**File**: `frontend/components/ui/scroll-area.tsx`

```
Scrollbar vertical:   flex touch-none h-full w-2.5 border-l border-l-transparent
Scrollbar horizontal: flex touch-none h-2.5 flex-col border-t border-t-transparent
Thumb:                bg-border relative flex-1 rounded-full
```

---

## 9. Layout System

### 9.1 Dashboard Shell

**File**: `frontend/app/dashboard/layout.tsx`

```
Root container:
  flex h-screen overflow-hidden bg-background

Sidebar (desktop):
  hidden lg:flex
  w-64 h-screen bg-sidebar border-r border-sidebar-border
  flex flex-col shrink-0

Mobile nav (hamburger):
  lg:hidden
  Overlay: fixed inset-0 z-40 bg-black/60
  Drawer: fixed top-0 left-0 z-50 w-64 h-full bg-sidebar border-r border-sidebar-border

Main content:
  flex-1 flex flex-col overflow-hidden
  Header: h-14 border-b border-border bg-background/80 backdrop-blur-sm
  Content: flex-1 overflow-y-auto p-4 md:p-6 lg:p-8

Chat FAB:
  fixed bottom-6 right-6 z-30

Chat side panel:
  fixed top-0 right-0 z-50 h-full w-[400px] max-w-[90vw]
  Backdrop: fixed inset-0 z-40 bg-black/30
```

### 9.2 Sidebar Structure

**File**: `frontend/components/layout/sidebar.tsx`

```
Container: w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0

Sections:
  Logo area:  p-4 border-b border-sidebar-border
  Navigation: flex-1 p-3 space-y-1
  Divider:    hr border-sidebar-border my-3
  User area:  p-4 border-t border-sidebar-border

Navigation items:
  [LayoutDashboard] Dashboard    (shortcut: d)
  [Lightbulb]       Projects     (shortcut: p)
  [Target]          Milestones   (shortcut: m)
  [CheckSquare]     Tasks        (shortcut: t)
  [Rocket]          Deployments  (shortcut: r)
  [BookOpen]        Learnings    (shortcut: l)
  --- divider ---
  [Bot]             AI Assistant (shortcut: a) — accent styled
```

### 9.3 Header

**File**: `frontend/components/layout/header.tsx`

```
Container: h-14 border-b border-border bg-background/80 backdrop-blur-sm
           flex items-center justify-between px-4 md:px-6

Left side:
  Mobile hamburger: lg:hidden, p-2 rounded-md hover:bg-accent
  Terminal breadcrumb: font-mono text-xs
    Format: "umbral : ~/path $ section_name"

Right side:
  Icons: text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent
  User button: Clerk UserButton with dark theme
```

### 9.4 Grid Layouts

| Pattern | Classes |
|---|---|
| Stats grid | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` |
| Project cards | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| Info grid | `grid grid-cols-2 md:grid-cols-4 gap-4` |
| Form fields | `grid grid-cols-1 md:grid-cols-2 gap-4` |
| Learning cards | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |

---

## 10. Navigation Patterns

### 10.1 Sidebar Nav Item

```
Base: flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
      transition-colors group

Active:
  Container: bg-sidebar-accent
  Text:      text-brand-skyblue
  Icon:      text-brand-skyblue w-5 h-5

Inactive:
  Text:      text-sidebar-foreground/70
  Icon:      text-muted-foreground w-5 h-5 group-hover:text-sidebar-foreground
  Hover:     bg-sidebar-accent

Accent item (AI Assistant):
  Text:      text-community-yellow
  Icon:      text-community-yellow

Shortcut badge:
  ml-auto text-[10px] font-mono text-muted-foreground
  bg-background/50 px-1.5 py-0.5 rounded
  hidden lg:inline-block
```

### 10.2 Header Breadcrumb Format

Terminal-style path display:
```
"umbral" (text-brand-skyblue) + ":" (text-muted-foreground) +
"~/path" (text-community-blue) + "$" (text-muted-foreground) +
"section" (text-foreground)
```

---

## 11. Chat Interface

### 11.1 Full Chat Page Layout

**File**: `frontend/components/chat/chat-interface.tsx`

```
Root: flex h-full

Session sidebar (left):
  w-56 border-r border-border bg-card flex flex-col shrink-0 hidden md:flex

Main area (center):
  flex-1 flex flex-col min-w-0
  Header: TerminalHeader
  Messages: flex-1 overflow-y-auto p-4 space-y-4
  Input: border-t border-border p-4

Context panel (right):
  w-72 border-l border-border bg-card flex flex-col shrink-0
```

### 11.2 Side Chat Panel (FAB-triggered)

**File**: `frontend/components/chat/side-chat-panel.tsx`

```
Backdrop: fixed inset-0 z-40 bg-black/30 transition-opacity

Panel: fixed top-0 right-0 z-50 h-full w-[400px] max-w-[90vw]
       flex flex-col bg-background border-l border-border shadow-lg
       animate-in slide-in-from-right duration-200

Header: flex items-center justify-between px-4 py-3 border-b border-border
Messages: flex-1 overflow-y-auto p-4 space-y-4
Input: flex-shrink-0 border-t border-border p-3
  Textarea: min-h-[36px] max-h-[100px] text-sm font-mono resize-none
            border border-border rounded-md bg-background px-3 py-2
```

### 11.3 Chat FAB

**File**: `frontend/components/chat/chat-fab.tsx`

```
Button: fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full
        bg-gradient-to-br from-brand-skyblue to-community-blue
        text-white shadow-glow
        hover:shadow-lg hover:scale-105 active:scale-95
        transition-all duration-200 border-0

Icon: Bot from lucide-react, w-6 h-6
```

### 11.4 Message Bubble

**File**: `frontend/components/chat/message-bubble.tsx`

```
User message:
  Container: flex justify-end
  Bubble: max-w-[80%] rounded-lg px-4 py-3 text-sm
          bg-brand-skyblue/20 text-foreground border border-brand-skyblue/30

Assistant message:
  Container: flex justify-start
  Bubble: max-w-[80%] rounded-lg px-4 py-3 text-sm
          bg-card text-foreground border border-border

Timestamp: block text-[10px] text-muted-foreground font-mono mt-2

Project summary card (in assistant messages):
  Container: mt-3 rounded-lg border border-brand-skyblue/30 bg-[var(--bg-terminal)]
  Header: px-4 py-3 border-b border-brand-skyblue/20 bg-brand-skyblue/5
    Title: font-mono text-sm font-semibold text-brand-skyblue
    Badge: text-[10px]
  Fields: p-4 space-y-3
    Label: w-28 text-xs text-muted-foreground font-mono shrink-0
    Value: text-sm text-foreground
  Tech pills: px-2 py-0.5 text-xs font-mono rounded-md
              bg-brand-skyblue/10 text-brand-skyblue border border-brand-skyblue/20
```

### 11.5 Typing Indicator

**File**: `frontend/components/chat/typing-indicator.tsx`

```
Container: flex items-center gap-1.5 px-4 py-3

Dots: flex gap-1
  Dot 1: w-2 h-2 rounded-full bg-brand-skyblue animate-bounce
  Dot 2: w-2 h-2 rounded-full bg-brand-skyblue animate-bounce [animation-delay:150ms]
  Dot 3: w-2 h-2 rounded-full bg-brand-skyblue animate-bounce [animation-delay:300ms]

Text: text-xs text-muted-foreground font-mono ml-1
```

---

## 12. Form Patterns

### 12.1 Standard Form Field

```html
<div class="space-y-2">
  <label class="text-sm font-medium text-foreground">Label</label>
  <Input class="font-mono" placeholder="..." />
</div>
```

### 12.2 Form Grid

```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- fields -->
</div>
```

### 12.3 Form Button Group

```html
<div class="flex gap-3">
  <Button variant="ghost">Cancel</Button>
  <Button variant="default">Submit</Button>
</div>
```

### 12.4 Focus States (all form elements)

```
focus-visible:border-brand-skyblue
focus-visible:ring-brand-skyblue/30
focus-visible:ring-[3px]
```

### 12.5 Validation / Error States

```
aria-invalid:ring-destructive/20
aria-invalid:border-destructive
```

### 12.6 Disabled States

```
disabled:pointer-events-none
disabled:cursor-not-allowed
disabled:opacity-50
```

---

## 13. Loading & Skeleton States

### 13.1 Skeleton Component

```
Base: bg-accent animate-pulse rounded-md
```

### 13.2 Common Skeleton Sizes

| Context | Classes |
|---|---|
| Page title | `h-8 w-64` |
| Subtitle | `h-4 w-96` |
| Stat card | `h-24 rounded-lg` |
| Project card | `h-40 rounded-lg` |
| Learning card | `h-36 rounded-lg` |
| Generic card | `h-32 rounded-lg` |
| Text line | `h-4 w-full`, `h-4 w-3/4` |

### 13.3 Loading Patterns

- **Page loading**: 2-line skeleton for title + multiple card skeletons in grid
- **Stats loading**: 4x `h-24 rounded-lg` in stats grid
- **Chat loading**: TypingIndicator component with bouncing dots
- **Button loading**: `disabled` state with `opacity-50`

---

## 14. Animations & Transitions

### 14.1 CSS Transitions

| Duration | Usage |
|---|---|
| `duration-200` | Standard interactions (buttons, cards, nav items) |
| `duration-300` | Slower transitions (panel slides) |
| `duration-500` | Progress bar fill |

| Property | Class | Usage |
|---|---|---|
| All properties | `transition-all` | Buttons, cards |
| Colors only | `transition-colors` | Nav items, links |
| Box-shadow + color | `transition-[color,box-shadow]` | Inputs |
| Opacity | `transition-opacity` | Fade effects |

### 14.2 Scale Animations

| Effect | Class |
|---|---|
| Button hover | `hover:scale-[1.02]` |
| Button active | `active:scale-[0.98]` |
| FAB hover | `hover:scale-105` |
| FAB active | `active:scale-95` |
| Icon hover | `group-hover:scale-110` |

### 14.3 CSS Keyframe Animations

```css
/* Pulse glow for status indicators */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### 14.4 Tailwind Animations Used

| Class | Usage |
|---|---|
| `animate-pulse` | Skeleton loaders, status dots |
| `animate-bounce` | Typing indicator dots |
| `animate-in` | Toast entry, panel slides |
| `slide-in-from-right-5` | Toast slide-in |
| `slide-in-from-right` | Side chat panel |
| `fade-in-0` / `fade-out-0` | Dialog/dropdown transitions |
| `zoom-in-95` / `zoom-out-95` | Dialog/dropdown scale transitions |

### 14.5 Animation Delays (Typing Indicator)

```
Dot 1: [animation-delay:0ms]
Dot 2: [animation-delay:150ms]
Dot 3: [animation-delay:300ms]
```

---

## 15. Responsive Breakpoints

Using Tailwind CSS default breakpoints:

| Breakpoint | Width | Key Changes |
|---|---|---|
| Default | 0px+ | Single column, mobile layout |
| `sm:` | 640px+ | Stats: 2 columns |
| `md:` | 768px+ | Grid: 2 columns, padding increases, chat session sidebar visible |
| `lg:` | 1024px+ | Sidebar visible, grid: 3+ columns, keyboard shortcuts visible |
| `xl:` | 1280px+ | (Available but rarely used) |
| `2xl:` | 1536px+ | (Available but rarely used) |

### Key Responsive Patterns

```
Sidebar:        hidden lg:flex
Mobile nav:     lg:hidden
Content pad:    p-4 md:p-6 lg:p-8
Stats grid:     grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
Project grid:   grid-cols-1 md:grid-cols-2 lg:grid-cols-3
Text sizes:     text-2xl md:text-3xl lg:text-4xl (heroes only)
Font switch:    text-base md:text-sm (inputs)
Chat sidebar:   hidden md:flex
Dialog width:   max-w-[calc(100%-2rem)] sm:max-w-lg
```

---

## 16. Scrollbar Styling

Custom WebKit scrollbar (defined in `globals.css`):

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}
```

---

## 17. Utility Classes

### 17.1 Custom CSS Classes (globals.css)

| Class | Effect |
|---|---|
| `.terminal-block` | `background: var(--bg-terminal); border: 1px solid var(--border-subtle); border-radius: 0.5rem;` |
| `.glow-hover:hover` | `box-shadow: var(--shadow-glow); border-color: var(--border-glow);` |
| `.text-gradient-brand` | `background: var(--gradient-brand); -webkit-background-clip: text; -webkit-text-fill-color: transparent;` |
| `.animate-pulse-glow` | `animation: pulse-glow 2s ease-in-out infinite;` |

### 17.2 Tailwind Utility Function

**File**: `frontend/lib/utils.ts`

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 17.3 Common Class Combinations

```
// Card with glow
"bg-card border border-border rounded-lg p-5 glow-hover transition-all"

// Text truncation
"line-clamp-2"

// Monospace label
"font-mono text-xs text-brand-skyblue uppercase tracking-wider"

// Tech tag
"text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"

// Status indicator dot
"w-2 h-2 rounded-full animate-pulse"

// Backdrop blur header
"bg-background/80 backdrop-blur-sm"

// Interactive icon
"text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent"
```

---

## 18. Icon System

### 18.1 Library

**Lucide React** (`lucide-react`)

### 18.2 Icon Sizes

| Context | Size Class |
|---|---|
| Status dots | `w-2 h-2` |
| Badge icons | `w-3 h-3`, `size-3` |
| Default / inline | `w-4 h-4`, `size-4` |
| Navigation | `w-5 h-5` |
| Prominent / FAB | `w-6 h-6` |

### 18.3 Icons Used

| Icon | Import | Context |
|---|---|---|
| `LayoutDashboard` | lucide-react | Dashboard nav |
| `Lightbulb` | lucide-react | Projects nav |
| `Target` | lucide-react | Milestones nav |
| `CheckSquare` | lucide-react | Tasks nav |
| `Rocket` | lucide-react | Deployments nav |
| `BookOpen` | lucide-react | Learnings nav |
| `Bot` | lucide-react | AI Assistant nav, Chat FAB |
| `Menu` | lucide-react | Mobile hamburger |
| `X` | lucide-react | Close buttons |
| `Plus` | lucide-react | Create/add buttons |
| `Settings` | lucide-react | Settings nav |
| `Bell` | lucide-react | Notifications |
| `ChevronDown` | lucide-react | Dropdowns |
| `ChevronRight` | lucide-react | Breadcrumbs, sub-menus |
| `ChevronUp` | lucide-react | Scroll up |
| `Check` / `CheckIcon` | lucide-react | Select indicators |
| `Circle` / `CircleIcon` | lucide-react | Radio indicators |
| `Send` | lucide-react | Chat send button |
| `Trash2` | lucide-react | Delete actions |
| `XIcon` | lucide-react | Dialog close |
| `ArrowUpDown` | lucide-react | Sorting |
| `Search` | lucide-react | Search inputs |
| `FolderOpen` | lucide-react | Projects |
| `Zap` | lucide-react | Activity/streak |
| `TrendingUp` | lucide-react | Trends |
| `Code2` | lucide-react | Tech stack |
| `Calendar` | lucide-react | Dates |
| `Users` | lucide-react | Team/target users |

### 18.4 Icon Styling Patterns

```
Default: "text-muted-foreground"
Active:  "text-brand-skyblue"
Accent:  "text-community-yellow"
Hover:   "group-hover:text-foreground" or "group-hover:text-sidebar-foreground"
Button:  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
```

---

## 19. Authentication Pages

### 19.1 Sign-In Page

**File**: `frontend/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

```
Layout: flex min-h-screen items-center justify-center bg-background

Container: w-full max-w-md

Title: text-3xl font-display font-bold text-gradient-brand
       → "Umbral" (gradient text)

Subtitle: mt-2 text-muted-foreground font-mono text-sm
          → "Your AI Learning Vault"

Clerk component wrapper: mx-auto mt-8

Clerk theme override:
  baseTheme: dark
  variables:
    colorPrimary: "#0EA5E9"
    colorBackground: "#111827"
    colorText: "#F1F5F9"
    colorInputBackground: "#1F2937"
    colorInputText: "#F1F5F9"
  elements:
    card: "border border-[rgba(148,163,184,0.2)] shadow-lg"
    formButtonPrimary: "bg-[#0EA5E9] hover:bg-[#0284C7]"
```

### 19.2 Sign-Up Page

Same structure as sign-in with `<SignUp />` component.

---

## 20. Design Tokens Summary

### Quick Reference Card

```
BACKGROUNDS
  Page:      #0A0F1A
  Card:      #111827
  Elevated:  #1F2937
  Terminal:  #0D1321
  Hover:     #1E293B

TEXT
  Primary:   #F1F5F9
  Secondary: #94A3B8
  Tertiary:  #64748B

BRAND
  Primary:   #0EA5E9 (Sky Blue)
  Light:     #38BDF8
  Dark:      #0284C7
  Yellow:    #FCD34D
  Blue:      #3B82F6
  Cyan:      #22D3EE

STATUS
  Completed: #4ADE80
  Progress:  #FCD34D
  Blocked:   #F87171
  Planned:   #64748B
  Active:    #0EA5E9

FONTS
  Body:      Inter (400-700)
  Mono:      JetBrains Mono (400-600)
  Display:   Space Grotesk (500-700)

RADIUS
  Base:      10px (0.625rem)
  Small:     6px
  Medium:    8px

TRANSITIONS
  Fast:      200ms
  Medium:    300ms
  Slow:      500ms

SHADOWS
  Glow Blue:   0 0 20px rgba(14, 165, 233, 0.3)
  Glow Yellow: 0 0 20px rgba(252, 211, 77, 0.3)

BREAKPOINTS
  sm:  640px
  md:  768px
  lg:  1024px (sidebar appears)
  xl:  1280px

SIDEBAR
  Width:     256px (w-64)
  Chat:      224px (w-56)
  Panel:     400px (w-[400px])

HEADER
  Height:    56px (h-14)

ICONS
  Library:   Lucide React
  Default:   16px (w-4 h-4)
  Nav:       20px (w-5 h-5)
  Large:     24px (w-6 h-6)
```

---

## Appendix: Technology Stack

| Technology | Version / Details |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS v4 + PostCSS |
| **Component Lib** | Custom components + Radix UI primitives |
| **Variant Management** | CVA (class-variance-authority) |
| **Class Merging** | clsx + tailwind-merge |
| **Animation** | tw-animate-css + custom keyframes |
| **Icons** | Lucide React |
| **Auth UI** | Clerk (dark theme) |
| **Font Loading** | next/font/google + CSS @import fallback |

---

*Generated from the Umbral codebase. Last updated: 2026-02-26.*
