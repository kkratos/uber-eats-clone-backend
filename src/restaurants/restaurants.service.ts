import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { Restaurant } from "./entities/restaurants.entity";

@Injectable()
export class RestaurantService {
    constructor(@InjectRepository(Restaurant) private restaurant: Repository<Restaurant>) { }
    getAll():Promise<Restaurant[]> {
        return this.restaurant.find();
    }

    createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant>{
        const newRestaurant = this.restaurant.create(createRestaurantDto);
        //to put on database use save() method
        return this.restaurant.save(newRestaurant);
    }
}