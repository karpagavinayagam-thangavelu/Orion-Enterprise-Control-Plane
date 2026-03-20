import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'orion-stat-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="stat-card">
      <div class="card-header">
        <label>{{ label }}</label>
        @if (icon) {
          <span class="icon">{{ icon }}</span>
        }
      </div>
      <div class="value">{{ value }}</div>
      @if (trend) {
        <div class="trend" [class.up]="trendPositive" [class.down]="trendNegative">
          {{ trend }}
        </div>
      }
    </div>
  `,
    styles: [`
    .stat-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 24px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(56, 189, 248, 0.4);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .stat-card label {
      font-size: 0.875rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .stat-card .value {
      font-size: 2rem;
      font-weight: 700;
      margin: 8px 0;
      color: #38bdf8;
    }
    .stat-card .trend {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 4px;
    }
    .stat-card .trend.up { color: #10b981; }
    .stat-card .trend.down { color: #f43f5e; }
    .icon { font-size: 1.25rem; }
  `]
})
export class StatCardComponent {
    @Input({ required: true }) label!: string;
    @Input({ required: true }) value!: string | number;
    @Input() icon?: string;
    @Input() trend?: string;
    @Input() trendPositive = false;
    @Input() trendNegative = false;
}
