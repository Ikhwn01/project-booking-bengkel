import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

const DEFAULT_SERVICES = [
  {
    name: 'Servis Berkala & Ganti Oli',
    price: 150000,
    durationMinutes: 30,
    description: 'Pengecekan 20 titik komponen, ganti oli mesin, pencucian saringan udara, dan penyetelan rantai/cvt.',
  },
  {
    name: 'Tune Up Injeksi & Carbon Cleaner',
    price: 350000,
    durationMinutes: 60,
    description: 'Pembersihan throttle body, ruang bakar dengan carbon cleaner, penyetelan klep, dan kalibrasi sensor.',
  },
  {
    name: 'Servis Rem & Kaki-Kaki',
    price: 250000,
    durationMinutes: 45,
    description: 'Penggantian kampas rem depan/belakang, pengurasan minyak rem, dan pengecekan bearing roda.',
  },
  {
    name: 'Pengecekan Kelistrikan & Ganti Aki',
    price: 450000,
    durationMinutes: 30,
    description: 'Pengujian alternator/spul, pengisian daya, dan penggantian aki baru garansi 6 bulan.',
  },
];

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    let services = await this.prisma.service.findMany({
      orderBy: { price: 'asc' },
    }).catch(() => []);

    if (services.length === 0) {
      for (const s of DEFAULT_SERVICES) {
        await this.prisma.service.create({ data: s }).catch(() => {});
      }
      services = await this.prisma.service.findMany({
        orderBy: { price: 'asc' },
      }).catch(() => []);
    }

    if (services.length === 0) {
      return DEFAULT_SERVICES.map((s, idx) => ({
        id: `srv-${idx + 1}`,
        ...s,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    return services;
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: dto,
    });
  }

  async update(id: string, dto: Partial<CreateServiceDto>) {
    return this.prisma.service.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
