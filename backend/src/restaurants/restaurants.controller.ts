import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CuisineFacetDto } from './dto/cuisine-facet.dto';
import { DealDto } from './dto/deal.dto';
import { DealsQueryDto } from './dto/deals-query.dto';
import { ListRestaurantsQueryDto } from './dto/list-restaurants-query.dto';
import { RestaurantDetailDto } from './dto/restaurant-detail.dto';
import { RestaurantListItemDto } from './dto/restaurant-list-item.dto';
import { RestaurantsService } from './restaurants.service';

/** Read-only catalogue: browsable without logging in. */
@Public()
@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({
    summary: 'List restaurants',
    description:
      'Without query parameters every restaurant is returned. Optional filters narrow the list; they are combined with AND.',
  })
  @ApiOkResponse({ type: [RestaurantListItemDto] })
  @ApiBadRequestResponse({ description: 'Invalid filter value' })
  findAll(
    @Query() query: ListRestaurantsQueryDto,
  ): Promise<RestaurantListItemDto[]> {
    return this.restaurantsService.findAll(query);
  }

  // Static routes are declared before `:id`, otherwise they would be
  // matched (and rejected) by the UUID route.
  @Get('cuisines')
  @ApiOperation({ summary: 'List cuisines with their restaurant count' })
  @ApiOkResponse({ type: [CuisineFacetDto] })
  listCuisines(): Promise<CuisineFacetDto[]> {
    return this.restaurantsService.listCuisines();
  }

  @Get('deals')
  @ApiOperation({ summary: 'Orderable discounted dishes in random order' })
  @ApiOkResponse({ type: [DealDto] })
  @ApiBadRequestResponse({ description: 'Invalid limit' })
  findDeals(@Query() query: DealsQueryDto): Promise<DealDto[]> {
    return this.restaurantsService.findDeals(query.limit);
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
