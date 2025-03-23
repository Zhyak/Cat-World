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
    <mat-card class="mat-elevation-z4">
      <img mat-card-image [src]="cat.imageUrl" [alt]="cat.name" (error)="onImageError($event)">
      <mat-card-content>
        <mat-card-title>{{ cat.name }}</mat-card-title>
        <mat-card-subtitle>{{ cat.breed }}</mat-card-subtitle>
        <p>{{ cat.description }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary" [routerLink]="['/cat', cat.id]">
          <mat-icon>pets</mat-icon> Ver detalles
        </button>
        <button mat-button color="warn" (click)="delete.emit(cat)">
          <mat-icon>delete</mat-icon> Eliminar
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    img {
      object-fit: cover;
      height: 200px;
    }
    
    mat-card-content {
      flex-grow: 1;
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
}