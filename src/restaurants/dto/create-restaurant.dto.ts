import { InputType, OmitType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurants.entity";

// @ArgsType()
@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id'], InputType) {

}

// export class CreateRestaurantDto {

//     @Field(type => String)
//     @IsString()
//     @Length(5, 10)
//     name: string;

//     @Field(type => Boolean)
//     @IsBoolean()
//     isVegan: boolean;

//     @Field(type => String)
//     @IsString()
//     address: string;

//     @Field(type => String)
//     @IsString()
//     ownerName: string
// }