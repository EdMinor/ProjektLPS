import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Question, Catalog } from '../../../core/models';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-detail.component.html',
  styleUrl: './question-detail.component.css'
})
export class QuestionDetailComponent implements OnInit {
  question: Question | null = null;
  catalog: Catalog | null = null;
  currentIndex = 0;
  catalogId: number | null = null;
  questions: Question[] = [];
  loading = true;
  error: string | null = null;

  // Answer management
  selectedAnswers: string[] = [];
  fillInAnswer: string = '';
  hasAnswered: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentIndex = Number(this.route.snapshot.paramMap.get('index'));
    this.catalogId = Number(this.route.snapshot.queryParamMap.get('catalogId'));
    
    if (this.catalogId) {
      this.loadCatalogAndQuestions();
    } else {
      this.error = 'Kein Katalog ausgewählt';
      this.loading = false;
    }
  }

  loadCatalogAndQuestions(): void {
    this.loading = true;
    this.error = null;

    // Load catalog first
    this.apiService.getCatalogById(this.catalogId!).subscribe({
      next: (catalog) => {
        this.catalog = catalog;
        this.loadQuestions();
      },
      error: (error) => {
        this.error = 'Fehler beim Laden des Katalogs';
        this.loading = false;
        console.error('Error loading catalog:', error);
      }
    });
  }

  loadQuestions(): void {
    this.apiService.getQuestionsByCatalog(this.catalogId!).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.loadCurrentQuestion();
      },
      error: (error) => {
        this.error = 'Fehler beim Laden der Fragen';
        this.loading = false;
        console.error('Error loading questions:', error);
      }
    });
  }

  loadCurrentQuestion(): void {
    if (this.questions.length === 0) {
      this.error = 'Keine Fragen in diesem Katalog gefunden';
      this.loading = false;
      return;
    }

    if (this.currentIndex >= this.questions.length) {
      this.currentIndex = 0; // Reset to first question if index is out of bounds
    }

    this.question = this.questions[this.currentIndex];
    this.resetAnswerState();
    this.loading = false;
  }

  resetAnswerState(): void {
    this.selectedAnswers = [];
    this.fillInAnswer = '';
    this.hasAnswered = false;
  }

  // Single Choice Answer Management
  selectSingleAnswer(optionId: string): void {
    this.selectedAnswers = [optionId];
    this.hasAnswered = true;
  }

  // Multiple Choice Answer Management
  toggleMultipleAnswer(optionId: string): void {
    const index = this.selectedAnswers.indexOf(optionId);
    if (index > -1) {
      this.selectedAnswers.splice(index, 1);
    } else {
      this.selectedAnswers.push(optionId);
    }
    this.hasAnswered = this.selectedAnswers.length > 0;
  }

  isOptionSelected(optionId: string): boolean {
    return this.selectedAnswers.includes(optionId);
  }

  // Fill-in Answer Management
  updateFillInAnswer(value: string): void {
    this.fillInAnswer = value;
    this.hasAnswered = value.trim().length > 0;
  }

  // Navigation with Answer Validation
  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentIndex = index;
      this.question = this.questions[index];
      this.resetAnswerState();
      
      // Update URL without navigation
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { catalogId: this.catalogId },
        fragment: index.toString()
      });
    }
  }

  goToPrevious(): void {
    if (this.currentIndex > 0) {
      this.goToQuestion(this.currentIndex - 1);
    }
  }

  goToNext(): void {
    if (this.canGoNext) {
      this.goToQuestion(this.currentIndex + 1);
    }
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

  // Getters
  get questionNumber(): number {
    return this.currentIndex + 1;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentIndex < this.questions.length - 1;
  }

  get canProceed(): boolean {
    if (!this.question) return false;
    
    switch (this.question.type) {
      case 'single':
        return this.selectedAnswers.length === 1;
      case 'multi':
        return this.selectedAnswers.length > 0;
      case 'fill':
        return this.fillInAnswer.trim().length > 0;
      default:
        return false;
    }
  }

  get answerSummary(): string {
    if (!this.question) return '';
    
    switch (this.question.type) {
      case 'single':
        return this.selectedAnswers.length > 0 ? `Ausgewählt: ${this.selectedAnswers[0]}` : 'Keine Antwort ausgewählt';
      case 'multi':
        return this.selectedAnswers.length > 0 ? `${this.selectedAnswers.length} Antwort(en) ausgewählt` : 'Keine Antworten ausgewählt';
      case 'fill':
        return this.fillInAnswer.trim() ? `Eingegeben: "${this.fillInAnswer}"` : 'Keine Antwort eingegeben';
      default:
        return '';
    }
  }
}
