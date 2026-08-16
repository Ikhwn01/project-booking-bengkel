import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';

const DEFAULT_MECHANICS = [
  { id: 'mech-1', name: 'Budi Santoso', specialization: 'Mesin & Tune Up Injeksi', isAvailable: true },
  { id: 'mech-2', name: 'Agus Setiawan', specialization: 'Rem & Kaki-kaki', isAvailable: true },
  { id: 'mech-3', name: 'Eko Prasetyo', specialization: 'Kelistrikan & ECU', isAvailable: true },
];

@Injectable()
export class MechanicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const dbMechanics = await this.prisma.mechanic.findMany({
        orderBy: { name: 'asc' },
      });
      if (dbMechanics && dbMechanics.length > 0) {
        return dbMechanics;
      }
    } catch (e) {}
    return DEFAULT_MECHANICS;
  }

  async findAvailable() {
    try {
      const dbMechanics = await this.prisma.mechanic.findMany({
        where: { isAvailable: true },
        orderBy: { name: 'asc' },
      });
      if (dbMechanics && dbMechanics.length > 0) {
        return dbMechanics;
      }
    } catch (e) {}
    return DEFAULT_MECHANICS;
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
