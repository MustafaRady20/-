import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStockDto, UpdateStockDto } from 'src/stok/dtos/create-stock.dto';
import { ItemPricingService } from 'src/stok/item-pricing/item-pricing.service';
import { Stock, StockDocument } from 'src/stok/schema/stock.schema';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    private itemPricingService: ItemPricingService,
  ) {}

  async create(createStockDto: CreateStockDto) {
    const createdStock = new this.stockModel({
      ...createStockDto,
      enterTime: new Date(createStockDto.enterTime),
      date: new Date(),
    });
    return createdStock.save();
  }

  async findAll(): Promise<Stock[]> {
    return this.stockModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Stock> {
    const stock = await this.stockModel.findById(id).exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return stock;
  }

  async findBySerialNumber(serialNumber: string) {
    const stock = await this.stockModel.findOne({ serialNumber }).exec();
    if (!stock) {
      throw new NotFoundException(
        `Stock with serial number ${serialNumber} not found`,
      );
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto) {
    const stock = await this.stockModel.findById(id).exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    // If exitTime is provided, calculate the total price
    if (updateStockDto.exitTime) {
      const exitTime = new Date(updateStockDto.exitTime);
      const enterTime = stock.enterTime;

      if (exitTime <= enterTime) {
        throw new BadRequestException('Exit time must be after enter time');
      }

      const daysStayed = this.calculateDays(enterTime, exitTime);
      const totalPrice = await this.calculateTotalPrice(
        stock.numberOfBigItems,
        stock.numberOfSmallItems,
        stock.numberOfElectricalItems,
        daysStayed,
      );

      updateStockDto = {
        ...updateStockDto,
        exitTime: exitTime.toISOString(),
      };

      const updatedStock = await this.stockModel
        .findByIdAndUpdate(
          id,
          {
            ...updateStockDto,
            exitTime,
            daysStayed,
            totalPrice,
          },
          { new: true },
        )
        .exec();

      return updatedStock;
    }

    const updatedStock = await this.stockModel
      .findByIdAndUpdate(id, updateStockDto, { new: true })
      .exec();
    return updatedStock;
  }

  async checkout(id: string, exitTime?: Date) {
    const stock = await this.stockModel.findById(id).exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    if (stock.exitTime) {
      throw new BadRequestException('Stock has already been checked out');
    }

    const checkoutTime = exitTime || new Date();
    const daysStayed = this.calculateDays(stock.enterTime, checkoutTime);
    const totalPrice = await this.calculateTotalPrice(
      stock.numberOfBigItems,
      stock.numberOfSmallItems,
      stock.numberOfElectricalItems,
      daysStayed,
    );

    const updatedStock = await this.stockModel
      .findByIdAndUpdate(
        id,
        {
          exitTime: checkoutTime,
          daysStayed,
          totalPrice,
        },
        { new: true },
      )
      .exec();

    return updatedStock;
  }

  async remove(id: string): Promise<void> {
    const result = await this.stockModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
  }

  private calculateDays(enterTime: Date, exitTime: Date): number {
    // Get the date part only (ignore time)
    const enterDate = new Date(
      enterTime.getFullYear(),
      enterTime.getMonth(),
      enterTime.getDate(),
    );
    const exitDate = new Date(
      exitTime.getFullYear(),
      exitTime.getMonth(),
      exitTime.getDate(),
    );

    // Calculate the difference in days
    const diffInMilliseconds = exitDate.getTime() - enterDate.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

    // Return the number of calendar days (minimum 1 day)
    return Math.max(1, diffInDays + 1);
  }

  private async calculateTotalPrice(
    numberOfBigItems: number,
    numberOfSmallItems: number,
    numberOfElectricalItems: number,
    daysStayed: number,
  ): Promise<number> {
    try {
      const bigItemPricing = await this.itemPricingService.findByType('Big');
      const smallItemPricing =
        await this.itemPricingService.findByType('small');
      const ElectricaltemPricing =
        await this.itemPricingService.findByType('Electrical');

      const totalPrice =
        numberOfBigItems * bigItemPricing.pricePerDay +
        numberOfSmallItems * smallItemPricing.pricePerDay +
        numberOfElectricalItems * ElectricaltemPricing.pricePerDay * daysStayed;

      return totalPrice;
    } catch (error) {
      throw new BadRequestException(
        'Unable to calculate price. Please ensure item pricing is configured.',
      );
    }
  }

  async getActiveStocks(): Promise<Stock[]> {
    return this.stockModel.find({ exitTime: { $exists: false } }).exec();
  }

  async getCompletedStocks(): Promise<Stock[]> {
    return this.stockModel.find({ exitTime: { $exists: true } }).exec();
  }
}
