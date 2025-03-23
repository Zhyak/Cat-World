import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CatsService } from '../../services/cats.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cat-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, RouterModule],
  template: `
    @if (cat$ | async; as cat) {
      <div class="container">
        <mat-card>
          <img mat-card-image [src]="cat.imageUrl" [alt]="cat.name">
          <mat-card-content>
            <h1>{{ cat.name }}</h1>
            <p class="description">{{ cat.description }}</p>
            
            <div class="info-grid">
              <div class="info-item">
                <h3>Edad</h3>
                <p>{{ calculateAge(cat.birthday) }}</p>
              </div>
              
              <div class="info-item">
                <h3>Raza</h3>
                <p>{{ cat.breed }}</p>
              </div>
              
              <div class="info-item">
                <h3>Color</h3>
                <p>{{ cat.furColor }}</p>
              </div>
              
              <div class="info-item">
                <h3>Juguete Favorito</h3>
                <p>{{ cat.favoriteToy }}</p>
              </div>
              
              <div class="info-item">
                <h3>Dueño</h3>
                <p>{{ cat.ownerName }}</p>
              </div>
            </div>

            <h3>Personalidad</h3>
            <mat-chip-set>
              @for (trait of cat.personalityTraits; track trait) {
                <mat-chip>{{ trait }}</mat-chip>
              }
            </mat-chip-set>

            <h3>Curiosidades</h3>
            <ul>
              @for (fact of cat.funFacts; track fact) {
                <li>{{ fact }}</li>
              }
            </ul>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/">
              <mat-icon>arrow_back</mat-icon> Volver
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    mat-card {
      margin: 20px auto;
      max-width: 800px;
    }
    
    img {
      max-height: 400px;
      object-fit: cover;
    }
    
    h1 {
      font-size: 2rem;
      margin-bottom: 16px;
    }
    
    .description {
      font-size: 1.1rem;
      margin-bottom: 24px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 24px 0;
    }
    
    .info-item h3 {
      color: #666;
      margin-bottom: 8px;
    }
    
    mat-chip-set {
      margin: 16px 0;
    }
    
    ul {
      list-style-position: inside;
      margin: 16px 0;
    }
    
    li {
      margin-bottom: 8px;
    }
  `]
})
export class CatDetailComponent {
  cat$ = this.route.paramMap.pipe(
    switchMap(params => this.catsService.getCatById(params.get('id') || ''))
  );

  constructor(
    private route: ActivatedRoute,
    private catsService: CatsService
  ) {}

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