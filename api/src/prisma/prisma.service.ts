import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    name: 'Servis Berkala & Ganti Oli',
    price: 150000,
    durationMinutes: 30,
    description: 'Pengecekan 20 titik komponen, ganti oli mesin, pencucian saringan udara, dan penyetelan rantai/cvt.',
  },
  {
    id: 'srv-2',
    name: 'Tune Up Injeksi & Carbon Cleaner',
    price: 350000,
    durationMinutes: 60,
    description: 'Pembersihan throttle body, ruang bakar dengan carbon cleaner, penyetelan klep, dan kalibrasi sensor.',
  },
  {
    id: 'srv-3',
    name: 'Servis Rem & Kaki-Kaki',
    price: 250000,
    durationMinutes: 45,
    description: 'Penggantian kampas rem depan/belakang, pengurasan minyak rem, dan pengecekan bearing roda.',
  },
  {
    id: 'srv-4',
    name: 'Pengecekan Kelistrikan & Ganti Aki',
    price: 450000,
    durationMinutes: 30,
    description: 'Pengujian alternator/spul, pengisian daya, dan penggantian aki baru garansi 6 bulan.',
  },
];

const DEFAULT_MECHANICS = [
  { id: 'mech-1', name: 'Budi Santoso', specialization: 'Mesin & Tune Up Injeksi', isAvailable: true },
  { id: 'mech-2', name: 'Agus Setiawan', specialization: 'Rem & Kaki-kaki', isAvailable: true },
  { id: 'mech-3', name: 'Eko Prasetyo', specialization: 'Kelistrikan & ECU', isAvailable: true },
];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to Supabase PostgreSQL database!');
      await this.seedInitialDataIfNeeded();
    } catch (e) {
      console.error('❌ Database connection error:', e);
    }
  }

  async seedInitialDataIfNeeded() {
    try {
      // 1. Seed Services into Supabase
      const srvCount = await this.service.count().catch(() => 0);
      if (srvCount === 0) {
        for (const s of DEFAULT_SERVICES) {
          await this.service.upsert({
            where: { id: s.id },
            update: {},
            create: s,
          }).catch(() => {});
        }
      }

      // 2. Seed Mechanics into Supabase
      const mechCount = await this.mechanic.count().catch(() => 0);
      if (mechCount === 0) {
        for (const m of DEFAULT_MECHANICS) {
          await this.mechanic.upsert({
            where: { id: m.id },
            update: {},
            create: m,
          }).catch(() => {});
        }
      }

      // 3. Seed Users & Vehicles into Supabase
      const userCount = await this.user.count().catch(() => 0);
      if (userCount === 0) {
        console.log('🌱 Seeding initial demo users into Supabase...');
        const adminPass = await bcrypt.hash('admin123', 10);
        const custPass = await bcrypt.hash('customer123', 10);

        const admin = await this.user.create({
          data: {
            id: 'usr-admin-1',
            name: 'Administrator Bengkel',
            email: 'admin@bengkel.com',
            password: adminPass,
            phone: '081234567890',
            role: 'ADMIN',
          },
        });

        const customer = await this.user.create({
          data: {
            id: 'usr-customer-1',
            name: 'Rudi Hermawan',
            email: 'customer@bengkel.com',
            password: custPass,
            phone: '085711223344',
            role: 'CUSTOMER',
          },
        });

        const vehicle = await this.vehicle.create({
          data: {
            id: 'veh-demo-1',
            userId: customer.id,
            brand: 'Honda',
            model: 'Vario 160',
            plateNumber: 'B 4567 KLS',
          },
        });

        await this.booking.create({
          data: {
            id: 'book-demo-1',
            userId: customer.id,
            vehicleId: vehicle.id,
            serviceId: 'srv-1',
            mechanicId: 'mech-1',
            date: new Date(),
            timeSlot: '09:00',
            status: 'DONE',
            notes: 'Harap periksa tarikan awal agak berat',
          },
        });

        console.log('✅ Supabase demo data successfully seeded!');
      }
    } catch (e) {
      console.error('Seed error:', e);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
