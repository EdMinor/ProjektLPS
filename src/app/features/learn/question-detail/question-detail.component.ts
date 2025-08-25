import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, ApiError } from '../../../core/services/api.service';
import { HeaderComponent, BreadcrumbItem } from '../../../shared/components/header/header.component';
import { ErrorHandlerComponent } from '../../../shared/components/error-handler/error-handler.component';
import { Question, Catalog } from '../../../core/models';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ErrorHandlerComponent],
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
  error: ApiError | null = null;

  // Answer management
  selectedAnswers: string[] = [];
  fillInAnswer: string = '';
  hasAnswered: boolean = false;
  
  // Evaluation state
  isEvaluated: boolean = false;
  isCorrect: boolean = false;
  showSolution: boolean = false;
  score: number = 0;
  totalScore: number = 0;
  answeredQuestions: Map<number, { answers: string[], isCorrect: boolean, fillInAnswer?: string }> = new Map();
  
  // Results popup
  showResultsPopup: boolean = false;
  
  // Math for template
  Math = Math;

  // Breadcrumbs for header - will be updated dynamically
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', route: '/home' },
    { label: 'Kataloge', route: '/learn/catalogs' },
    { label: 'Fragen', active: true }
  ];

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
      this.error = {
        message: 'Kein Katalog ausgewählt',
        type: 'not_found',
        retryable: false
      };
      this.loading = false;
    }
  }

  loadCatalogAndQuestions(): void {
    this.loading = true;
    this.error = null;
    this.apiService.getCatalogById(this.catalogId!).subscribe({
      next: (catalog) => {
        this.catalog = catalog;
        this.updateBreadcrumbs();
        this.loadQuestions();
      },
      error: (error: ApiError) => {
        this.error = error;
        this.loading = false;
        console.error('Error loading catalog:', error);
      }
    });
  }

  // Calculate total score from all answered questions
  calculateTotalScore(): void {
    this.score = 0;
    this.totalScore = 0;
    
    for (const [_, answerState] of this.answeredQuestions) {
      if (answerState.isCorrect) {
        this.score++;
      }
      this.totalScore++;
    }
  }

  // Update breadcrumbs based on loaded catalog
  updateBreadcrumbs(): void {
    if (this.catalog) {
      this.breadcrumbs = [
        { label: 'Startseite', route: '/home' },
        { label: 'Kataloge', route: '/learn/catalogs' },
        { label: this.catalog.title || 'Katalog', route: undefined },
        { label: 'Fragen', active: true }
      ];
    }
  }

  loadQuestions(): void {
    this.apiService.getQuestionsByCatalog(this.catalogId!).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.loadCurrentQuestion();
      },
      error: (error: ApiError) => {
        this.error = error;
        this.loading = false;
        console.error('Error loading questions:', error);
      }
    });
  }

  loadCurrentQuestion(): void {
    if (this.questions.length === 0) {
      this.error = {
        message: 'Keine Fragen in diesem Katalog gefunden',
        type: 'not_found',
        retryable: false
      };
      this.loading = false;
      return;
    }
    
    if (this.currentIndex >= this.questions.length) {
      this.currentIndex = 0;
    }
    
    this.question = this.questions[this.currentIndex];
    
    // Debug: Log the current question structure
    console.log('Current question loaded:', {
      question: this.question,
      type: this.question.type,
      correctAnswer: this.question.correctAnswer,
      correctAnswers: this.question.correctAnswers,
      options: this.question.options
    });
    
    this.restoreAnswerState();
    this.calculateTotalScore(); // Ensure score is accurate
    this.loading = false;
  }

  resetAnswerState(): void {
    this.selectedAnswers = [];
    this.fillInAnswer = '';
    this.hasAnswered = false;
    this.isEvaluated = false;
    this.isCorrect = false;
    this.showSolution = false;
  }

  restoreAnswerState(): void {
    const savedState = this.answeredQuestions.get(this.currentIndex);
    if (savedState) {
      this.selectedAnswers = [...savedState.answers];
      this.fillInAnswer = savedState.fillInAnswer || '';
      this.hasAnswered = true;
      this.isEvaluated = true;
      this.isCorrect = savedState.isCorrect;
      this.showSolution = true; // Always show solution for answered questions
    } else {
      this.resetAnswerState();
    }
  }

  // Answer selection methods
  selectOption(optionId: string): void {
    if (this.question?.type === 'single') {
      this.selectSingleAnswer(optionId);
    } else if (this.question?.type === 'multi') {
      this.toggleMultipleAnswer(optionId);
    }
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  }

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
    
    // Don't auto-evaluate for multiple choice - let user click "Lösung anzeigen"
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

  // Helper method to normalize correct answers (handle both ID and text formats)
  getNormalizedCorrectAnswers(): string[] {
    if (!this.question) return [];
    
    if (this.question.type === 'single' && this.question.correctAnswer) {
      return [this.question.correctAnswer];
    } else if (this.question.type === 'multi' && this.question.correctAnswers) {
      // Try to find the correct answers by matching option text first
      const normalizedAnswers: string[] = [];
      
      for (const answer of this.question.correctAnswers) {
        // First try to find by ID
        let foundOption = this.question.options.find(opt => opt.id === answer);
        
        // If not found by ID, try to find by text
        if (!foundOption) {
          foundOption = this.question.options.find(opt => 
            opt.text.toLowerCase().trim() === answer.toLowerCase().trim()
          );
        }
        
        if (foundOption) {
          normalizedAnswers.push(foundOption.id);
        } else {
          // If still not found, use the original answer (fallback)
          normalizedAnswers.push(answer);
        }
      }
      
      return normalizedAnswers;
    } else if (this.question.type === 'fill' && this.question.correctAnswers) {
      return this.question.correctAnswers;
    }
    
    return [];
  }

  // Answer evaluation
  evaluateAnswer(): void {
    if (!this.question || !this.hasAnswered) return;

    this.isEvaluated = true;
    this.showSolution = true;
    
    // Get normalized correct answers
    const normalizedCorrectAnswers = this.getNormalizedCorrectAnswers();
    
    // Debug logging
    console.log('Evaluating answer:', {
      questionType: this.question.type,
      selectedAnswers: this.selectedAnswers,
      correctAnswer: this.question.correctAnswer,
      correctAnswers: this.question.correctAnswers,
      normalizedCorrectAnswers,
      question: this.question
    });
    
    switch (this.question.type) {
      case 'single':
        this.isCorrect = this.selectedAnswers.length === 1 && 
                        this.selectedAnswers[0] === this.question.correctAnswer;
        break;
      case 'multi':
        if (normalizedCorrectAnswers.length > 0) {
          // For multiple choice, compare the arrays directly
          const correctSet = new Set(normalizedCorrectAnswers);
          const selectedSet = new Set(this.selectedAnswers);
          
          // Check if all correct answers are selected AND all selected answers are correct
          const allCorrectSelected = [...correctSet].every(answer => selectedSet.has(answer));
          const noExtraSelected = selectedSet.size === correctSet.size;
          
          this.isCorrect = allCorrectSelected && noExtraSelected;
          
          console.log('Multiple choice evaluation:', {
            correctAnswers: this.question.correctAnswers,
            normalizedCorrectAnswers,
            selectedAnswers: this.selectedAnswers,
            correctSet: [...correctSet],
            selectedSet: [...selectedSet],
            allCorrectSelected,
            noExtraSelected,
            isCorrect: this.isCorrect
          });
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

    // Save answer state
    this.answeredQuestions.set(this.currentIndex, {
      answers: [...this.selectedAnswers],
      isCorrect: this.isCorrect,
      fillInAnswer: this.question.type === 'fill' ? this.fillInAnswer : undefined
    });

    // Update score
    if (this.isCorrect) {
      this.score++;
    }
    this.totalScore++;
  }

  // New methods for the updated template
  isCurrentQuestionCorrect(): boolean {
    const savedState = this.answeredQuestions.get(this.currentIndex);
    return savedState ? savedState.isCorrect : false;
  }

  getCorrectAnswers(): string[] {
    if (!this.question) return [];
    
    if (this.question.type === 'single' && this.question.correctAnswer) {
      // Find the option text for the correct answer ID
      const correctOption = this.question.options.find(opt => opt.id === this.question!.correctAnswer);
      return correctOption ? [correctOption.text] : [this.question.correctAnswer];
    } else if (this.question.type === 'multi' && this.question.correctAnswers) {
      // Use normalized correct answers for consistency
      const normalizedCorrectAnswers = this.getNormalizedCorrectAnswers();
      return normalizedCorrectAnswers.map(answerId => {
        const correctOption = this.question!.options.find(opt => opt.id === answerId);
        return correctOption ? correctOption.text : answerId;
      });
    } else if (this.question.type === 'fill' && this.question.correctAnswers) {
      return this.question.correctAnswers;
    }
    
    return [];
  }

  canCheckAnswer(): boolean {
    if (!this.question) return false;
    
    if (this.question.type === 'fill') {
      return this.fillInAnswer.trim().length > 0;
    } else if (this.question.type === 'multi') {
      // For multiple choice, require at least one answer selected
      return this.selectedAnswers.length > 0;
    } else if (this.question.type === 'single') {
      // Single choice is auto-evaluated, so this shouldn't be called
      return false;
    }
    
    return false;
  }

  checkAnswer(): void {
    if (this.canCheckAnswer()) {
      this.evaluateAnswer();
    }
  }

  // Navigation methods
  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentIndex = index;
      this.question = this.questions[index];
      this.restoreAnswerState();
      this.updateBreadcrumbs(); // Update breadcrumbs when changing questions
      this.calculateTotalScore(); // Ensure score is accurate
      
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

  // New methods for the updated UI
  getPerformanceClass(): string {
    const percentage = (this.score / this.questions.length) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'average';
    return 'poor';
  }

  getPerformanceText(): string {
    const percentage = (this.score / this.questions.length) * 100;
    if (percentage >= 90) return '🎯 Ausgezeichnet! Du beherrschst diesen Bereich perfekt!';
    if (percentage >= 70) return '👍 Gut gemacht! Du hast eine solide Grundlage.';
    if (percentage >= 50) return '📚 Nicht schlecht! Mit etwas Übung wirst du noch besser.';
    return '💪 Weiter üben! Jede Frage macht dich stärker.';
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  // Helper methods for getting option text
  getSelectedOptionText(optionId: string): string {
    if (!this.question) return 'Keine Antwort';
    const option = this.question.options.find(o => o.id === optionId);
    return option ? option.text : 'Keine Antwort';
  }

  getSelectedOptionsText(optionIds: string[]): string {
    if (!this.question || !optionIds.length) return 'Keine Antwort';
    const texts = optionIds.map(id => {
      const option = this.question!.options.find(o => o.id === id);
      return option ? option.text : '';
    }).filter(text => text);
    return texts.length > 0 ? texts.join(', ') : 'Keine Antwort';
  }

  // Event handler for fill-in input
  onFillInInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.updateFillInAnswer(target.value);
    }
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
        // For multiple choice, check if this option ID is in the normalized correct answers
        const normalizedCorrectAnswers = this.getNormalizedCorrectAnswers();
        return normalizedCorrectAnswers.includes(optionId);
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

  onRetry(): void {
    this.loadCatalogAndQuestions();
  }

  onGoHome(): void {
    this.router.navigate(['/home']);
  }
  
  // Abbrechen-Methode
  cancelLearning(): void {
    if (confirm('Möchten Sie den Lernmodus wirklich abbrechen? Alle bisherigen Antworten gehen verloren.')) {
      this.router.navigate(['/learn/catalogs']);
    }
  }
}

