import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { AuthGuard } from './app/core/guards/auth.guard';
import { MainLayoutComponent } from './app/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './app/layouts/auth-layout/auth-layout.component';
import { AppComponent } from './app/app.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./app/features/cats/pages/cat-list/cat-list.component')
          .then(m => m.CatListComponent)
      },
      {
        path: 'cat/new',
        loadComponent: () => import('./app/features/cats/pages/cat-form/cat-form.component')
          .then(m => m.CatFormComponent)
      },
      {
        path: 'cat/edit/:id',
        loadComponent: () => import('./app/features/cats/pages/cat-form/cat-form.component')
          .then(m => m.CatFormComponent)
      },
      {
        path: 'cat/:id',
        loadComponent: () => import('./app/features/cats/pages/cat-detail/cat-detail.component')
          .then(m => m.CatDetailComponent)
      }
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./app/features/auth/pages/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./app/features/auth/pages/register/register.component')
          .then(m => m.RegisterComponent)
      }
    ]
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations()
  ]
}).catch(err => console.error(err));