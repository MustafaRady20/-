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
} from '@nestjs/common';
import { ItemPricingService } from './item-pricing.service';
import {
  CreateItemPricingDto,
  UpdateItemPricingDto,
} from 'src/stok/dtos/create-item-pricing.dto';

@Controller('item-pricing')
export class ItemPricingController {
  constructor(private readonly itemPricingService: ItemPricingService) {}

  @Post()
  create(@Body() createItemPricingDto: CreateItemPricingDto) {
    return this.itemPricingService.create(createItemPricingDto);
  }

  @Get()
  findAll() {
    return this.itemPricingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemPricingService.findOne(id);
  }

  @Get('type/:itemType')
  findByType(@Param('itemType') itemType: string) {
    return this.itemPricingService.findByType(itemType);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemPricingDto: UpdateItemPricingDto,
  ) {
    return this.itemPricingService.update(id, updateItemPricingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.itemPricingService.remove(id);
  }
}
