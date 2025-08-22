import { Routes } from '@angular/router';

export const LEARN_ROUTES: Routes = [
  { path: '', redirectTo: 'catalogs', pathMatch: 'full' },
  { path: 'catalogs', loadComponent: () => import('./catalog-list/catalog-list.component').then(m => m.CatalogListComponent) },
  { path: 'questions/:index', loadComponent: () => import('./question-detail/question-detail.component').then(m => m.QuestionDetailComponent) }
];
