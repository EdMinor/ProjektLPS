import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, map, throwError, shareReplay } from 'rxjs';
import { Topic, Catalog, Question } from '../models';
import { environment } from '../../../environments/environment';

export interface ApiError {
  message: string;
  type: 'network' | 'not_found' | 'server' | 'unknown';
  retryable: boolean;
}

interface DbSchema {
  topics?: Topic[];
  catalogs?: Catalog[];
  questions?: Question[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly dataUrl = environment.dataUrl;
  private dbCache$: Observable<DbSchema> | null = null;

  constructor(private http: HttpClient) {}

  private getDbData(): Observable<DbSchema> {
    if (!this.dbCache$) {
      this.dbCache$ = this.http.get<DbSchema>(this.dataUrl).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.dbCache$;
  }

  private isLocalApi(): boolean {
    return this.dataUrl.includes('localhost:3000');
  }

  // Topics
  getTopics(): Observable<Topic[]> {
    if (this.isLocalApi()) {
      return this.http.get<Topic[]>(`${this.dataUrl}/topics`)
        .pipe(catchError(this.handleError));
    }
    return this.getDbData().pipe(
      map(db => db.topics ?? []),
      catchError(this.handleError)
    );
  }

  // Catalogs
  getCatalogs(): Observable<Catalog[]> {
    if (this.isLocalApi()) {
      return this.http.get<Catalog[]>(`${this.dataUrl}/kataloge`)
        .pipe(catchError(this.handleError));
    }
    return this.getDbData().pipe(
      map(db => db.catalogs ?? []),
      catchError(this.handleError)
    );
  }

  getCatalogById(id: number): Observable<Catalog> {
    if (this.isLocalApi()) {
      return this.http.get<Catalog>(`${this.dataUrl}/kataloge/${id}`)
        .pipe(catchError(this.handleError));
    }
    return this.getDbData().pipe(
      map(db => {
        const catalog = (db.catalogs ?? []).find(c => c.id === id);
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
    if (this.isLocalApi()) {
      return this.http.get<Question[]>(`${this.dataUrl}/fragen`)
        .pipe(
          map(questions => questions.filter(q => q.catalogId === catalogId)),
          map(questions => {
            if (questions.length === 0) {
              throw new Error('Keine Fragen für diesen Katalog gefunden');
            }
            return questions;
          }),
          catchError(this.handleError)
        );
    }
    return this.getDbData().pipe(
      map(db => {
        const questions = (db.questions ?? []).filter(q => q.catalogId === catalogId);
        if (questions.length === 0) {
          throw new Error('Keine Fragen für diesen Katalog gefunden');
        }
        return questions;
      }),
      catchError(this.handleError)
    );
  }

  getQuestionById(id: number): Observable<Question> {
    if (this.isLocalApi()) {
      return this.http.get<Question[]>(`${this.dataUrl}/fragen`)
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
    return this.getDbData().pipe(
      map(db => {
        const question = (db.questions ?? []).find(q => q.id === id);
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
        message: 'Ein unerwarteter Fehler ist aufgetreten.',
        type: 'unknown',
        retryable: true
      };
    }
    
    return throwError(() => apiError);
  }
}
