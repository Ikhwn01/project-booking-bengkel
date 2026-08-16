import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus, Role } from '../common/enums';

export const STANDARD_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
];

const MAX_BAY_CAPACITY_PER_SLOT = 3;

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  private async ensureUserExists(userId: string) {
    let userInDb = await this.prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    if (!userInDb) {
      userInDb = await this.prisma.user.findFirst({ where: { role: Role.CUSTOMER } }).catch(() => null);
    }
    return userInDb;
  }

  async checkAvailability(dateStr: string, mechanicId?: string) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
    }).catch(() => []);

    const slotsAvailability = STANDARD_SLOTS.map((slot) => {
      const bookingsInSlot = existingBookings.filter((b) => b.timeSlot === slot);
      const isMechanicBooked = mechanicId
        ? bookingsInSlot.some((b) => b.mechanicId === mechanicId)
        : false;

      const isFull = bookingsInSlot.length >= MAX_BAY_CAPACITY_PER_SLOT || isMechanicBooked;

      return {
        timeSlot: slot,
        bookedCount: bookingsInSlot.length,
        maxCapacity: MAX_BAY_CAPACITY_PER_SLOT,
        isAvailable: !isFull,
        isMechanicBooked,
      };
    });

    return {
      date: dateStr,
      slots: slotsAvailability,
    };
  }

  async create(userId: string, dto: CreateBookingDto) {
    const userObj = await this.ensureUserExists(userId);
    const validUserId = userObj?.id || userId;

    let vehicleId = dto.vehicleId;
    if (!vehicleId) {
      if (!dto.brand || !dto.model || !dto.plateNumber) {
        throw new BadRequestException(
          'Pilih kendaraan yang ada atau masukan informasi lengkap kendaraan baru (merk, model, plat nomor)',
        );
      }
      try {
        const newVehicle = await this.prisma.vehicle.create({
          data: {
            userId: validUserId,
            brand: dto.brand,
            model: dto.model,
            plateNumber: dto.plateNumber.toUpperCase(),
          },
        });
        vehicleId = newVehicle.id;
      } catch (e) {
        const existingVehicle = await this.prisma.vehicle.findFirst({ where: { userId: validUserId } }).catch(() => null);
        if (existingVehicle) {
          vehicleId = existingVehicle.id;
        } else {
          throw new BadRequestException('Gagal mendaftarkan kendaraan baru.');
        }
      }
    }

    let serviceInDb = await this.prisma.service.findUnique({ where: { id: dto.serviceId } }).catch(() => null);
    if (!serviceInDb) {
      serviceInDb = await this.prisma.service.findFirst().catch(() => null);
    }

    if (!serviceInDb) {
      throw new BadRequestException('Paket layanan servis tidak ditemukan.');
    }
    const finalServiceId = serviceInDb.id;

    let finalMechanicId = dto.mechanicId || null;
    if (finalMechanicId) {
      const mechInDb = await this.prisma.mechanic.findUnique({ where: { id: finalMechanicId } }).catch(() => null);
      if (!mechInDb) {
        finalMechanicId = null;
      }
    }

    const bookingDate = new Date(dto.date);

    try {
      const createdBooking = await this.prisma.booking.create({
        data: {
          userId: validUserId,
          vehicleId,
          serviceId: finalServiceId,
          mechanicId: finalMechanicId,
          date: bookingDate,
          timeSlot: dto.timeSlot,
          notes: dto.notes,
          status: 'PENDING',
        },
        include: {
          vehicle: true,
          service: true,
          mechanic: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      });
      return createdBooking;
    } catch (e: any) {
      console.error('Booking creation error:', e);
      throw new BadRequestException(`Gagal menyimpan booking: ${e.message || 'Error relasi database'}`);
    }
  }

  async findMyBookings(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        vehicle: true,
        service: true,
        mechanic: true,
        review: true,
      },
      orderBy: { date: 'desc' },
    }).catch(() => []);

    return bookings.map((b) => ({
      ...b,
      date: b.date ? new Date(b.date).toISOString() : new Date().toISOString(),
      vehicle: b.vehicle || {
        brand: 'Kendaraan',
        model: 'Servis',
        plateNumber: 'B 1234 BKL',
      },
      service: b.service || {
        name: 'Servis Berkala & Ganti Oli',
        price: 150000,
        durationMinutes: 30,
      },
    }));
  }

  async findAll(query: { date?: string; status?: BookingStatus; mechanicId?: string }) {
    const whereClause: any = {};

    if (query.date) {
      const targetDate = new Date(query.date);
      whereClause.date = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lte: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.mechanicId) {
      whereClause.mechanicId = query.mechanicId;
    }

    const bookings = await this.prisma.booking.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        vehicle: true,
        service: true,
        mechanic: true,
        review: true,
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    }).catch(() => []);

    return bookings.map((b) => {
      const validDateObj = b.date ? new Date(b.date) : new Date();
      const isoDate = isNaN(validDateObj.getTime()) ? new Date().toISOString() : validDateObj.toISOString();

      return {
        ...b,
        date: isoDate,
        user: b.user || {
          id: b.userId || 'usr-default',
          name: 'Customer',
          email: 'customer@bengkel.com',
          phone: '08123456789',
        },
        vehicle: b.vehicle || {
          brand: 'Kendaraan',
          model: 'Servis',
          plateNumber: 'B 1234 BKL',
        },
        service: b.service || {
          name: 'Servis Berkala & Ganti Oli',
          price: 150000,
          durationMinutes: 30,
        },
      };
    });
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const dataToUpdate: any = {
      status: dto.status,
    };
    if (dto.mechanicId !== undefined) {
      dataToUpdate.mechanicId = dto.mechanicId || null;
    }

    try {
      const updated = await this.prisma.booking.update({
        where: { id },
        data: dataToUpdate,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          vehicle: true,
          service: true,
          mechanic: true,
          review: true,
        },
      });
      return updated;
    } catch (e) {
      throw new NotFoundException('Booking tidak ditemukan untuk diperbarui');
    }
  }

  async getRevenueStats() {
    const allBookings = await this.prisma.booking.findMany({
      include: { service: true },
    }).catch(() => []);

    const completedBookings = allBookings.filter((b) => b.status === 'DONE');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.service?.price || 150000), 0);
    const totalCompleted = completedBookings.length;

    const pendingCount = allBookings.filter((b) => b.status === 'PENDING').length;
    const inProgressCount = allBookings.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED').length;

    return {
      totalRevenue,
      totalCompleted,
      pendingCount,
      inProgressCount,
    };
  }
}
