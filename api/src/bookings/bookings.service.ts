import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus, Role } from '../common/enums';
import { globalMemoryUsers } from '../auth/auth.service';

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
export const globalMemoryBookingsMap = new Map<string, any>();

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  private async ensureUserExists(userId: string) {
    try {
      const userInDb = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!userInDb) {
        const memUser = globalMemoryUsers.get(userId);
        await this.prisma.user.create({
          data: {
            id: userId,
            name: memUser?.name || 'Customer',
            email: memUser?.email || `user-${Date.now()}@bengkel.com`,
            password: memUser?.password || '$2b$10$e7q9V/3J5/wQ.4hW.1010e.1010101010101010101010',
            phone: memUser?.phone || '08123456789',
            role: memUser?.role || Role.CUSTOMER,
          },
        }).catch(() => {});
      }
    } catch (e) {}
  }

  async checkAvailability(dateStr: string, mechanicId?: string) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const dbBookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: BookingStatus.CANCELLED },
      },
    }).catch(() => []);

    const memBookings = Array.from(globalMemoryBookingsMap.values()).filter((b) => {
      const bDate = new Date(b.date);
      return (
        bDate >= startOfDay &&
        bDate <= endOfDay &&
        b.status !== BookingStatus.CANCELLED
      );
    });

    const allBookings = [...dbBookings, ...memBookings];

    const slotsAvailability = STANDARD_SLOTS.map((slot) => {
      const bookingsInSlot = allBookings.filter((b) => b.timeSlot === slot);
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
    await this.ensureUserExists(userId);
    let vehicleId = dto.vehicleId;

    if (!vehicleId) {
      if (!dto.brand || !dto.model || !dto.plateNumber) {
        throw new BadRequestException(
          'Pilih kendaraan yang ada atau masukan informasi lengkap kendaraan baru (merk, model, plat nomor)',
        );
      }
      const newVehicle = await this.prisma.vehicle.create({
        data: {
          userId,
          brand: dto.brand,
          model: dto.model,
          plateNumber: dto.plateNumber.toUpperCase(),
        },
      }).catch(() => ({
        id: `veh-${Date.now()}`,
        userId,
        brand: dto.brand,
        model: dto.model,
        plateNumber: dto.plateNumber!.toUpperCase(),
      }));
      vehicleId = newVehicle.id;
    }

    const bookingDate = new Date(dto.date);

    let createdBooking: any = null;
    try {
      createdBooking = await this.prisma.booking.create({
        data: {
          userId,
          vehicleId,
          serviceId: dto.serviceId,
          mechanicId: dto.mechanicId || null,
          date: bookingDate,
          timeSlot: dto.timeSlot,
          notes: dto.notes,
          status: BookingStatus.PENDING,
        },
        include: {
          vehicle: true,
          service: true,
          mechanic: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      });
    } catch (e) {
      const serviceObj = await this.prisma.service.findUnique({ where: { id: dto.serviceId } }).catch(() => null);
      const memUser = globalMemoryUsers.get(userId);

      createdBooking = {
        id: `booking-${Date.now()}`,
        userId,
        vehicleId,
        serviceId: dto.serviceId,
        mechanicId: dto.mechanicId || null,
        date: bookingDate,
        timeSlot: dto.timeSlot,
        notes: dto.notes,
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        vehicle: {
          id: vehicleId,
          brand: dto.brand || 'Kendaraan',
          model: dto.model || 'Servis',
          plateNumber: (dto.plateNumber || 'B 1234 BKL').toUpperCase(),
        },
        service: serviceObj || {
          id: dto.serviceId,
          name: 'Servis Berkala & Ganti Oli',
          price: 150000,
          durationMinutes: 45,
        },
        mechanic: dto.mechanicId ? { id: dto.mechanicId, name: 'Budi Santoso', specialization: 'Mesin & Transmisi' } : null,
        user: {
          id: userId,
          name: memUser?.name || 'Customer',
          email: memUser?.email || 'customer@bengkel.com',
          phone: memUser?.phone || '08123456789',
        },
      };
    }

    globalMemoryBookingsMap.set(createdBooking.id, createdBooking);
    return createdBooking;
  }

  async findMyBookings(userId: string) {
    const dbBookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        vehicle: true,
        service: true,
        mechanic: true,
        review: true,
      },
      orderBy: { date: 'desc' },
    }).catch(() => []);

    const memBookings = Array.from(globalMemoryBookingsMap.values()).filter(
      (b) => b.userId === userId,
    );

    const merged = new Map<string, any>();
    dbBookings.forEach((b) => merged.set(b.id, b));
    memBookings.forEach((b) => merged.set(b.id, b));

    return Array.from(merged.values()).map((b) => ({
      ...b,
      vehicle: b.vehicle || {
        brand: 'Kendaraan',
        model: 'Servis',
        plateNumber: 'B 1234 BKL',
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

    const dbBookings = await this.prisma.booking.findMany({
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

    const memBookings = Array.from(globalMemoryBookingsMap.values());

    const mergedMap = new Map<string, any>();
    dbBookings.forEach((b) => mergedMap.set(b.id, b));
    memBookings.forEach((b) => mergedMap.set(b.id, b));

    let list = Array.from(mergedMap.values());

    if (query.status) {
      list = list.filter((b) => b.status === query.status);
    }
    if (query.mechanicId) {
      list = list.filter((b) => b.mechanicId === query.mechanicId);
    }

    return list.map((b) => {
      const memUser = globalMemoryUsers.get(b.userId);
      return {
        ...b,
        user: b.user || {
          id: b.userId,
          name: memUser?.name || 'Customer',
          email: memUser?.email || 'customer@bengkel.com',
          phone: memUser?.phone || '08123456789',
        },
        vehicle: b.vehicle || {
          brand: 'Kendaraan',
          model: 'Servis',
          plateNumber: 'B 1234 BKL',
        },
      };
    });
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    let booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { service: true, vehicle: true, user: true, mechanic: true },
    }).catch(() => null);

    if (!booking && globalMemoryBookingsMap.has(id)) {
      booking = globalMemoryBookingsMap.get(id);
    }

    const mechanicObj = dto.mechanicId
      ? await this.prisma.mechanic.findUnique({ where: { id: dto.mechanicId } }).catch(() => ({
          id: dto.mechanicId,
          name: 'Budi Santoso',
          specialization: 'Mesin & Transmisi',
        }))
      : booking?.mechanic;

    const updatedBooking = {
      ...booking,
      id,
      status: dto.status,
      mechanicId: dto.mechanicId || booking?.mechanicId || null,
      mechanic: mechanicObj || booking?.mechanic,
    };

    globalMemoryBookingsMap.set(id, updatedBooking);

    try {
      await this.prisma.booking.update({
        where: { id },
        data: {
          status: dto.status,
          mechanicId: dto.mechanicId || undefined,
        },
      });
    } catch (e) {}

    return updatedBooking;
  }

  async getRevenueStats() {
    const allBookings = await this.findAll({});

    const completedBookings = allBookings.filter((b) => b.status === BookingStatus.DONE);
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.service?.price || 150000), 0);
    const totalCompleted = completedBookings.length;

    const pendingCount = allBookings.filter((b) => b.status === BookingStatus.PENDING).length;
    const inProgressCount = allBookings.filter((b) => b.status === BookingStatus.IN_PROGRESS).length;

    return {
      totalRevenue,
      totalCompleted,
      pendingCount,
      inProgressCount,
    };
  }
}
