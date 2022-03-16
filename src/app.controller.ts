import { Controller, Get, Redirect, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly configService: ConfigService) {}

  @Get("/leaderboard")
  @Render("leaderboard")
  async getLeaderboard() {
    return  {clients: await this.appService.getLeaderByConnectiontime(parseInt(this.configService.get("LEADERBOARD_LENGTH")))}
  }

  @Get("/")
  @Redirect("/leaderboard")
  pass() {}
}
