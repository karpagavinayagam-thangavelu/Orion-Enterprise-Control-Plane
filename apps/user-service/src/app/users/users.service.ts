import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string): Promise<Partial<User>> {
        const profile = await this.prisma.userProfile.findUnique({ where: { id } });
        return profile || { id };
    }
}
