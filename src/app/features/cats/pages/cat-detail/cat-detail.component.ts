import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CatsService } from '../../../../core/services/cats.service';
import { SanitizationService } from '../../../../core/services/sanitization.service';
import { switchMap } from 'rxjs/operators';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cat-detail',
  templateUrl: './cat-detail.component.html',
  styleUrls: ['./cat-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterModule
  ]
})
export class CatDetailComponent {
  cat$ = this.route.paramMap.pipe(
    switchMap(params => this.catsService.getCatById(params.get('id') || ''))
  );

  constructor(
    private route: ActivatedRoute,
    private catsService: CatsService,
    public sanitizer: SanitizationService
  ) {}

  getSafeImageUrl(url: string): SafeUrl {
    return this.sanitizer.sanitizeUrl(url);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placekitten.com/600/400';
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