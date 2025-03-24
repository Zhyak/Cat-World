import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule, RouteReuseStrategy } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CatsService } from '../../../../core/services/cats.service';
import { PERSONALITY_TRAITS } from '../../../../core/models/cat.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cat-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatChipsModule,
    NgxDropzoneModule
  ],
  template: `
    <div class="container">
      <h1>{{ isEditMode ? 'Editar Gatito' : 'Agregar Nuevo Gatito' }}</h1>
      
      <form [formGroup]="catForm" (ngSubmit)="onSubmit()">
        <div class="image-upload">
          <ngx-dropzone
            [accept]="'image/jpeg,image/jpg,image/png,image/webp'"
            [maxFileSize]="5242880"
            (change)="onImageSelected($event)"
            [multiple]="false"
            [disabled]="uploadingImage"
          >
            @if (!selectedImage && !existingImageUrl) {
              <ngx-dropzone-label>
                <div class="upload-prompt">
                  <mat-icon>cloud_upload</mat-icon>
                  <p>Arrastra una imagen o haz clic para seleccionar</p>
                  <small>Formatos permitidos: JPG, PNG, WEBP (máx. 5MB)</small>
                </div>
              </ngx-dropzone-label>
            } @else if (selectedImage) {
              <ngx-dropzone-image-preview [file]="selectedImage">
                <ngx-dropzone-label>{{ selectedImage.name }}</ngx-dropzone-label>
              </ngx-dropzone-image-preview>
            } @else if (existingImageUrl) {
              <img [src]="existingImageUrl" alt="Imagen actual" class="existing-image">
            }
          </ngx-dropzone>
          @if (uploadingImage) {
            <div class="upload-overlay">
              <mat-spinner diameter="24"></mat-spinner>
              <span>Subiendo imagen...</span>
            </div>
          }
        </div>

        <div class="form-row">
          <mat-form-field class="form-field-full">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name" required>
            <mat-error *ngIf="catForm.get('name')?.errors?.['required']">
              El nombre es requerido
            </mat-error>
          </mat-form-field>
          
          <mat-form-field class="form-field-full">
            <mat-label>Fecha de nacimiento</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="birthday" required>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="form-field-full">
            <mat-label>Juguete favorito</mat-label>
            <input matInput formControlName="favoriteToy" required>
          </mat-form-field>
          
          <mat-form-field class="form-field-full">
            <mat-label>Dueño</mat-label>
            <input matInput formControlName="ownerName" required>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="form-field-full">
            <mat-label>Raza</mat-label>
            <input matInput formControlName="breed" required>
          </mat-form-field>
          
          <mat-form-field class="form-field-full">
            <mat-label>Color del pelaje</mat-label>
            <input matInput formControlName="furColor" required>
          </mat-form-field>
        </div>

        <mat-form-field class="form-field-full">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="3" required></textarea>
        </mat-form-field>

        <div class="personality-section">
          <h3>Personalidad</h3>
          <div class="personality-grid">
            @for (trait of personalityTraits; track trait) {
              <mat-checkbox [checked]="isTraitSelected(trait)" (change)="onTraitToggle($event, trait)">
                {{ trait }}
              </mat-checkbox>
            }
          </div>
        </div>

        <div class="fun-facts">
          <h3>Curiosidades</h3>
          <div formArrayName="funFacts">
            @for (fact of funFacts.controls; track fact; let i = $index) {
              <div class="fun-fact-item">
                <mat-form-field class="form-field-full">
                  <mat-label>Curiosidad {{ i + 1 }}</mat-label>
                  <input matInput [formControlName]="i">
                </mat-form-field>
                <button type="button" mat-icon-button color="warn" (click)="removeFunFact(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
          <button type="button" mat-stroked-button (click)="addFunFact()">
            <mat-icon>add</mat-icon> Agregar curiosidad
          </button>
        </div>

        <div class="actions">
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            [disabled]="!catForm.valid || isSubmitting || uploadingImage"
          >
            @if (isSubmitting) {
              <mat-spinner diameter="24" class="button-spinner"></mat-spinner>
              <span>{{ isEditMode ? 'Guardando...' : 'Creando...' }}</span>
            } @else {
              <span>{{ isEditMode ? 'Guardar Cambios' : 'Guardar Gatito' }}</span>
            }
          </button>
          <button mat-button type="button" routerLink="/" [disabled]="isSubmitting">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    form {
      margin-top: 20px;
    }
    
    .image-upload {
      margin-bottom: 24px;
      position: relative;
    }

    ngx-dropzone {
      height: 200px;
      border-radius: 8px;
      border: 2px dashed #ccc;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    ngx-dropzone:hover:not([disabled]) {
      border-color: #666;
      background: #f5f5f5;
    }

    ngx-dropzone[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .existing-image {
      max-height: 180px;
      object-fit: contain;
      border-radius: 4px;
    }

    .upload-prompt {
      text-align: center;
      color: #666;
    }

    .upload-prompt mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .upload-prompt small {
      display: block;
      margin-top: 8px;
      color: #999;
    }

    .upload-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border-radius: 8px;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
    }

    .form-field-full {
      width: 100%;
    }

    .personality-section {
      margin: 24px 0;
    }

    .personality-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }

    .fun-facts {
      margin: 24px 0;
    }

    .fun-fact-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      min-height: 36px;
      margin: 24px 0;
    }

    .button-spinner {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .actions {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class CatFormComponent implements OnInit, OnDestroy {
  catForm: FormGroup;
  isSubmitting = false;
  uploadingImage = false;
  selectedImage: File | null = null;
  existingImageUrl: string | null = null;
  personalityTraits = PERSONALITY_TRAITS;
  isEditMode = false;
  catId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private catsService: CatsService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private routeReuseStrategy: RouteReuseStrategy
  ) {
    // Prevent route reuse to ensure clean state
    (this.routeReuseStrategy as any).shouldReuseRoute = () => false;

    this.catForm = this.fb.group({
      name: ['', Validators.required],
      birthday: [null, Validators.required],
      favoriteToy: ['', Validators.required],
      ownerName: ['', Validators.required],
      breed: ['', Validators.required],
      furColor: ['', Validators.required],
      description: ['', Validators.required],
      personalityTraits: [[]],
      funFacts: this.fb.array([])
    });
  }

  ngOnInit() {
    // Reset all state variables
    this.isSubmitting = false;
    this.uploadingImage = false;
    this.selectedImage = null;
    this.existingImageUrl = null;

    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.catId = params['id'];
        this.loadCatData(params['id']);
      } else {
        this.addFunFact(); // Add one empty fun fact by default for new cats
      }
    });
  }

  ngOnDestroy() {
    // Reset all state variables
    this.isSubmitting = false;
    this.uploadingImage = false;
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCatData(id: string) {
    this.catsService.getCatById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cat) => {
        if (cat) {
          this.existingImageUrl = cat.imageUrl;
          this.catForm.patchValue({
            name: cat.name,
            birthday: new Date(cat.birthday),
            favoriteToy: cat.favoriteToy,
            ownerName: cat.ownerName,
            breed: cat.breed,
            furColor: cat.furColor,
            description: cat.description,
            personalityTraits: cat.personalityTraits || []
          });

          // Clear and rebuild fun facts array
          while (this.funFacts.length) {
            this.funFacts.removeAt(0);
          }
          (cat.funFacts || []).forEach(fact => {
            this.funFacts.push(this.fb.control(fact));
          });
        } else {
          this.snackBar.open('No se encontró el gatito', 'Cerrar', { duration: 5000 });
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error loading cat:', error);
        this.snackBar.open('Error al cargar los datos del gatito', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/']);
      }
    });
  }

  get funFacts() {
    return this.catForm.get('funFacts') as FormArray;
  }

  addFunFact() {
    this.funFacts.push(this.fb.control(''));
  }

  removeFunFact(index: number) {
    this.funFacts.removeAt(index);
  }

  isTraitSelected(trait: string): boolean {
    const traits = this.catForm.get('personalityTraits')?.value || [];
    return traits.includes(trait);
  }

  onTraitToggle(event: any, trait: string) {
    const traits = [...(this.catForm.get('personalityTraits')?.value || [])];
    if (event.checked) {
      traits.push(trait);
    } else {
      const index = traits.indexOf(trait);
      if (index > -1) {
        traits.splice(index, 1);
      }
    }
    this.catForm.patchValue({ personalityTraits: traits });
  }

  onImageSelected(event: any) {
    this.selectedImage = event.addedFiles[0];
    if (this.selectedImage) {
      if (this.selectedImage.size > 5242880) {
        this.snackBar.open('La imagen no debe superar los 5MB', 'Cerrar', { duration: 3000 });
        this.selectedImage = null;
        return;
      }
      this.existingImageUrl = null;
    }
  }

  async onSubmit() {
    if (!this.catForm.valid || this.isSubmitting || this.uploadingImage) return;

    this.isSubmitting = true;

    try {
      let imageUrl = this.existingImageUrl;
      
      if (this.selectedImage) {
        this.uploadingImage = true;
        try {
          imageUrl = await this.catsService.uploadImage(this.selectedImage);
        } finally {
          this.uploadingImage = false;
        }
      }

      const catData = {
        ...this.catForm.value,
        imageUrl
      };

      if (this.isEditMode && this.catId) {
        await this.catsService.updateCat(this.catId, catData);
      } else {
        await this.catsService.addCat(catData);
      }

      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error saving cat:', error);
      this.snackBar.open(
        error.message || 'Error al guardar el gatito',
        'Cerrar',
        { duration: 5000 }
      );
    } finally {
      this.isSubmitting = false;
    }
  }
}