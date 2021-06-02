import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

//object type for graphql
@ObjectType()
//entity type for typeorm
@Entity()
export class Restaurant {

    @PrimaryGeneratedColumn()// typeorm
    @Field(type => Number) //Graphql
    id: number

    @Field(type => String) 
    @Column()
    name: string;

    @Field(type => Boolean, { defaultValue: true })
    @Column({default:true})
    isVegan: boolean

    @Field(type => String)
    @Column()
    address: string

    @Field(type => String)
    @Column()
    ownerName: string

    @Field(type => String)
    @Column()
    categoryName:string
}

//Repository is a the one incharge of interacting with the entity.