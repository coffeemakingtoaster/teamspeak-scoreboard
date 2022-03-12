import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client } from './Models/client.model';
import { Model } from 'mongoose';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(@InjectModel(Client.name) private clientModel: Model<Client>){
  }

  @Interval(60000)
  async checkTSandUpdate(){
    this.logger.debug(`Updating based on teamspeak query`)
  }

  async getLeaderByConnectiontime(amount: number): Promise<Client[]>{
    this.logger.debug(`Getting top ${amount} clients from database`)
    //TODO: Implement this
    return [{name: "test1", minutes: 11, teamspeakID: "123"},{name: "test2", minutes: 10, teamspeakID: "223"}]
  }
  
}
