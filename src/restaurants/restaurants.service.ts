import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { Restaurant } from "./entities/restaurants.entity";

@Injectable()
export class RestaurantService {
    constructor(@InjectRepository(Restaurant) private restaurant: Repository<Restaurant>) { }

    getAll(): Promise<Restaurant[]> {
        return this.restaurant.find();
    }

    createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
        const newRestaurant = this.restaurant.create(createRestaurantDto);
        console.log(newRestaurant)
        return this.restaurant.save(newRestaurant); //! to put on database use save() method
    }

    updateRestaurant({ id, data }: UpdateRestaurantDto) {
        return this.restaurant.update(id, { ...data })
    }
}