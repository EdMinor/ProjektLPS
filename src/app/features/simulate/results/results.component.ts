import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SimulationStoreService } from '../../../core/services/simulation-store.service';
import { BreadcrumbItem } from '../../../shared/components/header/header.component';
import { SimulationResult, Question, SimulationAnswer } from '../../../core/models';

@Component({
  selector: 'app-simulation-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  results: SimulationResult | null = null;
  questions: Question[] = [];
  answers: Map<number, SimulationAnswer> = new Map();
  
  isLoading = true;
  error: string | null = null;
  
  // UI State
  showDetailedResults = false;
  selectedQuestionIndex: number | null = null;

  // Breadcrumbs for header
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Simulation', route: '/simulate/setup' },
    { label: 'Ergebnisse', active: true }
  ];

  constructor(
    private simulationStore: SimulationStoreService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  private loadResults(): void {
    try {
      const state = this.simulationStore.getCurrentState();
      
      if (!state.questions || !state.config) {
        this.error = 'Keine Simulation-Ergebnisse gefunden.';
        this.isLoading = false;
        return;
      }

      this.results = this.simulationStore.getSimulationResults();
      this.questions = state.questions;
      
      // Lade alle Antworten
      this.answers = state.answers;
      
      if (!this.results) {
        this.error = 'Fehler beim Laden der Ergebnisse.';
      }
      
      this.isLoading = false;
    } catch (error) {
      this.error = 'Unerwarteter Fehler beim Laden der Ergebnisse.';
      console.error('Error loading results:', error);
      this.isLoading = false;
    }
  }

  // Navigation
  startNewSimulation(): void {
    this.simulationStore.clearSimulation();
    this.router.navigate(['/simulate/setup']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  closeResults(): void {
    // Schließt das Modal und bleibt auf der aktuellen Seite
    // Der Benutzer kann dann die Fragen nochmal ansehen
    this.router.navigate(['/simulate/run']);
  }

  // UI Methods
  toggleDetailedResults(): void {
    this.showDetailedResults = !this.showDetailedResults;
  }

  selectQuestion(index: number): void {
    this.selectedQuestionIndex = this.selectedQuestionIndex === index ? null : index;
  }

  // Utility Methods
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'single': return 'Single Choice';
      case 'multi': return 'Multiple Choice';
      case 'fill': return 'Fill-in';
      default: return type;
    }
  }

  getQuestionAnswer(questionId: number): SimulationAnswer | null {
    return this.answers.get(questionId) || null;
  }

  isQuestionCorrect(questionId: number): boolean {
    const answer = this.getQuestionAnswer(questionId);
    return answer ? answer.isCorrect : false;
  }

  getQuestionTime(questionId: number): number {
    const answer = this.getQuestionAnswer(questionId);
    return answer ? answer.timeSpent : 0;
  }

  getPerformanceClass(percentage: number): string {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  }

  getPerformanceIcon(percentage: number): string {
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '✅';
    if (percentage >= 40) return '⚠️';
    return '❌';
  }

  getPerformanceText(percentage: number): string {
    if (percentage >= 80) return 'Ausgezeichnet!';
    if (percentage >= 60) return 'Gut gemacht!';
    if (percentage >= 40) return 'Befriedigend';
    return 'Verbesserung nötig';
  }

  // Statistics
  getAverageTimePerQuestion(): number {
    if (!this.results) return 0;
    return this.results.averageTimePerQuestion;
  }

  getFastestQuestion(): { questionId: number; time: number } | null {
    if (!this.results || this.results.timePerQuestion.size === 0) return null;
    
    let fastest = { questionId: 0, time: Infinity };
    this.results.timePerQuestion.forEach((time, questionId) => {
      if (time < fastest.time) {
        fastest = { questionId, time };
      }
    });
    
    return fastest;
  }

  getSlowestQuestion(): { questionId: number; time: number } | null {
    if (!this.results || this.results.timePerQuestion.size === 0) return null;
    
    let slowest = { questionId: 0, time: 0 };
    this.results.timePerQuestion.forEach((time, questionId) => {
      if (time > slowest.time) {
        slowest = { questionId, time };
      }
    });
    
    return slowest;
  }

  getQuestionTypeStats() {
    const stats: Record<string, { total: number; correct: number; avgTime: number }> = {
      single: { total: 0, correct: 0, avgTime: 0 },
      multi: { total: 0, correct: 0, avgTime: 0 },
      fill: { total: 0, correct: 0, avgTime: 0 }
    };

    this.questions.forEach((question, index) => {
      const answer = this.getQuestionAnswer(question.id);
      const time = answer ? answer.timeSpent : 0;
      
      if (stats[question.type]) {
        stats[question.type].total++;
        if (answer && answer.isCorrect) {
          stats[question.type].correct++;
        }
        stats[question.type].avgTime += time;
      }
    });

    // Berechne Durchschnittszeiten
    Object.keys(stats).forEach(type => {
      if (stats[type].total > 0) {
        stats[type].avgTime = Math.round(stats[type].avgTime / stats[type].total);
      }
    });

    return stats;
  }

  // Export and share methods removed - app doesn't save results
}
