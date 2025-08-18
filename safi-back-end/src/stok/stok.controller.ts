import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CreateStockDto, UpdateStockDto } from 'src/stok/dtos/create-stock.dto';
import { StockService } from 'src/stok/stok.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get('active')
  getActiveStocks() {
    return this.stockService.getActiveStocks();
  }

  @Get('completed')
  getCompletedStocks() {
    return this.stockService.getCompletedStocks();
  }

  @Get('serial/:serialNumber')
  findBySerialNumber(@Param('serialNumber') serialNumber: string) {
    return this.stockService.findBySerialNumber(serialNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(id, updateStockDto);
  }

  @Post(':id/checkout')
  checkout(@Param('id') id: string) {
    const checkoutTime = new Date();
    return this.stockService.checkout(id, checkoutTime);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}
