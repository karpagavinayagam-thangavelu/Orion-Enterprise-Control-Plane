import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { map } from 'rxjs/operators';

export interface ComplianceStats {
    complianceScore: number;
    activePolicies: number;
    recentViolations: number;
    lastAudit: string;
}

export interface ComplianceCheck {
    id: string;
    title: string;
    status: string;
    category: string;
    lastCheck: string;
}

@Injectable({
    providedIn: 'root',
})
export class ComplianceService {
    private apollo = inject(Apollo);

    getStats() {
        const query = gql`
      query GetComplianceStats {
        complianceStats {
          complianceScore
          activePolicies
          recentViolations
          lastAudit
        }
      }
    `;

        return this.apollo
            .watchQuery<any>({ query })
            .valueChanges.pipe(map((result) => {
                if (result.error) {
                    console.error('ComplianceService: GraphQL Error', result.error);
                    return null;
                }
                if (!result.data) {
                    console.warn('ComplianceService: No data returned');
                    return null;
                }
                return result.data.complianceStats;
            }));
    }

    getChecks() {
        const query = gql`
      query GetComplianceChecks {
        complianceChecks {
          id
          title
          status
          category
          lastCheck
        }
      }
    `;

        return this.apollo
            .watchQuery<any>({ query })
            .valueChanges.pipe(map((result) => {
                if (result.error) {
                    console.error('ComplianceService: GraphQL Error (checks)', result.error);
                    return [];
                }
                if (!result.data) {
                    console.warn('ComplianceService: No checks data returned');
                    return [];
                }
                return result.data.complianceChecks;
            }));
    }
}
