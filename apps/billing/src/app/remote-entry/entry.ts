import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureHeaderComponent, StatCardComponent, DataContainerComponent } from '@orion/ui';
import { BillingService, Transaction, RevenueStats } from '../billing.service';

@Component({
  standalone: true,
  imports: [CommonModule, FeatureHeaderComponent, StatCardComponent, DataContainerComponent],
  selector: 'app-billing-entry',
  template: `
    <div class="feature-container">
      <orion-feature-header 
        title="Billing & Invoices" 
        subtitle="Manage enterprise billing cycles and financial reporting.">
      </orion-feature-header>

      <div class="stats-grid" *ngIf="stats() as s">
        <orion-stat-card 
          label="Total Revenue" 
          [value]="(s.totalRevenue | currency:'USD':'symbol':'1.0-0') || '$0'" 
          [trend]="s.monthlyGrowth * 100 + '% vs last month'" 
          [trendPositive]="s.monthlyGrowth > 0">
        </orion-stat-card>
        <orion-stat-card 
          label="Pending Invoices" 
          [value]="s.pendingInvoices.toString()" 
          trend="Awaiting approval">
        </orion-stat-card>
        <orion-stat-card 
          label="Next Payout" 
          [value]="s.nextPayoutDate" 
          trend="Scheduled">
        </orion-stat-card>
      </div>

      <orion-data-container title="Recent Transactions">
        <div class="table-row table-header">
          <span>ID</span>
          <span>Customer</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        <div class="table-row" *ngFor="let t of transactions()">
          <span>#{{t.id.substring(0, 8)}}</span>
          <span>{{t.customerName}}</span>
          <span>{{t.amount | currency}}</span>
          <span class="status-pill" [class.success]="t.status === 'PAID'">{{t.status}}</span>
        </div>
        <div *ngIf="transactions().length === 0" class="empty-state">
          No transactions found.
        </div>
      </orion-data-container>
    </div>
  `,
  styles: [`
    .feature-container {
      animation: fadeIn 0.5s ease-out;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 40px;
    }

    .table-row {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr 1fr;
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
    }

    .table-row.table-header { font-weight: 600; color: #94a3b8; }
    
    .status-pill {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      width: fit-content;
    }

    .status-pill:not(.success) {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .empty-state {
        padding: 40px;
        text-align: center;
        color: #94a3b8;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RemoteEntry implements OnInit {
  private billingService = inject(BillingService);

  stats = signal<RevenueStats | null>(null);
  transactions = signal<Transaction[]>([]);

  ngOnInit() {
    this.billingService.getRevenueStats().subscribe(data => this.stats.set(data));
    this.billingService.getTransactions().subscribe(data => this.transactions.set(data));
  }
}
