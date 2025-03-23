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
  templateUrl: './cat-list.component.html',
  styleUrls: ['./cat-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    RouterModule,
    CatCardComponent
  ]
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