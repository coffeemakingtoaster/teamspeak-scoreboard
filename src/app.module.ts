import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Client, ClientSchema } from './Models/client.model';

@Module({
  imports: [
     // This has to be done to ensure that env variables work
     ConfigModule.forRoot({
      envFilePath: ['.env']
  }),
  MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
          uri: configService.get<string>('DB_URI'),
          user: configService.get<string>('DB_USER'),
          pass: configService.get<string>('DB_PASS')
      }),
      inject: [ConfigService]
  }),
  MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema}]),
  ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
