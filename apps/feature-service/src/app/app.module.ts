import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { FeaturesModule } from './features/features.module';
import { PrismaModule } from './prisma/prisma.module';
import { SharedAuthModule } from '@orion/shared-auth';

@Module({
  imports: [
    PrismaModule,
    SharedAuthModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
    }),
    FeaturesModule,
  ],
})
export class AppModule { }
