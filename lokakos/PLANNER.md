# PLANNER.md — LokaKos MVP Memory Bank

> **Single Source of Truth** untuk semua agen AI yang mengerjakan project ini.
> Selalu baca file ini sebelum menulis satu baris kode pun.

---

## 1. Project Vision & UI/UX Vibe

### Tagline

> _Temukan kos impianmu di Banda Aceh — langsung di peta._

### Konsep Utama

LokaKos adalah **map-first marketplace kos-kosan** untuk area Banda Aceh. Berbeda dari platform listing konvensional (scroll vertikal), LokaKos menempatkan peta sebagai elemen UI primer. Pengguna **berinteraksi dengan peta terlebih dahulu**, bukan dengan daftar kartu.

### UX Philosophy

- **Map is the UI.** Peta mengambil 60–70% layar pada desktop, 100% pada mobile.
- **Panel sebagai overlay.** Daftar properti dan detail muncul sebagai slide-in panel/drawer di atas peta, bukan halaman terpisah.
- **Zero clutter.** Navigasi minimal, konten tertata. Tidak ada iklan, tidak ada banner norak.
- **Realtime-first.** Status kamar (tersedia/penuh) harus akurat dan live.

### Palet Warna & Tipografi

| Token          | Nilai                    | Kegunaan                          |
| -------------- | ------------------------ | --------------------------------- |
| `bg-primary`   | `slate-950` / `#020617`  | Background utama (dark mode only) |
| `bg-surface`   | `slate-900` / `#0f172a`  | Card, Panel, Sidebar              |
| `bg-elevated`  | `slate-800` / `#1e293b`  | Hover state, input field          |
| `border`       | `slate-700` / `#334155`  | Pembatas elemen                   |
| `text-primary` | `slate-50` / `#f8fafc`   | Teks utama                        |
| `text-muted`   | `slate-400` / `#94a3b8`  | Teks sekunder, label              |
| `accent`       | `indigo-500` / `#6366f1` | CTA, active state, highlight      |
| `accent-hover` | `indigo-400` / `#818cf8` | Hover pada accent                 |
| `success`      | `emerald-500`            | Status "Tersedia"                 |
| `danger`       | `rose-500`               | Status "Penuh"                    |
| `warning`      | `amber-400`              | Status "Hampir Penuh"             |

**Font:** `Inter` (dari Google Fonts). Gunakan `font-sans` dari Tailwind.

**Design Language:**

- Rounded corners: `rounded-xl` untuk card, `rounded-full` untuk badge/chip.
- Shadow: `shadow-xl` dengan `shadow-black/50` untuk panel overlay.
- Animasi: `transition-all duration-300 ease-in-out` untuk panel slide-in/out.
- Mapbox style: `mapbox://styles/mapbox/dark-v11` (dark map sesuai tema).

---

## 2. Folder Architecture (`src/`)

```
lokakos/
├── PLANNER.md                  ← File ini (Memory Bank)
├── .env.local                  ← Secrets (JANGAN di-commit)
├── next.config.ts
├── tailwind.config.ts
└── src/
    ├── app/                    ← Next.js App Router
    │   ├── layout.tsx          ← Root layout (font, metadata global)
    │   ├── page.tsx            ← Halaman utama "/" (Map + Panel)
    │   ├── globals.css         ← CSS global + Tailwind directives
    │   │
    │   ├── (auth)/             ← Route group: tidak ada shared layout
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   └── register/
    │   │       └── page.tsx
    │   │
    │   ├── dashboard/          ← Dashboard pemilik kos (protected)
    │   │   ├── layout.tsx
    │   │   ├── page.tsx        ← Overview properti milik pemilik
    │   │   ├── properties/
    │   │   │   ├── page.tsx    ← List semua properti pemilik
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx ← Form tambah properti baru
    │   │   │   └── [id]/
    │   │   │       └── page.tsx ← Edit properti
    │   │   └── rooms/
    │   │       └── [propertyId]/
    │   │           └── page.tsx ← Manajemen kamar per properti
    │   │
    │   └── api/                ← Route Handlers (server-side)
    │       └── properties/
    │           └── route.ts    ← GET /api/properties (dengan bbox filter)
    │
    ├── components/
    │   ├── ui/                 ← Reusable UI primitives (TIDAK ada logika bisnis)
    │   │   ├── Button.tsx
    │   │   ├── Badge.tsx       ← Status badge (Tersedia/Penuh/dll)
    │   │   ├── Input.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Avatar.tsx
    │   │   └── Skeleton.tsx    ← Loading placeholder
    │   │
    │   ├── map/                ← Semua komponen yang berhubungan dengan Mapbox
    │   │   ├── MapContainer.tsx      ← Wrapper utama react-map-gl (dynamic import)
    │   │   ├── PropertyMarker.tsx    ← Custom marker (harga/titik) di peta
    │   │   ├── ClusterLayer.tsx      ← Mapbox cluster untuk banyak marker
    │   │   ├── MapControls.tsx       ← Tombol zoom, geolocation, dll
    │   │   └── MapStyleToggle.tsx    ← Ganti style peta (dark/satellite)
    │   │
    │   ├── property/           ← Komponen spesifik domain properti
    │   │   ├── PropertyCard.tsx      ← Card di list panel
    │   │   ├── PropertyDetail.tsx    ← Detail drawer/panel kanan
    │   │   ├── PropertyList.tsx      ← Scrollable list panel
    │   │   ├── RoomStatusBadge.tsx   ← Badge realtime status kamar
    │   │   └── FacilityChip.tsx      ← Chip fasilitas (WiFi, AC, dll)
    │   │
    │   ├── layout/             ← Komponen layout & navigasi
    │   │   ├── Navbar.tsx
    │   │   ├── Sidebar.tsx     ← Dashboard sidebar
    │   │   └── FilterPanel.tsx ← Panel filter (harga, fasilitas, dll)
    │   │
    │   └── auth/               ← Komponen terkait autentikasi
    │       ├── LoginForm.tsx
    │       └── RegisterForm.tsx
    │
    ├── lib/                    ← Utility, helpers, konfigurasi eksternal
    │   ├── supabase/
    │   │   ├── client.ts       ← createBrowserClient (untuk Client Components)
    │   │   ├── server.ts       ← createServerClient (untuk Server Components & Actions)
    │   │   └── middleware.ts   ← refreshSession logic untuk middleware.ts
    │   ├── mapbox/
    │   │   └── config.ts       ← Konstanta Mapbox (token, default center, zoom)
    │   └── utils.ts            ← Fungsi umum (cn(), formatPrice(), dll)
    │
    ├── hooks/                  ← Custom React Hooks
    │   ├── useMap.ts           ← State management peta (viewport, selected marker)
    │   ├── useProperties.ts    ← Fetch & subscribe properti dari Supabase
    │   ├── useRealtimeRooms.ts ← Subscribe WebSocket untuk status kamar
    │   └── useAuth.ts          ← Wrapper untuk session Supabase
    │
    ├── types/                  ← TypeScript type definitions
    │   ├── supabase.ts         ← Auto-generated types dari Supabase CLI
    │   ├── property.ts         ← Interface Property, Room, Facility
    │   └── map.ts              ← Interface ViewState, MapMarker, dll
    │
    ├── store/                  ← Global state (Zustand — install di Phase 2)
    │   ├── mapStore.ts         ← Viewport state, selected property ID
    │   └── filterStore.ts      ← State filter aktif (harga, fasilitas)
    │
    └── middleware.ts           ← Next.js middleware (root level src/ atau root)
```

---

## 3. Supabase Integration Plan

### 3.1 Authentication Strategy

**Provider yang digunakan:** Email/Password (MVP). Google OAuth menyusul.

**Client vs Server Client:**

- `lib/supabase/client.ts` → `createBrowserClient` dari `@supabase/ssr`. Digunakan di Client Components (`'use client'`).
- `lib/supabase/server.ts` → `createServerClient` dengan `cookies()` dari `next/headers`. Digunakan di Server Components, Route Handlers, dan Server Actions.

**Protected Routes:**

- Semua route di bawah `/dashboard/**` wajib terautentikasi.
- Jika unauthenticated → redirect ke `/login`.

### 3.2 SSR Middleware (`middleware.ts`)

```
Request masuk
    ↓
middleware.ts berjalan di Edge
    ↓
supabase.auth.getUser() dipanggil (refresh token jika perlu)
    ↓
Jika route = /dashboard/** && tidak ada session → NextResponse.redirect('/login')
Jika route = /login || /register && ada session → NextResponse.redirect('/')
    ↓
Lanjut ke halaman
```

**Matcher config:**

```ts
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 3.3 Row Level Security (RLS) Strategy

| Tabel               | Policy                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------- |
| `profiles`          | User hanya bisa baca/update profil sendiri                                             |
| `properties`        | SELECT: public (semua bisa lihat). INSERT/UPDATE/DELETE: hanya `owner_id = auth.uid()` |
| `rooms`             | SELECT: public. INSERT/UPDATE/DELETE: hanya via properti yang dimiliki                 |
| `room_availability` | SELECT: public. UPDATE: hanya pemilik properti terkait                                 |

### 3.4 Realtime WebSocket untuk Status Kamar

**Strategi:** Supabase Realtime `postgres_changes` pada tabel `room_availability`.

**Flow:**

```
Client mount
    ↓
useRealtimeRooms(propertyId) hook dipanggil
    ↓
supabase.channel(`rooms:${propertyId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'room_availability' }, handler)
  .subscribe()
    ↓
Setiap UPDATE dari pemilik kos → handler update state lokal
    ↓
RoomStatusBadge re-render dengan data terbaru
    ↓
useEffect cleanup → supabase.removeChannel() saat unmount
```

**Enable Realtime:** Pastikan tabel `room_availability` ditambahkan ke Supabase Realtime publication di dashboard Supabase.

---

## 4. Database Schema Outline

### Tabel: `profiles`

Ekstensi dari `auth.users` Supabase. Dibuat otomatis via database trigger saat user baru register.

```sql
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant', 'owner')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tabel: `properties`

Data utama setiap properti kos.

```sql
CREATE TABLE public.properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  address       TEXT NOT NULL,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  price_min     INTEGER NOT NULL,  -- Harga terendah (IDR/bulan)
  price_max     INTEGER,           -- Harga tertinggi (jika ada variasi)
  gender_type   TEXT NOT NULL DEFAULT 'mixed' CHECK (gender_type IN ('male', 'female', 'mixed')),
  thumbnail_url TEXT,
  image_urls    TEXT[],            -- Array URL gambar
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query geospasial (bbox filter)
CREATE INDEX idx_properties_location ON public.properties (latitude, longitude);
CREATE INDEX idx_properties_owner ON public.properties (owner_id);
```

### Tabel: `facilities`

Master data fasilitas (referensi).

```sql
CREATE TABLE public.facilities (
  id    SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name  TEXT NOT NULL UNIQUE,  -- 'WiFi', 'AC', 'Kamar Mandi Dalam', dll
  icon  TEXT                   -- Nama icon (Lucide, dll)
);
```

### Tabel: `property_facilities` (Junction)

Relasi many-to-many antara properti dan fasilitas.

```sql
CREATE TABLE public.property_facilities (
  property_id  UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  facility_id  SMALLINT REFERENCES public.facilities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, facility_id)
);
```

### Tabel: `rooms`

Tipe kamar dalam satu properti.

```sql
CREATE TABLE public.rooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,     -- 'Kamar Standar', 'Kamar Premium', dll
  price        INTEGER NOT NULL,  -- IDR/bulan
  total_units  INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tabel: `room_availability`

Status ketersediaan per tipe kamar. **Tabel ini yang di-subscribe Realtime.**

```sql
CREATE TABLE public.room_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE UNIQUE,
  available_units INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available', 'almost_full', 'full')),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Trigger: Auto-create profile saat user register

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 5. Phase-by-Phase Roadmap

### ✅ Phase 0: Project Setup & Config _(SELESAI)_

- [x] Inisialisasi Next.js 14 (App Router) + TypeScript + Tailwind CSS
- [x] Install `mapbox-gl`, `react-map-gl`
- [x] Setup `.env.local` dengan `NEXT_PUBLIC_MAPBOX_TOKEN`
- [x] Buat `PLANNER.md` ini ✅

---

### ✅ Phase 1: Map UI Skeleton _(SELESAI)_

**Goal:** Tampilan peta Banda Aceh berjalan, ada panel properti kosong, tidak ada backend.

**Deliverables:**

- [x] Refactor `src/app/globals.css` — setup Tailwind v4, CSS variables untuk palet warna
- [x] Buat `src/lib/mapbox/config.ts` — konstanta token, center Banda Aceh, zoom default
- [x] Buat `src/components/map/MapContainer.tsx` — `'use client'`, dynamic import SSR:false, streets-v12 style, marker interaktif
- [x] Buat `src/components/map/PropertyMarker.tsx` — ✅ Diekstrak ke file terpisah
- [ ] Buat `src/components/map/MapControls.tsx` — _(NavigationControl & GeolocateControl inline di MapContainer — cukup untuk MVP)_
- [x] Buat `src/components/property/PropertyCard.tsx` — ✅ card dengan skeleton loader, status badge, facility chips
- [x] Buat `src/components/property/PropertyList.tsx` — ✅ scrollable panel kiri, empty state, skeleton
- [x] Buat `src/components/property/PropertyDetail.tsx` — ✅ Diekstrak ke file terpisah, slide-in dari kanan
- [x] Buat `src/components/layout/Navbar.tsx` — ✅ Diekstrak ke file terpisah
- [x] Buat `src/components/layout/FilterPanel.tsx` — ✅ chip filter harga, fasilitas, tipe kos
- [x] Update `src/app/page.tsx` — ✅ layout split (PropertyList kiri + Peta kanan), semua komponen modular
- [x] Buat `src/types/property.ts` — interface `Property`, `Room`, `Facility`
- [x] Buat `src/types/map.ts` — interface `ViewState`, `MapMarker`
- [x] Buat `src/hooks/useMap.ts` — ✅ state management viewport & selected property via useMap hook
- [x] Buat `src/lib/mockData.ts` — 4 properti dummy di area Unsyiah/Darussalam
- [x] Gunakan **mock data** statis untuk menampilkan 4 properti dummy di peta ✅

**Definition of Done:**
Peta Banda Aceh muncul dengan light style, ada marker properti, klik marker → panel detail muncul dari kanan, ada list panel di kiri.

---

### 🔲 Phase 2: Supabase Auth & Database

**Goal:** User bisa register/login. Data tersimpan di Supabase.

**Deliverables:**

- [ ] Install `@supabase/supabase-js` dan `@supabase/ssr`
- [ ] Tambah `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` ke `.env.local`
- [ ] Buat `src/lib/supabase/client.ts` — `createBrowserClient`
- [ ] Buat `src/lib/supabase/server.ts` — `createServerClient` dengan cookies
- [ ] Buat `src/middleware.ts` — refresh session + protect `/dashboard/**`
- [ ] Buat `src/app/(auth)/login/page.tsx` + `src/components/auth/LoginForm.tsx`
- [ ] Buat `src/app/(auth)/register/page.tsx` + `src/components/auth/RegisterForm.tsx`
- [ ] Setup Supabase: jalankan SQL schema (tabel, RLS, trigger) dari Section 4
- [ ] Buat `src/hooks/useAuth.ts` — wrapper session
- [ ] Buat `src/app/dashboard/page.tsx` — halaman protected sederhana
- [ ] Generate `src/types/supabase.ts` via Supabase CLI

**Definition of Done:**
User bisa register sebagai `owner`, login, dan melihat dashboard sederhana. Logout bersihkan session.

---

### 🔲 Phase 3: Live Property Data (Fetch from Supabase)

**Goal:** Marker di peta dan list panel diisi data real dari database.

**Deliverables:**

- [ ] Buat `src/app/api/properties/route.ts` — GET dengan filter bbox (lat/lng bounds)
- [ ] Update `src/hooks/useProperties.ts` — fetch dari API route, filter by viewport bounds
- [ ] Integrasikan `useProperties` ke `MapContainer` dan `PropertyList`
- [ ] Buat `src/app/dashboard/properties/new/page.tsx` — form tambah properti baru (dengan Mapbox geocoder untuk pilih lokasi)
- [ ] Implementasi upload gambar ke Supabase Storage
- [ ] Buat `src/app/dashboard/properties/[id]/page.tsx` — edit properti

**Definition of Done:**
Pemilik kos bisa tambah properti dari dashboard, properti muncul di peta secara real-time setelah publish.

---

### 🔲 Phase 4: Realtime Room Status

**Goal:** Status kamar berubah live tanpa refresh halaman.

**Deliverables:**

- [ ] Aktifkan Supabase Realtime untuk tabel `room_availability`
- [ ] Buat `src/hooks/useRealtimeRooms.ts` — subscribe `postgres_changes`
- [ ] Integrasikan ke `PropertyDetail.tsx` — badge status update otomatis
- [ ] Buat UI di dashboard pemilik untuk update status kamar (`available` / `almost_full` / `full`)
- [ ] Buat `src/components/property/RoomStatusBadge.tsx` — badge dengan warna sesuai status

**Definition of Done:**
Saat pemilik update status kamar di dashboard, badge di halaman detail properti berubah dalam <2 detik di browser lain.

---

### 🔲 Phase 5: Search, Filter & Polish

**Goal:** Fitur pencarian dan filter berfungsi. UI siap untuk demo.

**Deliverables:**

- [ ] Implementasi Mapbox Geocoding API untuk search bar (cari lokasi)
- [ ] Filter by: rentang harga, jenis kelamin, fasilitas
- [ ] Clustering marker (Mapbox GL Cluster Layer) untuk performa saat banyak marker
- [ ] Animasi transisi panel (Framer Motion atau CSS transition)
- [ ] Skeleton loading state di semua komponen
- [ ] Responsive design untuk mobile (peta fullscreen, bottom sheet untuk list)
- [ ] SEO: metadata per halaman, OpenGraph

**Definition of Done:**
Platform siap untuk user testing dengan stakeholder / demo.

---

### 🔲 Phase 6: PWA & Performance (Post-MVP)

- [ ] Lighthouse score ≥ 90 di semua kategori
- [ ] PWA manifest + service worker (offline map tiles cache)
- [ ] Image optimization (WebP, lazy load)
- [ ] Rate limiting di API routes
- [ ] Error monitoring (Sentry)

---

## 6. Konvensi & Aturan Koding

### Naming Convention

- **Komponen:** PascalCase (`PropertyCard.tsx`)
- **Hooks:** camelCase dengan prefix `use` (`useProperties.ts`)
- **Types/Interfaces:** PascalCase (`Property`, `ViewState`)
- **Utility functions:** camelCase (`formatPrice`, `cn`)
- **CSS classes:** Tailwind utility classes, custom class dengan BEM jika perlu
- **API routes:** kebab-case URL (`/api/properties`, `/api/room-status`)

### Penting: Next.js Rules

- **Semua komponen yang menggunakan Mapbox, hooks, atau browser API WAJIB** menggunakan `'use client'` directive.
- **`MapContainer` WAJIB** di-import dengan `dynamic(() => ..., { ssr: false })` karena Mapbox GL membutuhkan `window`.
- **Server Components** hanya untuk data fetching awal dan layout statis.
- **Server Actions** untuk mutasi data (form submit) sebagai pengganti API routes sederhana.
- Gunakan `@supabase/ssr` (bukan `@supabase/auth-helpers-nextjs` yang sudah deprecated).

### Environment Variables

```
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# Supabase (tambahkan di Phase 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # JANGAN expose ke client!
```

### Git Commit Convention

```
feat: deskripsi fitur baru
fix: deskripsi bug yang diperbaiki
refactor: perubahan struktur tanpa fitur baru
style: perubahan CSS/UI tanpa logika
chore: konfigurasi, dependency, dll
```

---

## 7. Referensi Penting

| Resource                | URL                                                      |
| ----------------------- | -------------------------------------------------------- |
| Next.js App Router Docs | `node_modules/next/dist/docs/` (lokal)                   |
| react-map-gl Docs       | https://visgl.github.io/react-map-gl/                    |
| Mapbox GL JS Docs       | https://docs.mapbox.com/mapbox-gl-js/                    |
| Supabase SSR Guide      | https://supabase.com/docs/guides/auth/server-side/nextjs |
| Tailwind CSS v4         | https://tailwindcss.com/docs                             |
| Supabase Realtime       | https://supabase.com/docs/guides/realtime                |

---

## 8. Current Status Log

| Tanggal    | Update                                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-01 | Project init. PLANNER.md dibuat. Phase 0 selesai. Phase 1 siap dimulai.                                                                                                                                                                                 |
| 2026-05-01 | Phase 1 partial: `config.ts`, `MapContainer.tsx`, `page.tsx` (fullscreen map), mock data 4 properti di Unsyiah. Map dark-v11 berjalan, marker interaktif, detail panel slide-in ✅. Sisa Phase 1: PropertyCard, PropertyList, FilterPanel, useMap hook. |
| 2026-05-01 | Light Mode pivot: MapStyle diubah ke `streets-v12`, Navbar diupdate ke `bg-white` + teks hitam. UI terlihat bersih dan modern ✅.                                                                                                                       |
| 2026-05-02 | Phase 1 **SELESAI** ✅: FilterPanel (chip harga/fasilitas/tipe), useMap hook (viewState + selectedProperty), integrasi penuh di page.tsx — klik marker → PropertyDetail drawer slide-in dari kanan, tombol Tutup reset state. |

> **Agen AI:** Selalu update tabel ini setiap sesi kerja selesai.

---

_Last updated: 2026-05-02 — Phase 1 **SELESAI** ✅ | Phase 2: Supabase Auth & Database (NEXT)_
