import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.authUser.findMany();
        return users.map(user => this.mapToEntity(user));
    }

    async findOne(id: string): Promise<User> {
        const user = await this.prisma.authUser.findUnique({ where: { id } });
        return user ? this.mapToEntity(user) : null;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.prisma.authUser.findUnique({ where: { email } });
        return user ? this.mapToEntity(user) : null;
    }

    async createFromGoogle(googleData: { email: string; name: string; googleId: string }): Promise<User> {
        const newUser = await this.prisma.authUser.create({
            data: {
                email: googleData.email,
                name: googleData.name,
                passwordHash: '', // No password for Google users
                roles: 'ADMIN', // Default role for Google sign-in users
                permissions: 'VIEW_BILLING,VIEW_ANALYTICS,VIEW_COMPLIANCE',
            },
        });
        return this.mapToEntity(newUser);
    }

    private mapToEntity(user: any): User {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles ? user.roles.split(',') : [],
            permissions: user.permissions ? user.permissions.split(',') : [],
        };
    }
}
