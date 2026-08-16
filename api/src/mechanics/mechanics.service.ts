import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';

@Injectable()
export class MechanicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mechanic.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAvailable() {
    return this.prisma.mechanic.findMany({
      where: { isAvailable: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateMechanicDto) {
    return this.prisma.mechanic.create({
      data: dto,
    });
  }

  async update(id: string, dto: Partial<CreateMechanicDto>) {
    return this.prisma.mechanic.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.mechanic.delete({
      where: { id },
    });
  }
}
