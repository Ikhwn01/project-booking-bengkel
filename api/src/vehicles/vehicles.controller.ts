import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(req.user.id, dto);
  }

  @Get()
  async findMyVehicles(@Request() req) {
    return this.vehiclesService.findByUser(req.user.id);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.remove(id, req.user.id);
  }
}
