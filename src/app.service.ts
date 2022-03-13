import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client } from './Models/client.model';
import { Model } from 'mongoose';
import { Interval } from '@nestjs/schedule';
import { TeamSpeakClient } from 'node-ts';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(@InjectModel(Client.name) private clientModel: Model<Client>,
  private readonly configService: ConfigService){}

  @Interval(60000)
  async checkTSandUpdate() {
    this.logger.debug(`Updating based on teamspeak query`)
    const query = new TeamSpeakClient(this.configService.get("QUERY_URL"), parseInt(this.configService.get("QUERY_PORT")));
    const connected = await query.connect();

    await query.send("use", { sid: 1 });

    // Log in to use more features
    await query.send("login", {
      client_login_name: this.configService.get("QUERY_USER"),
      client_login_password: this.configService.get("QUERY_PW")
    });

    const clientList = await query.send("clientlist", {});


    for (let client of clientList.response) {
      // Exclude query clients
      if (client.client_type !== 1) {
        const clientInfo = await query.send("clientinfo", { clid: [client.clid, 1]} as any);
        console.log(clientInfo)
        let dbclient = await this.clientModel.findOneAndUpdate({
          teamspeakID: clientInfo.response[0].client_unique_identifier},
          {$inc : {'minutes' : 1}, name: clientInfo.response[0].client_nickname}
        ).exec()
        if (!dbclient){
          const newClient = await this.clientModel.create(
            {
              teamspeakID: clientInfo.response[0].client_unique_identifier,
              minutes: 1,
              name: clientInfo.response[0].client_nickname
            })
          await newClient.save()
        }
      }
    }

  }

  async getLeaderByConnectiontime(amount: number): Promise<Client[]>{
    this.logger.debug(`Getting top ${amount} clients from database`)
    return await this.clientModel.find().sort({minutes: -1}).limit(amount)  
  }
}
