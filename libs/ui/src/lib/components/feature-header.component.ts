import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'orion-feature-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="feature-header">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </header>
  `,
    styles: [`
    .feature-header {
      margin-bottom: 32px;
    }
    .feature-header h1 {
      font-size: 2.5rem;
      margin-bottom: 8px;
      color: #f8fafc;
      font-weight: 700;
    }
    .feature-header p {
      color: #94a3b8;
      font-size: 1.1rem;
    }
  `]
})
export class FeatureHeaderComponent {
    @Input({ required: true }) title!: string;
    @Input({ required: true }) subtitle!: string;
}
