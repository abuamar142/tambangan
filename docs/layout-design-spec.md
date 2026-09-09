# Tambangan — Full-Screen Responsive Layout System

> Design spec for a comprehensive layout overhaul. Replaces the current
> `Screen` + `ScreenHeader` pattern with a proper app shell that adapts
> from mobile-first bottom navigation to desktop sidebar navigation.

---

## 1. Current State Analysis

### What Exists

| Component | Purpose | Problem |
|-----------|---------|---------|
| `Screen` | Page wrapper with `max-w-md` / `max-w-6xl` | Too narrow on desktop (md default = 448px) |
| `ScreenHeader` | Sticky top bar with back/title/theme | No navigation — just back button |
| `ScreenContent` | Flex content area with padding | Works fine, keep as-is |
| Home page | Standalone, no Screen wrapper | Hero wastes horizontal space on desktop |
| Login/Register | Standalone centered card | Fine on mobile, wasted space on desktop |
| Admin | `Screen size="wide"` with tab bar | Tab bar + no sidebar = awkward at 1280px+ |

### Core Issues

1. **No persistent navigation** — users rely on back buttons and mental mapping
2. **Content always centered** — max-w-md means 448px usable on a 1440px screen
3. **No desktop-optimized layout** — sidebar navigation, multi-column content grids
4. **Admin panel orphaned** — tabs switch but layout doesn't adapt

---

## 2. Design System Foundation

### 2.1 Breakpoints

```
Mobile:    < 768px    → Bottom tab bar, stacked layouts
Tablet:    768-1024px → Collapsible sidebar or bottom nav
Desktop:   1024-1280px → Persistent sidebar, 2-column content
Wide:      > 1280px   → Extended sidebar, 3-column content possible
```

### 2.2 Layout Tokens (CSS Custom Properties)

Add to `globals.css`:

```css
@theme inline {
  /* ── Layout Tokens ── */
  --layout-sidebar-width: 280px;
  --layout-sidebar-collapsed: 72px;
  --layout-header-height: 56px;
  --layout-bottom-nav-height: 64px;
  --layout-content-max: 1400px;
  --layout-content-padding: 1.5rem; /* 24px */
  --layout-content-padding-sm: 1rem; /* 16px — mobile */
}
```

### 2.3 Typography Scale

```
heading-1:  text-3xl font-extrabold tracking-tight (30px/36px)  — Page titles
heading-2:  text-xl  font-bold    tracking-tight (20px/28px)  — Section headers
heading-3:  text-sm  font-bold    uppercase tracking-widest   — Labels/categories
body:       text-base leading-relaxed                           — Default body
body-sm:    text-sm  leading-snug                              — Secondary text
mono:       font-mono text-xs                                  — Timestamps, counts
```

### 2.4 Elevation System

```
Level 0:  bg-base-100                     — Page background
Level 1:  bg-base-100 border-base-300     — Cards, panels (default state)
Level 2:  shadow-sm border-base-300       — Elevated cards (hover)
Level 3:  shadow-md                       — Floating elements (dropdowns, modals)
Level 4:  shadow-xl                       — Overlays
```

### 2.5 Animation Patterns

```css
/* Page transitions */
.animate-page-in {
  animation: pageIn 0.3s ease-out;
}

@keyframes pageIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Staggered card reveal */
.animate-card-in {
  animation: cardIn 0.4s ease-out backwards;
}
.animate-card-in:nth-child(1) { animation-delay: 0ms; }
.animate-card-in:nth-child(2) { animation-delay: 50ms; }
.animate-card-in:nth-child(3) { animation-delay: 100ms; }
.animate-card-in:nth-child(4) { animation-delay: 150ms; }
.animate-card-in:nth-child(5) { animation-delay: 200ms; }
.animate-card-in:nth-child(6) { animation-delay: 250ms; }

@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Sidebar slide */
.animate-sidebar-in {
  animation: sidebarIn 0.2s ease-out;
}

@keyframes sidebarIn {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
```

---

## 3. App Shell Architecture

### 3.1 Component Hierarchy

```
<RootLayout>                          ← src/app/layout.tsx (exists)
  <ThemeProvider>                     ← exists
    <AppShell>                        ← NEW: orchestrates layout
      ├── <Sidebar>                   ← NEW: desktop nav (md+)
      ├── <MobileHeader>              ← NEW: mobile top bar (md-)
      ├── <main>                      ← content slot
      │   └── {children}
      └── <BottomNav>                 ← NEW: mobile bottom tabs (md-)
```

### 3.2 ASCII Layout Diagrams

#### Mobile (< 768px)

```
┌─────────────────────────┐
│ ☰  TambanganTrack    🌙 │  ← MobileHeader (h-14, sticky)
├─────────────────────────┤
│                         │
│   ┌─────────────────┐   │
│   │   Page Content   │   │  ← Full width, p-4
│   │                  │   │
│   │   (stacked)      │   │
│   │                  │   │
│   └─────────────────┘   │
│                         │
├─────────────────────────┤
│ 🏠  🚢  ⚓  👤          │  ← BottomNav (h-16, fixed bottom)
└─────────────────────────┘
```

#### Tablet (768px – 1024px)

```
┌──────────────────────────────────┐
│ 🏠  TambanganTrack          🌙  │  ← MobileHeader (h-14, sticky)
├──────────────────────────────────┤
│                                  │
│   ┌──────────────────────┐       │
│   │    Page Content       │       │  ← max-w-3xl, centered
│   │                       │       │
│   │    (2-col grid)       │       │
│   │                       │       │
│   └──────────────────────┘       │
│                                  │
├──────────────────────────────────┤
│ 🏠  🚢  ⚓  👤                   │  ← BottomNav (h-16, fixed bottom)
└──────────────────────────────────┘
```

#### Desktop (1024px – 1280px)

```
┌────────┬────────────────────────────────┐
│        │ 🌙  TambanganTrack        👤  │  ← TopBar (h-14, sticky)
│  LOGO  ├────────────────────────────────┤
│        │                                │
│  🏠    │   ┌──────────────────────┐     │
│  Home  │   │    Page Content       │     │  ← max-w-5xl, padded
│        │   │                       │     │
│  🚢    │   │    (2-col grid)       │     │
│  Tamb. │   │                       │     │
│        │   └──────────────────────┘     │
│  ⚓    │                                │
│  Nahk. │                                │
│        │                                │
│  👤    │                                │
│  Admin │                                │
│        │                                │
│ ─────  │                                │
│  🌙    │                                │
└────────┴────────────────────────────────┘
 ← 280px →← ─────── flex-1 ──────────── →
```

#### Wide (> 1280px)

```
┌────────┬──────────────────────────────────────────┐
│        │ 🌙  TambanganTrack                 👤  │
│  LOGO  ├──────────────────────────────────────────┤
│        │                                          │
│  🏠    │   ┌────────────────┐ ┌────────────────┐  │
│  Home  │   │  Primary        │ │  Secondary      │  │
│        │   │  Content        │ │  Panel          │  │
│  🚢    │   │  (main)         │ │  (sidebar)      │  │
│  Tamb. │   │                 │ │                 │  │
│        │   └────────────────┘ └────────────────┘  │
│  ⚓    │                                          │
│  Nahk. │                                          │
│        │                                          │
│  👤    │                                          │
│  Admin │                                          │
│        │                                          │
│ ─────  │                                          │
│  🌙    │                                          │
└────────┴──────────────────────────────────────────┘
 ← 280px →← ──────── flex-1 ───────────────────── →
             max-w-[1400px] centered
```

---

## 4. Navigation Structure

### 4.1 Primary Navigation Items

```typescript
const NAV_ITEMS = [
  { href: "/",          label: "Beranda",     icon: Home,         show: "always" },
  { href: "/tambangan", label: "Tambangan",   icon: MapPin,       show: "always" },
  { href: "/nahkoda",   label: "Nahkoda",     icon: Anchor,       show: "auth" },
  { href: "/admin",     label: "Admin",       icon: Shield,       show: "admin" },
];
```

### 4.2 Desktop Sidebar Structure

```
┌──────────────────┐
│  ⚓ TambanganTrack │  ← Brand header (always visible)
│──────────────────│
│                  │
│  🏠 Beranda      │  ← Nav items (icon + label)
│  🚢 Tambangan    │
│  ⚓ Nahkoda      │     Active state: bg-primary/10, text-primary
│  🛡️ Admin       │     Hover: bg-base-200
│                  │
│──────────────────│
│                  │
│  Context actions │  ← Secondary actions (back, refresh, etc.)
│  (varies)        │
│                  │
│──────────────────│
│  🌙 Theme        │  ← Footer utilities
│  👤 Username     │
│  🚪 Keluar       │
└──────────────────┘
```

### 4.3 Mobile Bottom Navigation

```
┌────────┬────────┬────────┬────────┐
│  🏠   │  🚢   │  ⚓   │  👤   │
│ Beranda│Tambang.│Nahkoda│ Admin  │
└────────┴────────┴────────┴────────┘

- h-16, fixed bottom, safe-area-inset-bottom
- Active: text-primary, subtle bg-primary/10 indicator
- Inactive: text-base-content/50
- Icons only on mobile, no labels (save space)
- Label appears as tooltip on long-press (optional)
```

### 4.4 Mobile Header

```
┌─────────────────────────────────────┐
│ ☰  TambanganTrack              🌙   │
└─────────────────────────────────────┘

- h-14, sticky top-0, z-20
- Hamburger only on pages with sub-navigation (optional)
- Title: current section name
- Theme toggle always visible
```

---

## 5. Page-Specific Layouts

### 5.1 Public Pages (Home, Login, Register)

**Strategy:** Full-width hero on desktop, no sidebar shell.

#### Home Page — Desktop

```
┌──────────────────────────────────────────────┐
│                                              │
│          ⚓ TambanganTrack                    │
│                                              │
│     Tau perahu mana yang siap,              │
│     sebelum lari ke dermaga.                 │
│                                              │
│  ┌──────────────────┐ ┌──────────────────┐   │
│  │ Cek Status Perahu │ │ Saya Nahkoda     │   │
│  │                   │ │                   │   │
│  └──────────────────┘ └──────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  Kapal Terbaru                       │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐   │    │
│  │  │ Kapal 1│ │ Kapal 2│ │ Kapal 3│   │    │
│  │  └────────┘ └────────┘ └────────┘   │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

**Key changes:**
- Remove `max-w-md` constraint — use `max-w-6xl` on desktop
- Hero takes full width with centered text
- Quick links in 2-column grid (already done, just remove width cap)
- Kapal section uses 3-column grid on desktop
- Footer stays centered

#### Login / Register — Desktop

```
┌──────────────────────────────────────┐
│                                      │
│    ┌──────────────────────────┐      │
│    │  ⚓                      🌙│     │
│    │                          │      │
│    │  Masuk Nahkoda           │      │
│    │                          │      │
│    │  [Username]              │      │
│    │  [Password]              │      │
│    │  [  Masuk  ]             │      │
│    │                          │      │
│    │  Daftar →                │      │
│    └──────────────────────────┘      │
│                                      │
│    ← Kembali ke beranda             │
└──────────────────────────────────────┘
```

**Key changes:**
- Keep centered card on mobile (max-w-md)
- On desktop: card at max-w-lg, centered vertically and horizontally
- Background: subtle radial gradient, full viewport
- No sidebar shell — standalone layout

### 5.2 Dashboard Pages (Nahkoda, Admin)

**Strategy:** App shell with sidebar + content grid.

#### Nahkoda Dashboard — Desktop

```
┌────────┬────────────────────────────────────┐
│        │ ⚓ Nahkoda Dashboard          🌙  │
│ LOGO   ├────────────────────────────────────┤
│        │                                    │
│ 🏠     │  ┌─────────────┐ ┌─────────────┐  │
│ 🚢     │  │ Daftarkan    │ │ Admin       │  │
│ ⚓ ←──  │  │ Kapal +      │ │ Panel →     │  │
│ 👤     │  └─────────────┘ └─────────────┘  │
│        │                                    │
│        │  ┌──────────────────────────────┐  │
│        │  │  Kapal Saya                  │  │
│        │  │  ┌────────┐  ┌────────┐     │  │
│        │  │  │ Kapal 1│  │ Kapal 2│     │  │
│        │  │  └────────┘  └────────┘     │  │
│        │  └──────────────────────────────┘  │
│        │                                    │
└────────┴────────────────────────────────────┘
```

**Key changes:**
- Sidebar replaces back buttons
- Content area: `max-w-5xl` with `p-6`
- Kapal cards in 2-column grid (already works)
- Action buttons stay at top
- Password change section in a collapsible panel

#### Admin Panel — Desktop

```
┌────────┬────────────────────────────────────┐
│        │ 🛡️ Panel Admin               🌙  │
│ LOGO   ├────────────────────────────────────┤
│        │                                    │
│ 🏠     │  [Users] [Kapal] [Tambangan]       │
│ 🚢     │                                    │
│ ⚓     │  ┌──────────────────────────────┐  │
│ 👤 ←──  │  │  Tab Content                 │  │
│        │  │                              │  │
│        │  │  (full width of content area) │  │
│        │  │                              │  │
│        │  └──────────────────────────────┘  │
│        │                                    │
└────────┴────────────────────────────────────┘
```

**Key changes:**
- Tab bar moves below the top bar (already works)
- Content uses full width of the content area (already `max-w-6xl`)
- Remove `Screen size="wide"` — sidebar handles width
- Tab content area: `max-w-5xl` with `p-6`

### 5.3 Detail Pages (Kapal, Tambangan)

**Strategy:** App shell with header + back button + content.

#### Tambangan Detail — Mobile

```
┌─────────────────────────┐
│ ← Pilih Tambangan    🌙 │  ← ScreenHeader with back
├─────────────────────────┤
│                         │
│  [Segarkan] [Share]     │
│                         │
│  ┌─────────────────┐    │
│  │ Paling cepat    │    │  ← Highlight card
│  │ Perahu Jaya 1   │    │
│  └─────────────────┘    │
│                         │
│  Standby di Jatikalen   │
│  ┌────────┐ ┌────────┐  │
│  │Kapal 1 │ │Kapal 2 │  │
│  └────────┘ └────────┘  │
│                         │
│  Standby di Megaluh     │
│  ┌────────┐ ┌────────┐  │
│  │Kapal 3 │ │Kapal 4 │  │
│  └────────┘ └────────┘  │
│                         │
│  Riwayat Terakhir       │
│  ┌─────────────────┐    │
│  │ Timeline        │    │
│  └─────────────────┘    │
│                         │
└─────────────────────────┘
```

#### Tambangan Detail — Desktop

```
┌────────┬────────────────────────────────────┐
│        │ ← Tambangan Name              🌙  │
│ LOGO   ├────────────────────────────────────┤
│        │                                    │
│ 🏠     │  [Segarkan] [Share]                │
│ 🚢 ←──  │                                    │
│ ⚓     │  ┌──────────────┐ ┌──────────────┐ │
│ 👤     │  │ Standby A     │ │ Standby B     │ │
│        │  │ ┌────┐┌────┐ │ │ ┌────┐┌────┐ │ │
│        │  │ │ K1 ││ K2 │ │ │ │ K3 ││ K4 │ │ │
│        │  │ └────┘└────┘ │ │ └────┘└────┘ │ │
│        │  └──────────────┘ └──────────────┘ │
│        │                                    │
│        │  ┌──────────────────────────────┐  │
│        │  │ Sedang Menyeberang           │  │
│        │  │ ┌────┐ ┌────┐ ┌────┐        │  │
│        │  │ │ K5 │ │ K6 │ │ K7 │        │  │
│        │  │ └────┘ └────┘ └────┘        │  │
│        │  └──────────────────────────────┘  │
│        │                                    │
│        │  ┌──────────────────────────────┐  │
│        │  │ Riwayat Terakhir             │  │
│        │  │ Timeline...                  │  │
│        │  └──────────────────────────────┘  │
└────────┴────────────────────────────────────┘
```

### 5.4 List Pages (Kapal List)

**Strategy:** Sidebar + filters + scrollable grid.

#### Kapal List — Desktop

```
┌────────┬────────────────────────────────────┐
│        │ ← Semua Kapal (42)            🌙  │
│ LOGO   ├────────────────────────────────────┤
│        │                                    │
│ 🏠     │  ┌─────────────────┐  ┌────────┐  │
│ 🚢 ←──  │  │ 🔍 Cari kapal…  │  │Filter▾│  │
│ ⚓     │  └─────────────────┘  └────────┘  │
│ 👤     │                                    │
│        │  ┌────────┐ ┌────────┐ ┌────────┐ │
│        │  │Kapal 1  │ │Kapal 2  │ │Kapal 3  │ │
│        │  └────────┘ └────────┘ └────────┘ │
│        │  ┌────────┐ ┌────────┐ ┌────────┐ │
│        │  │Kapal 4  │ │Kapal 5  │ │Kapal 6  │ │
│        │  └────────┘ └────────┘ └────────┘ │
│        │                                    │
│        │  ← Sebelumnya  1/5  Selanjutnya → │
└────────┴────────────────────────────────────┘
```

**Key changes:**
- Search + filter in a horizontal bar on desktop (already works)
- Grid: 1 col mobile → 2 col tablet → 3 col desktop
- Pagination stays at bottom
- Content area: `max-w-5xl`

### 5.5 Control Pages (Nahkoda Kapal Detail)

**Strategy:** App shell + complex form layout.

#### Nahkoda Kapal Control — Desktop

```
┌────────┬────────────────────────────────────┐
│        │ ← Perahu Jaya 1               🌙  │
│ LOGO   ├────────────────────────────────────┤
│        │                                    │
│ 🏠     │  ┌──────────────────────────────┐  │
│ 🚢     │  │  Perahu Jaya 1               ✏️│  │
│ ⚓ ←──  │  │  Tambangan: Jatikalen-Megaluh│  │
│ 👤     │  └──────────────────────────────┘  │
│        │                                    │
│        │  ┌──────────────────────────────┐  │
│        │  │  Status: Standby Jatikalen   │  │
│        │  │  ════════════════════════    │  │
│        │  └──────────────────────────────┘  │
│        │                                    │
│        │  ┌──────────────┐ ┌──────────────┐│
│        │  │ Mode Toggle   │ │ Timer         ││
│        │  │ [Manual][GPS] │ │ 5m  10m  15m ││
│        │  │               │ │ [Custom]      ││
│        │  │ [A][Proses][B]│ │               ││
│        │  └──────────────┘ └──────────────┘│
│        │                                    │
│        │  ┌──────────────────────────────┐  │
│        │  │ Riwayat Perjalanan           │  │
│        │  │ Timeline...                  │  │
│        │  └──────────────────────────────┘  │
└────────┴────────────────────────────────────┘
```

**Key changes:**
- On desktop, mode toggle and timer can sit side-by-side (2-col)
- Status card, action cards, and timeline stack vertically
- Content area: `max-w-3xl` (focused, single-column for forms)

---

## 6. Component Specifications

### 6.1 `AppShell` Component

```tsx
// src/components/layout/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";

// Pages that should NOT show the app shell (standalone layouts)
const STANDALONE_PATHS = ["/", "/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_PATHS.some(
    (p) => pathname === p || pathname === p + "/"
  );

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-base-100">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header (hidden on md+) */}
        <MobileHeader />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav (hidden on md+) */}
      <BottomNav />
    </div>
  );
}
```

### 6.2 `Sidebar` Component

```tsx
// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Anchor, Shield, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { api } from "@/lib/client/api";
import { useEffect, useState } from "react";
import type { UserInfo } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/",          label: "Beranda",   icon: Home },
  { href: "/tambangan", label: "Tambangan", icon: MapPin },
  { href: "/nahkoda",   label: "Nahkoda",   icon: Anchor, auth: true },
  { href: "/admin",     label: "Admin",     icon: Shield, admin: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle, mounted } = useTheme();
  const [me, setMe] = useState<UserInfo | null>(null);

  useEffect(() => {
    api<{ user: UserInfo | null }>("/api/auth/me")
      .then((r) => setMe(r.user))
      .catch(() => {});
  }, []);

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (item.admin) return me?.role === "admin";
    if (item.auth) return !!me;
    return true;
  });

  return (
    <aside className="hidden md:flex md:w-[280px] md:flex-col md:border-r md:border-base-300 md:bg-base-100">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
          <Anchor size={16} />
        </div>
        <span className="text-sm font-bold tracking-tight text-base-content">
          TambanganTrack
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href
            || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer utilities */}
      <div className="border-t border-base-300 px-3 py-3 space-y-1">
        {me && (
          <div className="px-3 py-1.5 text-xs font-medium text-base-content/50">
            {me.username}
          </div>
        )}
        {mounted && (
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/70 transition-all hover:bg-base-200"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </button>
        )}
      </div>
    </aside>
  );
}
```

### 6.3 `MobileHeader` Component

```tsx
// src/components/layout/MobileHeader.tsx
"use client";

import { Anchor } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-base-300 bg-base-100/80 px-4 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-content">
          <Anchor size={14} />
        </div>
        <span className="text-sm font-bold tracking-tight text-base-content">
          TambanganTrack
        </span>
      </div>
      <ThemeToggle />
    </header>
  );
}
```

### 6.4 `BottomNav` Component

```tsx
// src/components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Anchor, Shield } from "lucide-react";
import { api } from "@/lib/client/api";
import { useEffect, useState } from "react";
import type { UserInfo } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/",          label: "Beranda",   icon: Home },
  { href: "/tambangan", label: "Tambangan", icon: MapPin },
  { href: "/nahkoda",   label: "Nahkoda",   icon: Anchor, auth: true },
  { href: "/admin",     label: "Admin",     icon: Shield, admin: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const [me, setMe] = useState<UserInfo | null>(null);

  useEffect(() => {
    api<{ user: UserInfo | null }>("/api/auth/me")
      .then((r) => setMe(r.user))
      .catch(() => {});
  }, []);

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (item.admin) return me?.role === "admin";
    if (item.auth) return !!me;
    return true;
  });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-base-300 bg-base-100/95 backdrop-blur-md md:hidden"
         style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-center justify-around">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href
            || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors duration-150 ${
                active
                  ? "text-primary"
                  : "text-base-content/50 active:text-base-content/70"
              }`}
            >
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ${
                active ? "bg-primary/10" : ""
              }`}>
                <Icon size={20} />
                {active && (
                  <div className="absolute -bottom-0.5 h-0.5 w-4 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 6.5 Updated `ScreenHeader`

The `ScreenHeader` component stays for detail pages that need a back button, but its styling adapts:

```tsx
// Updated ScreenHeader — works within the app shell
export function ScreenHeader({
  title,
  subtitle,
  backHref,
  actions,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 border-b border-base-300 bg-base-100/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Kembali"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-primary shadow-sm transition hover:bg-primary/10 active:bg-primary/15"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold tracking-tight text-base-content">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-base-content/70">{subtitle}</p>
          )}
        </div>
        {actions}
        <ThemeToggle />
      </div>
    </div>
  );
}
```

---

## 7. Responsive Grid Patterns

### 7.1 Content Grid Classes

Use these consistent grid patterns across all pages:

```tsx
{/* Single column — forms, detail pages */}
<div className="space-y-4">

{/* Two column — card lists */}
<div className="grid gap-3 sm:grid-cols-2">

{/* Three column — kapal list on desktop */}
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

{/* Two column layout — detail pages on wide screens */}
<div className="grid gap-6 lg:grid-cols-[1fr_340px]">

{/* Dashboard layout — action cards */}
<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
```

### 7.2 Content Width Classes

```tsx
{/* Narrow — forms, single items */}
<div className="mx-auto max-w-xl">

{/* Default — most content */}
<div className="mx-auto max-w-3xl">

{/* Wide — lists, grids */}
<div className="mx-auto max-w-5xl">

{/* Full — admin panels */}
<div className="mx-auto max-w-7xl">
```

---

## 8. Theme System Updates

### 8.1 Sidebar-Specific Colors

The existing DaisyUI themes already work well. Add these semantic variables for the sidebar:

```css
@theme inline {
  /* Sidebar specific */
  --color-sidebar-bg: var(--color-base-100);
  --color-sidebar-border: var(--color-base-300);
  --color-sidebar-hover: var(--color-base-200);
  --color-sidebar-active-bg: color-mix(in oklch, var(--color-primary) 10%, transparent);
  --color-sidebar-active-text: var(--color-primary);
}
```

### 8.2 Dark Mode Considerations

The existing dark theme works well. For the sidebar:
- `bg-base-100` → dark navy background
- `border-base-300` → subtle divider
- `bg-primary/10` → teal tint for active items
- `hover:bg-base-200` → lighter navy on hover

No changes needed — the existing palette handles it.

---

## 9. Implementation Roadmap

### Phase 1: App Shell Foundation
1. Create `src/components/layout/AppShell.tsx`
2. Create `src/components/layout/Sidebar.tsx`
3. Create `src/components/layout/MobileHeader.tsx`
4. Create `src/components/layout/BottomNav.tsx`
5. Update `src/app/layout.tsx` to wrap children in `<AppShell>`
6. Add layout tokens to `globals.css`

### Phase 2: Navigation
1. Implement auth-aware nav items
2. Add active state detection
3. Add theme toggle to sidebar footer
4. Add user info display in sidebar

### Phase 3: Page Adaptations
1. Update Home page — remove max-w-md, use max-w-6xl
2. Update Login/Register — keep standalone, improve desktop centering
3. Update Nahkoda — use app shell, remove back button (sidebar handles nav)
4. Update Admin — use app shell, tabs stay within content area
5. Update Kapal list — 3-column grid on desktop
6. Update Tambangan detail — 2-column layout on wide screens
7. Update Nahkoda kapal control — side-by-side mode/timer on desktop

### Phase 4: Polish
1. Add page transition animations
2. Add staggered card reveals
3. Add sidebar hover/active transitions
4. Add bottom nav safe-area support
5. Test all breakpoints
6. Test PWA behavior (standalone mode, safe areas)

---

## 10. File Change Summary

### New Files
```
src/components/layout/
├── AppShell.tsx         — Main layout orchestrator
├── Sidebar.tsx          — Desktop sidebar navigation
├── MobileHeader.tsx     — Mobile top bar
└── BottomNav.tsx        — Mobile bottom tab bar
```

### Modified Files
```
src/app/globals.css      — Add layout tokens, animation keyframes
src/app/layout.tsx       — Wrap children in <AppShell>
src/app/page.tsx         — Remove max-w-md constraint, use max-w-6xl
src/app/login/page.tsx   — Standalone layout, no shell changes
src/app/register/page.tsx — Same as login
src/app/nahkoda/page.tsx — Remove Screen wrapper, use app shell
src/app/admin/page.tsx   — Remove Screen wrapper, use app shell
src/app/kapal/page.tsx   — Remove Screen wrapper, use app shell
src/app/tambangan/page.tsx — Remove Screen wrapper, use app shell
src/app/tambangan/[slug]/page.tsx — Remove Screen wrapper, use app shell
src/app/nahkoda/kapal/[slug]/page.tsx — Remove Screen wrapper, use app shell
src/app/nahkoda/kapal/baru/page.tsx — Remove Screen wrapper, use app shell
src/components/ScreenHeader.tsx — Update to work within app shell
```

### Deprecated (Can Remove Later)
```
src/components/Screen.tsx — Replaced by AppShell
```

---

## 11. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sidebar width | 280px | Fits all nav labels, matches common patterns |
| Bottom nav style | Icons only | Saves vertical space, familiar mobile pattern |
| Standalone pages | Home, Login, Register | These need full-width hero, no nav shell |
| Content max-width | 5xl (1024px) | Balanced readability without wasting space |
| Active indicator | bg-primary/10 + text-primary | Consistent with existing DaisyUI theme |
| Back buttons | Keep in ScreenHeader | Useful for deep navigation within sections |
| Auth-aware nav | Client-side check | Simple, no extra API calls beyond existing /api/auth/me |
| Safe area support | env(safe-area-inset-bottom) | Required for PWA on iOS |

---

## 12. Accessibility Notes

- Sidebar: `role="navigation"`, `aria-label="Main navigation"`
- Bottom nav: `role="navigation"`, `aria-label="Mobile navigation"`
- Active links: `aria-current="page"`
- Focus management: visible focus rings (already implemented via `*:focus-visible`)
- Keyboard: Tab order flows sidebar → content → utilities
- Screen readers: skip-to-content link at top of sidebar
- Reduced motion: respect `prefers-reduced-motion` (already implemented)
- Color contrast: all text meets WCAG AA (existing theme verified)
