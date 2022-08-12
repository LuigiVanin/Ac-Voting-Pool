import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';

export const GetPool = createParamDecorator(
    (_: unknown, request: ExecutionContext) => {
        const { pool } = request.switchToHttp().getRequest();
        if (!pool) {
            throw new BadRequestException();
        }
        console.log(pool);
        return pool;
    },
);

export const GetParticipant = createParamDecorator(
    (_: unknown, request: ExecutionContext) => {
        const { participant } = request.switchToHttp().getRequest();
        if (!participant) {
            throw new BadRequestException();
        }
        console.log(participant);
        return participant;
    },
);
