import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent, BreadcrumbItem } from '../../../shared/components/header/header.component';
import { Catalog, Topic } from '../../../core/models';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
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

  // Breadcrumbs for header
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', route: '/home' },
    { label: 'Kataloge', active: true }
  ];

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

  filterByTopic(topic: string): void {
    this.selectedTopic = topic;
    this.filterCatalogs();
  }

  clearFilter(): void {
    this.selectedTopic = null;
    this.loadCatalogs();
  }

  private filterCatalogs(): void {
    if (!this.selectedTopic || this.selectedTopic === 'all') {
      this.catalogs = [...this.allCatalogs];
    } else {
      this.catalogs = this.allCatalogs.filter(catalog => {
        if (this.selectedTopic === '101') {
          return catalog.topicId === 1;
        } else if (this.selectedTopic === '102') {
          return catalog.topicId === 2;
        }
        return true;
      });
    }
  }

  getTopicName(topicId: number): string {
    const topic = this.topics.find(t => t.id === topicId);
    return topic ? topic.name : 'Unbekannt';
  }

  selectCatalog(catalog: Catalog): void {
    this.router.navigate(['/learn/questions', 0], { 
      queryParams: { catalogId: catalog.id } 
    });
  }
}
