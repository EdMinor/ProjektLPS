import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiError } from '../../../core/services/api.service';

@Component({
  selector: 'app-error-handler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container" *ngIf="error">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      
      <h3 class="error-title">{{ getErrorTitle() }}</h3>
      <p class="error-message">{{ error.message }}</p>
      
      <div class="error-actions">
        <button 
          *ngIf="error.retryable" 
          class="btn btn-primary" 
          (click)="onRetry.emit()">
          Erneut versuchen
        </button>
        <button 
          class="btn btn-secondary" 
          (click)="onGoHome.emit()">
          Zur Startseite
        </button>
      </div>
      
      <div class="error-help" *ngIf="error.type === 'network'">
        <p><strong>Tipps zur Fehlerbehebung:</strong></p>
        <ul>
          <li>Überprüfen Sie Ihre Internetverbindung</li>
          <li>Stellen Sie sicher, dass der Server läuft</li>
          <li>Versuchen Sie es in einigen Minuten erneut</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
      margin: 0 auto;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    
    .error-icon {
      color: #dc3545;
      margin-bottom: 1rem;
    }
    
    .error-title {
      color: #343a40;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    
    .error-message {
      color: #6c757d;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    
    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover {
      background: #0056b3;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #545b62;
    }
    
    .error-help {
      text-align: left;
      background: white;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }
    
    .error-help p {
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }
    
    .error-help ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .error-help li {
      margin-bottom: 0.25rem;
      color: #495057;
    }
  `]
})
export class ErrorHandlerComponent {
  @Input() error: ApiError | null = null;
  @Output() onRetry = new EventEmitter<void>();
  @Output() onGoHome = new EventEmitter<void>();

  getErrorTitle(): string {
    if (!this.error) return '';
    
    switch (this.error.type) {
      case 'network':
        return 'Verbindungsfehler';
      case 'not_found':
        return 'Ressource nicht gefunden';
      case 'server':
        return 'Serverfehler';
      case 'unknown':
      default:
        return 'Ein Fehler ist aufgetreten';
    }
  }
}
