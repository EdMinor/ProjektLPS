import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export interface TimerState {
  timeRemaining: number; // in Sekunden
  timeSpent: number;     // in Sekunden
  isRunning: boolean;
  isPaused: boolean;
  warningThreshold: number; // Sekunden vor Ende für Warnung
  criticalThreshold: number; // Sekunden vor Ende für kritische Warnung
}

export interface TimerConfig {
  totalTime: number;      // Gesamtzeit in Sekunden
  warningThreshold?: number; // Warnung bei X Sekunden (Standard: 300 = 5 Min)
  criticalThreshold?: number; // Kritische Warnung bei X Sekunden (Standard: 60 = 1 Min)
  autoPauseOnBlur?: boolean; // Automatisch pausieren wenn Tab nicht aktiv
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerState = new BehaviorSubject<TimerState>(this.getInitialState());
  public timerState$ = this.timerState.asObservable();
  
  private timerSubscription?: Subscription;
  private config: TimerConfig | null = null;
  private startTime: Date | null = null;
  private pauseStartTime: Date | null = null;
  private totalPauseTime = 0;

  constructor() {
    // Automatische Pause wenn Tab nicht aktiv
    this.setupVisibilityChangeHandler();
  }

  // Timer starten
  startTimer(config: TimerConfig): void {
    this.config = {
      ...config,
      warningThreshold: config.warningThreshold || 300,    // 5 Minuten
      criticalThreshold: config.criticalThreshold || 60,   // 1 Minute
      autoPauseOnBlur: config.autoPauseOnBlur !== false
    };

    this.startTime = new Date();
    this.totalPauseTime = 0;
    
         const initialState: TimerState = {
       timeRemaining: config.totalTime,
       timeSpent: 0,
       isRunning: true,
       isPaused: false,
       warningThreshold: this.config.warningThreshold!,
       criticalThreshold: this.config.criticalThreshold!
     };

    this.timerState.next(initialState);
    this.startTimerInterval();
  }

  // Timer stoppen
  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }

    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      isRunning: false,
      isPaused: false
    });
  }

  // Timer pausieren
  pauseTimer(): void {
    if (!this.timerState.value.isRunning || this.timerState.value.isPaused) {
      return;
    }

    this.pauseStartTime = new Date();
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }

    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      isPaused: true
    });
  }

  // Timer fortsetzen
  resumeTimer(): void {
    if (!this.timerState.value.isRunning || !this.timerState.value.isPaused) {
      return;
    }

    if (this.pauseStartTime) {
      const pauseDuration = (new Date().getTime() - this.pauseStartTime.getTime()) / 1000;
      this.totalPauseTime += pauseDuration;
      this.pauseStartTime = null;
    }

    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      isPaused: false
    });

    this.startTimerInterval();
  }

  // Timer zurücksetzen
  resetTimer(): void {
    this.stopTimer();
    this.startTime = null;
    this.pauseStartTime = null;
    this.totalPauseTime = 0;
    this.timerState.next(this.getInitialState());
  }

  // Zeit hinzufügen (für Bonus-Zeit)
  addTime(seconds: number): void {
    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      timeRemaining: currentState.timeRemaining + seconds
    });
  }

  // Zeit abziehen (für Strafen)
  subtractTime(seconds: number): void {
    const currentState = this.timerState.value;
    const newTimeRemaining = Math.max(0, currentState.timeRemaining - seconds);
    
    this.timerState.next({
      ...currentState,
      timeRemaining: newTimeRemaining
    });

    // Wenn Zeit aufgebraucht, Timer stoppen
    if (newTimeRemaining <= 0) {
      this.stopTimer();
    }
  }

  // Aktuelle Zeit pro Frage starten
  startQuestionTimer(): void {
    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      timeSpent: 0
    });
  }

  // Zeit pro Frage stoppen
  stopQuestionTimer(): number {
    const currentState = this.timerState.value;
    const questionTime = currentState.timeSpent;
    
    this.timerState.next({
      ...currentState,
      timeSpent: 0
    });

    return questionTime;
  }

  // Timer-Status abrufen
  getTimerState(): TimerState {
    return this.timerState.value;
  }

  // Observable für Timer-Status
  getTimerState$(): Observable<TimerState> {
    return this.timerState.asObservable();
  }

  // Zeit-Formatierung
  formatTime(seconds: number): string {
    // Sekunden auf ganze Zahl aufrunden
    const roundedSeconds = Math.round(seconds);
    
    const hours = Math.floor(roundedSeconds / 3600);
    const minutes = Math.floor((roundedSeconds % 3600) / 60);
    const remainingSeconds = roundedSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  // Zeit-Status für CSS-Klassen
  getTimeStatus(): 'normal' | 'warning' | 'critical' | 'expired' {
    const currentState = this.timerState.value;
    const { timeRemaining, warningThreshold, criticalThreshold } = currentState;

    if (timeRemaining <= 0) return 'expired';
    if (timeRemaining <= criticalThreshold) return 'critical';
    if (timeRemaining <= warningThreshold) return 'warning';
    return 'normal';
  }

  // Zeit-Status als Text
  getTimeStatusText(): string {
    const status = this.getTimeStatus();
    switch (status) {
      case 'normal': return 'Zeit läuft normal';
      case 'warning': return 'Zeit wird knapp!';
      case 'critical': return 'Zeit läuft ab!';
      case 'expired': return 'Zeit ist abgelaufen!';
      default: return '';
    }
  }

  // Zeit-Status als Icon
  getTimeStatusIcon(): string {
    const status = this.getTimeStatus();
    switch (status) {
      case 'normal': return '⏱️';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      case 'expired': return '⏰';
      default: return '⏱️';
    }
  }

  // Verbleibende Zeit in Prozent
  getTimeRemainingPercentage(): number {
    if (!this.config) return 0;
    
    const currentState = this.timerState.value;
    return (currentState.timeRemaining / this.config.totalTime) * 100;
  }

  // Verbrauchte Zeit in Prozent
  getTimeSpentPercentage(): number {
    if (!this.config) return 0;
    
    const currentState = this.timerState.value;
    const totalElapsed = this.getTotalElapsedTime();
    return (totalElapsed / this.config.totalTime) * 100;
  }

  // Gesamt verstrichene Zeit (inkl. Pausen)
  getTotalElapsedTime(): number {
    if (!this.startTime) return 0;
    
    const now = new Date();
    const totalDuration = (now.getTime() - this.startTime.getTime()) / 1000;
    return totalDuration - this.totalPauseTime;
  }

  // Geschätzte verbleibende Zeit basierend auf aktueller Geschwindigkeit
  getEstimatedTimeRemaining(): number {
    const currentState = this.timerState.value;
    const totalElapsed = this.getTotalElapsedTime();
    
    if (totalElapsed <= 0) return currentState.timeRemaining;
    
    // Berechne durchschnittliche Zeit pro Sekunde
    const timePerSecond = totalElapsed / (this.config?.totalTime || 1);
    const estimatedRemaining = currentState.timeRemaining / timePerSecond;
    
    return Math.max(0, estimatedRemaining);
  }

  // Private Methoden
  private getInitialState(): TimerState {
    return {
      timeRemaining: 0,
      timeSpent: 0,
      isRunning: false,
      isPaused: false,
      warningThreshold: 300,
      criticalThreshold: 60
    };
  }

  private startTimerInterval(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(1000).pipe(
      takeWhile(() => this.timerState.value.isRunning && !this.timerState.value.isPaused)
    ).subscribe(() => {
      this.updateTimer();
    });
  }

  private updateTimer(): void {
    const currentState = this.timerState.value;
    
    if (currentState.timeRemaining <= 0) {
      this.stopTimer();
      return;
    }

    const newState: TimerState = {
      ...currentState,
      timeRemaining: currentState.timeRemaining - 1,
      timeSpent: currentState.timeSpent + 1
    };

    this.timerState.next(newState);

    // Timer stoppen wenn Zeit abgelaufen
    if (newState.timeRemaining <= 0) {
      this.stopTimer();
    }
  }

  private setupVisibilityChangeHandler(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.config?.autoPauseOnBlur) {
          if (document.hidden && this.timerState.value.isRunning && !this.timerState.value.isPaused) {
            this.pauseTimer();
          } else if (!document.hidden && this.timerState.value.isPaused) {
            this.resumeTimer();
          }
        }
      });
    }
  }

  // Cleanup
  ngOnDestroy(): void {
    this.stopTimer();
  }
}
