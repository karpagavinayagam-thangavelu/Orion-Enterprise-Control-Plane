import { Module } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { FeaturesResolver } from './features.resolver';

@Module({
  providers: [FeaturesService, FeaturesResolver],
})
export class FeaturesModule {}
