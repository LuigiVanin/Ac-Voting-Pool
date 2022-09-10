import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
} from '@nestjs/class-validator';

export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?!.*@).*$/)
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @Matches(/^(http|https|Http|Https):\/\/[^ "]+$/)
    @IsUrl()
    imageUrl: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
