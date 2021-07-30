import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType('DishOptionsInputType', { isAbstract: true })
@ObjectType()
class DishOptions {
    @Field(type => String)
    name: string;

    @Field(type => [String], { nullable: true })
    choices?: string[]

    @Field(type => Int, { nullable: true })
    extra?: number
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()  //! Object type of grapgql
@Entity()      //! entity type for typeorm
export class Dish extends CoreEntity {

    @Field(type => String)
    @Column({ unique: true })
    @IsString()
    @Length(5)
    name: string;

    @Field(type => Int)
    @Column()
    @IsNumber()
    price: number;

    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    @IsString()
    photo: string;

    @Field(type => String)
    @Column()
    @Length(5, 140)
    description: string;

    @Field(type => Restaurant)
    @ManyToOne(type => Restaurant, restaurant => restaurant.menu, { onDelete: "CASCADE" })
    restaurant: Restaurant;

    @RelationId((dish: Dish) => dish.restaurant)
    restaurantId: number;

    @Field(type => [DishOptions], {
        nullable: true
    })
    @Column({ type: "json", nullable: true })
    options: DishOptions[]
}