import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="auth-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-md);
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    @media (max-width: 600px) {
      .auth-container {
        padding: var(--spacing-sm);
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AuthLayoutComponent {}