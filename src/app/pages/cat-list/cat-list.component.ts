import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CatCardComponent } from '../../components/cat-card/cat-card.component';
import { DeleteDialogComponent } from '../../components/delete-dialog/delete-dialog.component';
import { CatsService } from '../../services/cats.service';
import { Cat } from '../../models/cat.model';

@Component({
  selector: 'app-cat-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
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
          <mat-icon>add</mat-icon> Agregar Gatito
        </button>
      </div>
      
      @if (catsService.isLoading() | async) {
        <div class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if ((cats$ | async)?.length === 0) {
        <div class="no-results">
          <mat-icon>sentiment_dissatisfied</mat-icon>
          <p>No hay gatitos registrados</p>
        </div>
      }

      <div class="cats-grid">
        @for (cat of cats$ | async; track cat.id) {
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
    
    h1 {
      margin: 0;
      font-size: 2rem;
      color: #333;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .no-results {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .no-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }

    .no-results p {
      font-size: 1.1rem;
    }

    .cats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      padding: 20px 0;
    }
  `]
})
export class CatListComponent implements OnInit {
  cats$!: Observable<Cat[]>;

  constructor(
    public catsService: CatsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cats$ = this.catsService.getCats();
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