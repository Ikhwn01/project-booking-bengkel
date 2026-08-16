import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';

const DEFAULT_MECHANICS = [
  { name: 'Budi Santoso', specialization: 'Mesin & Tune Up Injeksi', isAvailable: true },
  { name: 'Agus Setiawan', specialization: 'Rem & Kaki-kaki', isAvailable: true },
  { name: 'Eko Prasetyo', specialization: 'Kelistrikan & ECU', isAvailable: true },
];

@Injectable()
export class MechanicsService {
  constructor(private prisma: PrismaService) {}

  private async ensureDefaultMechanics() {
    let mechanics = await this.prisma.mechanic.findMany().catch(() => []);
    if (mechanics.length === 0) {
      for (const m of DEFAULT_MECHANICS) {
        await this.prisma.mechanic.create({ data: m }).catch(() => {});
      }
    }
  }

  async findAll() {
    await this.ensureDefaultMechanics();
    let mechanics = await this.prisma.mechanic.findMany({
      orderBy: { name: 'asc' },
    }).catch(() => []);

    if (mechanics.length === 0) {
      return DEFAULT_MECHANICS.map((m, idx) => ({
        id: `mech-${idx + 1}`,
        ...m,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    return mechanics;
  }

  async findAvailable() {
    await this.ensureDefaultMechanics();
    let mechanics = await this.prisma.mechanic.findMany({
      where: { isAvailable: true },
      orderBy: { name: 'asc' },
    }).catch(() => []);

    if (mechanics.length === 0) {
      return DEFAULT_MECHANICS.map((m, idx) => ({
        id: `mech-${idx + 1}`,
        ...m,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    return mechanics;
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
