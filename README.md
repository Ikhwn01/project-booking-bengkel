# 🚗 AutoFix Express - Sistem Booking Servis Bengkel Kendaraan

Sistem pemesanan (booking) servis kendaraan (mobil/motor) terstruktur dengan arsitektur terpisah antara API Server dan Web Client.

---

## 🛠️ Tech Stack

### **API Server (NestJS)**
- **Framework**: NestJS (TypeScript) - Modular Architecture
- **Database ORM**: Prisma ORM
- **Database**: SQLite / PostgreSQL
- **Auth & Keamanan**: JWT (Passport.js), bcrypt, Role-Based Access Control (`CUSTOMER`, `ADMIN`, `MECHANIC`)
- **Validasi Data**: `class-validator` & `class-transformer`

### **Web Client (Next.js)**
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom Glassmorphism UI + Dual Language (ID 🇮🇩 / EN 🇬🇧) + Multi-Currency (Rp / $)
- **State & Data Fetching**: TanStack Query (React Query) + Axios Interceptors
- **Form & Validasi**: React Hook Form + Zod Schema Validation

---

## 📁 Struktur Folder Project

```text
project booking bengkel/
├── docker-compose.yml          # PostgreSQL container configuration
├── README.md
├── api/                        # Server NestJS Backend API
│   ├── prisma/
│   │   ├── schema.prisma       # Model Prisma & Relasi Tabel
│   │   ├── dev.db              # Database SQLite lokal
│   │   └── seed.ts             # Database Seeder Data Awal
│   ├── src/
│   │   ├── auth/               # Auth Register, Login, JWT Strategy
│   │   ├── users/              # Management Data User
│   │   ├── vehicles/           # CRUD Kendaraan Pelanggan
│   │   ├── services/           # Katalog Layanan Servis Bengkel
│   │   ├── mechanics/          # Management Data Mekanik
│   │   ├── bookings/           # Realtime Slot Check & Anti Double Booking
│   │   ├── reviews/            # Fitur Rating & Ulasan Pelanggan
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   └── package.json
└── web/                        # Client Frontend Next.js Web
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx        # Landing Page (Profil & Testimonial Pelanggan)
    │   │   ├── login/          # Page Login User & Admin
    │   │   ├── register/       # Page Registrasi Pelanggan
    │   │   ├── booking/        # Form Booking dengan Real-Time Slot Check
    │   │   ├── riwayat/        # Riwayat Booking & Form Ulasan Pelanggan
    │   │   ├── dashboard/      # Admin Dashboard (Kelola Booking & Mekanik)
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   ├── components/         # Navbar (Dual Language Switcher) & Footer
    │   └── lib/                # i18n Context, Axios & React Query Provider
    ├── .env.local
    └── package.json
```

---

## 🚀 Cara Menjalankan Project secara Lokal

### **1. Jalankan API Server (NestJS)**

1. Masuk ke folder `api`:
   ```bash
   cd api
   ```
2. Install dependencies (jika belum):
   ```bash
   npm install
   ```
3. Generate Prisma Client & Database (SQLite):
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```
4. Jalankan API Server:
   ```bash
   npm run start:dev
   ```
   *API Server akan berjalan di `http://localhost:3001`*

---

### **2. Jalankan Web Application (Next.js)**

1. Buka terminal baru dan masuk ke folder `web`:
   ```bash
   cd web
   ```
2. Install dependencies (jika belum):
   ```bash
   npm install
   ```
3. Jalankan Web Server dev:
   ```bash
   npm run dev
   ```
   *Aplikasi Web akan berjalan di `http://localhost:3000`*

---

## 🔑 Akun Demo Default (Dari Database Seeder)

- **Admin Bengkel**:
  - Email: `admin@bengkel.com`
  - Password: `admin123`
- **Customer**:
  - Email: `customer@bengkel.com`
  - Password: `customer123`
