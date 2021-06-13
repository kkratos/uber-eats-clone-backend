import { UseGuards } from "@nestjs/common";
import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/loginInput.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { AuthUser } from '../auth/auth-user.decorator'
import { userProfileInput, userProfileOutput } from "./dtos/user.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
@Resolver(of => User)
export class UsersResolver {
    constructor(private readonly userService: UsersService) { }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        return this.userService.createAccount(createAccountInput)
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        return this.userService.login(loginInput);
    }

    @Query(returns => User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User) {
        return authUser
    }

    @UseGuards(AuthGuard)
    @Query(returns => userProfileOutput)
    async userProfile(@Args() userProfileInput: userProfileInput): Promise<userProfileOutput> {
        return this.userService.findById(userProfileInput.userId);
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput)
    async editProfile(@AuthUser() authUser: User, @Args('input') editprofileInput: EditProfileInput): Promise<EditProfileOutput> {
        return this.userService.editProfile(authUser.id, editprofileInput)
    }

    @Mutation(returns => VerifyEmailOutput)
    verifyEmail(@Args('input') { code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
        return this.userService.verifyEmail(code)
    }
}
