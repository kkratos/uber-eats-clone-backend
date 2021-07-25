import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationInput, PaginationOutput } from "src/common/dtos/pagination.dto";
import { Restaurant } from "../entities/restaurants.entity";


@InputType()
export class RestaurantInput extends PaginationInput {

}

@ObjectType()
export class RestaurantOutput extends PaginationOutput {

    @Field(type => [Restaurant], { nullable: true })
    results?: Restaurant[];
}