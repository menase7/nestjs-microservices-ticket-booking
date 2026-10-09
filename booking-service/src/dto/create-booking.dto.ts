import { IsString, IsNumber, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  userId: string;

  @IsString()
  eventName: string;

  @IsNumber()
  @Min(1)
  ticketCount: number;

  @IsNumber()
  @Min(0)
  price: number;
}
