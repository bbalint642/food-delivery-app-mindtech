import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { RestaurantDetailDto } from './dto/restaurant-detail.dto';
import { RestaurantDto } from './dto/restaurant.dto';
import { RestaurantsService } from './restaurants.service';

/** Read-only catalogue: browsable without logging in. */
@Public()
@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'List all restaurants' })
  @ApiOkResponse({ type: [RestaurantDto] })
  findAll(): Promise<RestaurantDto[]> {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant details including its menu' })
  @ApiOkResponse({ type: RestaurantDetailDto })
  @ApiBadRequestResponse({ description: 'Invalid restaurant id (not a UUID)' })
  @ApiNotFoundResponse({ description: 'Restaurant not found' })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantDetailDto> {
    return this.restaurantsService.findOne(id);
  }
}
