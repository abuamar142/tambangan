# Tambangan UX Overhaul — Complete Specification

> **Goal**: Make Tambangan DELIGHTFUL and INSTANTLY USEFUL.
> A passenger opens the app, sees ship status in under 2 seconds, and knows exactly when to go to the dock.

---

## 1. Current State Audit

### What works
- DaisyUI theme with teal brand + amber accent — good semantic foundation
- ChannelBar (progress meter) is a unique, clever visualization
- Ticker countdown component exists but is underused
- PWA install prompt, theme toggle, share button — nice touches
- AppShell with Sidebar + BottomNav + MobileHeader — solid structure

### What hurts
| Problem | Impact | Severity |
|---------|--------|----------|
| Home page wastes 60% of viewport on a decorative header | Critical info delayed | High |
| Countdown timer is `text-xs` — easy to miss on mobile | Core UX fails | High |
| Tambangan detail groups ships into 3 sections but no visual hierarchy | Everything looks equal | Medium |
| KapalCard shows ChannelBar + countdown as secondary info buried at bottom | Status is not instant | High |
| No "at a glance" summary — how many ships at each point? | Requires scrolling/clicking | Medium |
| Home page shows ALL ships across ALL tambangan — no quick tambangan access | Confusing for passengers | High |
| Filter is a `<select>` dropdown — not touch-friendly, not visual | Poor mobile UX | Medium |
| No haptic feedback on status change | Missed delight opportunity | Low |
| Captain controls are flat buttons — no visual status state | Hard to see current state | Medium |

---

## 2. Design Principles for Tambangan

### P1: INSTANT comprehension
Open the app → know the status in under 2 seconds. No scrolling, no tapping, no reading small text.

### P2: Contextual relevance
Passengers see tambangan overview. Captains see their ships. Admins see everything. Each role gets exactly what they need.

### P3: Time-aware design
Countdowns are THE most important element. They should dominate the visual hierarchy when active.

### P4: Mobile-first, PWA-native
Every interaction assumes thumb reach, small screen, potentially slow network. The app should feel native.

### P5: Maritime atmosphere
The UI should feel like the sea — calm, rhythmic, trustworthy. Not corporate, not gamified.

---

## 3. Visual Design System

### 3.1 Color Semantics (extend existing DaisyUI theme)

```
┌─────────────────────────────────────────────────────────────┐
│  STATUS COLOR MAP                                           │
├──────────────┬──────────────────────────────────────────────┤
│  STANDBY     │  Teal (#0d9488) — calm, available, ready    │
│  CROSSING    │  Amber (#f59e0b) — active, in-motion, alert │
│  EXPIRED     │  Red (#ef4444) — timer done, urgent          │
│  ARRIVED     │  Green (#22c55e) — completed, safe            │
│  INACTIVE    │  Slate (#64748b) — offline, unavailable       │
└──────────────┴──────────────────────────────────────────────┘
```

### 3.2 Typography Scale

```
ROLE              FONT              SIZE        WEIGHT    USE
─────────────────────────────────────────────────────────────
Countdown Big     Geist Mono        3rem/48px   800       Tambangan detail hero
Countdown Small   Geist Mono        1.5rem/24px 700       KapalCard inline
Status Label      Geist Sans        0.875rem    600       StatusBadge text
Ship Name         Geist Sans        1rem        700       KapalCard title
Section Header    Geist Sans        0.75rem     700       "STANDBY DI PELABUHAN"
Point Name        Geist Mono        0.75rem     500       Titik A / Titik B labels
Body              Geist Sans        0.875rem    400       Descriptions
Caption           Geist Mono        0.75rem     400       Timestamps, metadata
```

### 3.3 Spacing Density

```
MOBILE (default):     Compact — 3-4px gaps, 12-16px padding
TABLET (md):          Normal — 4-6px gaps, 16-24px padding
DESKTOP (lg):         Comfortable — 6-8px gaps, 24-32px padding

Card internal:        12-16px padding
Section gaps:         12px vertical
Page margins:         16px mobile, 24px tablet, 32px desktop
```

### 3.4 Animation Tokens

```
TRANSITION              DURATION    EASING              USE
─────────────────────────────────────────────────────────────
Status change           300ms       ease-out            Color/position shifts
Card enter              400ms       ease-out            Page load stagger
Countdown pulse         1000ms      ease-in-out         When < 60 seconds
Crossing dot            800ms       ease-in-out         ChannelBar animate-pulse
Page transition         300ms       ease-out            Route changes
Hover lift              200ms       ease-out            Card hover
Button press            100ms       ease-in             Active state
```

### 3.5 Elevation System

```
LEVEL     TOKEN                    USE
─────────────────────────────────────────────
0         none                     Background surfaces
1         shadow-sm                Cards at rest
2         shadow-md                Cards with active timer
3         shadow-lg + glow         Countdown hero, focused elements
4         shadow-xl                Modals, overlays
```

---

## 4. Page Designs

### 4.1 HOME PAGE — Passenger View

**User goal**: "Which ship is available RIGHT NOW?"
**Design philosophy**: Show tambangan cards with LIVE status badges — not a ship list.

```
┌─────────────────────────────────────────────┐
│ ◀ ▶  ○ ○ ○  (PWA status bar area)          │
├─────────────────────────────────────────────┤
│                                             │
│  ╔═════════════════════════════════════╗    │
│  ║  🏠  TAMBANGAN          [🌙] [👤]  ║    │
│  ╚═════════════════════════════════════╝    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ⚡ BERANGKAT TERCEPAT              │    │
│  │                                     │    │
│  │     ┌─────────────────────┐        │    │
│  │     │    ╔═══════════╗    │        │    │
│  │     │    ║  3:42     ║    │        │    │
│  │     │    ║  MENIT    ║    │        │    │
│  │     │    ╚═══════════╝    │        │    │
│  │     │                     │        │    │
│  │     │  Kapal "Sinar Laut" │        │    │
│  │     │  Standby Pelabuhan  │        │    │
│  └─────│─────────────────────│────────┘    │
│        └─────────────────────┘              │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🗺️  PELABUHAN MUARA → TANJUNG    │    │
│  │                                     │    │
│  │  ┌──────┐  ◀══⛵══▶  ┌──────┐     │    │
│  │  │ 2    │   1 menyeberang│ 3    │     │    │
│  │  │standby│              │standby│     │    │
│  │  └──────┘              └──────┘     │    │
│  │                                     │    │
│  │  Total: 6 kapal  ·  Update: 3 dtk  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🗺️  PELABUHAN BARU → NUSA INDAH  │    │
│  │                                     │    │
│  │  ┌──────┐  ◀  ⛵  ▶   ┌──────┐     │    │
│  │  │ 0    │   0 menyeberang│ 4    │     │    │
│  │  │standby│              │standby│     │    │
│  │  └──────┘              └──────┘     │    │
│  │                                     │    │
│  │  Total: 4 kapal  ·  Update: 1 dtk  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  📋  Lihat Semua Kapal →           │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  🏠     🗺️     🚢     👤                   │
│  Beranda  Rute  Kapal  Akun                 │
└─────────────────────────────────────────────┘
```

**Key changes from current**:
1. **"Fastest Departure" hero** is PROMINENT — full-width amber card with giant countdown
2. **Tambangan cards** show a MINI CROSSING DIAGRAM — the ChannelBar concept, but at card level, showing count of ships at each point
3. **No individual ship cards on home** — that's clutter. Home = tambangan overview
4. **Bottom navigation** replaces the full sidebar for passengers — simpler, faster
5. **Update timestamp** per tambangan shows data freshness

**Component: `TambanganOverviewCard`**

```
Props:
  - tambangan: TambanganDto
  - counts: { titik_a: number, proses: number, titik_b: number }
  - fastestShip: KapalLiveDto | null
  - lastUpdated: string

Visual structure:
  ┌──────────────────────────────────┐
  │  Route Name                      │  ← bold, 1rem
  │  Point A  ←══⛵══→  Point B     │  ← ChannelBar + ship icons
  │  [2] standby    [3] standby      │  ← count badges
  │  [1 menyeberang]                 │  ← crossing count (amber)
  │  Total: 6  ·  Update: 3 dtk     │  ← caption
  └──────────────────────────────────┘
```

**Component: `FastestDepartureHero`**

```
Props:
  - ship: KapalLiveDto
  - tambangan: TambanganDto

Visual structure:
  ┌──────────────────────────────────────┐
  │  ⚡ BERANGKAT TERCEPAT               │
  │                                      │
  │  ╔══════════════════════╗            │
  │  ║     3 : 42           ║  ← 3rem   │
  │  ║   MENIT LAGI         ║            │
  │  ╚══════════════════════╝            │
  │                                      │
  │  Kapal "Sinar Laut"                  │
  │  Standby Pelabuhan Muara             │
  └──────────────────────────────────────┘
  
  Background: amber gradient at 5%
  Border: amber/20
  Glow: shadow-glow-amber
```

---

### 4.2 TAMBAANGAN DETAIL PAGE — The Core Page

**User goal**: "What's the status of every ship on this route RIGHT NOW?"
**Design philosophy**: Two columns — Point A and Point B — with a crossing zone between them.

```
┌─────────────────────────────────────────────┐
│  ◀  Pelabuhan Muara ↔ Tanjung              │
├─────────────────────────────────────────────┤
│                                             │
│  ╔═════════════════════════════════════╗    │
│  ║  PELABUHAN MUARA    ◀══⛵══▶       ║    │
│  ║                     TANJUNG        ║    │
│  ╚═════════════════════════════════════╝    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ⏱️  BERANGKAT TERCEPAT             │    │
│  │                                     │    │
│  │  ╔═════════════════╗                │    │
│  │  ║   2 : 15         ║               │    │
│  │  ║  MENIT LAGI      ║               │    │
│  │  ╚═════════════════╝                │    │
│  │                                     │    │
│  │  "Sinar Laut" · Standby Pelabuhan  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── STANDBY PELABUHAN ──────────────┐    │
│  │                                     │    │
│  │  ┌──────────┐  ┌──────────┐        │    │
│  │  │ ⚓ Nusa  │  │ ⚓ Bahari │       │    │
│  │  │ ═══●     │  │ ═══●     │       │    │
│  │  │ 5:30     │  │ 8:45     │       │    │
│  │  └──────────┘  └──────────┘        │    │
│  │                                     │    │
│  │  ┌──────────┐  ┌──────────┐        │    │
│  │  │ ⚓ Mawar │  │ ⚓ Jaya  │        │    │
│  │  │ ═══●     │  │ ═══●     │       │    │
│  │  │ --:--    │  │ 12:00    │       │    │
│  │  └──────────┘  └──────────┘        │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── SEDANG MENYEBERANG ─────────────┐    │
│  │                                     │    │
│  │  ┌──────────┐                       │    │
│  │  │ 🚢 Samudra│                      │    │
│  │  │ ●═════▶  │  ← animated bar      │    │
│  │  │ 1:20     │  ← countdown         │    │
│  │  │ → Tanjung│  ← destination       │    │
│  │  └──────────┘                       │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── STANDBY TANJUNG ────────────────┐    │
│  │                                     │    │
│  │  ┌──────────┐  ┌──────────┐        │    │
│  │  │ ⚓ Dewi  │  │ ⚓ Mutiara│       │    │
│  │  │ ●═══     │  │ ●═══     │       │    │
│  │  │ 3:10     │  │ 6:20     │       │    │
│  │  └──────────┘  └──────────┘        │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── RIWAYAT ────────────────────────┐     │
│  │  ▼ Riwayat Terakhir                │     │
│  │  · Sinar Laut · Ubah status        │     │
│  │    Titik A → Proses · 3 mnt lalu   │     │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**Key changes from current**:
1. **Summary banner** at top shows route + total ship counts — instant orientation
2. **Fastest departure hero** with GIANT countdown — the most important info
3. **Three distinct sections** with clear visual separators:
   - STANDBY PELABUHAN (teal section header)
   - SEDANG MENYEBERANG (amber section header)
   - STANDBY TANJUNG (teal section header)
4. **Ship cards in grid** — 2 columns on mobile, 3 on tablet
5. **Crossing ships get dedicated cards** — larger, with animated progress bar
6. **Countdown on EVERY ship card** — not just the fastest

**Component: `TambanganSummaryBanner`**

```
Props:
  - tambangan: TambanganDto
  - counts: { titik_a: number, proses: number, titik_b: number }

Visual:
  ╔═══════════════════════════════════════╗
  ║  POINT A NAME    ◀══⛵══▶  POINT B   ║
  ╚═══════════════════════════════════════╝
  
  Full-width, teal gradient background
  Ship count badges inline
  ChannelBar showing crossing ship position
```

**Component: `StatusSection`**

```
Props:
  - title: string (e.g., "STANDBY PELABUHAN MUARA")
  - ships: KapalLiveDto[]
  - color: "teal" | "amber"
  - tambangan: TambanganDto

Visual:
  ┌─── TITLE ────────────────────────┐  ← section header
  │                                   │
  │  ┌────┐ ┌────┐ ┌────┐            │  ← grid of KapalCards
  │  │    │ │    │ │    │            │
  │  └────┘ └────┘ └────┘            │
  │                                   │
  └───────────────────────────────────┘
```

**Component: `KapalCardMini`** (new — for grid display)

```
Props:
  - kapal: KapalLiveDto
  - tambangan: TambanganDto
  - size: "compact" | "normal"

Visual (compact):
  ┌──────────┐
  │ ⚓ Nusa   │  ← ship name, bold
  │ ═════●   │  ← ChannelBar (thin)
  │ 5:30     │  ← countdown or "berangkat" or "tidak ada timer"
  └──────────┘

Visual (normal — for crossing ships):
  ┌────────────────┐
  │ 🚢 Samudra     │
  │ ●═══════▶      │  ← ChannelBar (thick, animated)
  │ 1:20 lagi      │  ← countdown
  │ → Tanjung      │  ← destination
  └────────────────┘
```

---

### 4.3 CAPTAIN (NAHKODA) DASHBOARD

**User goal**: "Manage my ships quickly — change status, set timers, see history."
**Design philosophy**: Action-oriented. One tap to change status. One tap to set timer.

```
┌─────────────────────────────────────────────┐
│  ◀  Dashboard Nahkoda                       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  [Daftarkan Kapal +]   [Admin 🛡️]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  STATUS RINGAWAN                    │    │
│  │                                     │    │
│  │  ┌──────┐  ┌──────┐  ┌──────┐     │    │
│  │  │  2   │  │  1   │  │  3   │     │    │
│  │  │⊙Stand│  │ ⊗Play│  │⊙Stand│     │    │
│  │  │  by  │  │  ing │  │  by  │     │    │
│  │  │ ● A  │  │  ⛵  │  │ ● B  │     │    │
│  │  └──────┘  └──────┘  └──────┘     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── KAPAL SAYA ─────────────────────┐    │
│  │                                     │    │
│  │  ┌─────────────────────────────┐   │    │
│  │  │ ⚓ Sinar Laut               │   │    │
│  │  │ ═══════════════════●        │   │    │
│  │  │ Standby Pelabuhan Muara     │   │    │
│  │  │ ┌─────┬────────┬─────┐     │   │    │
│  │  │ │ ◀ A │  ⛵    │  B ▶│     │   │    │
│  │  │ └─────┴────────┴─────┘     │   │    │
│  │  └─────────────────────────────┘   │    │
│  │                                     │    │
│  │  ┌─────────────────────────────┐   │    │
│  │  │ ⚓ Nusa Indah              │   │    │
│  │  │ ●══════════════════▶        │   │    │
│  │  │ Sedang menyeberang          │   │    │
│  │  │ ┌─────┬────────┬─────┐     │   │    │
│  │  │ │ ◀ A │  ⛵    │  B ▶│     │   │    │
│  │  │ └─────┴────────┴─────┘     │   │    │
│  │  └─────────────────────────────┘   │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── AKTIVITAS ──────────────────────┐    │
│  │  · Sinar Laut · Standby Pelabuhan  │    │
│  │    3 mnt lalu                       │    │
│  │  · Nusa Indah · Timer diatur       │    │
│  │    10 mnt lalu                      │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  🏠     🗺️     🚢     👤                   │
└─────────────────────────────────────────────┘
```

**Key changes from current**:
1. **Status overview ring** — 3 circles showing count at each status (standby A, crossing, standby B)
2. **Ship cards with inline status controls** — 3-column button grid ON the card, not on a separate page
3. **Current status highlighted** — active button is colored, others are muted
4. **Timer set inline** — tap the clock icon, input appears on the card
5. **Swipe gestures** — swipe left/right on a ship card to change status (mobile)

**Component: `CaptainShipCard`**

```
Props:
  - ship: KapalMineDto
  - onStatusChange: (status: KapalStatus) => void
  - onTimerSet: (minutes: number) => void

Visual:
  ┌─────────────────────────────────────┐
  │  ⚓ Sinar Laut           [✏️] [🗑️] │
  │  ═══════════════════════●          │  ← ChannelBar
  │  Standby Pelabuhan Muara           │
  │                                     │
  │  ┌────────┬──────────┬────────┐    │  ← Status buttons
  │  │ ◀ A    │   ⛵     │  B ▶  │    │
  │  │(active)│          │        │    │
  │  └────────┴──────────┴────────┘    │
  │                                     │
  │  🕐 Set timer: [5] [10] [15] menit│  ← Quick timer presets
  │     atau input manual: [___] mnt   │
  └─────────────────────────────────────┘
```

**Component: `StatusOverviewRing`**

```
Props:
  - counts: { titik_a: number, proses: number, titik_b: number }
  - titikA: Titik
  - titikB: Titik

Visual:
  ┌──────┐  ┌──────┐  ┌──────┐
  │  2   │  │  1   │  │  3   │
  │⊙Stand│  │ ⊗Play│  │⊙Stand│
  │  by  │  │  ing │  │  by  │
  │ ● A  │  │  ⛵  │  │ ● B  │
  └──────┘  └──────┘  └──────┘
  
  Each circle is 80px diameter
  Active status (crossing) pulses amber
  Standby statuses are teal
```

---

### 4.4 ADMIN PANEL

**User goal**: "Overview of all activity. Quick management."
**Design philosophy**: Dense but scannable. Stats first, actions second.

```
┌─────────────────────────────────────────────┐
│  ◀  Admin Panel                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─── OVERVIEW ────────────────────────┐    │
│  │                                     │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ │    │
│  │  │  12    │ │  4     │ │  8     │ │    │
│  │  │ Users  │ │ Routes │ │ Ships  │ │    │
│  │  └────────┘ └────────┘ └────────┘ │    │
│  │                                     │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ │    │
│  │  │  3     │ │  5     │ │  4     │ │    │
│  │  │Admins  │ │ Captains│ │Guests  │ │    │
│  │  └────────┘ └────────┘ └────────┘ │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── LIVE ACTIVITY ──────────────────┐    │
│  │                                     │    │
│  │  ⚡ 3 ships crossing NOW            │    │
│  │  📊 12 status changes today        │    │
│  │  ⏱️  5 timers active                │    │
│  │  🔄 Last sync: 2 seconds ago       │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── TABS ───────────────────────────┐    │
│  │ [Users] [Routes] [Ships]            │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─── USERS ──────────────────────────┐    │
│  │  ┌─────────────────────────────┐   │    │
│  │  │ 👤 Admin Muara   · admin    │   │    │
│  │  │ 👤 Pak Budi      · nahkoda  │   │    │
│  │  │ 👤 Bu Sari       · nahkoda  │   │    │
│  │  │ 👤 Guest 001     · guest    │   │    │
│  │  └─────────────────────────────┘   │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 4.5 MOBILE-SPECIFIC DESIGN

#### Gesture Patterns

```
GESTURE              ACTION                    FEEDBACK
──────────────────────────────────────────────────────────
Swipe right          Captain: Set status       Haptic light
                     to next point
Swipe left           Captain: Set status       Haptic light
                     to previous point
Pull down            Refresh data              Haptic medium
Long press ship      Quick status menu         Haptic heavy
Tap countdown        Expand to full timer      Visual expand
Swipe ship card      Dismiss/delete            Haptic heavy
```

#### Haptic Feedback Map

```
EVENT                          PATTERN          INTENSITY
──────────────────────────────────────────────────────────
Status change                  success          light
Timer set                      success          light
Timer expired                  warning          medium
Ship arrives                   success          heavy
Connection restored            success          light
Error occurred                 error            heavy
Pull to refresh                selection        light
```

#### Offline-First Considerations

```
STATE              BEHAVIOR
─────────────────────────────────────────────────────
Online             Real-time polling (4s)
Slow (3G+)         Polling interval doubles to 8s
Offline            Show cached data + "offline" banner
                   Queue status changes for sync
Reconnect          Sync queued changes, resume polling
                   Show toast: "X perubahan tersinkron"
```

#### PWA Home Screen Behavior

```
EVENT                    BEHAVIOR
─────────────────────────────────────────────────────
App installed            Show welcome toast
                         "Tambangan siap digunakan!"
First open               Show onboarding tooltip
                         "Geser untuk ganti status"
Background → Foreground  Refresh data immediately
                         Show badge if timer expired
Badge count             Number of active timers
                         expiring in < 5 minutes
```

---

## 5. Component Hierarchy & Purpose

```
APP
├── AppShell
│   ├── Sidebar (desktop only)
│   ├── MobileHeader (mobile only)
│   ├── BottomNav (mobile, post-auth)
│   └── Main Content Area
│
├── HOME PAGE (Passenger)
│   ├── FastestDepartureHero        ← Giant countdown
│   ├── TambanganOverviewCard[]     ← Route cards with status
│   └── Link to /kapal              ← "Lihat semua"
│
├── TAMBAANGAN DETAIL PAGE
│   ├── TambanganSummaryBanner      ← Route overview
│   ├── FastestDepartureHero        ← Countdown hero
│   ├── StatusSection (Standby A)   ← Ship grid
│   │   └── KapalCardMini[]
│   ├── StatusSection (Crossing)    ← Ship grid
│   │   └── KapalCardMini[] (crossing variant)
│   ├── StatusSection (Standby B)   ← Ship grid
│   │   └── KapalCardMini[]
│   └── EventsTimeline              ← History
│
├── CAPTAIN DASHBOARD
│   ├── StatusOverviewRing          ← 3-circle stats
│   ├── CaptainShipCard[]           ← Ship + controls
│   │   ├── ChannelBar
│   │   ├── StatusToggleButtons
│   │   └── QuickTimerPresets
│   └── EventsTimeline              ← Recent activity
│
├── ADMIN PANEL
│   ├── StatsOverview               ← Grid of numbers
│   ├── LiveActivityFeed            ← Real-time changes
│   ├── TabContent
│   │   ├── UsersTab
│   │   ├── TambanganTab
│   │   └── KapalTab
│   └── EventsTimeline
│
└── SHARED COMPONENTS
    ├── KapalCardMini               ← Compact ship card
    ├── KapalCardCrossing           ← Crossing ship card
    ├── ChannelBar                  ← Progress meter
    ├── StatusBadge                 ← Status label
    ├── Ticker                      ← Countdown display
    ├── FastestDepartureHero        ← Countdown hero
    ├── TambanganOverviewCard       ← Route overview
    ├── StatusSection               ← Section container
    ├── StatusOverviewRing          ← 3-circle stats
    ├── CaptainShipCard             ← Ship + controls
    ├── EventsTimeline              ← History log
    ├── SkeletonCard                ← Loading state
    ├── EmptyState                  ← No data state
    ├── ErrorNote                   ← Error display
    ├── ShareButton                 ← Share/copy
    ├── PwaInstallPrompt            ← Install banner
    └── ThemeToggle                 ← Light/dark
```

---

## 6. Interaction Patterns

### 6.1 Countdown Timer — The Star

```
WHEN timer > 5 min:
  → Show in card as `font-mono text-sm font-bold text-accent`
  → No animation

WHEN timer 1-5 min:
  → Show in card as `font-mono text-base font-extrabold text-accent`
  → Subtle pulse every 5 seconds

WHEN timer < 1 min:
  → Show in card as `font-mono text-lg font-extrabold text-accent`
  → Continuous pulse animation
  → Haptic notification if app is foreground
  → Badge update on PWA icon

WHEN timer expires:
  → Badge changes to `badge-error "Waktu habis"`
  → Card border changes to error color
  → If crossing: "Tiba" animation (green flash)
  → If standby: "Berangkat" animation (amber flash)
```

### 6.2 Status Change Flow (Captain)

```
1. Captain taps status button on ship card
   → Button shows loading spinner
   → Card border pulses briefly

2. API call completes (usually < 200ms)
   → Success: card updates with new status
   → Haptic: light success pattern
   → ChannelBar animates to new position (700ms)
   → StatusBadge updates with new label

3. If error:
   → Card shows error state (red border)
   → Toast notification with retry option
   → Haptic: error pattern
```

### 6.3 Timer Setting Flow (Captain)

```
1. Captain taps clock icon on ship card
   → Quick preset buttons appear: [5] [10] [15] [30] menit
   → Manual input field appears

2. Captain taps a preset OR types custom minutes
   → Timer starts immediately
   → Card shows countdown
   → ChannelBar updates if crossing

3. Timer countdown runs client-side
   → Updates every second
   → No API calls needed

4. Timer expires:
   → Badge changes to "Waktu habis"
   → Captain notified via haptic
   → Ship status NOT auto-changed (captain must act)
```

### 6.4 Pull-to-Refresh

```
1. User pulls down on any scrollable page
   → Skeleton cards appear briefly
   → Refresh indicator shows

2. Data loads
   → Cards animate in with stagger
   → "Updated X seconds ago" label appears
   → Smooth scroll back to position
```

### 6.5 Navigation Patterns

```
MOBILE:
  → BottomNav for main sections (Home, Routes, Ships, Account)
  → Back button in MobileHeader for sub-pages
  → Swipe back gesture (iOS) / back button (Android)

DESKTOP:
  → Sidebar for main sections
  → Breadcrumb trail for sub-pages
  → Keyboard shortcuts: 1-4 for nav items
```

---

## 7. Specific Recommendations for Tambangan

### 7.1 IMMEDIATE WINS (Do First)

1. **Replace home page ship list with tambangan overview cards**
   - Current: Shows 5 individual ships across all routes
   - New: Shows route cards with ship counts per status
   - Impact: Passenger finds their route in 1 tap instead of scrolling

2. **Make countdown timer 3x larger on tambangan detail page**
   - Current: `text-xs font-semibold` (12px, semi-bold)
   - New: `text-3xl font-extrabold` (30px, extra-bold) in dedicated hero
   - Impact: Timer is instantly visible

3. **Add "Fastest Departure" hero to tambangan detail page**
   - Current: Small "Paling cepat berangkat" text card
   - New: Full-width amber card with giant countdown
   - Impact: Most urgent info is most prominent

4. **Add ship count badges to tambangan overview cards**
   - Current: Just route name + point names
   - New: Shows "2 ⊙A | 1 ⛵ | 3 ⊙B" inline
   - Impact: At-a-glance status without clicking

### 7.2 HIGH-VALUE FEATURES

5. **Captain: Inline status controls on ship cards**
   - Current: Click card → separate page → change status
   - New: 3-button grid directly on card
   - Impact: 1-tap status change instead of 3 taps

6. **Captain: Quick timer presets**
   - Current: Manual input only
   - New: [5] [10] [15] [30] minute preset buttons
   - Impact: Timer set in 1 tap instead of typing

7. **Status change animations**
   - Current: Instant update, no visual feedback
   - New: ChannelBar animates, card border pulses, haptic feedback
   - Impact: Status change feels alive and confirmed

8. **Offline indicator**
   - Current: No offline handling
   - New: Banner when offline, cached data display
   - Impact: App works on slow/intermittent connections

### 7.3 POLISH FEATURES

9. **PWA badge for active timers**
   - Show number of ships with timers expiring in < 5 min
   - Impact: User sees urgency without opening app

10. **Dark mode optimization**
    - Increase glow effects in dark mode
    - Use deeper shadows for depth
    - Impact: Dark mode feels more atmospheric

11. **Loading state improvements**
    - Current: Skeleton cards (just gray rectangles)
    - New: Skeleton cards with realistic layout (name bar, progress bar, time)
    - Impact: Loading feels faster and more professional

12. **Empty state improvements**
    - Current: "Belum ada kapal" text
    - New: Illustrated empty state with action suggestion
    - Impact: Reduces confusion when no data

---

## 8. Implementation Priority

### Phase 1: Core UX Fix (1-2 days)
- [ ] New `TambanganOverviewCard` component for home page
- [ ] New `FastestDepartureHero` component
- [ ] Update home page to show tambangan cards instead of ship list
- [ ] Increase countdown timer size on tambangan detail page
- [ ] Add ship count badges to tambangan cards

### Phase 2: Captain Experience (2-3 days)
- [ ] New `CaptainShipCard` with inline controls
- [ ] New `StatusOverviewRing` component
- [ ] Inline status change buttons on captain cards
- [ ] Quick timer presets
- [ ] Status change animations (ChannelBar animation)
- [ ] Haptic feedback on status change

### Phase 3: Visual Polish (1-2 days)
- [ ] New `KapalCardMini` component for grid display
- [ ] New `KapalCardCrossing` component for crossing ships
- [ ] New `StatusSection` component with visual headers
- [ ] Improve skeleton loading states
- [ ] Improve empty states
- [ ] Status change animations (card border pulse, color flash)

### Phase 4: Mobile & PWA (1-2 days)
- [ ] Offline indicator banner
- [ ] Pull-to-refresh improvements
- [ ] Swipe gestures for captain status changes
- [ ] PWA badge for active timers
- [ ] Welcome/onboarding tooltip

### Phase 5: Admin & Polish (1 day)
- [ ] Admin panel stat cards
- [ ] Live activity feed
- [ ] Dark mode glow optimizations
- [ ] Keyboard shortcuts for desktop

---

## 9. Data Model Considerations

The existing `KapalStatus` type is clean:
```typescript
type KapalStatus = "titik_a" | "proses" | "titik_b";
```

No data model changes needed. All UX improvements are presentation-layer only.

**New computed values needed**:
```typescript
// For TambanganOverviewCard
interface TambanganStatusCounts {
  titik_a: number;
  proses: number;
  titik_b: number;
  total: number;
}

// For FastestDepartureHero
interface FastestDeparture {
  ship: KapalLiveDto;
  tambangan: TambanganDto;
  minutesLeft: number;
}
```

**New API endpoints** (optional, for efficiency):
```
GET /api/tambangan/:slug/status-counts
→ { titik_a: 2, proses: 1, titik_b: 3, total: 6 }

GET /api/tambangan/:slug/fastest
→ { ship: KapalLiveDto, minutesLeft: 3 }
```

Or compute these client-side from existing data (current approach, works fine).

---

## 10. Accessibility

### Color Contrast
- All status colors meet WCAG AA (4.5:1) on both light and dark backgrounds
- Countdown text is `text-accent` on `bg-base-100` — high contrast
- Status badges use solid backgrounds with white text

### Screen Reader
- ChannelBar already has `role="meter"` with `aria-label` — keep this
- Add `aria-live="polite"` on countdown displays
- Add `aria-label` on all interactive buttons
- Section headers use semantic heading levels (h2 for sections, h3 for subsections)

### Keyboard Navigation
- All interactive elements are focusable
- Tab order follows visual order
- Status buttons can be activated with Enter/Space
- Escape closes modals and inline editors

### Reduced Motion
- All animations respect `prefers-reduced-motion: reduce`
- Countdown pulse disabled when reduced motion preferred
- ChannelBar position changes are instant (no transition)

---

## 11. Dark Mode Considerations

```
ELEMENT              LIGHT MODE              DARK MODE
──────────────────────────────────────────────────────────
Background           base-100 (warm white)   base-100 (dark slate)
Cards                base-100 with shadow     base-200 with deeper shadow
Glow effects         subtle (15% opacity)     prominent (25% opacity)
Countdown text       accent (amber)           accent-light (brighter amber)
Status badges        Solid backgrounds        Slightly desaturated
ChannelBar track     base-300                 base-300 (slightly lighter)
Borders              base-300                 base-300 (slightly lighter)
Text                 base-content             base-content (slightly brighter)
```

---

## 12. Performance Considerations

### Current: Polling every 4 seconds
- This is fine for the scale (dozens of ships, not thousands)
- Consider WebSocket for future scale (100+ concurrent users)

### Component Optimization
- `KapalCardMini` should be memoized (`React.memo`)
- Countdown hook (`useCountdown`) is already efficient (single interval)
- ChannelBar position changes are CSS-only (no re-render)
- Consider virtual scrolling for kapal list page (100+ ships)

### Bundle Size
- Current: Lucide icons are tree-shaken (good)
- New components should import only needed Lucide icons
- Consider icon sprites for frequently used icons (Anchor, Navigation, Clock)

---

*End of UX Specification*
*Last updated: 2026-09-09*
*Status: Ready for implementation*
