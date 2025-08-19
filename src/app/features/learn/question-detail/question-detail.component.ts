import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Question } from '../../../core/models';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-detail.component.html',
  styleUrl: './question-detail.component.css'
})
export class QuestionDetailComponent implements OnInit {
  question: Question | null = null;
  currentIndex = 0;
  catalogId: number | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentIndex = Number(this.route.snapshot.paramMap.get('index'));
    this.catalogId = Number(this.route.snapshot.queryParamMap.get('catalogId'));
    
    if (this.catalogId) {
      this.loadQuestion();
    } else {
      this.error = 'Kein Katalog ausgewählt';
      this.loading = false;
    }
  }

  loadQuestion(): void {
    // Für MVP: Vereinfachte Implementierung
    this.loading = false;
    // TODO: Implementiere echte Fragenladung
  }

  goBack(): void {
    if (this.catalogId) {
      this.router.navigate(['/learn/catalogs', this.catalogId]);
    } else {
      this.router.navigate(['/learn/catalogs']);
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
