import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateItemPricingDto,
  UpdateItemPricingDto,
} from 'src/stok/dtos/create-item-pricing.dto';
import {
  ItemPricing,
  ItemPricingDocument,
} from 'src/stok/schema/item-pricing.schema';

@Injectable()
export class ItemPricingService {
  constructor(
    @InjectModel(ItemPricing.name)
    private itemPricingModel: Model<ItemPricingDocument>,
  ) {}

  async create(
    createItemPricingDto: CreateItemPricingDto,
  ): Promise<ItemPricing> {
    const createdItemPricing = new this.itemPricingModel(createItemPricingDto);
    return createdItemPricing.save();
  }

  async findAll(): Promise<ItemPricing[]> {
    return this.itemPricingModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<ItemPricing> {
    const itemPricing = await this.itemPricingModel.findById(id).exec();
    if (!itemPricing) {
      throw new NotFoundException(`Item pricing with ID ${id} not found`);
    }
    return itemPricing;
  }

  async findByType(itemType: string): Promise<ItemPricing> {
    const itemPricing = await this.itemPricingModel
      .findOne({
        itemType,
        isActive: true,
      })
      .exec();
    if (!itemPricing) {
      throw new NotFoundException(
        `Item pricing for type ${itemType} not found`,
      );
    }
    return itemPricing;
  }

  async update(
    id: string,
    updateItemPricingDto: UpdateItemPricingDto,
  ): Promise<ItemPricing> {
    const updatedItemPricing = await this.itemPricingModel
      .findByIdAndUpdate(id, updateItemPricingDto, { new: true })
      .exec();
    if (!updatedItemPricing) {
      throw new NotFoundException(`Item pricing with ID ${id} not found`);
    }
    return updatedItemPricing;
  }

  async remove(id: string): Promise<void> {
    const result = await this.itemPricingModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Item pricing with ID ${id} not found`);
    }
  }
}
