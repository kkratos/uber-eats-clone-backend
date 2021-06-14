import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service";


const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
})

const mockJwtService = () => ({
    sign: jest.fn(),
    verify: jest.fn()
})

// const mockMailService = {
//     sendVerificationEmail: jest.fn()
// }

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UsersService", () => {

    let service: UsersService;
    let usersRepository: MockRepository<User>;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [UsersService,
                {
                    provide: getRepositoryToken(User), useValue: mockRepository(),
                },
                {
                    provide: getRepositoryToken(Verification), useValue: mockRepository(),
                },
                {
                    provide: JwtService, useValue: mockJwtService()
                },
                // {
                //     provide:mailService,
                //     useValue: mockMailService
                // }
            ],
        }).compile();
        service = module.get<UsersService>(UsersService);
        usersRepository = module.get(getRepositoryToken(User));

    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe("Create account", () => {
        const createAccount = {
            email: '',
            password: '',
            role: 0
        }
        it('should fail if user exits', async () => {
            usersRepository.findOne.mockResolvedValue({
                id: 1,
                email: '',
            });
            const result = await service.createAccount(createAccount)
            expect(result).toMatchObject({ ok: false, error: "User already exits with that email" });
        });
        it('should create a new user', async () => {
            usersRepository.findOne.mockResolvedValue(undefined);
            usersRepository.create.mockReturnValue(createAccount);
            await service.createAccount(createAccount);
            expect(usersRepository.create).toHaveBeenCalledTimes(1);
            expect(usersRepository.create).toHaveBeenCalledWith(createAccount);
            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(createAccount);
        })
    });

    it.todo('login');
    it.todo('findById');
    it.todo('editProfile');
    it.todo('verifyEmail');
})