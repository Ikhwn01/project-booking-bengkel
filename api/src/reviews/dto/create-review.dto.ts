import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Booking ID harus diisi' })
  @IsString()
  bookingId: string;

  @IsNotEmpty({ message: 'Rating harus diisi' })
  @IsInt()
  @Min(1, { message: 'Rating minimal 1 bintang' })
  @Max(5, { message: 'Rating maksimal 5 bintang' })
  rating: number;

  @IsNotEmpty({ message: 'Ulasan harus diisi' })
  @IsString()
  comment: string;
}
