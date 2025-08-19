import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Catalog, Topic } from '../../../core/models';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.css'
})
export class CatalogListComponent implements OnInit {
  catalogs: Catalog[] = [];
  allCatalogs: Catalog[] = [];
  topics: Topic[] = [];
  selectedTopic: string | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadTopics();
    this.loadCatalogs();
  }

  loadTopics(): void {
    this.apiService.getTopics().subscribe({
      next: (topics) => {
        this.topics = topics;
      },
      error: (error) => {
        console.error('Error loading topics:', error);
      }
    });
  }

  loadCatalogs(): void {
    this.loading = true;
    this.error = null;

    // Get topic from query params
    this.route.queryParams.subscribe(params => {
      this.selectedTopic = params['topic'] || null;
    });

    this.apiService.getCatalogs().subscribe({
      next: (catalogs) => {
        this.allCatalogs = catalogs;
        this.filterCatalogs();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Fehler beim Laden der Kataloge';
        this.loading = false;
        console.error('Error loading catalogs:', error);
      }
    });
  }

  filterCatalogs(): void {
    if (!this.selectedTopic) {
      this.catalogs = this.allCatalogs;
      return;
    }

    if (this.selectedTopic === '101') {
      this.catalogs = this.allCatalogs.filter(cat => cat.topicId === 1);
    } else if (this.selectedTopic === '102') {
      this.catalogs = this.allCatalogs.filter(cat => cat.topicId === 2);
    } else {
      this.catalogs = this.allCatalogs;
    }
  }

  getTopicName(topicId: number): string {
    const topic = this.topics.find(t => t.id === topicId);
    return topic ? topic.name : 'Unbekannt';
  }

  selectCatalog(catalog: Catalog): void {
    this.router.navigate(['/learn/catalogs', catalog.id]);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  clearFilter(): void {
    this.selectedTopic = null;
    this.filterCatalogs();
  }
}
