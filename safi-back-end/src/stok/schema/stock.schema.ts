import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { nanoid } from 'nanoid';

export type StockDocument = Stock & Document;

@Schema({ timestamps: true })
export class Stock {
  @Prop({ required: true })
  visitorName: string;

  @Prop({ unique: true })
  serialNumber: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true, min: 0 })
  numberOfBigItems: number;

  @Prop({ required: true, min: 0 })
  numberOfSmallItems: number;

  @Prop({ required: true, min: 0 })
  numberOfElectricalItems: number;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ required: true })
  enterTime: Date;

  @Prop()
  exitTime: Date;

  @Prop({ default: 0 })
  daysStayed: number;

  createdAt: Date;
  updatedAt: Date;
}

export const StockSchema = SchemaFactory.createForClass(Stock);

StockSchema.pre<StockDocument>('save', function (next) {
  if (!this.serialNumber) {
    this.serialNumber = nanoid(10); // هيطلع حاجة زي: "NGT5X2kL9a"
  }
  next();
});
