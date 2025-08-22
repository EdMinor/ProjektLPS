import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SimulationStoreService } from '../../../core/services/simulation-store.service';
import { TimerService, TimerState } from '../../../core/services/timer.service';
import { HeaderComponent, BreadcrumbItem } from '../../../shared/components/header/header.component';
import { Question, SimulationAnswer } from '../../../core/models';

@Component({
  selector: 'app-simulation-run',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.css']
})
export class RunComponent implements OnInit, OnDestroy {
  currentQuestion: Question | null = null;
  currentQuestionIndex = 0;
  totalQuestions = 0;
  progress = { current: 0, total: 0, percentage: 0 };
  
  // Antworten
  selectedAnswers: string[] = [];
  fillInAnswer = '';
  isAnswered = false;
  currentAnswer: SimulationAnswer | null = null;
  
  // Timer
  timerState: TimerState | null = null;
  timerSubscription?: Subscription;
  
  // Zustand
  isActive = false;
  isPaused = false;
  isLoading = true;
  error: string | null = null;
  
  // Navigation
  canGoNext = false;
  canGoPrevious = false;
  isLastQuestion = false;
  isFirstQuestion = false;

  // Results Modal
  showResultsModal = false;

  // Timer Configuration
  hasTimeLimit = false;

  // Simulation Status
  simulationCompleted = false;

  // Breadcrumbs for header
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', route: '/' },
    { label: 'Simulation', route: '/simulate/setup' },
    { label: 'Läuft', active: true }
  ];

  constructor(
    private simulationStore: SimulationStoreService,
    private timerService: TimerService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.initializeSimulation();
    this.setupTimerSubscription();
    
    // Starte Timer für erste Frage (nur bei Zeitlimit)
    if (this.hasTimeLimit) {
      this.timerService.startQuestionTimer();
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerService.stopTimer();
  }

  private initializeSimulation(): void {
    const state = this.simulationStore.getCurrentState();
    
    if (!state.questions || !state.config) {
      this.error = 'Keine aktive Simulation gefunden. Bitte starte eine neue Simulation.';
      this.isLoading = false;
      return;
    }

    this.isActive = state.isActive;
    this.isPaused = state.isPaused;
    this.currentQuestionIndex = state.currentQuestionIndex;
    this.totalQuestions = state.questions.length;
    
    // Reset completion status für neue Simulation
    this.simulationCompleted = false;
    
    // Timer initialisieren
    this.hasTimeLimit = !!(state.config.timeLimit && state.timeRemaining);
    if (this.hasTimeLimit && state.timeRemaining) {
      this.timerService.startTimer({
        totalTime: state.timeRemaining,
        warningThreshold: 300, // 5 Minuten
        criticalThreshold: 60,  // 1 Minute
        autoPauseOnBlur: true
      });
    }
    
    this.updateProgress();
    this.loadCurrentQuestion();
    this.isLoading = false;
  }

  private loadCurrentQuestion(): void {
    this.currentQuestion = this.simulationStore.getCurrentQuestion();
    
    if (this.currentQuestion) {
      // Lade bestehende Antwort
      this.currentAnswer = this.simulationStore.getQuestionAnswer(this.currentQuestion.id);
      this.isAnswered = !!this.currentAnswer;
      
      if (this.currentAnswer) {
        this.selectedAnswers = [...this.currentAnswer.answers];
        this.fillInAnswer = this.currentAnswer.answers[0] || '';
      } else {
        this.resetAnswerState();
      }
    }

    this.updateNavigationState();
  }

  private resetAnswerState(): void {
    this.selectedAnswers = [];
    this.fillInAnswer = '';
    this.isAnswered = false;
  }

  private updateProgress(): void {
    this.progress = this.simulationStore.getProgress();
  }

  private updateNavigationState(): void {
    this.canGoNext = this.simulationStore.canGoNext();
    this.canGoPrevious = this.simulationStore.canGoPrevious();
    this.isLastQuestion = this.currentQuestionIndex === this.totalQuestions - 1;
    this.isFirstQuestion = this.currentQuestionIndex === 0;
  }

  private setupTimerSubscription(): void {
    // Nur Timer-Subscription aktivieren, wenn ein Zeitlimit gesetzt ist
    if (this.hasTimeLimit) {
      this.timerSubscription = this.timerService.getTimerState$().subscribe((timerState) => {
        this.timerState = timerState;
        
        // Update Store
        this.simulationStore.updateTimeRemaining(timerState.timeRemaining);
        
        // Zeit abgelaufen
        if (timerState.timeRemaining <= 0 && timerState.isRunning) {
          this.onTimeUp();
        }
        
        // Pause-Status synchronisieren
        if (timerState.isPaused !== this.isPaused) {
          this.isPaused = timerState.isPaused;
        }
      });
    }
  }

  // Antwort-Handling
  onSingleChoiceSelect(optionId: string): void {
    if (this.isAnswered) return;
    
    this.selectedAnswers = [optionId];
    this.submitAnswer();
  }

  onMultipleChoiceToggle(optionId: string): void {
    if (this.isAnswered) return;
    
    const index = this.selectedAnswers.indexOf(optionId);
    if (index > -1) {
      // Option entfernen
      this.selectedAnswers = this.selectedAnswers.filter(id => id !== optionId);
    } else {
      // Option hinzufügen
      this.selectedAnswers = [...this.selectedAnswers, optionId];
    }
  }

  onMultipleChoiceSubmit(): void {
    if (this.isAnswered || this.selectedAnswers.length === 0) return;
    
    this.submitAnswer();
  }

  onFillInInput(event: Event): void {
    if (this.isAnswered) return;
    
    const target = event.target as HTMLInputElement;
    this.fillInAnswer = target.value;
  }

  onFillInSubmit(): void {
    if (this.isAnswered || !this.fillInAnswer.trim()) return;
    
    this.selectedAnswers = [this.fillInAnswer.trim()];
    this.submitAnswer();
  }

  private submitAnswer(): void {
    if (!this.currentQuestion) return;
    
    // Stoppe Timer für aktuelle Frage (nur bei Zeitlimit)
    let questionTime = 0;
    if (this.hasTimeLimit) {
      questionTime = this.timerService.stopQuestionTimer();
    }
    
    // Speichere Antwort im Store
    this.simulationStore.answerQuestion(
      this.currentQuestion.id,
      this.selectedAnswers,
      questionTime
    );
    
    this.isAnswered = true;
    this.currentAnswer = this.simulationStore.getQuestionAnswer(this.currentQuestion.id);
    
    // Auto-advance für alle Fragetypen
    if (this.isLastQuestion) {
      // Bei letzter Frage automatisch zu Ergebnissen
      setTimeout(() => this.finishSimulation(), 1000);
    } else if (this.canGoNext) {
      // Zur nächsten Frage
      setTimeout(() => this.nextQuestion(), 1000);
    }
  }

  // Navigation
  nextQuestion(): void {
    if (!this.canGoNext) return;
    
    this.simulationStore.nextQuestion();
    this.currentQuestionIndex++;
    
    // Starte Timer für neue Frage (nur bei Zeitlimit)
    if (this.hasTimeLimit) {
      this.timerService.startQuestionTimer();
    }
    
    this.loadCurrentQuestion();
    this.updateProgress();
  }

  previousQuestion(): void {
    if (!this.canGoPrevious) return;
    
    this.simulationStore.previousQuestion();
    this.currentQuestionIndex--;
    
    // Starte Timer für neue Frage (nur bei Zeitlimit)
    if (this.hasTimeLimit) {
      this.timerService.startQuestionTimer();
    }
    
    this.loadCurrentQuestion();
    this.updateProgress();
  }

  goToQuestion(index: number): void {
    if (index < 0 || index >= this.totalQuestions) return;
    
    this.simulationStore.goToQuestion(index);
    this.currentQuestionIndex = index;
    
    // Starte Timer für neue Frage (nur bei Zeitlimit)
    if (this.hasTimeLimit) {
      this.timerService.startQuestionTimer();
    }
    
    this.loadCurrentQuestion();
    this.updateProgress();
  }

  // Simulation beenden
  finishSimulation(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    this.simulationStore.endSimulation();
    this.simulationCompleted = true;
    this.showResultsModal = true;
  }

  onTimeUp(): void {
    this.finishSimulation();
  }

  // Pause/Resume
  togglePause(): void {
    if (this.isPaused) {
      this.timerService.resumeTimer();
      this.simulationStore.resumeSimulation();
    } else {
      this.timerService.pauseTimer();
      this.simulationStore.pauseSimulation();
    }
  }

  // Utility methods
  formatTime(seconds: number): string {
    return this.timerService.formatTime(seconds);
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'single': return 'Single Choice';
      case 'multi': return 'Multiple Choice';
      case 'fill': return 'Fill-in';
      default: return type;
    }
  }

  // Template helper methods
  get store() {
    return this.simulationStore;
  }

  // Hilfsmethode: Prüft ob eine Frage nach Index beantwortet wurde
  isQuestionAnsweredByIndex(index: number): boolean {
    const currentState = this.simulationStore.getCurrentState();
    const questions = currentState.questions;
    
    if (!questions || index < 0 || index >= questions.length) return false;
    
    const question = questions[index];
    if (!question) return false;
    
    return this.simulationStore.isQuestionAnswered(question.id);
  }

  getOptionStatus(optionId: string, optionText: string): string {
    if (!this.isAnswered || !this.currentAnswer) return '';
    
    const isSelected = this.selectedAnswers.includes(optionId) || 
                      this.selectedAnswers.includes(optionText);
    
    if (!isSelected) return '';
    
    return this.currentAnswer.isCorrect ? 'correct' : 'incorrect';
  }

  canSubmitMultipleChoice(): boolean {
    if (!this.currentQuestion || this.currentQuestion.type !== 'multi') return false;
    
    // Mindestens eine Option muss ausgewählt sein
    return this.selectedAnswers.length > 0;
  }

  getProgressBarWidth(): string {
    return `${this.progress.percentage}%`;
  }

  getTimeRemainingClass(): string {
    if (!this.timerState) return '';
    return this.timerService.getTimeStatus();
  }

  getTimeStatusText(): string {
    if (!this.timerState) return '';
    return this.timerService.getTimeStatusText();
  }

  getTimeStatusIcon(): string {
    if (!this.timerState) return '';
    return this.timerService.getTimeStatusIcon();
  }

  getTimeRemainingPercentage(): number {
    if (!this.timerState) return 0;
    return this.timerService.getTimeRemainingPercentage();
  }

  // Results Modal Methods
  closeResultsModal(): void {
    this.showResultsModal = false;
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  startNewSimulation(): void {
    this.simulationStore.clearSimulation();
    this.router.navigate(['/simulate/setup']);
  }

  // Results Data
  getSimulationResults() {
    return this.simulationStore.getSimulationResults();
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  // Hilfsmethode: Konvertiert Option-IDs zu Texten
  getAnswerTexts(answers: string[]): string[] {
    if (!this.currentQuestion || !this.currentQuestion.options) return answers;
    
    return answers.map(answerId => {
      const option = this.currentQuestion!.options.find(opt => opt.id === answerId);
      return option ? option.text : answerId;
    });
  }

  // Hilfsmethode: Konvertiert korrekte Antworten zu Texten
  getCorrectAnswerTexts(): string[] {
    if (!this.currentQuestion) return [];
    
    // Für Single Choice und Fill-in
    if (this.currentQuestion.correctAnswer) {
      // Prüfen ob es eine ID ist
      const option = this.currentQuestion.options?.find(opt => opt.id === this.currentQuestion!.correctAnswer);
      return option ? [option.text] : [this.currentQuestion.correctAnswer];
    }
    
    // Für Multiple Choice
    if (this.currentQuestion.correctAnswers) {
      return this.currentQuestion.correctAnswers.map(answerId => {
        const option = this.currentQuestion!.options?.find(opt => opt.id === answerId);
        return option ? option.text : answerId;
      });
    }
    
    return [];
  }
}
