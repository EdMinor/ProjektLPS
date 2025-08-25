import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent, BreadcrumbItem } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.css']
})
export class ImpressumComponent {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', route: '/home' },
    { label: 'Impressum', active: true }
  ];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
