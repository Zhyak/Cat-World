import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Cat } from '../../models/cat.model';

@Component({
  selector: 'app-cat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <mat-card class="cat-card">
      <img mat-card-image [src]="cat.imageUrl" [alt]="cat.name" (error)="onImageError($event)">
      <mat-card-content>
        <h2 class="cat-name">{{ cat.name }}</h2>
        <div class="cat-info">
          <div class="info-item">
            <mat-icon class="info-icon">person</mat-icon>
            <span>{{ cat.ownerName }}</span>
          </div>
          <div class="info-item">
            <mat-icon class="info-icon">cake</mat-icon>
            <span>{{ calculateAge(cat.birthday) }}</span>
          </div>
          <div class="info-item">
            <mat-icon class="info-icon">toys</mat-icon>
            <span>{{ cat.favoriteToy }}</span>
          </div>
        </div>
        <p class="description">{{ cat.description }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary" [routerLink]="['/cat', cat.id]">
          <mat-icon>pets</mat-icon> Ver detalles
        </button>
        <button mat-button color="accent" [routerLink]="['/cat/edit', cat.id]">
          <mat-icon>edit</mat-icon> Editar
        </button>
        <button mat-button color="warn" (click)="delete.emit(cat)">
          <mat-icon>delete</mat-icon> Eliminar
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .cat-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .cat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }
    
    img {
      height: 200px;
      object-fit: cover;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    
    mat-card-content {
      flex-grow: 1;
      padding: 16px;
    }

    .cat-name {
      font-size: 1.5rem;
      margin-bottom: 12px;
      color: #333;
    }

    .cat-info {
      margin: 16px 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      margin: 8px 0;
      color: rgba(0, 0, 0, 0.7);
    }

    .info-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 8px;
      color: #666;
    }

    .description {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9rem;
      line-height: 1.5;
      margin-top: 12px;
    }

    mat-card-actions {
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }

    button {
      flex: 1;
      margin: 0 4px !important;
    }
  `]
})
export class CatCardComponent {
  @Input({ required: true }) cat!: Cat;
  @Output() delete = new EventEmitter<Cat>();

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placekitten.com/400/300';
  }

  calculateAge(birthday: Date): string {
    const today = new Date();
    const birth = new Date(birthday);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 +
      today.getMonth() - birth.getMonth();
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} año${years !== 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths !== 1 ? 'es' : ''}`;
    }
    return `${remainingMonths} mes${remainingMonths !== 1 ? 'es' : ''}`;
  }
}