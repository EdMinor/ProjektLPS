import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'impressum', loadComponent: () => import('./pages/impressum/impressum.component').then(m => m.ImpressumComponent) },
  { path: 'learn', loadChildren: () => import('./features/learn/learn.routes').then(m => m.LEARN_ROUTES) },
  { path: 'simulate', loadChildren: () => import('./features/simulate/simulate.routes').then(m => m.SIMULATE_ROUTES) },
  { path: '**', redirectTo: '/home' }
];
