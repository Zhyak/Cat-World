import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { supabase } from '../../supabase/supabase.client';
import { Cat } from '../models/cat.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CatsService implements OnDestroy {
  private cats = new BehaviorSubject<Cat[]>([]);
  private loading = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.loadCats();
        }
      });
  }

  getCats(): Observable<Cat[]> {
    return this.cats.asObservable();
  }

  isLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  private async loadCats(): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.loading.next(true);
    try {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cats = (data || []).map((dbCat: any) => this.mapDatabaseCatToModel(dbCat));
      this.cats.next(cats);
    } catch (error: any) {
      console.error('Error loading cats:', error);
      this.showError(`Error al cargar los gatos: ${error.message || 'Error desconocido'}`);
    } finally {
      this.loading.next(false);
    }
  }

  private mapDatabaseCatToModel(dbCat: any): Cat {
    return {
      id: dbCat.id,
      name: dbCat.name,
      imageUrl: dbCat.imageUrl,
      birthday: new Date(dbCat.birthday),
      favoriteToy: dbCat.favoriteToy,
      breed: dbCat.breed,
      furColor: dbCat.furColor,
      ownerName: dbCat.ownerName,
      description: dbCat.description,
      personalityTraits: dbCat.personalityTraits || [],
      funFacts: dbCat.funFacts || [],
      userId: dbCat.user_id,
      createdAt: new Date(dbCat.created_at),
      updatedAt: dbCat.updated_at ? new Date(dbCat.updated_at) : new Date()
    };
  }

  private mapModelToDatabaseCat(cat: Partial<Cat>): any {
    return {
      name: cat.name,
      imageUrl: cat.imageUrl,
      birthday: cat.birthday instanceof Date ? cat.birthday.toISOString().split('T')[0] : cat.birthday,
      favoriteToy: cat.favoriteToy,
      breed: cat.breed,
      furColor: cat.furColor,
      ownerName: cat.ownerName,
      description: cat.description,
      personalityTraits: cat.personalityTraits,
      funFacts: cat.funFacts,
      updated_at: new Date().toISOString()
    };
  }

  async uploadImage(file: File): Promise<string> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${userId}/${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cat-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cat-images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('No se pudo obtener la URL de la imagen');
      }

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(`Error al subir la imagen: ${error.message || 'Error desconocido'}`);
    }
  }

  async addCat(cat: Omit<Cat, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    this.loading.next(true);
    try {
      const dbCat = this.mapModelToDatabaseCat(cat);
      const { data, error } = await supabase
        .from('cats')
        .insert([{ ...dbCat, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      const newCat = this.mapDatabaseCatToModel(data);
      this.cats.next([newCat, ...this.cats.value]);
      this.showSuccess('Gatito agregado exitosamente');
    } catch (error: any) {
      console.error('Error adding cat:', error);
      this.showError(`Error al agregar el gatito: ${error.message || 'Error desconocido'}`);
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  async updateCat(id: string, cat: Partial<Cat>): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    this.loading.next(true);
    try {
      const dbCat = this.mapModelToDatabaseCat(cat);
      const { data, error } = await supabase
        .from('cats')
        .update(dbCat)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedCat = this.mapDatabaseCatToModel(data);
      this.cats.next(this.cats.value.map((c: Cat) => c.id === id ? updatedCat : c));
      this.showSuccess('Gatito actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating cat:', error);
      this.showError(`Error al actualizar el gatito: ${error.message || 'Error desconocido'}`);
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  async deleteCat(id: string): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    this.loading.next(true);
    try {
      const { error } = await supabase
        .from('cats')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      this.cats.next(this.cats.value.filter((cat: Cat) => cat.id !== id));
      this.showSuccess('Gatito eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting cat:', error);
      this.showError(`Error al eliminar el gatito: ${error.message || 'Error desconocido'}`);
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  getCatById(id: string): Observable<Cat | undefined> {
    return this.cats.asObservable().pipe(
      map((cats: Cat[]) => cats.find((cat: Cat) => cat.id === id))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
