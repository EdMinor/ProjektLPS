import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, map, throwError } from 'rxjs';
import { Topic, Catalog, Question } from '../models';

export interface ApiError {
  message: string;
  type: 'network' | 'not_found' | 'server' | 'unknown';
  retryable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Topics
  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.baseUrl}/themen`)
      .pipe(catchError(this.handleError));
  }

  // Catalogs
  getCatalogs(): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`${this.baseUrl}/kataloge`)
      .pipe(catchError(this.handleError));
  }

  getCatalogById(id: number): Observable<Catalog> {
    return this.http.get<Catalog[]>(`${this.baseUrl}/kataloge`)
      .pipe(
        map(catalogs => catalogs.find(c => c.id === id)),
        map(catalog => {
          if (!catalog) {
            throw new Error(`Catalog with id ${id} not found`);
          }
          return catalog;
        }),
        catchError(this.handleError)
      );
  }

  // Questions
  getQuestionsByCatalog(catalogId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/fragen?catalogId=${catalogId}`)
      .pipe(catchError(this.handleError));
  }

  getQuestionById(id: number): Observable<Question> {
    // Für Vercel müssen wir alle Fragen laden und dann filtern
    return this.http.get<Question[]>(`${this.baseUrl}/fragen`)
      .pipe(
        map(questions => questions.find(q => q.id === id)),
        map(question => {
          if (!question) {
            throw new Error(`Question with id ${id} not found`);
          }
          return question;
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let apiError: ApiError;
    
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        // Netzwerkfehler (keine Verbindung)
        apiError = {
          message: 'Keine Verbindung zum Server möglich. Bitte überprüfen Sie Ihre Internetverbindung.',
          type: 'network',
          retryable: true
        };
      } else if (error.status === 404) {
        apiError = {
          message: 'Die angeforderte Ressource wurde nicht gefunden.',
          type: 'not_found',
          retryable: false
        };
      } else if (error.status >= 500) {
        apiError = {
          message: 'Serverfehler. Bitte versuchen Sie es später erneut.',
          type: 'server',
          retryable: true
        };
      } else {
        apiError = {
          message: `Fehler: ${error.status} - ${error.statusText}`,
          type: 'unknown',
          retryable: false
        };
      }
    } else if (error.message === 'Keine Fragen für diesen Katalog gefunden') {
      apiError = {
        message: 'Dieser Katalog enthält keine Fragen.',
        type: 'not_found',
        retryable: false
      };
    } else {
      apiError = {
        message: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
        type: 'unknown',
        retryable: false
      };
    }
    
    return throwError(() => apiError);
  }
}
