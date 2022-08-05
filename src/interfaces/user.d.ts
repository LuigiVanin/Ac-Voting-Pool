import { User } from '@prisma/client';

type AuthUser = Omit<User, 'password'>;
