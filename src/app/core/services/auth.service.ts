import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { supabase } from '../../supabase/supabase.client';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    this.userSubject.next(session?.user || null);

    supabase.auth.onAuthStateChange((event, session) => {
      this.userSubject.next(session?.user || null);
    });
  }

  async signUp(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      this.snackBar.open('¡Registro exitoso! Por favor, inicia sesión.', 'Cerrar', { duration: 3000 });
      return true;
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error en el registro', 'Cerrar', { duration: 5000 });
      return false;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      this.router.navigate(['/']);
      return true;
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error al iniciar sesión', 'Cerrar', { duration: 5000 });
      return false;
    }
  }

  async signOut() {
    await supabase.auth.signOut();
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return this.userSubject.value !== null;
  }

  getCurrentUserId(): string | null {
    return this.userSubject.value?.id || null;
  }
}