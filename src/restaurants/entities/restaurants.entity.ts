import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@ObjectType()  //! Object type of grapgql
@Entity()      //! entity type for typeorm
export class Restaurant {

    @PrimaryGeneratedColumn() //! typeorm
    @Field(type => Number)    //!Graphql
    id: number

    @Field(type => String)
    @Column()
    @IsString() //! Validation
    @Length(5) //! Validation
    name: string;

    @Field(type => Boolean, { nullable: true })
    @Column({ default: true })
    @IsBoolean()
    @IsOptional()
    isVegan: boolean

    @Field(type => String, { defaultValue: ';a;a' })
    @Column()
    @IsString()
    address: string

    // @Field(type => String)
    // @Column()
    // @IsString()
    // ownerName: string

    // @Field(type => String)
    // @Column()
    // @IsString()
    // categoryName: string
}

//Repository is a the one incharge of interacting with the entity.