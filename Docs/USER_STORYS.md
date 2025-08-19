# User Storys – Lern- und Prüf-Simulator (MVP)

## Leitplanken

**Zielgruppen:** Lernende (primär), Dozierende (sekundär)

**Scope MVP:** Lernmodus, einfache Simulation, keine Authentifizierung, keine Persistenz

**Definition of Done (DoD):** Akzeptanzkriterien erfüllt, keine Konsolenfehler, responsive Basis, A11y-Grundlagen (Fokus, Kontrast), Unit-Test für Bewertungslogik

---

## EPIC A – Kataloge & Navigation

### A1 – Startseite

**Als Lernender möchte ich zwischen Lernmodus und Simulation wählen, um direkt zum passenden Einstieg zu gelangen.**

#### Akzeptanzkriterien
- `/` zeigt zwei primäre Aktionen: „Lernen" und „Simulation"
- Links führen zu `/learn/catalogs` bzw. `/simulate/setup`
- Responsive Darstellung ab 360 px Breite

#### Tasks
- Route `/`
- Minimaler Header/Footer
- CTA-Buttons

**Status:** ✅ **Implementiert** - Moderne Startseite mit Gradient-Design und Call-to-Action Buttons

---

### A2 – Themenauswahl (Lernmodus)

**Als Lernender möchte ich zwischen LPIC-101, LPIC-102 oder allen Themen wählen, um mich auf spezifische Bereiche zu konzentrieren.**

#### Akzeptanzkriterien
- Nach Klick auf "Lernen" öffnet sich Modal zur Themenauswahl
- Drei Optionen: LPIC-101 (4 Blöcke), LPIC-102 (7 Blöcke), Alle Themen (11 Blöcke)
- Jede Option zeigt Anzahl der Lernblöcke und kurze Beschreibung
- Auswahl führt zu gefilterter Katalogliste

#### Tasks
- Topic-Selection-Modal mit drei Kategorien
- Beschreibungen für LPIC-101 und LPIC-102
- Navigation mit Query-Parameter für Filterung

**Status:** ✅ **Implementiert** - Schönes Modal mit Themenauswahl und Beschreibungen

---

### A3 – Katalogliste (Lernen)

**Als Lernender möchte ich eine gefilterte Liste der Kataloge sehen, um einen passenden Katalog auszuwählen.**

#### Akzeptanzkriterien
- `/learn/catalogs` lädt `GET /api/kataloge` und `GET /api/topics`
- Kataloge werden nach gewähltem Thema gefiltert (LPIC-101, LPIC-102 oder alle)
- Jeder Eintrag zeigt Titel, Code, Anzahl Fragen und Thema
- Filter-Anzeige mit Anzahl verfügbarer Kataloge
- Klick führt zu `/learn/catalogs/:catalogId`

#### Tasks
- ApiClient: `getCatalogs()`, `getTopics()`
- Komponente `CatalogListComponent` mit Filterung
- Lade-/Fehlerzustände und Empty States
- Responsive Grid-Layout

**Status:** ✅ **Implementiert** - Gefilterte Katalogliste mit schönem Card-Design und Filter-Anzeige

---

### A4 – Katalog-Detail

**Als Lernender möchte ich Details zu einem Katalog sehen, um zu verstehen, was ich lernen werde.**

#### Akzeptanzkriterien
- `/learn/catalogs/:id` zeigt Katalog-Informationen
- Anzeige: Titel, Code, Fragenanzahl, Thema
- Beschreibung des Lerninhalts
- "Mit dem Lernen beginnen" Button

#### Tasks
- Komponente `CatalogDetailComponent`
- API-Integration für Katalog-Details
- Start-Button für Lernmodus

**Status:** ✅ **Implementiert** - Detaillierte Katalog-Ansicht mit Start-Button

---

### A5 – Fragenliste (optional einfach)

**Als Lernender möchte ich vorab die Anzahl und kurze Infos sehen, um mit einem Klick zu starten.**

#### Akzeptanzkriterien
- `/learn/catalogs/:catalogId` zeigt „Fragen bearbeiten"-Schaltfläche
- Start führt zur ersten Frage `/learn/questions/0?catalogId=:id`

#### Tasks
- ApiClient: `getQuestionsByCatalog(catalogId)`
- Komponente `QuestionListPage` (minimal)
- „Start"-Button

**Status:** 🔄 **In Entwicklung** - Grundstruktur vorhanden, Fragenladung noch zu implementieren

---

## EPIC B – Lernmodus

### B1 – Frage anzeigen

**Als Lernender möchte ich eine Frage im Detail sehen, um sie zu beantworten.**

#### Akzeptanzkriterien
- Route: `/learn/questions/:index?catalogId=:id`
- Frage zeigt: Text, Typ, Antwortoptionen (single/multi) oder Eingabefeld (fill)
- Navigation: „Zurück", „Nächste", „Zur Liste"

#### Tasks
- Komponente `QuestionDetailPage`
- Typ-spezifische Darstellung (Radio/Checkbox/Textfeld)
- Keyboard-Fokus bei Seitenwechsel

**Status:** 🔄 **In Entwicklung** - Grundstruktur vorhanden, echte Fragenladung noch zu implementieren

---

### B2 – Antwort prüfen & Lösung anzeigen

**Als Lernender möchte ich Feedback und die Lösung sehen, um zu verstehen, ob ich richtig lag.**

#### Akzeptanzkriterien
- Button „Antwort prüfen": bewertet Eingaben
- Button „Lösung anzeigen": zeigt korrekte Antwort(en) + solution (falls vorhanden)
- fill: Eingabe wird normalisiert (Trim, Lowercase); mehrere korrekte Varianten werden akzeptiert

#### Tasks
- Bewertungs-Helper pro Fragetyp
- State: `givenAnswers`, `isCorrect`, `showSolution`
- Unit-Tests für Bewertungslogik (single/multi/fill)

**Status:** ❌ **Nicht implementiert** - Nächste Phase

---

### B3 – Reihenfolge & Fortschritt

**Als Lernender möchte ich meinen Fortschritt sehen, um motiviert zu bleiben.**

#### Akzeptanzkriterien
- Fortschrittsanzeige „Frage X/Y"
- „Nächste" ist deaktiviert, wenn keine Eingabe bei single/multi erfolgte (MVP-Entscheidung)
- Optional: „Zufällige Reihenfolge" als Toggle (Frontend)

#### Tasks
- Progress-Komponente
- Optional: Shuffle-Funktion mit Seed
- Signals/Service für aktuellen Index

**Status:** ❌ **Nicht implementiert** - Nächste Phase

---

## EPIC C – Simulation

### C1 – Setup

**Als Lernender möchte ich die Simulation konfigurieren, um unter realistischen Bedingungen zu üben.**

#### Akzeptanzkriterien
- Route `/simulate/setup`
- Eingaben: Katalog, Anzahl Fragen (z. B. 20), Zeitlimit (optional im MVP: ohne Timer)
- Start führt zu `/simulate/run`

#### Tasks
- Formular (Reactive Forms)
- ApiClient: Kataloge laden
- Validierung (Anzahl ≤ verfügbare Fragen)

**Status:** 🔄 **Grundstruktur vorhanden** - Placeholder-Komponenten erstellt

---

### C2 – Durchlauf ohne Feedback

**Als Lernender möchte ich Fragen ohne Zwischenfeedback beantworten, um die Prüfungssituation zu simulieren.**

#### Akzeptanzkriterien
- Route `/simulate/run`
- Reihenfolge gemischt
- Keine Lösung/Feedback währenddessen
- Abschluss-Button „Auswertung" aktiviert, wenn alle Fragen beantwortet sind oder explizit beendet

#### Tasks
- SimulationStore (Konfiguration, Fragen, Antworten)
- UI ähnlich Lernmodus, aber ohne „Lösung anzeigen"
- Abbruch/Beenden mit Bestätigung

**Status:** 🔄 **Grundstruktur vorhanden** - Placeholder-Komponenten erstellt

---

### C3 – Ergebnisübersicht

**Als Lernender möchte ich am Ende eine Übersicht, um meinen Score zu sehen und aus Fehlern zu lernen.**

#### Akzeptanzkriterien
- Route `/simulate/results`
- Anzeige: Anzahl richtig/falsch, Prozent
- Liste falscher Fragen mit korrekter Lösung

#### Tasks
- Auswertungsfunktion
- Results-Komponente
- Link „Erneut simulieren" bzw. „Zur Katalogliste"

**Status:** 🔄 **Grundstruktur vorhanden** - Placeholder-Komponenten erstellt

---

## EPIC D – Technik & Querschnitt

### D1 – API-Anbindung

**Als Entwickler möchte ich einen gekapselten ApiClient, um die Datenzugriffe zentral zu halten.**

#### Akzeptanzkriterien
- ApiClient nutzt `environment.apiBaseUrl`
- Methoden: `getCatalogs()`, `getQuestionsByCatalog(catalogId)`, optional `getQuestion(id)`

#### Tasks
- Service + Interfaces (Catalog, Question, Option)
- Fehler-/Ladezustände in Aufrufern

**Status:** ✅ **Implementiert** - Vollständiger API-Service mit Error-Handling

---

### D2 – Routing & Shell

**Als Entwickler möchte ich ein klares Routing und eine App-Shell, um die App skalierbar zu halten.**

#### Akzeptanzkriterien
- Standalone Components, Lazy Routes
- Grundlayout mit Header/Footer, Container

#### Tasks
- Router-Konfiguration
- Basislayout + globale Styles

**Status:** ✅ **Implementiert** - Vollständiges Routing-System mit Lazy Loading

---

### D3 – A11y & Fehlerfälle

**Als Lernender möchte ich klare Fehlermeldungen und bedienbare UI, um frustfrei zu lernen.**

#### Akzeptanzkriterien
- Tastaturbedienung möglich (Fokusindikatoren)
- Fehlerbanner bei API-Fehlern mit „Erneut laden"
- Leersituationen sprechen Klartext

#### Tasks
- ErrorBanner-, LoadingSpinner-Komponenten
- Fokus-Management beim Fragenseitenwechsel

**Status:** ✅ **Implementiert** - Loading-States, Error-Handling und Empty States

---

## Backlog (nach MVP)

### E1 – Timer in Simulation
- Countdown, Warnung bei < 1 Minute
- Auto-Abschluss bei 0

### E2 – Themen-/Tag-Filter in Katalog
- Filtern nach Tags, Schwierigkeitsgrad

**Status:** ✅ **Teilweise implementiert** - Grundlegende Themenfilterung bereits vorhanden

### E3 – Einstellungen merken (LocalStorage)
- Letzter Katalog, Anzahl Fragen

### E4 – Barrierefreiheit erweitert
- Screenreader-Labels, ARIA-Live für Statusmeldungen

### E5 – i18n
- Struktur für Übersetzungen vorbereiten

---

## Technische Stories (Detail)

### T1 – Bewertungslogik

#### Akzeptanzkriterien
- **single:** genau eine korrekte Option gewählt
- **multi:** gewählt == Menge korrekter Optionen
- **fill:** Eingabe normalisiert und enttrimmte Gleichheit mit einer korrekten Variante
- Unit-Tests für alle drei Typen mit mindestens je 3 Fällen

**Status:** ❌ **Nicht implementiert** - Nächste Phase

### T2 – Shuffle-Helper

#### Akzeptanzkriterien
- Fisher–Yates Shuffle implementiert
- Optional Seed für deterministische Tests
- Unit-Test: Länge unverändert, Multiset unverändert

**Status:** ❌ **Nicht implementiert** - Nächste Phase

### T3 – State mit Signals

#### Akzeptanzkriterien
- **LearningStore:** questions, index, answers, result
- **SimulationStore:** config, shuffled, answers, score
- Keine globalen Variablen; Stores sind Injectable Services

**Status:** ❌ **Nicht implementiert** - Nächste Phase

---

## Roadmap (empfohlen)

1. **EPIC D2/D1:** Shell + ApiClient + Routing ✅ **ABGESCHLOSSEN**
2. **EPIC A2/A3:** Katalogliste → Fragen laden → Start ✅ **ABGESCHLOSSEN** (mit Verbesserungen)
3. **EPIC B1/B2:** Frage-Detail + Bewertung + Lösung 🔄 **AKTUELL**
4. **EPIC C1/C2/C3:** Simulation Setup → Run → Results 🔄 **GRUNDSTRUKTUR VORHANDEN**
5. **EPIC D3:** Fehlerfälle, A11y-Basis ✅ **ABGESCHLOSSEN**
6. **Tests (T1/T2),** Feinschliff, Review gegen DoD ❌ **NOCH ZU IMPLEMENTIEREN**

---

## Nichtziele im MVP

- ❌ Authentifizierung, Benutzerkonten
- ❌ Persistente Speicherung von Ergebnissen
- ❌ Statistiken/Leaderboard
- ❌ LMS-/Fremdsystem-Integrationen
- ❌ Offline-Funktion

---

## Implementierte Verbesserungen (über MVP hinaus)

### ✅ **Themenbasierte Navigation**
- **LPIC-101** (4 Lernblöcke): Systemarchitektur, Linux-Installation, Paketverwaltung
- **LPIC-102** (7 Lernblöcke): Shells, Scripting, Datenverwaltung
- **Alle Themen** (11 Lernblöcke): Kompletter LPIC-1 Stoff

### ✅ **Verbesserte Benutzerführung**
- Topic-Selection-Modal mit Beschreibungen
- Gefilterte Kataloglisten je nach gewähltem Thema
- Filter-Anzeige mit Anzahl verfügbarer Kataloge
- Empty States für bessere UX

### ✅ **Moderne UI/UX**
- Responsive Design mit CSS Grid
- Hover-Effekte und Animationen
- Konsistente Farbpalette und Typografie
- Loading-States und Error-Handling

### ✅ **Skalierbare Architektur**
- Standalone Components (Angular 19)
- Lazy Loading für Features
- Zentrale API-Services
- TypeScript-Interfaces für alle Datenmodelle