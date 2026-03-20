import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { map } from 'rxjs/operators';

export interface Transaction {
    id: string;
    customerName: string;
    amount: number;
    status: string;
    date: string;
}

export interface RevenueStats {
    totalRevenue: number;
    monthlyGrowth: number;
    pendingInvoices: number;
    nextPayoutDate: string;
}

@Injectable({
    providedIn: 'root',
})
export class BillingService {
    private apollo = inject(Apollo);

    getRevenueStats() {
        const query = gql`
      query GetRevenueStats {
        revenueStats {
          totalRevenue
          monthlyGrowth
          pendingInvoices
          nextPayoutDate
        }
      }
    `;

        return this.apollo
            .watchQuery<any>({
                query,
            })
            .valueChanges.pipe(map((result: any) => {
                if (result.errors) {
                    console.error('BillingService: GraphQL Errors', result.errors);
                    return null;
                }
                if (!result.data) {
                    console.warn('BillingService: No data returned');
                    return null;
                }
                return result.data.revenueStats;
            }));
    }

    getTransactions() {
        const query = gql`
      query GetTransactions {
        transactions {
          id
          customerName
          amount
          status
          date
        }
      }
    `;

        return this.apollo
            .watchQuery<any>({
                query,
            })
            .valueChanges.pipe(map((result: any) => {
                if (result.errors) {
                    console.error('BillingService: GraphQL Errors', result.errors);
                    return [];
                }
                if (!result.data) {
                    console.warn('BillingService: No transaction data returned');
                    return [];
                }
                return result.data.transactions;
            }));
    }
}
