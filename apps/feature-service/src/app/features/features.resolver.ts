import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, RolesGuard, Roles } from '@orion/shared-auth';
import { FeaturesService } from './features.service';
import { FeatureFlag } from './entities/feature-flag.entity';

@Resolver(() => FeatureFlag)
export class FeaturesResolver {
    constructor(private readonly featuresService: FeaturesService) { }

    @Query(() => [FeatureFlag], { name: 'featureFlags' })
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAll() {
        return this.featuresService.findAll();
    }

    @Query(() => FeatureFlag, { name: 'featureFlag' })
    @UseGuards(GqlAuthGuard)
    findOne(@Args('name') name: string) {
        return this.featuresService.findOne(name);
    }
}
