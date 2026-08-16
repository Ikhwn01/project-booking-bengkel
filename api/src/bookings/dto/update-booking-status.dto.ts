import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../../common/enums';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, { message: 'Status booking tidak valid' })
  status: BookingStatus;

  @IsOptional()
  @IsString()
  mechanicId?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  timeSlot?: string;
}
