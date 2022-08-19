import { Injectable } from '@nestjs/common';
import { UserRepo } from './user.repo';

@Injectable()
export class UserService {
    constructor(private repo: UserRepo) {}

    async getAllUsers() {
        return await this.repo.getAll();
    }
}
