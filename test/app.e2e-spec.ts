import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from 'src/auth/dto';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { Factory } from './factory';

describe('-- All Suite Tests --', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let factory: Factory;
    const SIGNUP = '/auth/signup';
    const SIGNIN = '/auth/signin';
    const GETUSER = '/user/me';
    const CREATEPOOL = '/pool';

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            }),
        );

        await app.init();
        await app.listen(3000);

        prisma = app.get(PrismaService);
        await prisma.cleanDb();
        factory = new Factory(prisma);
        pactum.request.setBaseUrl('http://localhost:3000');
    });

    afterAll(async () => {
        await prisma.cleanDb();
        app.close();
    });

    describe('-> Auth (e2e)', () => {
        describe('Sign up feature tests', () => {
            it('Test signup feature with sucess case - 201', async () => {
                const user: SignUpDto = factory.user.generateUserData();

                await pactum
                    .spec()
                    .post(SIGNUP)
                    .withBody(user)
                    .expectStatus(201)
                    .expectJsonLike({
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                    });

                const result = await factory.user.inspectUser({
                    email: user.email,
                });

                expect(result).not.toBeNull();
            });
            it('Test signup feature with failing case - duplicate name - 409', async () => {
                const { name } = await factory.user.createUser();
                const userData = factory.user.generateUserData({ name });
                return pactum
                    .spec()
                    .post(SIGNUP)
                    .withBody(userData)
                    .expectStatus(409);
            });
            it('Test signup feature with failing case - duplicate email - 409', async () => {
                const { email } = await factory.user.createUser();
                const userData = factory.user.generateUserData({ email });
                return pactum
                    .spec()
                    .post(SIGNUP)
                    .withBody(userData)
                    .expectStatus(409);
            });
            it('Test signup feature with failing case - wrong request body - 400', () => {
                const userData = factory.user.generateUserData({
                    email: 'ldskadksald',
                });
                delete userData.password;

                return pactum
                    .spec()
                    .post(SIGNUP)
                    .withBody(userData)
                    .expectStatus(400);
            });
        });

        describe('Sign in feature tests', () => {
            it('Test login with sucess - should return token - 201', async () => {
                const userData = factory.user.generateUserData();
                const { email, password } = userData;
                await factory.user.createUser(userData);

                return pactum
                    .spec()
                    .post(SIGNIN)
                    .withBody({ email, password })
                    .expectStatus(201)
                    .expectJsonLike({
                        token: /(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/,
                    })
                    .stores('userToken', 'token');
            });

            it('Test login with incorrect password - 403', async () => {
                const userData = factory.user.generateUserData();
                const { email } = userData;
                await factory.user.createUser(userData);

                return pactum
                    .spec()
                    .post(SIGNIN)
                    .withBody({ email, password: faker.internet.password(7) })
                    .expectStatus(403);
            });

            it('Test login with invalid email - should fail with not found - 404', async () => {
                const { email } = factory.user.generateUserData();

                return pactum
                    .spec()
                    .post(SIGNIN)
                    .withBody({ email, password: faker.internet.password(7) })
                    .expectStatus(404);
            });
        });

        describe('Test jwt authentication', () => {
            it('Test acess user data without validation token - 401', async () => {
                return pactum.spec().get(GETUSER).expectStatus(400);
            });

            it('Test acess user data with validation token on wrong format - 401', async () => {
                await pactum
                    .spec()
                    .get(GETUSER)
                    .withHeaders({
                        Authorization: 'Bearer ',
                    })
                    .expectStatus(401);

                await pactum
                    .spec()
                    .get(GETUSER)
                    .withHeaders({
                        Authorization: 'Bearer djaojfodjsafjoa',
                    })
                    .expectStatus(401);
            });

            it('Test acess token with invalid JWT - 403', async () => {
                const user = await factory.user.createUser();
                const payload = {
                    email: user.email,
                    name: user.email,
                    id: user.id,
                };
                const fakeToken = jwt.sign(payload, 'MEU JWT DE TESTE');

                return pactum
                    .spec()
                    .get(GETUSER)
                    .withHeaders({
                        Authorization: `Bearer ${fakeToken}`,
                    })
                    .expectStatus(401);
            });

            it('Test acess user data with correct validation token - 200', async () => {
                return pactum
                    .spec()
                    .get(GETUSER)
                    .withHeaders({
                        Authorization: 'Bearer $S{userToken}',
                    })
                    .expectStatus(200);
            });
        });
    });

    describe('-> Pool (e2e)', () => {
        let user: User;

        beforeAll(async () => {
            const { email, name, password, imageUrl } =
                factory.user.generateUserData();
            user = await factory.user.createUser({
                email,
                name,
                password,
                imageUrl,
            });
            user.password = password;
            await pactum
                .spec()
                .post(SIGNIN)
                .withBody({ email, password })
                .stores('userToken', 'token');
        });

        describe('Test Create pool', () => {
            it('Testing the creation of a pool with sucess - 201', async () => {
                const body = factory.pool.generatePoolData();
                await pactum
                    .spec()
                    .post('/pool')
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .withBody(body)
                    .expectStatus(201);

                const pool = await factory.pool.inspectPool(body.name, user.id);
                const owner = await factory.pool.inspectParticipant(
                    body.name,
                    user.id,
                );
                expect(pool).not.toBeNull();
                expect(owner).not.toBeNull();
            });

            it('Testing creating a pool with the same name - should fail - 409', async () => {
                const { name } = await factory.pool.createPool(user.id);
                await pactum
                    .spec()
                    .post(CREATEPOOL)
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .withBody({ name })
                    .expectStatus(409);
            });
        });

        describe('Test getting pools', () => {
            it('Testing getting pools from user', async () => {
                await factory.pool.createPool(user.id);
                return pactum
                    .spec()
                    .get('/pool')
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .expectStatus(200)
                    .expectJsonLength(3);
            });

            it('Getting pool by id', async () => {
                const pool = await factory.pool.createPool(user.id);
                return pactum
                    .spec()
                    .get(`/pool/${pool.id}`)
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .expectStatus(200);
            });

            it('Trying to get pool with invalid id', async () => {
                const invalidText = faker.lorem.word();
                return pactum
                    .spec()
                    .get(`/pool/${invalidText}`)
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .expectStatus(400);
            });
        });

        describe('Adding participants to a pool', () => {
            it('adding participant to a pool with sucess', async () => {
                const pool = await factory.pool.createPool(user.id);
                const userToAdd = await factory.user.createUser();
                await pactum
                    .spec()
                    .post(`/pool/${pool.id}`)
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .withBody({ users: [userToAdd.id] })
                    .expectStatus(201);

                const created = await factory.pool.inspectParticipant(
                    pool.name,
                    userToAdd.id,
                );
                expect(created).not.toBeNull();
            });

            it('adding multiple users to a pool - 200', async () => {
                const pool = await factory.pool.createPool(user.id);
                const users: User[] = [];

                for (let i = 0; i < 5; i++) {
                    users[i] = await factory.user.createUser();
                }
                await pactum
                    .spec()
                    .post(`/pool/${pool.id}`)
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .withBody({ users: users.map((i) => i.id) })
                    .expectStatus(201);
            });

            it('trying to add multiple mal formatted ids to a pool - 200', async () => {
                const pool = await factory.pool.createPool(user.id);
                const users: string[] = [];

                for (let i = 0; i < 5; i++) {
                    users[i] = faker.lorem.word();
                }
                await pactum
                    .spec()
                    .post(`/pool/${pool.id}`)
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .withBody({ users })
                    .expectStatus(400);
            });

            it('trying to add the owner as the only participant - should fail- 400', async () => {
                const pool = await factory.pool.createPool(user.id);
                return pactum
                    .spec()
                    .post(`/pool/${pool.id}`)
                    .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                    .withBody({ users: [user.id] })
                    .expectStatus(400);
            });
        });
    });
});
