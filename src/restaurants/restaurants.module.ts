import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver, DishResolver, RestaurantsResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [RestaurantsResolver, RestaurantService, CategoryResolver, DishResolver],
})
export class RestaurantsModule { }
