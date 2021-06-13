import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@ArgsType()
export class userProfileInput {
    @Field(type => Number)
    userId: number
}

@ObjectType()
export class userProfileOutput extends MutationOutput {

    @Field(type => User, { nullable: true })
    user?: User;
}