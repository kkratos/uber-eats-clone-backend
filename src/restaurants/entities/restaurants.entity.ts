import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { number } from "joi";
import { CoreEntity } from "src/common/entities/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Category } from "./category.entity";

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()  //! Object type of grapgql
@Entity()      //! entity type for typeorm
export class Restaurant extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string;

    @Field(type => String)
    @Column()
    @IsString()
    address: string

    @Field(type => Category, { nullable: true })
    @ManyToOne(type => Category, category => category.restaurants, { nullable: true, onDelete: "SET NULL" })
    category: Category;

    @Field(type => User)
    @ManyToOne(type => User, user => user.restaurants, { onDelete: "CASCADE" })
    owner: User;

    @RelationId((restaurant: Restaurant) => restaurant.owner)
    ownerId: number;

}

//Repository is a the one incharge of interacting with the entity.