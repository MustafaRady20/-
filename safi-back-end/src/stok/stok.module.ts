import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemPricingController } from 'src/stok/item-pricing/item-pricing.controller';
import { ItemPricingService } from 'src/stok/item-pricing/item-pricing.service';
import {
  ItemPricing,
  ItemPricingSchema,
} from 'src/stok/schema/item-pricing.schema';
import { Stock, StockSchema } from 'src/stok/schema/stock.schema';
import { StockController } from 'src/stok/stok.controller';
import { StockService } from 'src/stok/stok.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Stock.name, schema: StockSchema },
      { name: ItemPricing.name, schema: ItemPricingSchema },
    ]),
  ],
  controllers: [StockController, ItemPricingController],
  providers: [StockService, ItemPricingService],
  exports: [StockService, ItemPricingService],
})
export class StockModule {}
