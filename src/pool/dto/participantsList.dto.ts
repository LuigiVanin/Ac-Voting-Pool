import { Type } from '@nestjs/class-transformer';
import { IsArray, IsNotEmpty } from '@nestjs/class-validator';

export class ParticipantsList {
    @IsArray()
    @Type(() => Number)
    @IsNotEmpty()
    users: number[];
}
