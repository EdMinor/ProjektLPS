import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent, BreadcrumbItem } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // Breadcrumbs for header
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', active: true }
  ];

  constructor(private router: Router) {}

  startLearning(): void {
    this.router.navigate(['/learn/catalogs']);
  }

  startSimulation(): void {
    this.router.navigate(['/simulate/setup']);
  }
}
