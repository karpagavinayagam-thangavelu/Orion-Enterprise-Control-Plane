import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureHeaderComponent, DataContainerComponent } from '@orion/ui';
import { ComplianceService, ComplianceStats, ComplianceCheck } from '../compliance.service';

@Component({
  standalone: true,
  imports: [CommonModule, FeatureHeaderComponent, DataContainerComponent],
  selector: 'app-compliance-entry',
  template: `
    <div class="feature-container">
      <orion-feature-header 
        title="Compliance & Security" 
        subtitle="Monitor regulatory adherence and security protocols.">
      </orion-feature-header>

      <div class="compliance-status" *ngIf="stats() as s">
        <div class="status-indicator">
          <div class="ring" [style.border-top-color]="s.complianceScore > 90 ? '#10b981' : '#f59e0b'">
            <div class="percentage" [style.color]="s.complianceScore > 90 ? '#10b981' : '#f59e0b'">
                {{s.complianceScore | number:'1.0-0'}}%
            </div>
          </div>
          <div class="status-text">
            <h3>Overall Compliance</h3>
            <p>{{s.complianceScore > 90 ? 'Excellent status.' : 'Requires attention.'}} {{s.recentViolations}} recent advisories.</p>
            <small>Last Audit: {{s.lastAudit}}</small>
          </div>
        </div>
      </div>

      <orion-data-container title="Compliance Checklists">
        <div class="check-item" *ngFor="let check of checks()">
          <div class="check-info">
            <span class="check-icon" [class.passed]="check.status === 'COMPLIANT'">
                {{check.status === 'COMPLIANT' ? '✓' : '!'}}
            </span>
            <div>
              <div class="check-name">{{check.title}}</div>
              <div class="check-desc">{{check.category}}</div>
            </div>
          </div>
          <div class="check-status">{{check.status}}</div>
        </div>
        <div *ngIf="checks().length === 0" class="empty-state">
           No compliance checks recorded.
        </div>
      </orion-data-container>
    </div>
  `,
  styles: [`
    .feature-container { animation: fadeIn 0.5s ease-out; }

    .compliance-status {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(129, 140, 248, 0.1));
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 24px;
      padding: 40px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      backdrop-filter: blur(10px);
    }

    .ring {
      width: 100px;
      height: 100px;
      border: 8px solid rgba(16, 185, 129, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 32px;
    }

    .percentage { font-size: 1.5rem; font-weight: 800; }

    .status-text h3 { font-size: 1.5rem; margin-bottom: 4px; color: #f8fafc; }
    .status-text p { color: #94a3b8; margin-bottom: 4px; }
    .status-text small { color: #64748b; font-size: 0.75rem; }

    .check-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #cbd5e1;
    }
    .check-item:last-child { border-bottom: none; }

    .check-info { display: flex; align-items: center; gap: 20px; }
    .check-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(244, 63, 94, 0.1);
      color: #f43f5e;
      font-weight: 800;
    }
    .check-icon.passed { background: rgba(16, 185, 129, 0.1); color: #10b981; }

    .check-name { font-weight: 600; margin-bottom: 2px; }
    .check-desc { font-size: 0.875rem; color: #64748b; }
    .check-status { font-size: 0.875rem; font-weight: 600; color: #64748b; }

    .empty-state { padding: 20px; text-align: center; color: #64748b; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RemoteEntry implements OnInit {
  private complianceService = inject(ComplianceService);

  stats = signal<ComplianceStats | null>(null);
  checks = signal<ComplianceCheck[]>([]);

  ngOnInit() {
    this.complianceService.getStats().subscribe(data => this.stats.set(data));
    this.complianceService.getChecks().subscribe(data => this.checks.set(data));
  }
}
