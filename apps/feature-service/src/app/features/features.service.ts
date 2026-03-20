import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './entities/feature-flag.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeaturesService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<FeatureFlag[]> {
        return await this.prisma.featureFlag.findMany();
    }

    async findOne(name: string): Promise<FeatureFlag> {
        return await this.prisma.featureFlag.findUnique({ where: { name } });
    }
}
