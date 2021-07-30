import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Like, Raw, Repository } from "typeorm";
import { AllCategoriesOutput } from "./dto/all-category.dto";
import { CategoryInput, CategoryOutput } from "./dto/category.dto";
import { CreateDishInput } from "./dto/create-dish.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dto/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dto/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dto/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dto/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dto/search-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        private readonly categories: CategoryRepository
    ) { }

    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner
            const category = await this.categories.getOrCreate(createRestaurantInput.categoryName);

            newRestaurant.category = category;
            await this.restaurants.save(newRestaurant); //!add to database
            return {
                ok: true,
            }
        } catch {
            return {
                ok: false,
                error: "Could not create restaurant"
            }
        }
    }

    async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {

        try {
            const restaurant = await this.restaurants.findOne(editRestaurantInput.restaurantId, { loadRelationIds: true })

            if (!restaurant) {
                return {
                    ok: false,
                    error: 'Restaurant not found'
                }
            }
            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't edit a restaurant you don't own"
                }
            }
            let category: Category = null;
            if (editRestaurantInput.categoryName) {
                category = await this.categories.getOrCreate(editRestaurantInput.categoryName)
            }

            await this.restaurants.save([{
                id: editRestaurantInput.restaurantId,
                ...editRestaurantInput,
                category: category
            }])
            return {
                ok: true
            }
        } catch {
            return {
                ok: false,
                error: 'Could not edit Restaurant'
            }
        }
    }

    async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId, { loadRelationIds: true })

            if (!restaurant) {
                return {
                    ok: false,
                    error: 'Restaurant not found'
                }
            }
            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't delete a restaurant you don't own"
                }
            }
            console.log("will delete", restaurant);
            return {
                ok: true
            }
            // await this.restaurant.delete(restaurantId)
        } catch {
            return {
                ok: false,
                error: "Could'nt delete a restaurant"
            }
        }
    }

    async allCategories(): Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find();
            return {
                ok: true,
                categories
            }
        } catch {
            return {
                ok: false,
                error: "Could not load categories"
            }
        }
    }

    countRestaurants(category: Category) {
        return this.restaurants.count({ category })
    }

    async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne({ slug }, { relations: ["restaurants"] })
            if (!category) {
                return {
                    ok: false,
                    error: "Category not found"
                }
            }

            const restaurants = await this.restaurants.find(
                {
                    where: {
                        category,
                    },
                    take: 25,
                    skip: (page - 1) * 25
                }
            );
            category.restaurants = restaurants;
            const totalResults = await this.countRestaurants(category)
            return {
                ok: true,
                category,
                totalPages: Math.ceil(totalResults / 25)
            }
        } catch {
            return {
                ok: false,
                error: "Could not load category"
            }
        }
    }

    async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                skip: (page - 1) * 25,
                take: 25,

            });
            return {
                ok: true,
                results: restaurants,
                totalPages: Math.ceil(totalResults / 25),
                totalResults
            }
        } catch {
            return {
                ok: false,
                error: 'could not load restaurants'
            }
        }
    }

    async findRestaurantById({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId, { relations: ['menu'] })
            return {
                ok: true,
                restaurant
            }
        } catch {
            return {
                ok: false,
                error: 'Could not find restaurant'
            }
        }
    }

    async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                where: {
                    // name: Like(`%${query}%`)
                    name: Raw(name => `${name} ILIKE '%${query}%'`),
                },
                skip: (page - 1) * 25,
                take: 25,
            })
            return {
                ok: true,
                restaurants,
                totalResults,
                totalPages: Math.ceil(totalResults / 25),
            }
        } catch {
            return {
                ok: false,
                error: "Could not search for restaurant"
            }
        }
    }

    async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateRestaurantOutput> {
        return{
            ok:false,
        }
    }
}