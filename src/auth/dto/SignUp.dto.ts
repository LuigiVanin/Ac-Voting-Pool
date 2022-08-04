import {
    IsEmail,
    IsNotEmpty,
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

    @IsNotEmpty()
    @Matches(/^(http|https):\/\/[^ "]+$/)
    @IsUrl()
    imageUrl: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
