import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, BookingStatus } from '../common/enums';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get('check-availability')
  async checkAvailability(
    @Query('date') date: string,
    @Query('mechanicId') mechanicId?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.bookingsService.checkAvailability(targetDate, mechanicId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  async findMyBookings(@Request() req) {
    return this.bookingsService.findMyBookings(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MECHANIC)
  @Get()
  async findAll(
    @Query('date') date?: string,
    @Query('status') status?: BookingStatus,
    @Query('mechanicId') mechanicId?: string,
  ) {
    return this.bookingsService.findAll({ date, status, mechanicId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('stats/revenue')
  async getRevenueStats() {
    return this.bookingsService.getRevenueStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MECHANIC)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }
}
