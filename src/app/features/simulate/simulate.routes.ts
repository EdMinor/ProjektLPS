import { Routes } from '@angular/router';

export const SIMULATE_ROUTES: Routes = [
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  { path: 'setup', loadComponent: () => import('./setup/setup.component').then(m => m.SetupComponent) },
  { path: 'run', loadComponent: () => import('./run/run.component').then(m => m.RunComponent) },
  { path: 'results', loadComponent: () => import('./results/results.component').then(m => m.ResultsComponent) }
];
