import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  SimulationConfig, 
  SimulationState, 
  SimulationAnswer, 
  SimulationResult,
  Question 
} from '../models';
import { ShuffleService } from './shuffle.service';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root'
})
export class SimulationStoreService {
  private readonly STORAGE_KEY = 'lpic_simulation_state';
  
  private stateSubject = new BehaviorSubject<SimulationState>(this.getInitialState());
  public state$ = this.stateSubject.asObservable();

  constructor(
    private shuffleService: ShuffleService,
    private timerService: TimerService
  ) {
    this.loadFromStorage();
  }

  // Initial state
  private getInitialState(): SimulationState {
    return {
      config: null,
      questions: null,
      currentQuestionIndex: 0,
      answers: new Map(),
      startTime: null,
      endTime: null,
      isActive: false,
      isPaused: false,
      timeRemaining: null
    };
  }

  // Get current state
  getCurrentState(): SimulationState {
    return this.stateSubject.value;
  }

  // Initialize simulation
  initializeSimulation(config: SimulationConfig, questions: Question[]): void {
    // Generiere einen Seed für reproduzierbare Tests
    const seed = config.useSeed 
      ? this.shuffleService.generateUserSeed() 
      : this.shuffleService.generateRandomSeed();
    
    const shuffledQuestions = config.shuffleQuestions 
      ? this.shuffleService.shuffleQuestions(questions, {
          shuffleQuestions: true,
          shuffleOptions: config.shuffleOptions || false,
          seed: config.useSeed ? seed : undefined
        })
      : questions;
    
    const newState: SimulationState = {
      config,
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      answers: new Map(),
      startTime: new Date(),
      endTime: null,
      isActive: true,
      isPaused: false,
      timeRemaining: config.timeLimit ? config.timeLimitMinutes! * 60 : null
    };

    this.updateState(newState);
  }

  // Start simulation
  startSimulation(): void {
    const currentState = this.getCurrentState();
    if (currentState.config && currentState.questions) {
      const updatedState = {
        ...currentState,
        startTime: new Date(),
        isActive: true,
        isPaused: false
      };
      this.updateState(updatedState);
    }
  }

  // Pause simulation
  pauseSimulation(): void {
    const currentState = this.getCurrentState();
    const updatedState = {
      ...currentState,
      isPaused: true
    };
    this.updateState(updatedState);
  }

  // Resume simulation
  resumeSimulation(): void {
    const currentState = this.getCurrentState();
    const updatedState = {
      ...currentState,
      isPaused: false
    };
    this.updateState(updatedState);
  }

  // Answer question
  answerQuestion(questionId: number, answers: string[], timeSpent: number): void {
    const currentState = this.getCurrentState();
    const question = currentState.questions?.find(q => q.id === questionId);
    
    if (question) {
      const isCorrect = this.evaluateAnswer(question, answers);
      
      const answer: SimulationAnswer = {
        questionId,
        answers,
        isCorrect,
        timeSpent,
        timestamp: new Date()
      };

      const newAnswers = new Map(currentState.answers);
      newAnswers.set(questionId, answer);

      const updatedState = {
        ...currentState,
        answers: newAnswers
      };
      this.updateState(updatedState);
    }
  }

  // Navigate to next question
  nextQuestion(): void {
    const currentState = this.getCurrentState();
    if (currentState.questions && currentState.currentQuestionIndex < currentState.questions.length - 1) {
      const updatedState = {
        ...currentState,
        currentQuestionIndex: currentState.currentQuestionIndex + 1
      };
      this.updateState(updatedState);
    }
  }

  // Navigate to previous question
  previousQuestion(): void {
    const currentState = this.getCurrentState();
    if (currentState.currentQuestionIndex > 0) {
      const updatedState = {
        ...currentState,
        currentQuestionIndex: currentState.currentQuestionIndex - 1
      };
      this.updateState(updatedState);
    }
  }

  // Go to specific question
  goToQuestion(index: number): void {
    const currentState = this.getCurrentState();
    if (currentState.questions && index >= 0 && index < currentState.questions.length) {
      const updatedState = {
        ...currentState,
        currentQuestionIndex: index
      };
      this.updateState(updatedState);
    }
  }

  // Update time remaining
  updateTimeRemaining(seconds: number): void {
    const currentState = this.getCurrentState();
    const updatedState = {
      ...currentState,
      timeRemaining: seconds
    };
    this.updateState(updatedState);
  }

  // End simulation
  endSimulation(): void {
    const currentState = this.getCurrentState();
    
    // Timer stoppen
    this.timerService.stopTimer();
    
    const updatedState = {
      ...currentState,
      endTime: new Date(),
      isActive: false,
      isPaused: false
    };
    this.updateState(updatedState);
  }

  // Get simulation results
  getSimulationResults(): SimulationResult | null {
    const currentState = this.getCurrentState();
    
    if (!currentState.questions || !currentState.startTime) {
      return null;
    }

    const totalQuestions = currentState.questions.length;
    const answers = Array.from(currentState.answers.values());
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentage = (correctAnswers / totalQuestions) * 100;

    const endTime = currentState.endTime || new Date();
    const totalTime = (endTime.getTime() - currentState.startTime.getTime()) / 1000;
    const averageTimePerQuestion = totalTime / totalQuestions;

    const timePerQuestion = new Map();
    answers.forEach(answer => {
      timePerQuestion.set(answer.questionId, answer.timeSpent);
    });

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      percentage,
      totalTime,
      averageTimePerQuestion,
      timePerQuestion,
      completedAt: endTime
    };
  }

  // Reset simulation
  resetSimulation(): void {
    const initialState = this.getInitialState();
    this.updateState(initialState);
  }

  // Clear simulation data
  clearSimulation(): void {
    this.resetSimulation();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Private methods
  private updateState(newState: SimulationState): void {
    this.stateSubject.next(newState);
    this.saveToStorage(newState);
  }

  private evaluateAnswer(question: Question, answers: string[]): boolean {
    switch (question.type) {
      case 'single':
        return question.correctAnswer === answers[0];
      
      case 'multi':
        if (!question.correctAnswers) return false;
        if (answers.length !== question.correctAnswers.length) return false;
        return answers.every(answer => question.correctAnswers!.includes(answer));
      
      case 'fill':
        if (!question.correctAnswers) return false;
        return question.correctAnswers.some(correctAnswer => 
          answers.some(answer => 
            answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
          )
        );
      
      default:
        return false;
    }
  }

  private saveToStorage(state: SimulationState): void {
    try {
      // Convert Map to array for storage
      const storageState = {
        ...state,
        answers: Array.from(state.answers.entries())
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageState));
    } catch (error) {
      console.error('Error saving simulation state to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        // Convert array back to Map
        if (parsedState.answers) {
          parsedState.answers = new Map(parsedState.answers);
        }
        this.stateSubject.next(parsedState);
      }
    } catch (error) {
      console.error('Error loading simulation state from storage:', error);
      // Fallback to initial state
      this.stateSubject.next(this.getInitialState());
    }
  }

  // Utility methods
  getCurrentQuestion(): Question | null {
    const currentState = this.getCurrentState();
    if (currentState.questions && currentState.currentQuestionIndex < currentState.questions.length) {
      return currentState.questions[currentState.currentQuestionIndex];
    }
    return null;
  }

  getQuestionAnswer(questionId: number): SimulationAnswer | null {
    const currentState = this.getCurrentState();
    return currentState.answers.get(questionId) || null;
  }

  isQuestionAnswered(questionId: number): boolean {
    return this.getCurrentState().answers.has(questionId);
  }

  getProgress(): { current: number; total: number; percentage: number } {
    const currentState = this.getCurrentState();
    const total = currentState.questions?.length || 0;
    const current = currentState.currentQuestionIndex + 1;
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return { current, total, percentage };
  }

  canGoNext(): boolean {
    const currentState = this.getCurrentState();
    return currentState.questions ? 
      currentState.currentQuestionIndex < currentState.questions.length - 1 : false;
  }

  canGoPrevious(): boolean {
    return this.getCurrentState().currentQuestionIndex > 0;
  }
}
