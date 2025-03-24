import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './app/core/services/auth.service';
import { AuthGuard } from './app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./app/features/cats/pages/cat-list/cat-list.component')
      .then(m => m.CatListComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./app/features/auth/pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./app/features/auth/pages/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'cat/new',
    canActivate: [AuthGuard],
    loadComponent: () => import('./app/features/cats/pages/cat-form/cat-form.component')
      .then(m => m.CatFormComponent)
  },
  {
    path: 'cat/edit/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./app/features/cats/pages/cat-form/cat-form.component')
      .then(m => m.CatFormComponent)
  },
  {
    path: 'cat/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./app/features/cats/pages/cat-detail/cat-detail.component')
      .then(m => m.CatDetailComponent)
  }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button routerLink="/">
        <mat-icon>pets</mat-icon>
      </button>
      <span>Catálogo de Gatitos</span>
      <span class="spacer"></span>
      @if (authService.isAuthenticated()) {
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="authService.signOut()">
            <mat-icon>logout</mat-icon>
            <span>Cerrar sesión</span>
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
  `]
})
export class App {
  constructor(public authService: AuthService) {}
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations()
  ]
}).catch(err => console.error(err));