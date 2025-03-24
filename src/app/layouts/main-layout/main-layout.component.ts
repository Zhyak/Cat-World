import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button routerLink="/">
        <mat-icon>pets</mat-icon>
      </button>
      <span>Cat World</span>
      <span class="spacer"></span>
      @if (authService.isAuthenticated()) {
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="authService.signOut()">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      }
    </mat-toolbar>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0 var(--spacing-sm);
      min-height: 56px !important;
      
      span {
        margin-left: var(--spacing-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    @media (max-width: 600px) {
      mat-toolbar {
        padding: 0 var(--spacing-xs);
        
        span {
          font-size: 1.1rem;
        }
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class MainLayoutComponent {
  constructor(public authService: AuthService) {}
}