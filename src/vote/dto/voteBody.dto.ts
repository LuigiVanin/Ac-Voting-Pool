import { IsNotEmpty, IsNumber } from '@nestjs/class-validator';

export class VoteBody {
    @IsNumber()
    @IsNotEmpty()
    votedParticipantId: number;
}
