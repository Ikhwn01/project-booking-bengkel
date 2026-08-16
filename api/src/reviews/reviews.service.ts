import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingStatus } from '../common/enums';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { vehicle: true, user: true, review: true },
    });

    if (!booking) {
      throw new NotFoundException('Data booking tidak ditemukan');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('Anda tidak berhak memberi ulasan pada booking ini');
    }

    if (booking.status !== BookingStatus.DONE) {
      throw new BadRequestException('Ulasan hanya dapat diberikan jika servis sudah selesai (DONE)');
    }

    if (booking.review) {
      throw new BadRequestException('Anda sudah memberikan ulasan untuk booking servis ini');
    }

    const vehicleName = `Pemilik ${booking.vehicle.brand} ${booking.vehicle.model}`;

    return this.prisma.review.create({
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
  }

  async findAll() {
    return this.prisma.review.findMany({
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
    });
  }
}
