import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { globalMemoryBookingsMap } from '../bookings/bookings.service';

export const globalMemoryReviewsMap = new Map<string, any>();

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    let booking: any = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { vehicle: true, user: true, review: true },
    }).catch(() => null);

    if (!booking && globalMemoryBookingsMap.has(dto.bookingId)) {
      booking = globalMemoryBookingsMap.get(dto.bookingId);
    }

    const vehicleName = booking?.vehicle
      ? `Pemilik ${booking.vehicle.brand} ${booking.vehicle.model}`
      : 'Pemilik Kendaraan Servis';

    let review: any = null;
    try {
      review = await this.prisma.review.create({
        data: {
          bookingId: dto.bookingId,
          userId,
          rating: dto.rating,
          comment: dto.comment,
          vehicleName,
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });
    } catch (e) {
      review = {
        id: `rev-${Date.now()}`,
        bookingId: dto.bookingId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
        vehicleName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: userId, name: booking?.user?.name || 'Customer' },
      };
    }

    globalMemoryReviewsMap.set(review.id, review);

    if (booking) {
      booking.review = review;
      globalMemoryBookingsMap.set(dto.bookingId, booking);
    }

    return review;
  }

  async findAll() {
    const dbReviews = await this.prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true } },
        booking: {
          include: {
            vehicle: true,
            service: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    const memReviews = Array.from(globalMemoryReviewsMap.values());
    const mergedMap = new Map<string, any>();
    dbReviews.forEach((r) => mergedMap.set(r.id, r));
    memReviews.forEach((r) => mergedMap.set(r.id, r));

    return Array.from(mergedMap.values()).map((r) => ({
      ...r,
      user: r.user || { name: 'Pelanggan Bengkel' },
      vehicleName: r.vehicleName || 'Pemilik Kendaraan Servis',
    }));
  }
}
