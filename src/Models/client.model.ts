import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema()
export class Client {
  @Prop({required: true})
  name: string;

  @Prop({required: true, unique: true})
  teamspeakID: string

  @Prop({default: 0})
  minutes: number;

  @Prop({default: 0})
  idle_warns: number;
}

export const ClientSchema = SchemaFactory.createForClass(Client)
export type ClientDocument = Client & Document;