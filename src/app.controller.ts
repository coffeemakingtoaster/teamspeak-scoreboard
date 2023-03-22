import {
  Controller,
  Get,
  Logger,
  Query,
  Redirect,
  Render,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/leaderboard')
  @Render('leaderboard')
  async getLeaderboard() {
    return {
      clients: await this.appService.getLeaderByConnectiontime(
        parseInt(this.configService.get('LEADERBOARD_LENGTH')),
      ),
    };
  }

  @Get('/')
  @Redirect('/leaderboard')
  pass() {
    this.logger.debug('Redirected lost soul to leaderboard');
  }

  @Get('/api/leaderboard')
  async getLeaderboardAPI(@Query('amount') amount: number) {
    if (amount === undefined) {
      amount = parseInt(this.configService.get('LEADERBOARD_LENGTH'));
    }
    return { clients: await this.appService.getLeaderByConnectiontime(amount) };
  }
}
