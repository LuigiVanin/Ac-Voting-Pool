import { IsOptional, IsNotEmpty, IsString } from '@nestjs/class-validator';

export class CreatePoolDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    desc?: string;
}
