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
import { PERSONALITY_TRAITS, NewCat, UpdateCat } from '../../../../core/models/cat.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cat-form',
  templateUrl: './cat-form.component.html',
  styleUrls: ['./cat-form.component.scss'],
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
  ]
})
export class CatFormComponent implements OnInit, OnDestroy {
  catForm: FormGroup;
  isSubmitting = false;
  uploadingImage = false;
  selectedImage: File | null = null;
  existingImageUrl: string | undefined = undefined;
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
    this.isSubmitting = false;
    this.uploadingImage = false;
    this.selectedImage = null;
    this.existingImageUrl = undefined;

    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.catId = params['id'];
        this.loadCatData(params['id']);
      } else {
        this.addFunFact();
      }
    });
  }

  ngOnDestroy() {
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

  onTraitToggle(event: { checked: boolean }, trait: string) {
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

  onImageSelected(event: { addedFiles: File[] }) {
    this.selectedImage = event.addedFiles[0];
    if (this.selectedImage) {
      if (this.selectedImage.size > 5242880) {
        this.snackBar.open('La imagen no debe superar los 5MB', 'Cerrar', { duration: 3000 });
        this.selectedImage = null;
        return;
      }
      this.existingImageUrl = undefined;
    }
  }

  validateInput(value: string): string {
    return value.replace(/[<>]/g, '').slice(0, 500);
  }

  async onSubmit() {
    if (!this.catForm.valid || this.isSubmitting || this.uploadingImage) return;
    if (!this.selectedImage && !this.existingImageUrl) {
      this.snackBar.open('Debes seleccionar una imagen', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.catForm.value;
      const sanitizedData = {
        name: this.validateInput(formValue.name),
        description: this.validateInput(formValue.description),
        favoriteToy: this.validateInput(formValue.favoriteToy),
        ownerName: this.validateInput(formValue.ownerName),
        breed: this.validateInput(formValue.breed),
        furColor: this.validateInput(formValue.furColor),
        birthday: formValue.birthday,
        personalityTraits: formValue.personalityTraits?.map((trait: string) => this.validateInput(trait)) || [],
        funFacts: formValue.funFacts?.map((fact: string) => this.validateInput(fact)) || []
      };

      let imageUrl = this.existingImageUrl;
      
      if (this.selectedImage) {
        this.uploadingImage = true;
        try {
          const uploadedUrl = await this.catsService.uploadImage(this.selectedImage);
          if (!uploadedUrl) throw new Error('Error al subir la imagen');
          imageUrl = uploadedUrl;
        } finally {
          this.uploadingImage = false;
        }
      }

      if (!imageUrl) throw new Error('No se pudo obtener la URL de la imagen');

      const catData: NewCat = {
        ...sanitizedData,
        imageUrl
      };

      if (this.isEditMode && this.catId) {
        const updateData: UpdateCat = catData;
        await this.catsService.updateCat(this.catId, updateData);
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