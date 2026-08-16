import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama lengkap harus diisi' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Email harus diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsNotEmpty({ message: 'Password harus diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @IsNotEmpty({ message: 'Nomor HP harus diisi' })
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  role?: 'CUSTOMER' | 'ADMIN' | 'MECHANIC';
}
