import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateItemPricingDto {
  @IsString()
  itemType: string;

  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateItemPricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerDay?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
