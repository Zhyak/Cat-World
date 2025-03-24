import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizationService {
  constructor(private sanitizer: DomSanitizer) {}

  sanitizeHtml(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  sanitizeUrl(url: string): SafeUrl {
    // Basic URL validation
    if (!url || !this.isValidUrl(url)) {
      return this.sanitizer.bypassSecurityTrustUrl('');
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}