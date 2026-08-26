# Tambangan Track

Web mobile-first untuk lacak perahu tambangan (Jatikalen–Megaluh, Nganjuk). Mode **Penumpang** melihat posisi kapal secara live (polling 4 detik), mode **Nahkoda** mengelola kapalnya setelah login.

Migrasi dari single-file `TambanganTrack.tsx` (AI Studio `window.storage`) ke **Next.js App Router + PostgreSQL (Docker) + JWT auth**, diekspos online via `cloudflared tunnel` di `tambangan.abuamar.online`.

## Stack

- Next.js 16.3 (App Router, Turbopack) — `output: standalone` untuk Docker
- Tailwind CSS 4, lucide-react
- PostgreSQL 17 + Drizzle ORM
- `jose` JWT (httpOnly cookie), `bcryptjs`
- `zod` validasi

## Struktur

```
src/
  app/
    page.tsx                    # home — pilih role
    login/ page.tsx             # login
    register/ page.tsx          # register
    tambangan/page.tsx          # daftar tambangan (publik)
    tambangan/[slug]/page.tsx   # status kapal live, polling
    nahkoda/page.tsx            # dashboard kapal milik saya (protected)
    nahkoda/kapal/baru/page.tsx # daftar kapal (pilih/buat tambangan)
    nahkoda/kapal/[slug]/page.tsx # kontrol status, GPS, timer
    api/                        # auth, tambangan, kapal
  components/ ChannelBar, StatusBadge, ScreenHeader, KapalGroup, ErrorNote
  lib/db/ schema.ts, index.ts, bootstrap.ts
  lib/auth/ session.ts, password.ts
  proxy.ts                      # guard /nahkoda/*
  instrumentation.ts            # bootstrap DB + seed saat boot
```

## Prasyarat

- Node 22+, pnpm 11
- Docker + Docker Compose
- (untuk publik) akun Cloudflare Zero Trust + domain `abuamar.online`

## Jalankan lokal (dev)

```bash
# 1. DB
docker compose up -d db             # postgres di localhost:5432
# 2. cek .env (sudah terisi default dev)
cat .env
# 3. app
pnpm install
pnpm dev                            # http://localhost:3000
```

Seed otomatis saat boot: tambangan `jatikalen-megaluh` + akun `admin/admin123`.
Daftarkan nahkoda baru di `/register` atau login sebagai `admin`.

Polling penumpang 4 detik; nahkoda mengontrol status (`titik_a`/`proses`/`titik_b`), timer, dan lokasi titik via GPS.

## Produksi (Docker)

```bash
cp .env.example .env
# isi JWT_SECRET (string acak panjang) dan credential lain

docker compose up -d --build db app
# cek http://localhost:3000
```

## Online via cloudflared (`tambangan.abuamar.online`)

Di server/VPS yang jalankan compose:

1. Cloudflare Dashboard -> Zero Trust -> Networks -> Tunnels -> Create tunnel (Cloudflared).
2. Route hostname `tambangan.abuamar.online` -> `http://app:3000`.
3. Copy **Tunnel Token**.
4. Di host, set env dan nyalakan service tunnel:

```bash
# .env
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoi...token-dari-dashboard

docker compose --profile tunnel up -d db app cloudflared
# tanpa tunnel: docker compose up -d db app
```

Cloudflare otomatis menerbitkan HTTPS; tidak perlu Nginx/Certbot. Tunnel berjalan di dalam compose, me-route `https://tambangan.abuamar.online` -> `app:3000` di jaringan Docker.

## Env

| Key | Contoh | Keterangan |
|-----|--------|------------|
| `DATABASE_URL` | `postgres://tambangan:tambangan@db:5432/tambangan` | dev: `@localhost`, compose: `@db` |
| `JWT_SECRET` | string acak >=32 char | Wajib ganti di produksi |
| `ADMIN_USERNAME/PASSWORD` | `admin/admin123` | Seed saat boot pertama |
| `POSTGRES_*` | `tambangan` | Untuk service `db` |
| `CLOUDFLARE_TUNNEL_TOKEN` | `eyJ...` | Kosong = tunnel tidak aktif |

## API ringkas

Publik: `GET /api/tambangan`, `GET /api/tambangan/[slug]` (detail + kapal).
Auth: `POST /api/auth/register|login|logout`, `GET /api/auth/me`.
Protected (`tb_session` cookie): `POST /api/tambangan`, `POST /api/kapal`, `GET /api/nahkoda/kapal`, `GET|PATCH /api/kapal/[slug]`.

`PATCH /api/kapal/[slug]` actions:
- `{"action":"status","value":"titik_a"|"proses"|"titik_b"}`
- `{"action":"timer","minutes":5}` / `{"action":"timer_clear"}`
- `{"action":"set_lokasi_titik","side":"a"|"b","lat":..,"lng":..}`

## Catatan

- Penumpang tidak perlu akun; hanya nahkoda yang login. Kapal terikat `ownerId`, hanya pemilik yang bisa PATCH.
- File asli disimpan di `docs/reference/TambanganTrack.original.tsx` untuk referensi visual (ChannelBar, Timer, dll.) di-porting setia.
- GPS memerlukan HTTPS kecuali di `localhost`; domain tunnel sudah HTTPS.

## Perintah berguna

```bash
pnpm build              # cek Turbopack + typecheck + generate routes
pnpm lint
docker compose logs -f db app
docker compose down -v  # reset DB (hapus pgdata)
```
