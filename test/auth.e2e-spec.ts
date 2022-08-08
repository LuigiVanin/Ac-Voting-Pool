import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserFactory } from './factory/user.factory';
import { SignUpDto } from 'src/auth/dto';
import { faker } from '@faker-js/faker';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let factory: UserFactory;
    const SIGNUP = '/auth/signup';
    const SIGNIN = '/auth/signin';
    const GETUSER = '/user/me';

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
        factory = new UserFactory(prisma);
        pactum.request.setBaseUrl('http://localhost:3000');
    });

    afterAll(async () => {
        await prisma.cleanDb();
        app.close();
    });

    describe('Sign up feature tests', () => {
        it('Test signup feature with sucess case - 201', async () => {
            const user: SignUpDto = factory.generateUserData();

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

            const result = await factory.inspectUser({ email: user.email });

            expect(result).not.toBeNull();
        });
        it('Test signup feature with failing case - duplicate name - 409', async () => {
            const { name } = await factory.createUser();
            const userData = factory.generateUserData({ name });
            return pactum
                .spec()
                .post(SIGNUP)
                .withBody(userData)
                .expectStatus(409);
        });
        it('Test signup feature with failing case - duplicate email - 409', async () => {
            const { email } = await factory.createUser();
            const userData = factory.generateUserData({ email });
            return pactum
                .spec()
                .post(SIGNUP)
                .withBody(userData)
                .expectStatus(409);
        });
        it('Test signup feature with failing case - wrong request body - 400', () => {
            const userData = factory.generateUserData({ email: 'ldskadksald' });
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
            const userData = factory.generateUserData();
            const { email, password } = userData;
            await factory.createUser(userData);

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
            const userData = factory.generateUserData();
            const { email } = userData;
            await factory.createUser(userData);

            return pactum
                .spec()
                .post(SIGNIN)
                .withBody({ email, password: faker.internet.password(7) })
                .expectStatus(403);
        });

        it('Test login with invalid email - should fail with not found - 404', async () => {
            const { email } = factory.generateUserData();

            return pactum
                .spec()
                .post(SIGNIN)
                .withBody({ email, password: faker.internet.password(7) })
                .expectStatus(404);
        });
    });

    describe('Test jwt authentication', () => {
        it('Test acess user data without validation token - 400', async () => {
            return pactum.spec().get(GETUSER).expectStatus(400);
        });

        it('Test acess user data with validation token on wrong format - 403', async () => {
            await pactum
                .spec()
                .get(GETUSER)
                .withHeaders({
                    Authorization: 'Bearer ',
                })
                .expectStatus(400);

            await pactum
                .spec()
                .get(GETUSER)
                .withHeaders({
                    Authorization: 'Bearer djaojfodjsafjoa',
                })
                .expectStatus(400);
        });

        it('Test acess token with invalid JWT - 403', async () => {
            const user = await factory.createUser();
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
                .expectStatus(400);
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
