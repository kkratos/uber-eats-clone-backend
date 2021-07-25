import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dto/create-restaurant.dto'
import { RestaurantService } from './restaurants.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { EditRestaurantInput, EditRestaurantOutput } from './dto/edit-restaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dto/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dto/all-category.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';

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

  @Mutation(returns => EditRestaurantOutput)
  @Role(["Owner"])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(returns => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput);
  }

  @Query(returns => RestaurantOutput)
  restaurants(@Args('input') restaurantInput: RestaurantInput): Promise<RestaurantOutput> {
    return this.restaurantService.allRestaurants(restaurantInput);
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) { }

  @ResolveField(type => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category)
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(type => CategoryOutput)
  category(@Args('input') categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput)
  }
}
