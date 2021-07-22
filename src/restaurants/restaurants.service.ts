import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AllCategoriesOutput } from "./dto/all-category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dto/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dto/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurant: Repository<Restaurant>,
        private readonly categories: CategoryRepository
    ) { }

    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurant.create(createRestaurantInput);
            newRestaurant.owner = owner
            const category = await this.categories.getOrCreate(createRestaurantInput.categoryName);

            newRestaurant.category = category;
            await this.restaurant.save(newRestaurant); //!add to database
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
            const restaurant = await this.restaurant.findOne(editRestaurantInput.restaurantId, { loadRelationIds: true })

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

            await this.restaurant.save([{
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
            const restaurant = await this.restaurant.findOne(restaurantId, { loadRelationIds: true })

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
}