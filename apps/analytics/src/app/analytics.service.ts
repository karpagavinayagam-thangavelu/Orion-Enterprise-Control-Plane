import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { map } from 'rxjs/operators';

export interface AnalyticsStats {
    activeUsers: number;
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
}

export interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root',
})
export class AnalyticsService {
    private apollo = inject(Apollo);

    getStats() {
        const query = gql`
      query GetAnalyticsStats {
        analyticsStats {
          activeUsers
          totalRequests
          avgResponseTime
          errorRate
        }
      }
    `;

        return this.apollo
            .watchQuery<any>({ query })
            .valueChanges.pipe(map((result) => {
                if (result.error) {
                    console.error('AnalyticsService: GraphQL Error', result.error);
                    return null;
                }
                if (!result.data) {
                    console.warn('AnalyticsService: No data returned');
                    return null;
                }
                return result.data.analyticsStats;
            }));
    }

    getRecentActivity() {
        const query = gql`
      query GetRecentActivity {
        recentActivity(limit: 5) {
          id
          userId
          action
          timestamp
        }
      }
    `;

        return this.apollo
            .watchQuery<any>({ query })
            .valueChanges.pipe(map((result) => {
                if (result.error) {
                    console.error('AnalyticsService: GraphQL Error (recentActivity)', result.error);
                    return [];
                }
                if (!result.data) {
                    console.warn('AnalyticsService: No recentActivity data returned');
                    return [];
                }
                return result.data.recentActivity;
            }));
    }
}
