import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app/pages/cat-list/cat-list.component')
      .then(m => m.CatListComponent)
  },
  {
    path: 'cat/new',
    loadComponent: () => import('./app/pages/cat-form/cat-form.component')
      .then(m => m.CatFormComponent)
  },
  {
    path: 'cat/:id',
    loadComponent: () => import('./app/pages/cat-detail/cat-detail.component')
      .then(m => m.CatDetailComponent)
  }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button routerLink="/">
        <mat-icon>pets</mat-icon>
      </button>
      <span>Catálogo de Gatitos</span>
    </mat-toolbar>
    
    <router-outlet></router-outlet>
  `
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations()
  ]
}).catch(err => console.error(err));