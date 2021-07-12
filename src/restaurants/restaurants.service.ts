import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dto/create-restaurant.dto";
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


    async getOrCreateCategory(name: string): Promise<Category> {
        const categoryName = name.trim().toLowerCase();
        const categorySlug = categoryName.replace(/ /g, "-");
        let category = await this.categories.findOne({ slug: categorySlug })
        if (!category) {
            category = await this.categories.save(this.categories.create({ slug: categorySlug, name: categoryName }))
        }

        return category;
    }

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
}