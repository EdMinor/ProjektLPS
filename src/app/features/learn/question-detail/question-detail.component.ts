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
  
  // Evaluation state
  isEvaluated: boolean = false;
  isCorrect: boolean = false;
  score: number = 0;
  totalScore: number = 0;
  answeredQuestions: Map<number, { answers: string[], isCorrect: boolean, fillInAnswer?: string }> = new Map();
  
  // Results popup
  showResultsPopup: boolean = false;
  
  // Math for template
  Math = Math;

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
      this.currentIndex = 0;
    }
    
    this.question = this.questions[this.currentIndex];
    this.restoreAnswerState();
    this.loading = false;
  }

  resetAnswerState(): void {
    this.selectedAnswers = [];
    this.fillInAnswer = '';
    this.hasAnswered = false;
    this.isEvaluated = false;
    this.isCorrect = false;
  }

  restoreAnswerState(): void {
    const savedState = this.answeredQuestions.get(this.currentIndex);
    if (savedState) {
      this.selectedAnswers = [...savedState.answers];
      this.fillInAnswer = savedState.fillInAnswer || '';
      this.hasAnswered = true;
      this.isEvaluated = true;
      this.isCorrect = savedState.isCorrect;
    } else {
      this.resetAnswerState();
    }
  }

  // Answer selection methods
  selectSingleAnswer(optionId: string): void {
    if (this.isEvaluated) return; // Prevent changes after evaluation
    
    this.selectedAnswers = [optionId];
    this.hasAnswered = true;
    this.evaluateAnswer(); // Single choice is evaluated immediately
  }

  toggleMultipleAnswer(optionId: string): void {
    if (this.isEvaluated) return; // Prevent changes after evaluation
    
    const index = this.selectedAnswers.indexOf(optionId);
    if (index > -1) {
      this.selectedAnswers.splice(index, 1);
    } else {
      this.selectedAnswers.push(optionId);
    }
    this.hasAnswered = this.selectedAnswers.length > 0;
    
    // For multiple choice, check if we have the right number of answers
    if (this.question && this.question.type === 'multi' && this.question.correctAnswers) {
      if (this.selectedAnswers.length === this.question.correctAnswers.length) {
        this.evaluateAnswer();
      }
    }
  }

  isOptionSelected(optionId: string): boolean {
    return this.selectedAnswers.includes(optionId);
  }

  updateFillInAnswer(value: string): void {
    if (this.isEvaluated) return; // Prevent changes after evaluation
    
    this.fillInAnswer = value;
    this.hasAnswered = value.trim().length > 0;
    // Don't evaluate immediately for fill-in
  }

  // Confirm fill-in answer
  confirmFillInAnswer(): void {
    if (this.hasAnswered) {
      this.evaluateAnswer();
    }
  }

  // Answer evaluation
  evaluateAnswer(): void {
    if (!this.question || !this.hasAnswered) return;

    this.isEvaluated = true;
    
    switch (this.question.type) {
      case 'single':
        this.isCorrect = this.selectedAnswers.length === 1 && 
                        this.selectedAnswers[0] === this.question.correctAnswer;
        break;
      case 'multi':
        if (this.question.correctAnswers && this.question.correctAnswers.length > 0) {
          const correctSet = new Set(this.question.correctAnswers);
          const selectedSet = new Set(this.selectedAnswers);
          this.isCorrect = correctSet.size === selectedSet.size && 
                          [...correctSet].every(answer => selectedSet.has(answer));
        } else {
          this.isCorrect = false;
        }
        break;
      case 'fill':
        if (this.question.correctAnswers && this.question.correctAnswers.length > 0) {
          this.isCorrect = this.question.correctAnswers.some(answer => 
            answer.toLowerCase().trim() === this.fillInAnswer.toLowerCase().trim()
          );
        } else {
          this.isCorrect = false;
        }
        break;
      default:
        this.isCorrect = false;
    }

    // Save the answer state
    this.answeredQuestions.set(this.currentIndex, {
      answers: [...this.selectedAnswers],
      isCorrect: this.isCorrect,
      fillInAnswer: this.fillInAnswer
    });

    // Update score only if correct
    if (this.isCorrect) {
      this.score += 1;
    }
    
    // Update total score (number of answered questions)
    this.totalScore = this.answeredQuestions.size;
    
    // Show results popup if this is the last question
    if (this.currentIndex === this.questions.length - 1) {
      setTimeout(() => {
        this.showResultsPopup = true;
      }, 1500); // Show after 1.5 seconds
    }
  }

  // Navigation methods
  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentIndex = index;
      this.question = this.questions[index];
      this.restoreAnswerState();
      
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { catalogId: this.catalogId },
        fragment: `question-${index}`
      });
    }
  }

  goToPrevious(): void {
    if (this.canGoPrevious) {
      this.goToQuestion(this.currentIndex - 1);
    }
  }

  goToNext(): void {
    if (this.canGoNext && this.isEvaluated) {
      this.goToQuestion(this.currentIndex + 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/learn/catalogs'], { 
      queryParams: { topic: this.getTopicFromCatalog() } 
    });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  // Results popup methods
  closeResultsPopup(): void {
    this.showResultsPopup = false;
  }

  restartCatalog(): void {
    this.currentIndex = 0;
    this.score = 0;
    this.totalScore = 0;
    this.answeredQuestions.clear();
    this.showResultsPopup = false;
    this.loadCurrentQuestion();
  }

  // Helper methods
  getTopicFromCatalog(): string | null {
    if (!this.catalog) return null;
    return this.catalog.topicId === 1 ? '101' : this.catalog.topicId === 2 ? '102' : null;
  }

  // Check if catalog is completed
  isCatalogCompleted(): boolean {
    return this.answeredQuestions.size === this.questions.length;
  }

  // Fixed score calculation: based on correct answers, not total answered
  getProgressPercentage(): number {
    return this.questions.length > 0 ? (this.score / this.questions.length) * 100 : 0;
  }

  // Check if option is correct/incorrect for visual feedback
  isOptionCorrect(optionId: string): boolean {
    if (!this.question || !this.isEvaluated) return false;
    
    switch (this.question.type) {
      case 'single':
        return optionId === this.question.correctAnswer;
      case 'multi':
        return this.question.correctAnswers?.includes(optionId) || false;
      default:
        return false;
    }
  }

  // Check if option is selected and correct/incorrect
  getOptionStatus(optionId: string): 'correct' | 'incorrect' | 'selected' | 'none' {
    if (!this.isEvaluated) {
      return this.isOptionSelected(optionId) ? 'selected' : 'none';
    }
    
    if (this.isOptionCorrect(optionId)) {
      return 'correct';
    } else if (this.isOptionSelected(optionId)) {
      return 'incorrect';
    }
    
    return 'none';
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
      case 'single': return this.selectedAnswers.length === 1;
      case 'multi': return this.selectedAnswers.length > 0;
      case 'fill': return this.fillInAnswer.trim().length > 0;
      default: return false;
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

  get showSolution(): boolean {
    return this.isEvaluated && this.question !== null;
  }

  get correctAnswerText(): string {
    if (!this.question) return '';
    
    switch (this.question.type) {
      case 'single':
        return this.question.correctAnswer || 'Keine Lösung verfügbar';
      case 'multi':
        return this.question.correctAnswers && this.question.correctAnswers.length > 0 
          ? this.question.correctAnswers.join(', ') 
          : 'Keine Lösung verfügbar';
      case 'fill':
        return this.question.correctAnswers && this.question.correctAnswers.length > 0 
          ? this.question.correctAnswers.join(' oder ') 
          : 'Keine Lösung verfügbar';
      default:
        return 'Keine Lösung verfügbar';
    }
  }
}

