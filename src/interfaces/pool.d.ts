import { Pool } from '@prisma/client';

type PoolData = Omit<
    Pool,
    'id' | 'closed' | 'createdAt' | 'updatedAt' | 'desc'
> & { desc?: string };
