import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'OK',
      message: 'AutoFix Express NestJS Backend API Server is running',
      version: '1.0.0',
      availableEndpoints: {
        frontendUI: 'http://localhost:3000',
        services: 'http://localhost:3001/services',
        mechanics: 'http://localhost:3001/mechanics',
        bookingsAvailability: 'http://localhost:3001/bookings/check-availability',
      },
    };
  }
}
