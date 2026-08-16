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

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: BookingStatus.CANCELLED,
        },
      },
    });

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
      });
      vehicleId = newVehicle.id;
    }

    const bookingDate = new Date(dto.date);
    const startOfDay = new Date(new Date(dto.date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(dto.date).setHours(23, 59, 59, 999));

    const userExistingBooking = await this.prisma.booking.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
        timeSlot: dto.timeSlot,
        status: { not: BookingStatus.CANCELLED },
      },
    });
    if (userExistingBooking) {
      throw new BadRequestException('Anda sudah memiliki jadwal servis aktif pada jam dan tanggal ini');
    }

    const slotBookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        timeSlot: dto.timeSlot,
        status: { not: BookingStatus.CANCELLED },
      },
    });

    if (slotBookings.length >= MAX_BAY_CAPACITY_PER_SLOT) {
      throw new BadRequestException(`Slot jam ${dto.timeSlot} sudah penuh. Silakan pilih slot jam lain.`);
    }

    if (dto.mechanicId) {
      const mechanicBooked = slotBookings.some((b) => b.mechanicId === dto.mechanicId);
      if (mechanicBooked) {
        throw new BadRequestException('Mekanik yang dipilih sudah bertugas pada jam dan tanggal tersebut.');
      }
    }

    return this.prisma.booking.create({
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
  }

  async findMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        vehicle: true,
        service: true,
        mechanic: true,
        review: true,
      },
      orderBy: { date: 'desc' },
    });
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

    return this.prisma.booking.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        vehicle: true,
        service: true,
        mechanic: true,
        review: true,
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    });
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Data booking tidak ditemukan');
    }

    const dataToUpdate: any = {
      status: dto.status,
    };

    if (dto.mechanicId !== undefined) {
      dataToUpdate.mechanicId = dto.mechanicId;
    }

    if (dto.date && dto.timeSlot) {
      dataToUpdate.date = new Date(dto.date);
      dataToUpdate.timeSlot = dto.timeSlot;
    }

    return this.prisma.booking.update({
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
  }

  async getRevenueStats() {
    const completedBookings = await this.prisma.booking.findMany({
      where: { status: BookingStatus.DONE },
      include: { service: true },
    });

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);
    const totalCompleted = completedBookings.length;

    const pendingCount = await this.prisma.booking.count({
      where: { status: BookingStatus.PENDING },
    });

    const inProgressCount = await this.prisma.booking.count({
      where: { status: BookingStatus.IN_PROGRESS },
    });

    return {
      totalRevenue,
      totalCompleted,
      pendingCount,
      inProgressCount,
    };
  }
}
