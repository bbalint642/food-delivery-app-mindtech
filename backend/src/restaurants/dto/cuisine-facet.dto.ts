import { ApiProperty } from '@nestjs/swagger';

/** A cuisine offered in the catalogue, with the number of restaurants. */
export class CuisineFacetDto {
  @ApiProperty({ example: 'Olasz' })
  cuisine!: string;

  @ApiProperty({ example: 1 })
  count!: number;
}
