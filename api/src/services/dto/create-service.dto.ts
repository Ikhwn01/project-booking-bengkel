import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty({ message: 'Nama layanan harus diisi' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Harga harus diisi' })
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty({ message: 'Estimasi durasi harus diisi' })
  @IsNumber()
  @Min(5)
  durationMinutes: number;

  @IsOptional()
  @IsString()
  description?: string;
}
