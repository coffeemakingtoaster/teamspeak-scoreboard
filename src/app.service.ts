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
    return await this.clientModel.find().sort({minutes: -1}).limit(amount)  
  }
}
