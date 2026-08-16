import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to Database Cloud successfully!');

      // Ensure Supabase tables exist
      exec('npx prisma db push --accept-data-loss', (err, stdout) => {
        if (!err) {
          console.log('✅ Prisma DB Push to Supabase completed successfully');
        }
      });
    } catch (e) {
      console.error('❌ Prisma Cloud Database connect error:', e);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
