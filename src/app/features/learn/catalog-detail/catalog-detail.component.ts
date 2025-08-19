import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Catalog, Question } from '../../../core/models';

@Component({
  selector: 'app-catalog-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-detail.component.html',
  styleUrl: './catalog-detail.component.css'
})
export class CatalogDetailComponent implements OnInit {
  catalog: Catalog | null = null;
  questions: Question[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.loading = true;
    this.error = null;

    const catalogId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.apiService.getCatalogById(catalogId).subscribe({
      next: (catalog) => {
        this.catalog = catalog;
        this.loadQuestions(catalogId);
      },
      error: (error) => {
        this.error = 'Fehler beim Laden des Katalogs';
        this.loading = false;
        console.error('Error loading catalog:', error);
      }
    });
  }

  loadQuestions(catalogId: number): void {
    this.apiService.getQuestionsByCatalog(catalogId).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Fehler beim Laden der Fragen';
        this.loading = false;
        console.error('Error loading questions:', error);
      }
    });
  }

  startLearning(): void {
    if (this.catalog) {
      this.router.navigate(['/learn/questions/0'], { 
        queryParams: { catalogId: this.catalog.id } 
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/learn/catalogs']);
  }
}
