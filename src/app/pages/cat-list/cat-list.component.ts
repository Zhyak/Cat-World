import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { CatCardComponent } from '../../components/cat-card/cat-card.component';
import { DeleteDialogComponent } from '../../components/delete-dialog/delete-dialog.component';
import { CatsService } from '../../services/cats.service';
import { Cat } from '../../models/cat.model';

@Component({
  selector: 'app-cat-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    RouterModule,
    CatCardComponent
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Nuestros Gatitos</h1>
        <button mat-raised-button color="primary" routerLink="/cat/new">
          <mat-icon>add</mat-icon> Agregar Gato
        </button>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar por nombre</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onFilterChange()">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Raza</mat-label>
          <mat-select [(ngModel)]="selectedBreed" (ngModelChange)="onFilterChange()">
            <mat-option>Todas</mat-option>
            @for (breed of breeds; track breed) {
              <mat-option [value]="breed">{{ breed }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Color</mat-label>
          <mat-select [(ngModel)]="selectedColor" (ngModelChange)="onFilterChange()">
            <mat-option>Todos</mat-option>
            @for (color of furColors; track color) {
              <mat-option [value]="color">{{ color }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="age-range">
          <mat-form-field appearance="outline">
            <mat-label>Edad mínima (meses)</mat-label>
            <input matInput type="number" [(ngModel)]="minAge" (ngModelChange)="onFilterChange()">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Edad máxima (meses)</mat-label>
            <input matInput type="number" [(ngModel)]="maxAge" (ngModelChange)="onFilterChange()">
          </mat-form-field>
        </div>
      </div>
      
      @if (catsService.isLoading() | async) {
        <div class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <div class="cats-grid">
        @for (cat of filteredCats$ | async; track cat.id) {
          <app-cat-card 
            [cat]="cat"
            (delete)="onDeleteCat($event)"
          />
        }
      </div>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .age-range {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }
    
    h1 {
      margin: 0;
      font-size: 2rem;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
  `]
})
export class CatListComponent implements OnInit {
  private filterSubject = new BehaviorSubject<{
    search: string;
    breed: string | null;
    color: string | null;
    minAge: number | null;
    maxAge: number | null;
  }>({
    search: '',
    breed: null,
    color: null,
    minAge: null,
    maxAge: null
  });

  searchTerm = '';
  selectedBreed: string | null = null;
  selectedColor: string | null = null;
  minAge: number | null = null;
  maxAge: number | null = null;

  breeds: string[] = [];
  furColors: string[] = [];

  filteredCats$ = combineLatest([
    this.catsService.getCats(),
    this.filterSubject
  ]).pipe(
    map(([cats, filters]) => {
      return cats.filter(cat => {
        const matchesSearch = !filters.search || 
          cat.name.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesBreed = !filters.breed || 
          cat.breed === filters.breed;
        
        const matchesColor = !filters.color || 
          cat.furColor === filters.color;

        const age = this.calculateAge(cat.birthday);
        const matchesMinAge = !filters.minAge || 
          age >= filters.minAge;
        const matchesMaxAge = !filters.maxAge || 
          age <= filters.maxAge;

        return matchesSearch && matchesBreed && 
               matchesColor && matchesMinAge && matchesMaxAge;
      });
    })
  );

  constructor(
    public catsService: CatsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.breeds = this.catsService.getUniqueBreeds();
    this.furColors = this.catsService.getUniqueFurColors();
  }

  onFilterChange() {
    this.filterSubject.next({
      search: this.searchTerm,
      breed: this.selectedBreed,
      color: this.selectedColor,
      minAge: this.minAge,
      maxAge: this.maxAge
    });
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    return Math.floor(
      (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
  }

  async onDeleteCat(cat: Cat) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { catName: cat.name }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.catsService.deleteCat(cat.id);
        } catch (error) {
          console.error('Error deleting cat:', error);
        }
      }
    });
  }
}