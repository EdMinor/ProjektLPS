import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedTopic: '101' | '102' | 'all' | null = null;
  showTopicSelection = false;

  constructor(private router: Router) {}

  startLearning(): void {
    this.showTopicSelection = true;
  }

  selectTopic(topic: '101' | '102' | 'all'): void {
    this.selectedTopic = topic;
    this.showTopicSelection = false;
    
    if (topic === 'all') {
      this.router.navigate(['/learn/catalogs']);
    } else {
      this.router.navigate(['/learn/catalogs'], { 
        queryParams: { topic: topic } 
      });
    }
  }

  startSimulation(): void {
    this.router.navigate(['/simulate/setup']);
  }

  goBack(): void {
    this.selectedTopic = null;
    this.showTopicSelection = false;
  }
}
