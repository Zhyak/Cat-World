import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CatsService } from '../../services/cats.service';
import { PERSONALITY_TRAITS } from '../../models/cat.model';

@Component({
  selector: 'app-cat-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <h1>Agregar Nuevo Gato</h1>
      
      <form [formGroup]="catForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <mat-form-field class="form-field-full">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name" required>
            <mat-error *ngIf="catForm.get('name')?.errors?.['required']">
              El nombre es requerido
            </mat-error>
          </mat-form-field>
          
          <mat-form-field class="form-field-full">
            <mat-label>URL de la imagen</mat-label>
            <input matInput formControlName="imageUrl" required>
            <mat-error *ngIf="catForm.get('imageUrl')?.errors?.['required']">
              La imagen es requerida
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="form-field-full">
            <mat-label>Fecha de nacimiento</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="birthday" required>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
          
          <mat-form-field class="form-field-full">
            <mat-label>Juguete favorito</mat-label>
            <input matInput formControlName="favoriteToy" required>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="form-field-full">
            <mat-label>Raza</mat-label>
            <input matInput formControlName="breed" required>
          </mat-form-field>
          
          <mat-form-field class="form-field-full">
            <mat-label>Color de pelaje</mat-label>
            <input matInput formControlName="furColor" required>
          </mat-form-field>
        </div>

        <mat-form-field class="form-field-full">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="3" required></textarea>
        </mat-form-field>

        <mat-form-field class="form-field-full">
          <mat-label>Nombre del dueño</mat-label>
          <input matInput formControlName="ownerName" required>
        </mat-form-field>

        <h3>Rasgos de personalidad</h3>
        <div class="personality-traits" formArrayName="personalityTraits">
          @for (trait of personalityTraits; track trait) {
            <mat-checkbox [formControlName]="trait">
              {{ trait }}
            </mat-checkbox>
          }
        </div>

        <h3>Curiosidades</h3>
        <div formArrayName="funFacts">
          @for (fact of funFacts.controls; track fact; let i = $index) {
            <div class="form-row">
              <mat-form-field class="form-field-full">
                <mat-label>Curiosidad {{ i + 1 }}</mat-label>
                <input matInput [formControlName]="i">
                <button matSuffix mat-icon-button color="warn" (click)="removeFunFact(i)" type="button">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-form-field>
            </div>
          }
        </div>

        <button type="button" mat-stroked-button (click)="addFunFact()">
          <mat-icon>add</mat-icon> Agregar curiosidad
        </button>

        <div class="actions">
          @if (catsService.isLoading() | async) {
            <mat-spinner diameter="36"></mat-spinner>
          } @else {
            <button mat-raised-button color="primary" type="submit" [disabled]="!catForm.valid">
              Guardar Gato
            </button>
          }
        </div>
      </form>
    </div>
  `,
  styles: [`
    form {
      margin-top: 20px;
    }
    
    h3 {
      margin: 20px 0 10px;
    }
    
    .actions {
      margin-top: 20px;
      text-align: right;
      min-height: 36px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    
    button[type="button"] {
      margin: 10px 0;
    }
  `]
})
export class CatFormComponent {
  catForm: FormGroup;
  personalityTraits = PERSONALITY_TRAITS;

  constructor(
    private fb: FormBuilder,
    public catsService: CatsService,
    private router: Router
  ) {
    this.catForm = this.fb.group({
      name: ['', Validators.required],
      imageUrl: ['', Validators.required],
      birthday: [null, Validators.required],
      favoriteToy: ['', Validators.required],
      description: ['', Validators.required],
      breed: ['', Validators.required],
      furColor: ['', Validators.required],
      ownerName: ['', Validators.required],
      personalityTraits: this.fb.group(
        Object.fromEntries(PERSONALITY_TRAITS.map(trait => [trait, false]))
      ),
      funFacts: this.fb.array([this.fb.control('')])
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

  async onSubmit() {
    if (this.catForm.valid) {
      const formValue = this.catForm.value;
      const selectedTraits = Object.entries(formValue.personalityTraits)
        .filter(([_, selected]) => selected)
        .map(([trait]) => trait);

      const newCat = {
        ...formValue,
        personalityTraits: selectedTraits,
        funFacts: formValue.funFacts.filter(Boolean)
      };

      try {
        await this.catsService.addCat(newCat);
        this.router.navigate(['/']);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  }
}