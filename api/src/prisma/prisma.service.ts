import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  private async seedInitialDataIfNeeded() {
    try {
      const userCount = await this.user.count().catch(() => 0);
      if (userCount === 0) {
        console.log('🌱 Seeding initial demo data into Supabase...');
        const adminPass = await bcrypt.hash('admin123', 10);
        const custPass = await bcrypt.hash('customer123', 10);

        const admin = await this.user.create({
          data: {
            name: 'Administrator Bengkel',
            email: 'admin@bengkel.com',
            password: adminPass,
            phone: '081234567890',
            role: 'ADMIN',
          },
        });

        const customer = await this.user.create({
          data: {
            name: 'Rudi Hermawan',
            email: 'customer@bengkel.com',
            password: custPass,
            phone: '085711223344',
            role: 'CUSTOMER',
          },
        });

        const service1 = await this.service.create({
          data: {
            name: 'Servis Berkala & Ganti Oli',
            price: 150000,
            durationMinutes: 30,
            description: 'Pengecekan 20 titik komponen, ganti oli mesin, pencucian saringan udara, dan penyetelan rantai/cvt.',
          },
        });

        await this.service.create({
          data: {
            name: 'Tune Up Injeksi & Carbon Cleaner',
            price: 350000,
            durationMinutes: 60,
            description: 'Pembersihan throttle body, ruang bakar dengan carbon cleaner, penyetelan klep, dan kalibrasi sensor.',
          },
        });

        const mechanic1 = await this.mechanic.create({
          data: {
            name: 'Budi Santoso',
            specialization: 'Mesin & Tune Up Injeksi',
            isAvailable: true,
          },
        });

        await this.mechanic.create({
          data: {
            name: 'Agus Setiawan',
            specialization: 'Rem & Kaki-kaki',
            isAvailable: true,
          },
        });

        const vehicle = await this.vehicle.create({
          data: {
            userId: customer.id,
            brand: 'Honda',
            model: 'Vario 160',
            plateNumber: 'B 4567 KLS',
          },
        });

        await this.booking.create({
          data: {
            userId: customer.id,
            vehicleId: vehicle.id,
            serviceId: service1.id,
            mechanicId: mechanic1.id,
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
