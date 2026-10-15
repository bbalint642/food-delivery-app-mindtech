import { ApiProperty } from '@nestjs/swagger';
import { MenuItem } from '../../generated/prisma/client';

export class MenuItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Pizza Margherita' })
  name!: string;

  @ApiProperty({
    example: 'San Marzano paradicsom, fior di latte, bazsalikom.',
  })
  description!: string;

  @ApiProperty({
    example: 349000,
    description: 'Unit price in fillér (HUF).',
  })
  priceCents!: number;

  @ApiProperty({ description: 'Unavailable items cannot be ordered.' })
  isAvailable!: boolean;

  @ApiProperty({ description: 'True when the item is on sale.' })
  isOnSale!: boolean;

  @ApiProperty({
    nullable: true,
    example: 399000,
    description: 'List price in fillér before the sale. Null when not on sale.',
  })
  compareAtPriceCents!: number | null;

  @ApiProperty({
    nullable: true,
    example: '/images/foods/spaghetti-carbonara.webp',
  })
  imageUrl!: string | null;

  @ApiProperty({
    type: [String],
    example: ['glutén', 'tej'],
    description: 'EU major allergens present in the dish.',
  })
  allergens!: string[];

  @ApiProperty({ example: 810, description: 'Estimated kcal per serving.' })
  caloriesKcal!: number;

  @ApiProperty({
    example: 34,
    description: 'Estimated protein grams per serving.',
  })
  proteinGrams!: number;

  @ApiProperty({
    example: 96,
    description: 'Estimated carbohydrate grams per serving.',
  })
  carbsGrams!: number;

  @ApiProperty({ example: 26, description: 'Estimated fat grams per serving.' })
  fatGrams!: number;

  static fromEntity(item: MenuItem): MenuItemDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      priceCents: item.priceCents,
      isAvailable: item.isAvailable,
      isOnSale: item.isOnSale,
      compareAtPriceCents: item.compareAtPriceCents,
      imageUrl: item.imageUrl,
      allergens: item.allergens,
      caloriesKcal: item.caloriesKcal,
      proteinGrams: item.proteinGrams,
      carbsGrams: item.carbsGrams,
      fatGrams: item.fatGrams,
    };
  }
}
