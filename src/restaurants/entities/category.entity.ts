import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Restaurant } from "./restaurants.entity";


@ObjectType()  //! Object type of grapgql
@Entity()      //! entity type for typeorm
export class Category extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string;

    @Field(type => [Restaurant])
    @OneToMany(type => Restaurant, restaurant => restaurant.category)
    restaurants: Restaurant[];

}