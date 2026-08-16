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
      throw new BadRequestException('Anda sudah memberikan ulasan untuk booking servis ini');
    }

    const vehicleName = booking.vehicle
      ? `Pemilik ${booking.vehicle.brand} ${booking.vehicle.model}`
      : 'Pemilik Kendaraan Servis';

    const review = await this.prisma.review.create({
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

    return review;
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
