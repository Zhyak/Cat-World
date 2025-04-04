import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Cat } from '../../../../core/models/cat.model';
import { SanitizationService } from '../../../../core/services/sanitization.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cat-card',
  templateUrl: './cat-card.component.html',
  styleUrls: ['./cat-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule]
})
export class CatCardComponent {
  @Input({ required: true }) cat!: Cat;
  @Output() delete = new EventEmitter<Cat>();

  constructor(private sanitizer: SanitizationService) {}

  get safeImageUrl(): SafeUrl {
    return this.sanitizer.sanitizeUrl(this.cat.imageUrl);
  }

  get escapedName(): string {
    return this.sanitizer.escapeHtml(this.cat.name);
  }

  get escapedOwnerName(): string {
    return this.sanitizer.escapeHtml(this.cat.ownerName);
  }

  get escapedFavoriteToy(): string {
    return this.sanitizer.escapeHtml(this.cat.favoriteToy);
  }

  get escapedDescription(): string {
    return this.sanitizer.escapeHtml(this.cat.description);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placekitten.com/400/300';
  }

  onDelete() {
    this.delete.emit(this.cat);
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