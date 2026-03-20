import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureHeaderComponent, StatCardComponent, DataContainerComponent } from '@orion/ui';
import { AnalyticsService, AnalyticsStats, ActivityLog } from '../analytics.service';

@Component({
  standalone: true,
  imports: [CommonModule, FeatureHeaderComponent, StatCardComponent, DataContainerComponent],
  selector: 'app-analytics-entry',
  template: `
    <div class="feature-container">
      <orion-feature-header 
        title="Advanced Analytics" 
        subtitle="Real-time data visualization and predictive modeling.">
      </orion-feature-header>

      <orion-data-container title="Platform Traffic">
        <div header-actions class="time-filters">
          <span class="active">Daily</span>
          <span>Weekly</span>
          <span>Monthly</span>
        </div>

        <div class="chart-placeholder">
          <div class="bar" *ngFor="let h of [40, 60, 45, 80, 55, 90, 70, 85, 50, 65, 75, 95]" [style.height.%]="h"></div>
        </div>
        <div class="chart-footer">
          <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
        </div>
      </orion-data-container>

      <div class="grid-2x2" *ngIf="stats() as s">
        <orion-stat-card 
          label="Active Users"
          [value]="s.activeUsers.toLocaleString()"
          icon="👥"
          trend="+5.2% from yest."
          [trendPositive]="true">
        </orion-stat-card>
        <orion-stat-card 
          label="Total Requests"
          [value]="s.totalRequests.toLocaleString()"
          icon="🎯"
          trend="+12% from last hour"
          [trendPositive]="true">
        </orion-stat-card>
        <orion-stat-card 
          label="Avg Response Time"
          [value]="s.avgResponseTime + 'ms'"
          icon="⏱️"
          trend="-2.1% improvement"
          [trendPositive]="true">
        </orion-stat-card>
        <orion-stat-card 
          label="Error Rate"
          [value]="(s.errorRate * 100).toFixed(2) + '%'"
          icon="📉"
          trend="+0.01% from yest."
          [trendNegative]="true">
        </orion-stat-card>
      </div>

      <orion-data-container title="Recent System Activity" style="margin-top: 32px">
        <div class="activity-row" *ngFor="let log of activity()">
          <span class="action">{{log.action}}</span>
          <span class="user">User: {{log.userId}}</span>
          <span class="time">{{log.timestamp | date:'shortTime'}}</span>
        </div>
        <div *ngIf="activity().length === 0" class="empty-state">
          No recent activity logs.
        </div>
      </orion-data-container>
    </div>
  `,
  styles: [`
    .feature-container { animation: fadeIn 0.5s ease-out; }

    .time-filters { display: flex; gap: 12px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 8px; }
    .time-filters span { padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 0.875rem; color: #64748b; }
    .time-filters span.active { background: #38bdf8; color: #0f172a; font-weight: 600; }

    .chart-placeholder {
      height: 200px;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .bar {
      flex: 1;
      background: linear-gradient(to top, #38bdf8, #818cf8);
      border-radius: 4px 4px 0 0;
      transition: height 1s ease-in-out;
      opacity: 0.8;
    }
    .bar:hover { opacity: 1; filter: brightness(1.2); }

    .chart-footer { display: flex; justify-content: space-between; margin-top: 12px; color: #64748b; font-size: 12px; }

    .grid-2x2 { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 24px; 
      margin-top: 32px;
    }

    .activity-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #cbd5e1;
    }

    .activity-row:last-child { border-bottom: none; }

    .action { font-weight: 600; color: #38bdf8; }
    .user { color: #94a3b8; }
    .time { color: #64748b; font-size: 0.875rem; }

    .empty-state { padding: 20px; text-align: center; color: #64748b; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RemoteEntry implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats = signal<AnalyticsStats | null>(null);
  activity = signal<ActivityLog[]>([]);

  ngOnInit() {
    this.analyticsService.getStats().subscribe(data => this.stats.set(data));
    this.analyticsService.getRecentActivity().subscribe(data => this.activity.set(data));
  }
}
