import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

function resolveDatabaseUrl() {
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'api', 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try {
            fs.copyFileSync(p, tmpDbPath);
          } catch (err) {
            console.error('Failed to copy dev.db:', err);
          }
          break;
        }
      }
    }
    return 'file:/tmp/dev.db';
  }
  return process.env.DATABASE_URL || 'file:./dev.db';
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: resolveDatabaseUrl(),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
