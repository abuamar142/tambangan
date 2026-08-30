# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Penumpang** — Masyarakat umum di Nganjuk yang menggunakan ferry penyeberangan Jatikalen–Megaluh. Tidak perlu akun. Membuka app untuk melihat status kapal secara real-time: mana yang standby, mana yang sedang menyeberang, dan estimasi waktu keberangkatan.
- **Nahkoda (Operator Kapal)** — Operator ferry yang mengelola status kapal mereka: ubah status (titik A → proses → titik B), atur timer keberangkatan, simpan koordinat GPS titik penyeberangan. Login diperlukan.
- **Admin** — Pengelola sistem yang mengelola data awal (tambangan, user, kapal), reset password, dan assign tambangan ke nahkoda.

## Product Purpose

Tambangan memecahkan masalah penumpang ferry di Nganjuk yang tidak tahu kapan kapal berangkat dan ke mana arahnya. Penumpang harus datang ke dermaga tanpa kepastian — aplikasi ini memberikan visibilitas real-time sehingga penumpang bisa memutuskan kapan harus datang, mengurangi waktu tunggu, dan meningkatkan kepercayaan pada layanan ferry.

Success: penumpang tidak lagi menunggu berjam-jam di dermaga tanpa informasi. Nahkoda dapat mengelola status kapal dari ponsel tanpa harus hadir fisik. Admin memiliki data real-time untuk pengambilan keputusan.

## Positioning

Tambangan bukan ferry tracker generik — ini adalah **sistem operasional ferry micro-scale** yang dirancang untuk satu penyeberangan spesifik (Jatikalen–Megaluh). Yang membedakan:

- **Timer keberangkatan real-time** — countdown hidup yang berjalan di client, bukan hanya status statis
- **GPS capture titik** — nahkoda menyimpan koordinat asli titik A/B via Geolocation API, memungkinkan proximity detection
- **Mode GPS otomatis** — kapal bisa auto-detect status berdasarkan jarak GPS (≤120m = sampai, ≥250m = sedang menyeberang)
- **Mobile-first untuk jaringan desa** — dirancang untuk HP dengan sinyal terbatas, polling ringan tanpa WebSocket

## Operating Context

- Penyeberangan ferry manual di sungai Brantas, Nganjuk — bukan pelabuhan besar
- Nahkoda beroperasi dari HP sambil mengendarai kapal
- Penumpang menunggu di dermaga, sering tanpa informasi
- Admin berada di kantor desa atau mengelola dari jarak jauh
- Jaringan internet tidak selalu stabil (4G/3G di area pedesaan)

## Capabilities and Constraints

- **Real-time polling** 4 detik (client-initiated, bukan WebSocket) — kompatibel dengan jaringan lambat
- **Timer keberangkatan** — nahkoda set waktu berangkat, countdown live di semua klien
- **GPS proximity detection** — mode otomatis mendeteksi status berdasarkan jarak ke titik (NEAR=120m, FAR=250m)
- **Dark mode** — toggle persistensi, menyesuaikan system preference
- **PWA installable** — manifest + service worker untuk akses cepat dari home screen
- **Offline fallback** — halaman offline saat tidak ada koneksi
- **Push notifications** — infrastructure ready (service worker + subscription API)
- **Admin CRUD** — kelola user, tambangan, kapal dari panel admin
- **Tiap ferry terikat owner** — kapal hanya bisa diubah oleh pemiliknya (ownerId check)
- **GPS memerlukan HTTPS** — Geolocation API diblokir browser di HTTP non-localhost

## Brand Commitments

- Nama: **Tambangan** (TambanganTrack untuk branding)
- Brand color: **teal #0d9488** (primary), amber #f59e0b (accent/timer)
- Font: **Geist Sans** (body) + **Geist Mono** (timestamps/counters)
- Icon: **lucide-react** — konsisten outline style
- Voice: Sederhana, langsung, bahasa Indonesia — tidak formal, tidak terlalu kasual
- Logo: Anchor SVG putih di background teal rounded

## Evidence on Hand

- Screenshot: `docs/screenshot.png` — tampilan dark mode tambangan detail
- Deploy: `https://tambangan.abuamar.online` — production di VPS Jakarta via Caddy
- Repo: `https://github.com/abuamar142/tambangan`

## Product Principles

1. **Mobile-first, ringan** — setiap byte dan request dihitung untuk jaringan desa
2. **Real-time tanpa WebSocket** — polling ringan lebih kompatibel daripada connection persisten
3. **Sederhana untuk nahkoda** — satu layar, satu aksi, tidak ada navigasi kompleks
4. **Data-driven untuk admin** — overview stats, CRUD lengkap, export-ready
5. **Offline-resilient** — app tetap berguna bahkan tanpa koneksi (cached pages)

## Accessibility & Inclusion

- Semua form punya label (telah diperbaiki di revamp)
- ChannelBar punya role="meter" + aria-label untuk screen reader
- Admin tabs punya role="tab" + aria-selected
- focus-visible ring di semua interactive elements
- prefers-reduced-motion dihormati
- Touch target minimum 44px (min-h-11/min-w-11)
