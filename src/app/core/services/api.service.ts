import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Topic, Catalog, Question } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Topics
  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.baseUrl}/topics`)
      .pipe(catchError(this.handleError));
  }

  // Catalogs
  getCatalogs(): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`${this.baseUrl}/kataloge`)
      .pipe(catchError(this.handleError));
  }

  getCatalogById(id: number): Observable<Catalog> {
    return this.http.get<Catalog>(`${this.baseUrl}/kataloge/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Questions
  getQuestionsByCatalog(catalogId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/fragen`)
      .pipe(catchError(this.handleError));
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/fragen/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return of();
  }
}
