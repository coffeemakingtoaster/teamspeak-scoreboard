import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client } from './Models/client.model';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TeamSpeakClient } from 'node-ts';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectModel(Client.name) private clientModel: Model<Client>,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkTSandUpdate() {
    this.logger.debug(`Updating based on teamspeak query`);
    const query = new TeamSpeakClient(
      this.configService.get('QUERY_URL'),
      parseInt(this.configService.get('QUERY_PORT')),
    );
    try {
      await query.connect();
    } catch (error) {
      this.logger.error(`Error connecting to teamspeak: ${error}`);
    }

    await query.send('use', { sid: 1 });

    // Log in to use more features
    await query.send('login', {
      client_login_name: this.configService.get('QUERY_USER'),
      client_login_password: this.configService.get('QUERY_PW'),
    });

    const clientList = await query.send('clientlist', {});

    const client_infos = [];

    for (const client of clientList.response) {
      if (client.client_type === 1) {
        continue;
      }

      const clientInfo = await query.send('clientinfo', { clid: client.clid });
      if (!clientInfo) {
        this.logger.error(
          `Error getting clientinfo for ${client.client_nickname}`,
        );
        continue;
      }
      client_infos.push(clientInfo.response[0]);
    }

    for (const client of client_infos) {
      // Exclude query clients
      if (client.client_type !== 1) {
        // Add afk minute
        if (client.client_idle_time >= 180000) {
          this.logger.debug(
            `Client ${client.client_nickname} has been idle for more than 3 minutes`,
          );
          // This should never occur for a client that does not yet exist in DB
          await this.clientModel
            .findOneAndUpdate(
              {
                teamspeakID: client.client_unique_identifier,
              },
              { $inc: { idle_warns: 1 } },
            )
            .exec();
          continue;
        }

        this.logger.debug(
          client_infos.filter(
            (c) =>
              c.client_channel_group_inherited_channel_id ===
              client.client_channel_group_inherited_channel_id,
          ).length,
        );

        // Client is not afk but alone in channel => counts as idle and therefore no minutes added
        if (
          client_infos.filter(
            (c) =>
              c.client_channel_group_inherited_channel_id ===
              client.client_channel_group_inherited_channel_id,
          ).length <= 2
        ) {
          this.logger.debug(
            `Client ${client.client_nickname} is alone in channel`,
          );
          continue;
        }

        const dbclient = await this.clientModel
          .findOneAndUpdate(
            {
              teamspeakID: client.client_unique_identifier,
            },
            { $inc: { minutes: 1 }, name: client.client_nickname },
          )
          .exec();

        if (!dbclient) {
          const newClient = await this.clientModel.create({
            teamspeakID: client.client_unique_identifier,
            minutes: 1,
            name: client.client_nickname,
          });
          await newClient.save();
        }
      }
    }
  }

  async getLeaderByConnectiontime(amount: number): Promise<Client[]> {
    this.logger.debug(`Getting top ${amount} clients from database`);
    return await this.clientModel.find().sort({ minutes: -1 }).limit(amount);
  }
}
