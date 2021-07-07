import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dto/create-restaurant.dto";
import { Restaurant } from "./entities/restaurants.entity";

@Injectable()
export class RestaurantService {
    constructor(@InjectRepository(Restaurant)
    private restaurant: Repository<Restaurant>) { }


    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurant.create(createRestaurantInput);
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

}