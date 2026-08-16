import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    name: 'Servis Berkala & Ganti Oli',
    price: 150000,
    durationMinutes: 30,
    description: 'Pengecekan 20 titik komponen, ganti oli mesin, pencucian saringan udara, dan penyetelan rantai/cvt.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    name: 'Tune Up Injeksi & Carbon Cleaner',
    price: 350000,
    durationMinutes: 60,
    description: 'Pembersihan throttle body, ruang bakar dengan carbon cleaner, penyetelan klep, dan kalibrasi sensor.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    name: 'Servis Rem & Kaki-Kaki',
    price: 250000,
    durationMinutes: 45,
    description: 'Penggantian kampas rem depan/belakang, pengurasan minyak rem, dan pengecekan bearing roda.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    name: 'Pengecekan Kelistrikan & Ganti Aki',
    price: 450000,
    durationMinutes: 30,
    description: 'Pengujian alternator/spul, pengisian daya, dan penggantian aki baru garansi 6 bulan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const dbServices = await this.prisma.service.findMany({
        orderBy: { price: 'asc' },
      });
      if (dbServices && dbServices.length > 0) {
        return dbServices;
      }
    } catch (e) {}

    try {
      for (const s of DEFAULT_SERVICES) {
        await this.prisma.service.create({
          data: {
            id: s.id,
            name: s.name,
            price: s.price,
            durationMinutes: s.durationMinutes,
            description: s.description,
          },
        }).catch(() => {});
      }
    } catch (e) {}

    return DEFAULT_SERVICES;
  }

  async findOne(id: string) {
    let service = await this.prisma.service.findUnique({
      where: { id },
    }).catch(() => null);

    if (!service) {
      service = DEFAULT_SERVICES.find((s) => s.id === id) || (DEFAULT_SERVICES[0] as any);
    }
    return service;
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
