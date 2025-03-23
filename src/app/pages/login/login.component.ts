import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Iniciar sesión</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form #loginForm="ngForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <input
                matInput
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                #emailInput="ngModel"
              >
              @if (emailInput.invalid && emailInput.touched) {
                <mat-error>Por favor, ingresa un correo electrónico válido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                minlength="6"
                #passwordInput="ngModel"
              >
              @if (passwordInput.invalid && passwordInput.touched) {
                <mat-error>La contraseña debe tener al menos 6 caracteres</mat-error>
              }
            </mat-form-field>

            <div class="actions">
              @if (loading) {
                <mat-spinner diameter="36"></mat-spinner>
              } @else {
                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="loginForm.invalid"
                >
                  Iniciar sesión
                </button>
              }
            </div>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <p>¿No tienes una cuenta? <a routerLink="/register">Regístrate aquí</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .actions {
      display: flex;
      justify-content: center;
      min-height: 36px;
      margin: 24px 0;
    }

    mat-card-footer {
      padding: 16px;
      text-align: center;
    }

    a {
      color: #3f51b5;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(private authService: AuthService) {}

  async onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    try {
      await this.authService.signIn(this.email, this.password);
    } finally {
      this.loading = false;
    }
  }
}