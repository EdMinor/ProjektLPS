import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, ApiError } from '../../../core/services/api.service';
import { SimulationStoreService } from '../../../core/services/simulation-store.service';
import { TimerService } from '../../../core/services/timer.service';
import { HeaderComponent, BreadcrumbItem } from '../../../shared/components/header/header.component';
import { ErrorHandlerComponent } from '../../../shared/components/error-handler/error-handler.component';
import { Catalog, Topic, SimulationConfig } from '../../../core/models';

@Component({
  selector: 'app-simulation-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, ErrorHandlerComponent],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SimulationSetupComponent implements OnInit {
  setupForm!: FormGroup;
  catalogs: Catalog[] = [];
  allCatalogs: Catalog[] = []; // Store all catalogs
  topics: Topic[] = [];
  isLoading = false;
  error: ApiError | null = null;
  selectedTopic: string | null = 'all'; // Default to show all catalogs
  showConfigModal: boolean = false;
  showCatalogDropdown: boolean = false;
  dropdownDirection: 'up' | 'down' = 'down'; // Add dropdown direction property
  showCatalogModal: boolean = false; // Add catalog modal property

  // Breadcrumbs for header
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', route: '/home' },
    { label: 'Simulation', route: '/simulate/setup' },
    { label: 'Setup', active: true }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private simulationStore: SimulationStoreService,
    private timerService: TimerService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    
    // Überwache Formularstatus-Änderungen
    this.setupForm.statusChanges.subscribe(status => {
      console.log('Formularstatus geändert:', status);
      console.log('Formular gültig:', this.setupForm.valid);
      console.log('catalogId Wert:', this.setupForm.get('catalogId')?.value);
      console.log('catalogId Fehler:', this.setupForm.get('catalogId')?.errors);
    });
  }

  private initForm(): void {
    this.setupForm = this.fb.group({
      catalogId: [null, Validators.required],
      questionCount: [20, [Validators.required, Validators.min(1)]],
      timeLimit: [false],
      timeLimitMinutes: [60, [Validators.min(1), Validators.max(300)]],
      shuffleQuestions: [true],
      shuffleOptions: [true],
      useSeed: [false]
    });

    // Time limit fields werden nur aktiviert wenn timeLimit true ist
    this.setupForm.get('timeLimit')?.valueChanges.subscribe(hasTimeLimit => {
      const timeLimitMinutesControl = this.setupForm.get('timeLimitMinutes');
      if (hasTimeLimit) {
        timeLimitMinutesControl?.enable();
      } else {
        timeLimitMinutesControl?.disable();
      }
    });

    // Shuffle options werden nur aktiviert wenn shuffleQuestions true ist
    this.setupForm.get('shuffleQuestions')?.valueChanges.subscribe(shuffleQuestions => {
      const shuffleOptionsControl = this.setupForm.get('shuffleOptions');
      const useSeedControl = this.setupForm.get('useSeed');
      
      if (shuffleQuestions) {
        shuffleOptionsControl?.enable();
        useSeedControl?.enable();
      } else {
        shuffleOptionsControl?.disable();
        useSeedControl?.disable();
        // Setze Werte zurück
        shuffleOptionsControl?.setValue(false);
        useSeedControl?.setValue(false);
      }
    });
  }

  public async loadData(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const [catalogsData, topicsData] = await Promise.all([
        this.apiService.getCatalogs().toPromise(),
        this.apiService.getTopics().toPromise()
      ]);

      this.allCatalogs = (catalogsData || []).filter(catalog => catalog.questionCount > 0); // Filtere leere Kataloge aus
      this.topics = topicsData || [];



      // Initialize catalogs based on current filter
      this.filterByTopic('all');

      // Setze den ersten Katalog als Standard
      if (this.catalogs.length > 0) {
        const firstCatalog = this.catalogs[0];
        console.log('Erster verfügbarer Katalog:', firstCatalog);
        
        this.setupForm.patchValue({
          catalogId: firstCatalog.id
        });
        
        // Warte einen Tick, bevor updateMaxQuestions aufgerufen wird
        setTimeout(() => {
          this.updateMaxQuestions();
          
          // Debug: Log den gesetzten Katalog
          console.log('Standardkatalog gesetzt:', firstCatalog.id);
          console.log('Formularstatus:', this.setupForm.valid);
          console.log('catalogId Wert:', this.setupForm.get('catalogId')?.value);
        }, 0);
      } else {
        console.log('Keine Kataloge verfügbar');
      }
    } catch (error) {
      this.error = {
        message: 'Fehler beim Laden der Kataloge. Bitte versuche es erneut.',
        type: 'unknown',
        retryable: true
      };
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private updateMaxQuestions(): void {
    const selectedCatalogId = this.setupForm.get('catalogId')?.value;
    const selectedCatalog = this.catalogs.find(c => c.id === selectedCatalogId);
    
    if (selectedCatalog && selectedCatalog.questionCount > 0) {
      const maxQuestions = selectedCatalog.questionCount;
      const questionCountControl = this.setupForm.get('questionCount');
      
      // Debug: Log den ausgewählten Katalog
      console.log('updateMaxQuestions - selectedCatalogId:', selectedCatalogId);
      console.log('updateMaxQuestions - selectedCatalog:', selectedCatalog);
      console.log('updateMaxQuestions - maxQuestions:', maxQuestions);
      
      questionCountControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(maxQuestions)
      ]);
      
      // Passe die Anzahl der Fragen an, falls sie über dem Maximum liegt
      if (questionCountControl && questionCountControl.value > maxQuestions) {
        questionCountControl.setValue(maxQuestions);
      }
      
      questionCountControl?.updateValueAndValidity();
      
      // Debug: Formularstatus nach Update
      console.log('Formularstatus nach updateMaxQuestions:', this.setupForm.valid);
    } else {
      console.log('updateMaxQuestions - Kein gültiger Katalog gefunden für ID:', selectedCatalogId);
      // Setze Standardvalidatoren
      const questionCountControl = this.setupForm.get('questionCount');
      questionCountControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      questionCountControl?.updateValueAndValidity();
    }
  }

  onCatalogChange(): void {
    this.updateMaxQuestions();
  }

  getSelectedCatalog(): Catalog | null {
    const catalogId = this.setupForm.get('catalogId')?.value;
    return this.catalogs.find(c => c.id === catalogId) || null;
  }

  getTopicName(topicId: number): string {
    const topic = this.topics.find(t => t.id === topicId);
    return topic ? topic.name : 'Unbekannt';
  }

  onSubmit(): void {
    if (this.setupForm.valid) {
      const formValue = this.setupForm.value;
      
      // Erstelle die Simulation-Konfiguration
      const simulationConfig: SimulationConfig = {
        catalogId: formValue.catalogId,
        questionCount: formValue.questionCount,
        timeLimit: formValue.timeLimit,
        timeLimitMinutes: formValue.timeLimit ? formValue.timeLimitMinutes : null,
        shuffleQuestions: formValue.shuffleQuestions,
        shuffleOptions: formValue.shuffleOptions || false,
        useSeed: formValue.useSeed || false
      };

      // Lade Fragen für den ausgewählten Katalog
      this.loadQuestionsAndStartSimulation(simulationConfig);
    }
  }

  private async loadQuestionsAndStartSimulation(config: SimulationConfig): Promise<void> {
    try {
      const questions = await this.apiService.getQuestionsByCatalog(config.catalogId).toPromise();
      
      if (questions && questions.length > 0) {
        const selectedQuestions = questions.slice(0, config.questionCount);

        this.timerService.resetTimer(); // Reset timer before new simulation

        this.simulationStore.initializeSimulation(config, selectedQuestions);

        this.router.navigate(['/simulate/run']);
      } else {
        this.error = {
          message: 'Keine Fragen für den ausgewählten Katalog gefunden.',
          type: 'not_found',
          retryable: false
        };
      }
    } catch (error) {
      this.error = {
        message: 'Fehler beim Laden der Fragen. Bitte versuche es erneut.',
        type: 'unknown',
        retryable: true
      };
      console.error('Error loading questions:', error);
    }
  }

  // New methods for the updated UI
  selectCatalog(catalog: Catalog): void {
    this.setupForm.patchValue({ catalogId: catalog.id });
    this.updateMaxQuestions();
    this.showCatalogModal = false; // Close modal after selection
  }

  getMaxQuestions(): number {
    const selectedCatalog = this.getSelectedCatalog();
    return selectedCatalog ? selectedCatalog.questionCount : 1;
  }

  // New button-based configuration methods
  setQuestionCount(count: number): void {
    this.setupForm.patchValue({ questionCount: count });
  }

  setTimeLimit(minutes: number): void {
    this.setupForm.patchValue({ 
      timeLimit: true, 
      timeLimitMinutes: minutes 
    });
  }

  disableTimeLimit(): void {
    this.setupForm.patchValue({ 
      timeLimit: false, 
      timeLimitMinutes: null 
    });
  }

  toggleShuffleQuestions(): void {
    const currentValue = this.setupForm.get('shuffleQuestions')?.value;
    this.setupForm.patchValue({ 
      shuffleQuestions: !currentValue,
      shuffleOptions: !currentValue ? false : this.setupForm.get('shuffleOptions')?.value,
      useSeed: !currentValue ? false : this.setupForm.get('useSeed')?.value
    });
  }

  toggleShuffleOptions(): void {
    const currentValue = this.setupForm.get('shuffleOptions')?.value;
    this.setupForm.patchValue({ shuffleOptions: !currentValue });
  }

  toggleUseSeed(): void {
    const currentValue = this.setupForm.get('useSeed')?.value;
    this.setupForm.patchValue({ useSeed: !currentValue });
  }

  resetForm(): void {
    this.setupForm.reset({
      catalogId: this.catalogs.length > 0 ? this.catalogs[0].id : '',
      questionCount: 20,
      timeLimit: false,
      timeLimitMinutes: 60,
      shuffleQuestions: true,
      shuffleOptions: true,
      useSeed: false
    });
    this.updateMaxQuestions();
  }

  // Topic filtering methods
  filterByTopic(topic: string): void {
    this.selectedTopic = topic;
    if (topic === 'all') {
      this.catalogs = this.allCatalogs.filter(catalog => catalog.questionCount > 0);
    } else {
      // Filtere Kataloge nach Thema
      const topicId = topic === '101' ? 1 : 2;
      this.catalogs = this.allCatalogs.filter(catalog => 
        catalog.topicId === topicId && catalog.questionCount > 0
      );
    }
    
    // Überprüfe, ob der aktuell ausgewählte Katalog noch verfügbar ist
    const currentCatalogId = this.setupForm.get('catalogId')?.value;
    const isCurrentCatalogAvailable = this.catalogs.some(c => c.id === currentCatalogId);
    
    if (!isCurrentCatalogAvailable && this.catalogs.length > 0) {
      // Setze den ersten verfügbaren Katalog als Standard
      this.setupForm.patchValue({
        catalogId: this.catalogs[0].id
      });
      this.updateMaxQuestions();
      
      console.log('Katalog nach Filterung aktualisiert:', this.catalogs[0].id);
    }
  }

  clearFilter(): void {
    this.selectedTopic = null;
    this.catalogs = this.allCatalogs.filter(catalog => catalog.questionCount > 0);
  }

  // Modal methods
  openConfigModal(): void {
    this.showConfigModal = true;
  }

  closeConfigModal(): void {
    this.showConfigModal = false;
  }

  // New methods for catalog selection
  selectCatalogForSimulation(catalog: Catalog): void {
    this.setupForm.patchValue({
      catalogId: catalog.id,
      questionCount: Math.min(20, catalog.questionCount)
    });
    this.openConfigModal();
  }

  isCatalogSelected(catalog: Catalog): boolean {
    return this.setupForm.get('catalogId')?.value === catalog.id;
  }

  // Catalog modal methods
  openCatalogModal(): void {
    this.showCatalogModal = true;
  }

  closeCatalogModal(): void {
    this.showCatalogModal = false;
  }



  // Configuration summary method
  getConfigSummary(): string {
    const questionCount = this.setupForm.get('questionCount')?.value || 20;
    const timeLimit = this.setupForm.get('timeLimit')?.value;
    const timeLimitMinutes = this.setupForm.get('timeLimitMinutes')?.value;
    const shuffleQuestions = this.setupForm.get('shuffleQuestions')?.value;
    const shuffleOptions = this.setupForm.get('shuffleOptions')?.value;

    let summary = `${questionCount} Fragen`;
    
    if (timeLimit && timeLimitMinutes) {
      summary += `, ${timeLimitMinutes} Min`;
    } else {
      summary += `, Kein Zeitlimit`;
    }
    
    if (shuffleQuestions) {
      summary += `, Gemischt`;
      if (shuffleOptions) {
        summary += ` + Optionen`;
      }
    }
    
    return summary;
  }

  // Catalog dropdown methods
  toggleCatalogDropdown(): void {
    this.showCatalogDropdown = !this.showCatalogDropdown;
    if (this.showCatalogDropdown) {
      this.determineDropdownDirection();
    }
  }

  private determineDropdownDirection(): void {
    // Get the dropdown container element
    const dropdownContainer = document.querySelector('.catalog-dropdown-container');
    if (!dropdownContainer) {
      this.dropdownDirection = 'down';
      return;
    }

    const containerRect = dropdownContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 300; // max-height from CSS

    // Check if there's enough space below
    const spaceBelow = viewportHeight - containerRect.bottom;
    const spaceAbove = containerRect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      this.dropdownDirection = 'up';
    } else {
      this.dropdownDirection = 'down';
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.catalog-dropdown-container')) {
      this.showCatalogDropdown = false;
    }
  }

  onRetry(): void {
    this.loadData();
  }

  onGoHome(): void {
    this.router.navigate(['/home']);
  }
  
  // Debug-Methode für Formularstatus
  debugFormStatus(): void {
    console.log('=== FORMULAR DEBUG ===');
    console.log('Formular gültig:', this.setupForm.valid);
    console.log('Formular Status:', this.setupForm.status);
    console.log('catalogId Wert:', this.setupForm.get('catalogId')?.value);
    console.log('catalogId Fehler:', this.setupForm.get('catalogId')?.errors);
    console.log('questionCount Wert:', this.setupForm.get('questionCount')?.value);
    console.log('questionCount Fehler:', this.setupForm.get('questionCount')?.errors);
    console.log('Verfügbare Kataloge:', this.catalogs);
    console.log('Ausgewählter Katalog:', this.getSelectedCatalog());
    console.log('Alle Kataloge (inkl. leere):', this.allCatalogs);
    console.log('=====================');
  }
}
