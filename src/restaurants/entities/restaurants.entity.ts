import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";

@ObjectType()  //! Object type of grapgql
@Entity()      //! entity type for typeorm
export class Restaurant extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string;

    @Field(type => String, { defaultValue: ';a;a' })
    @Column()
    @IsString()
    address: string

    @Field(type => Category)
    @ManyToOne(type => Category, category => category.restaurants)
    category: Category;
}

//Repository is a the one incharge of interacting with the entity.