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
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn()
})

const mockJwtService = () => ({
    sign: jest.fn(() => 'signed-token'),
    verify: jest.fn(),
})

// const mockMailService = {
//     sendVerificationEmail: jest.fn()
// }

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UsersService", () => {

    let service: UsersService;
    let usersRepository: MockRepository<User>;
    let verificationRepository: MockRepository<Verification>;
    // let mailService: MailService
    let jwtService: JwtService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository(),
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository(),
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService()
                },
                // {
                //     provide:mailService,
                //     useValue: mockMailService
                // }
            ],
        }).compile();
        service = module.get<UsersService>(UsersService);
        usersRepository = module.get(getRepositoryToken(User));
        verificationRepository = module.get(getRepositoryToken(Verification))
        // mailService = module.get<MailService>(MailService)
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe("Create account", () => {
        const createAccount = {
            email: 'bs@email.com',
            password: 'bs.password',
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
            usersRepository.save.mockResolvedValue(createAccount);
            verificationRepository.create.mockReturnValue({ user: createAccount });
            verificationRepository.save.mockResolvedValue({
                code: 'code'
            });

            const result = await service.createAccount(createAccount);
            expect(usersRepository.create).toHaveBeenCalledTimes(1);
            expect(usersRepository.create).toHaveBeenCalledWith(createAccount);
            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(createAccount);
            expect(verificationRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationRepository.create).toHaveBeenCalledWith({ user: createAccount });

            expect(verificationRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationRepository.save).toHaveBeenCalledWith({ user: createAccount });

            // expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            // expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));

            expect(result).toEqual({ ok: true })
        })
        it('should fail on exception', async () => {
            usersRepository.findOne.mockRejectedValue(new Error());

            const result = await service.createAccount(createAccount);
            expect(result).toEqual({ ok: false, error: "Couldn't create account" });
        })
    });

    describe("login", () => {
        const loginArgs = {
            email: 'bs@email.co,',
            password: 'bs.password'
        }
        it("should fail if user does not exists", async () => {
            usersRepository.findOne.mockResolvedValue(null);

            const result = await service.login(loginArgs);

            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(result).toEqual({
                ok: false,
                error: 'User not found',
            })
        })

        it('should fail if the password is wrong', async () => {
            const mockedUser = {
                checkPassword: jest.fn(() => Promise.resolve(false)),
            };
            usersRepository.findOne.mockResolvedValue(mockedUser);
            const result = await service.login(loginArgs);
            expect(result).toEqual({ ok: false, error: 'Wrong password' });
        });

        it('should return token if password correct', async () => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true)),
            };
            usersRepository.findOne.mockResolvedValue(mockedUser);
            const result = await service.login(loginArgs);
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
            expect(result).toEqual({ ok: true, token: 'signed-token' })
        })
    })

    describe('findById', () => {

        const findByIdArgs = {
            id: 1
        }

        it('Should find an existing user', async () => {
            usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs)
            const result = await service.findById(1);
            expect(result).toEqual({ ok: true, user: findByIdArgs });
        });

        it('should fail if no user is found', async () => {
            usersRepository.findOneOrFail.mockRejectedValue(new Error());
            const result = await service.findById(1);
            expect(result).toEqual({ ok: false, error: 'User Not Found' });
        })
    })

    describe("editProfile", () => {
        it('Should change email', async () => {
            const oldUser = {
                email: 'bs@old.com',
                verified: true
            }
            const editProfileArgs = {
                userId: 1,
                input: { email: 'bs@new.com' },
            };
            const newVerification = {
                code: 'code'
            }

            const newUser = {
                verified: false,
                email: editProfileArgs.input.email,
            }

            usersRepository.findOne.mockResolvedValue(oldUser);
            verificationRepository.create.mockReturnValue(newVerification);
            verificationRepository.save.mockResolvedValue(newVerification);

            await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith(
                editProfileArgs.userId,
            );

            expect(verificationRepository.create).toHaveBeenCalledWith({
                user: newUser,
            });
            expect(verificationRepository.save).toHaveBeenCalledWith(
                newVerification,
            );
        })

        it('Should change password', async () => {
            const editProfileArgs = {
                userId: 1,
                input: { password: 'new.password' },
            };
            usersRepository.findOne.mockResolvedValue({ password: "old" })
            const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input)
            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
            expect(result).toEqual({ ok: true });
        })

        it("Should fail on exception", async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.editProfile(1, { email: '12' });
            expect(result).toEqual({ ok: false, error: 'Could not update profile' })
        })
    })

    describe('Verify Email', () => {

        it('Should verify email', async () => {
            const mockedVerfication = {
                user: {
                    verified: false
                },
                id: 1
            }
            verificationRepository.findOne.mockResolvedValue(mockedVerfication)
            const result = await service.verifyEmail('');

            expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
            expect(verificationRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

            expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
            expect(verificationRepository.delete).toHaveBeenCalledWith(mockedVerfication.id);

            expect(result).toEqual({ ok: true });
        })

        it('should fail on verification not found', async () => {
            verificationRepository.findOne.mockResolvedValue(undefined);
            const result = await service.verifyEmail('');
            expect(result).toEqual({ ok: false, error: "Verification not found." })
        });
        it('should fail on exception', async () => {
            verificationRepository.findOne.mockRejectedValue(new Error());
            const result = await service.verifyEmail('');
            expect(result).toEqual({ ok: false, error: "Could not verify email." })

        });
    })
})