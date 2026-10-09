import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('health')
  healthCheck() {
    return { status: 'UP', service: 'booking-service', timestamp: new Date() };
  }

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return await this.bookingService.createBooking(createBookingDto);
  }
}
