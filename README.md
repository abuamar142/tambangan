# Tambangan Track

<p align="center">
  <a href="https://nextjs.org"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white" /></a>
  <a href="https://tailwindcss.com"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white" /></a>
  <a href="https://www.docker.com"><img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" /></a>
  <a href="https://www.postgresql.org"><img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white" /></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" /></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-green" /></a>
</p>

<p align="center">
  Aplikasi pelacakan perahu tambangan <strong>Jatikalen – Megaluh (Nganjuk)</strong> — mobile-first, real-time, dan siap produksi.<br />
  <strong>Demo:</strong> <a href="https://tambangan.abuamar.online">https://tambangan.abuamar.online</a>
</p>

<p align="center">
  <img src="./docs/screenshot.png" alt="Screenshot Tambangan Track" width="720" />
</p>

---

## Fitur

### Peran & Hak Akses

| Peran | Akses | Kemampuan |
|-------|-------|-----------|
| **Penumpang** | Publik, tanpa akun | Melihat status kapal live (polling 4s), estimasi timer |
| **Nahkoda** | Login (`tb_session` cookie) | Kelola kapal, kontrol status, timer, dan GPS titik A/B |
| **Admin** | Login (role `admin`) | Seed akun `admin/admin123`, kelola data awal |

### Daftar Fitur

- **Live polling 4 detik** — status kapal real-time tanpa WebSocket, ringan di jaringan seluler.
- **GPS presisi** — simpan koordinat titik penyeberangan via Geolocation API (**HTTPS required**).
- **Dark / Light mode** — toggle tema dengan persistensi.
- **Mobile-first & aksesibel** — layout dioptimalkan untuk HP, navigasi bottom.
- **Keamanan** — JWT (`jose`) httpOnly cookie, bcrypt password hash, route guard (`proxy.ts`), validasi `zod`.

---

## Tech Stack

| Layer | Teknologi | Versi | Keterangan |
|-------|-----------|-------|------------|
| Framework | **Next.js** (App Router, Turbopack) | `16.3.2` | `output: standalone` untuk Docker multi-stage |
| UI | **Tailwind CSS** | `4.x` | Utility-first, mobile-first |
| Database | **PostgreSQL** | `17-alpine` | Service `db` di Docker Compose |
| ORM | **Drizzle ORM** | `0.45.2` | Schema di `src/lib/db/schema.ts` |
| Auth | **jose** (JWT) + **bcryptjs** | `6.x` / `3.x` | Cookie `tb_session`, hash password |
| Infra | **Docker Compose**, **Caddy**, **Cloudflare Tunnel** | — | VPS `43.129.53.235`, CI/CD via GitHub Actions |

---

## Quick Start

```bash
cp .env.example .env
docker compose up -d db
pnpm install
pnpm dev
```

Migrasi database otomatis jalan saat boot (`instrumentation.ts` → `drizzle-kit migrate`). Seed tambangan `jatikalen-megaluh` + akun `admin/admin123` juga otomatis.

---

## Environment Variables

| Key | Default | Keterangan |
|-----|---------|------------|
| `DATABASE_URL` | `postgres://tambangan:tambangan@localhost:5432/tambangan` | URL PostgreSQL (di Compose otomatis ke `@db`) |
| `JWT_SECRET` | `insecure-dev-secret-...` | Secret JWT, **wajib ganti di produksi** (≥32 char) |
| `ADMIN_USERNAME` | `admin` | Username seed admin |
| `ADMIN_PASSWORD` | `admin123` | Password seed admin (bcrypt hash) |
| `POSTGRES_USER` | `tambangan` | User PostgreSQL untuk service `db` |
| `POSTGRES_PASSWORD` | `tambangan` | Password PostgreSQL |
| `POSTGRES_DB` | `tambangan` | Nama database |
| `CLOUDFLARE_TUNNEL_TOKEN` | — | Token Cloudflare Zero Trust Tunnel (opsional) |

---

## Deployment

Produksi berjalan di VPS dengan Docker Compose (`db` + `app`) dan Caddy sebagai reverse proxy. CI/CD via GitHub Actions: push ke branch `main` otomatis trigger build + SSH deploy ke VPS. Lihat `.github/workflows/deploy.yml` untuk konfigurasi lengkap.

### Database Migrations

Menggunakan **Drizzle Kit** untuk managed migrations. Migrasi otomatis dijalankan saat app boot (`instrumentation.ts`).

**Workflow saat mengubah schema:**

```bash
# 1. Edit src/lib/db/schema.ts
# 2. Generate migration SQL
pnpm db:generate
# 3. Commit file drizzle/*.sql
# 4. Push ke main → CI/CD auto-apply migration + rebuild
```

**Perintah berguna:**

| Command | Fungsi |
|---------|--------|
| `pnpm db:generate` | Generate migration SQL dari schema.ts |
| `pnpm db:push` | Push schema langsung ke DB (dev, tanpa migration file) |
| `pnpm db:migrate` | Apply semua pending migration |
| `make db-shell` | Buka psql shell ke database |

Migrasi berjalan otomatis saat deploy (CI/CD) **dan** saat app boot (`instrumentation.ts`). Tidak perlu manual SSH untuk ALTER TABLE.

---

## Contributing

1. Fork repository ini.
2. Buat branch fitur (`git checkout -b feat/nama-fitur`).
3. Buka Pull Request ke branch `development`.

---

## License

Dirilis di bawah lisensi **MIT** — lihat file [LICENSE](./LICENSE) untuk detail.

---

<p align="center">
  Dibuat dengan Next.js, Tailwind, dan PostgreSQL — untuk penyeberangan Jatikalen – Megaluh.<br />
  <a href="https://tambangan.abuamar.online">tambangan.abuamar.online</a> · <a href="https://github.com/abuamar142/tambangan">GitHub</a>
</p>
