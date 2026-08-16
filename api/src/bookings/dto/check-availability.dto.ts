import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckAvailabilityDto {
  @IsNotEmpty({ message: 'Tanggal harus diisi' })
  @IsString()
  date: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  mechanicId?: string;
}
