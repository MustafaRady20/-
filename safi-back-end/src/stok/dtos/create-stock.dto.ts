import { IsString, IsNumber, IsDateString, Min, IsOptional } from 'class-validator';

export class CreateStockDto {
  @IsString()
  visitorName: string;

  @IsString()
  serialNumber: string;

  @IsString()
  phoneNumber: string;

  @IsNumber()
  @Min(0)
  numberOfBigItems: number;

  @IsNumber()
  @Min(0)
  numberOfSmallItems: number;

  @IsDateString()
  enterTime: string;
}


export class UpdateStockDto {
  @IsOptional()
  @IsString()
  visitorName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfBigItems?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfSmallItems?: number;

  @IsOptional()
  @IsDateString()
  exitTime?: string;
}