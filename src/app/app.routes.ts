import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'learn', loadChildren: () => import('./features/learn/learn.routes').then(m => m.LEARN_ROUTES) },
  { path: 'simulate', loadChildren: () => import('./features/simulate/simulate.routes').then(m => m.SIMULATE_ROUTES) },
  { path: '**', redirectTo: '/home' }
];
