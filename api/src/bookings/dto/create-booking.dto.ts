import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  vehicleId?: string;

  // Jika kendaraan baru diinput langsung di form booking
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsNotEmpty({ message: 'Layanan servis harus dipilih' })
  @IsString()
  serviceId: string;

  @IsOptional()
  @IsString()
  mechanicId?: string;

  @IsNotEmpty({ message: 'Tanggal booking harus dipilih' })
  @IsString()
  date: string; // Format: YYYY-MM-DD

  @IsNotEmpty({ message: 'Jam slot harus dipilih' })
  @IsString()
  timeSlot: string; // Contoh: "09:00"

  @IsOptional()
  @IsString()
  notes?: string;
}
