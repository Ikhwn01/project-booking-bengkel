import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

let cachedServer: any;

function setupVercelSQLite() {
  if (process.env.VERCEL) {
    try {
      const tmpDbPath = '/tmp/dev.db';
      const srcDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(srcDbPath)) {
        fs.copyFileSync(srcDbPath, tmpDbPath);
      }
      process.env.DATABASE_URL = 'file:/tmp/dev.db';
    } catch (e) {
      console.error('Vercel SQLite setup error:', e);
    }
  }
}

async function createServer() {
  setupVercelSQLite();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await createServer();
  }
  return cachedServer(req, res);
}

if (!process.env.VERCEL) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`API Server running on http://localhost:${port}`);
  }
  bootstrap();
}
