import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dto/create-restaurant.dto'
import { RestaurantService } from './restaurants.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) { }

  @Mutation(returns => CreateRestaurantOutput)
  @Role(["Owner"])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(authUser, createRestaurantInput);
  }
}
