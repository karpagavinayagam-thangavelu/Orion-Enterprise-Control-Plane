import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Ensures the subgraph URL is properly formatted for GraphQL introspection.
 * Handles Render's internal hostnames by adding http:// and /graphql if missing.
 */
function formatSubgraphUrl(url: string, defaultUrl: string): string {
  if (!url) return defaultUrl;

  let formatted = url;
  if (!formatted.startsWith('http')) {
    formatted = `http://${formatted}`;
  }
  if (!formatted.endsWith('/graphql')) {
    formatted = `${formatted.replace(/\/$/, '')}/graphql`;
  }
  return formatted;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: 'auth',
                url: formatSubgraphUrl(config.get('AUTH_SERVICE_URL'), 'http://localhost:3001/graphql')
              },
              {
                name: 'user',
                url: formatSubgraphUrl(config.get('USER_SERVICE_URL'), 'http://localhost:3002/graphql')
              },
              {
                name: 'feature',
                url: formatSubgraphUrl(config.get('FEATURE_SERVICE_URL'), 'http://localhost:3003/graphql')
              },
              {
                name: 'analytics',
                url: formatSubgraphUrl(config.get('ANALYTICS_SERVICE_URL'), 'http://localhost:3004/graphql')
              },
              {
                name: 'notification',
                url: formatSubgraphUrl(config.get('NOTIFICATION_SERVICE_URL'), 'http://localhost:3005/graphql')
              },
              {
                name: 'billing',
                url: formatSubgraphUrl(config.get('BILLING_SERVICE_URL'), 'http://localhost:3006/graphql')
              },
              {
                name: 'compliance',
                url: formatSubgraphUrl(config.get('COMPLIANCE_SERVICE_URL'), 'http://localhost:3007/graphql')
              },
            ],
          }),
          buildService({ url }) {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({ request, context }) {
                if (context['req'] && context['req'].headers) {
                  const auth = context['req'].headers.authorization;
                  if (auth) {
                    request.http.headers.set('authorization', auth);
                  }
                }
              },
            });
          },
        },
        server: {
          context: ({ req }) => ({ req }),
        },
      }),
    }),
  ],
})
export class AppModule { }
