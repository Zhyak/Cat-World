import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { supabase } from '../supabase/supabase.client';
import { Cat } from '../models/cat.model';

@Injectable({
  providedIn: 'root'
})
export class CatsService {
  private cats = new BehaviorSubject<Cat[]>([]);
  private loading = new BehaviorSubject<boolean>(false);

  constructor(private snackBar: MatSnackBar) {
    this.loadCats();
  }

  getCats(): Observable<Cat[]> {
    return this.cats.asObservable();
  }

  isLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  private async loadCats() {
    this.loading.next(true);
    try {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cats = data.map(cat => ({
        ...cat,
        birthday: new Date(cat.birthday),
        createdAt: new Date(cat.created_at)
      }));

      this.cats.next(cats);
    } catch (error) {
      console.error('Error loading cats:', error);
      this.showError('Error al cargar los gatos');
    } finally {
      this.loading.next(false);
    }
  }

  async addCat(cat: Omit<Cat, 'id' | 'createdAt'>): Promise<void> {
    this.loading.next(true);
    try {
      const { data, error } = await supabase
        .from('cats')
        .insert([{
          ...cat,
          imageUrl: cat.imageUrl || 'https://placekitten.com/400/300'
        }])
        .select()
        .single();

      if (error) throw error;

      const newCat = {
        ...data,
        birthday: new Date(data.birthday),
        createdAt: new Date(data.created_at)
      };

      this.cats.next([newCat, ...this.cats.value]);
      this.showSuccess('Gato agregado exitosamente');
    } catch (error) {
      console.error('Error adding cat:', error);
      this.showError('Error al agregar el gato');
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  async deleteCat(id: string): Promise<void> {
    this.loading.next(true);
    try {
      const { error } = await supabase
        .from('cats')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.cats.next(this.cats.value.filter(cat => cat.id !== id));
      this.showSuccess('Gato eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting cat:', error);
      this.showError('Error al eliminar el gato');
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  getCatById(id: string): Observable<Cat | undefined> {
    return this.cats.pipe(
      map(cats => cats.find(cat => cat.id === id))
    );
  }

  getUniqueBreeds(): string[] {
    return [...new Set(this.cats.value.map(cat => cat.breed))];
  }

  getUniqueFurColors(): string[] {
    return [...new Set(this.cats.value.map(cat => cat.furColor))];
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}