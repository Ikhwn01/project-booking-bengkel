import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Role, BookingStatus } from '../src/common/enums';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Reset / Clear tables
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Create Passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Administrator Bengkel',
      email: 'admin@bengkel.com',
      password: adminPassword,
      phone: '081234567890',
      role: Role.ADMIN,
    },
  });

  // 2. Create Customer User
  const customer = await prisma.user.create({
    data: {
      name: 'Rudi Hermawan',
      email: 'customer@bengkel.com',
      password: customerPassword,
      phone: '085711223344',
      role: Role.CUSTOMER,
    },
  });

  // 3. Create Services
  const service1 = await prisma.service.create({
    data: {
      name: 'Servis Berkala & Ganti Oli',
      price: 150000,
      durationMinutes: 30,
      description: 'Pengecekan 20 titik komponen, ganti oli mesin, pencucian saringan udara, dan penyetelan rantai/cvt.',
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Tune Up Injeksi & Carbon Cleaner',
      price: 350000,
      durationMinutes: 60,
      description: 'Pembersihan throttle body, ruang bakar dengan carbon cleaner, penyetelan klep, dan kalibrasi sensor.',
    },
  });

  const service3 = await prisma.service.create({
    data: {
      name: 'Servis Rem & Kaki-Kaki',
      price: 250000,
      durationMinutes: 45,
      description: 'Penggantian kampas rem depan/belakang, pengurasan minyak rem, dan pengecekan bearing roda.',
    },
  });

  const service4 = await prisma.service.create({
    data: {
      name: 'Pengecekan Kelistrikan & Ganti Aki',
      price: 450000,
      durationMinutes: 30,
      description: 'Pengujian alternator/spul, pengisian daya, dan penggantian aki baru garansi 6 bulan.',
    },
  });

  // 4. Create Mechanics
  const mechanic1 = await prisma.mechanic.create({
    data: {
      name: 'Budi Santoso',
      specialization: 'Mesin & Tune Up Injeksi',
      isAvailable: true,
    },
  });

  const mechanic2 = await prisma.mechanic.create({
    data: {
      name: 'Agus Setiawan',
      specialization: 'Rem & Kaki-kaki',
      isAvailable: true,
    },
  });

  const mechanic3 = await prisma.mechanic.create({
    data: {
      name: 'Eko Prasetyo',
      specialization: 'Kelistrikan & ECU',
      isAvailable: true,
    },
  });

  // 5. Create Vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      userId: customer.id,
      brand: 'Honda',
      model: 'Vario 160',
      plateNumber: 'B 4567 KLS',
    },
  });

  // 6. Create Demo Booking
  const todayStr = new Date().toISOString().split('T')[0];
  await prisma.booking.create({
    data: {
      userId: customer.id,
      vehicleId: vehicle.id,
      serviceId: service1.id,
      mechanicId: mechanic1.id,
      date: new Date(todayStr),
      timeSlot: '09:00',
      status: BookingStatus.CONFIRMED,
      notes: 'Harap periksa tarikan awal agak berat',
    },
  });

  console.log('✅ Database successfully seeded!');
  console.log(`🔑 Admin Credentials: email=admin@bengkel.com password=admin123`);
  console.log(`🔑 Customer Credentials: email=customer@bengkel.com password=customer123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
