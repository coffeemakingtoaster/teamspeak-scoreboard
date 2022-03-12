import { Logger, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.LOGLEVEL.split(',') as LogLevel[]
});
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  await app.listen(+process.env.PORT || 3001, () =>
  Logger.log(`Nest listening on ${process.env.HOST}`, 'Bootstrap')
);
}
bootstrap();
