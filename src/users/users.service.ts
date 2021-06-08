import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import * as jwt from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config';
import { JwtService } from "src/jwt/jwt.service";

export class UsersService {
    constructor(@InjectRepository(User) private readonly users: Repository<User>,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService) {
       
    }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<[boolean, string?]> {

        /** 
         * Check that email does not exits
         * Create a user & hash the password
         * return ok
         * 
        */

        try {
            const exists = await this.users.findOne({ email });
            if (exists) {
                return [false, "User already exits with that email"];
            }
            await this.users.save(this.users.create({ email, password, role }));
            return [true]
        } catch (e) {
            return [false, "Couldn't create an account"];
        }
    }

    async login({ email, password }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
        //find the user with the email
        //check if password is correct
        //make a JWT and give it to the user

        try {
            const user = await this.users.findOne({ email });
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
            const token = jwt.sign({ id: user.id }, this.config.get('PRIVATE_KEY'));
            return {
                ok: true,
                token,
            }
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }
}