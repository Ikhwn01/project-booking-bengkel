import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMechanicDto {
  @IsNotEmpty({ message: 'Nama mekanik harus diisi' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Spesialisasi harus diisi' })
  @IsString()
  specialization: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
