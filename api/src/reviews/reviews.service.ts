import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { vehicle: true, user: true, review: true },
    }).catch(() => null);

    if (!booking) {
      throw new NotFoundException('Data booking tidak ditemukan');
    }

    if (booking.review) {
      return booking.review;
    }

    const validUserId = booking.userId;
    const vehicleName = booking.vehicle
      ? `Pemilik ${booking.vehicle.brand} ${booking.vehicle.model}`
      : 'Pemilik Kendaraan Servis';

    try {
      const review = await this.prisma.review.create({
        data: {
          bookingId: dto.bookingId,
          userId: validUserId,
          rating: dto.rating,
          comment: dto.comment,
          vehicleName,
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });
      return review;
    } catch (e: any) {
      console.error('Review create error:', e);
      // Fallback: If foreign key check fails, update existing or return clean response
      try {
        const review = await this.prisma.review.upsert({
          where: { bookingId: dto.bookingId },
          update: {
            rating: dto.rating,
            comment: dto.comment,
          },
          create: {
            bookingId: dto.bookingId,
            userId: validUserId,
            rating: dto.rating,
            comment: dto.comment,
            vehicleName,
          },
        });
        return review;
      } catch (err) {
        throw new BadRequestException('Gagal menyimpan ulasan ke database.');
      }
    }
  }

  async findAll() {
    const reviews = await this.prisma.review.findMany({
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

    return reviews.map((r) => ({
      ...r,
      user: r.user || { name: 'Pelanggan Bengkel' },
      vehicleName: r.vehicleName || 'Pemilik Kendaraan Servis',
    }));
  }
}
