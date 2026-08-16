import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

const expressApp = express();

function prepareVercelDb() {
  if (process.env.VERCEL) {
    try {
      const tmpDb = '/tmp/dev.db';
      if (!fs.existsSync(tmpDb)) {
        const candidatePaths = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'api', 'prisma', 'dev.db'),
          path.join(__dirname, '..', 'prisma', 'dev.db'),
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            fs.copyFileSync(p, tmpDb);
            break;
          }
        }
      }
      process.env.DATABASE_URL = 'file:/tmp/dev.db';
    } catch (e) {
      console.error('Db prepare error:', e);
    }
  }
}

let isInitialized = false;

async function initNest() {
  if (!isInitialized) {
    prepareVercelDb();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    isInitialized = true;
  }
}

export default async function handler(req: any, res: any) {
  await initNest();
  expressApp(req, res);
}
