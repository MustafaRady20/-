import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemPricingDocument = ItemPricing & Document;

@Schema({ timestamps: true })
export class ItemPricing {
  @Prop({ required: true, unique: true })
  itemType: string; // 'big' or 'small'

  @Prop({ required: true, min: 0 })
  pricePerDay: number;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ItemPricingSchema = SchemaFactory.createForClass(ItemPricing);
