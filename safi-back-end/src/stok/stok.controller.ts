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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateStockDto, UpdateStockDto } from 'src/stok/dtos/create-stock.dto';
import { StockService } from 'src/stok/stok.service';
import { Roles } from 'src/user/decorators/roles.decorator';
import { RolesGuard } from 'src/user/guards/roles.guard';

@Controller('stock')
// @UseGuards(RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  // @Roles('admin', 'user')
  findAll() {
    return this.stockService.findAll();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  getActiveStocks() {
    return this.stockService.getActiveStocks();
  }

  @Get('completed')
  @UseGuards(JwtAuthGuard)
  getCompletedStocks() {
    return this.stockService.getCompletedStocks();
  }

  @Get('serial/:serialNumber')
  @UseGuards(JwtAuthGuard)
  findBySerialNumber(@Param('serialNumber') serialNumber: string) {
    return this.stockService.findBySerialNumber(serialNumber);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(id, updateStockDto);
  }

  @Post(':id/checkout')
  @UseGuards(JwtAuthGuard)
  @Roles('user', 'admin')
  checkout(@Param('id') id: string) {
    const checkoutTime = new Date();
    return this.stockService.checkout(id, checkoutTime);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}
