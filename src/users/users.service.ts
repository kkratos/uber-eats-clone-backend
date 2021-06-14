import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/loginInput.dto';
import { User } from './entities/user.entity';
import { JwtService } from "../jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { userProfileOutput } from './dtos/user.dto';

export class UsersService {
    constructor(@InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService) {
    }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const exists = await this.users.findOne({ email });
            if (exists) {
                return { ok: false, error: "User already exits with that email" };
            }
            const user = await this.users.save(this.users.create({ email, password, role }));
            const verification = await this.verifications.save(
                this.verifications.create({
                    user,
                }),
            );
            return { ok: true }
        } catch (e) {
            return { ok: false, error: "Couldn't create an account" };
        }
    }

    async login({ email, password }: LoginInput): Promise<LoginOutput> {
        //find the user with the email
        //check if password is correct
        //make a JWT and give it to the user

        try {
            const user = await this.users.findOne({ email }, { select: ['id', 'password'] });
            if (!user) {
                return {
                    ok: false,
                    error: "User not found"
                }
            }
            const passwordCorrect = await (await user).checkPassword(password);
            if (!passwordCorrect) {
                return {
                    ok: false,
                    error: "wrong password"
                }
            }
            console.log(user)
            const token = this.jwtService.sign(user.id)
            // const token = jwt.sign({ id: user.id }, this.config.get('PRIVATE_KEY'));
            return {
                ok: true,
                token,
            }
        } catch (error) {
            return {
                ok: false,
                error: "Can't log user in."
            }
        }
    }

    async findById(id: number): Promise<userProfileOutput> {
        try {
            const user = await this.users.findOneOrFail({ id });
            return {
                ok: true,
                user,
            };
        } catch (error) {
            return { ok: false, error: 'User Not Found' };
        }
    }

    async editProfile(userId: number, { email, password }: EditProfileInput): Promise<EditProfileOutput> {

        try {
            const user = await this.users.findOne(userId);
            if (email) {
                user.email = email
                user.verified = false;
                await this.verifications.save(this.verifications.create())
            }
            if (password) {
                user.password = password
            }
            await this.users.save(user);
            return { ok: true }
        } catch (error) {
            return { ok: false, error: "Could not update profile" }
        }

    }

    async verifyEmail(code: string): Promise<VerifyEmailOutput> {
        try {
            const verification = await this.verifications.findOne({ code }, { relations: ["user"] })

            if (verification) {
                verification.user.verified = true
                await this.users.save(verification.user)
                await this.verifications.delete(verification.id)
                return { ok: true }
            }
            return { ok: false, error: "Verification not found." }
        } catch (error) {
            return { ok: false, error };
        }

    }
}