import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'orion-logo',
    standalone: true,
    imports: [CommonModule],
    template: `
    <svg 
      [style.width]="size" 
      [style.height]="size" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      [class]="className"
    >
      <!-- Outer Circle -->
      <circle cx="50" cy="50" r="45" stroke="currentColor" [attr.stroke-width]="strokeWidth" class="outer-circle" />
      
      <!-- Connections -->
      <g class="connections">
        <line x1="25" y1="30" x2="60" y2="15" stroke="currentColor" [attr.stroke-width]="connectionWidth" />
        <line x1="60" y1="15" x2="50" y2="52" stroke="currentColor" [attr.stroke-width]="connectionWidth" />
        <line x1="50" y1="52" x2="85" y2="45" stroke="currentColor" [attr.stroke-width]="connectionWidth" />
        <line x1="85" y1="45" x2="75" y2="80" stroke="currentColor" [attr.stroke-width]="connectionWidth" />
        <line x1="75" y1="80" x2="50" y2="52" stroke="currentColor" [attr.stroke-width]="connectionWidth" />
        <line x1="50" y1="52" x2="30" y2="75" stroke="currentColor" [attr.stroke-width]="connectionWidth" />
        <line x1="30" y1="75" x2="25" y2="30" stroke="currentColor" [attr.stroke-width]="connectionWidth" />
      </g>

      <!-- Nodes (Stars) -->
      <g class="stars">
        <circle cx="60" cy="15" r="3" fill="currentColor" />
        <circle cx="25" cy="30" r="3" fill="currentColor" />
        <circle cx="85" cy="45" r="3" fill="currentColor" />
        <circle cx="75" cy="80" r="3" fill="currentColor" />
        <circle cx="30" cy="75" r="3" fill="currentColor" />
        <circle cx="50" cy="52" r="3" fill="currentColor" />
      </g>
    </svg>
  `,
    styles: [`
    :host { display: inline-block; }
    svg { display: block; overflow: visible; }
    .outer-circle { 
      filter: drop-shadow(0 0 4px currentColor);
      opacity: 0.8;
    }
    .stars circle {
      filter: drop-shadow(0 0 6px currentColor);
      animation: twinkle 3s infinite ease-in-out;
    }
    .stars circle:nth-child(2n) { animation-delay: 1s; }
    .stars circle:nth-child(3n) { animation-delay: 2s; }
    
    .connections {
      opacity: 0.4;
      filter: drop-shadow(0 0 2px currentColor);
    }

    @keyframes twinkle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.8); }
    }
  `]
})
export class LogoComponent {
    @Input() size = '32px';
    @Input() strokeWidth = '2.5';
    @Input() connectionWidth = '1.8';
    @Input() className = '';
}
