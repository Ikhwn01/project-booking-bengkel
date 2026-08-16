import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsNotEmpty({ message: 'Merk kendaraan harus diisi' })
  @IsString()
  brand: string;

  @IsNotEmpty({ message: 'Model kendaraan harus diisi' })
  @IsString()
  model: string;

  @IsNotEmpty({ message: 'Plat nomor harus diisi' })
  @IsString()
  plateNumber: string;
}
