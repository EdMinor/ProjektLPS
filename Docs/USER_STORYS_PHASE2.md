# User Stories - Phase 2: Simulation-Modus

## Übersicht
Dieses Dokument beschreibt alle User Stories für Phase 2 der LPIC Learning Platform - den Simulation-Modus.

## EPIC S - Simulation-Modus

### S1 – Simulation Setup
**Als Benutzer möchte ich eine Simulation konfigurieren können, um unter realistischen Bedingungen zu üben.**

**Akzeptanzkriterien:**
- [ ] Route `/simulate/setup` funktioniert
- [ ] Katalog-Auswahl aus verfügbaren Katalogen
- [ ] Anzahl der Fragen wählbar (Standard: 20, Max: verfügbare Fragen im Katalog)
- [ ] Zeitlimit optional wählbar (Standard: deaktiviert)
- [ ] "Simulation starten" Button
- [ ] Validierung der Eingaben
- [ ] Responsive Design

**Tasks:**
- [ ] Setup-Komponente implementieren
- [ ] Formular mit Reactive Forms
- [ ] Katalog-Auswahl laden
- [ ] Validierung implementieren
- [ ] Navigation zu Simulation starten

**Schwierigkeit:** 🟡 Mittel
**Geschätzte Zeit:** 2-3 Stunden

---

### S2 – Simulation Konfiguration
**Als Benutzer möchte ich erweiterte Einstellungen für die Simulation konfigurieren können.**

**Akzeptanzkriterien:**
- [ ] Fragen-Reihenfolge mischen (Standard: aktiviert)
- [ ] Schwierigkeitsgrad wählbar (falls verfügbar)
- [ ] Spezielle Fragetypen ausschließen (optional)
- [ ] Einstellungen in LocalStorage speichern
- [ ] Standard-Einstellungen zurücksetzen

**Tasks:**
- [ ] Erweiterte Konfigurationsoptionen
- [ ] LocalStorage Service implementieren
- [ ] Standard-Werte definieren
- [ ] Reset-Funktionalität

**Schwierigkeit:** 🟡 Mittel
**Geschätzte Zeit:** 1-2 Stunden

---

### S3 – Simulation Start
**Als Benutzer möchte ich die Simulation starten und die konfigurierten Fragen beantworten können.**

**Akzeptanzkriterien:**
- [ ] Route `/simulate/run` funktioniert
- [ ] Fragen werden gemischt angezeigt (falls aktiviert)
- [ ] Timer läuft (falls aktiviert)
- [ ] Keine Lösungen/Feedback während der Simulation
- [ ] Navigation zwischen Fragen
- [ ] Fortschrittsanzeige
- [ ] Simulation beenden können

**Tasks:**
- [ ] Run-Komponente implementieren
- [ ] Fragen mischen (Fisher-Yates Algorithmus)
- [ ] Timer implementieren
- [ ] Navigation ohne Feedback
- [ ] Beenden-Dialog

**Schwierigkeit:** 🟡 Mittel
**Geschätzte Zeit:** 3-4 Stunden

---

### S4 – Simulation Antworten
**Als Benutzer möchte ich Fragen in der Simulation beantworten können, ohne Feedback zu erhalten.**

**Akzeptanzkriterien:**
- [ ] Alle Fragetypen unterstützen (Single, Multi, Fill-in)
- [ ] Antworten werden gespeichert
- [ ] Keine Bewertung während der Simulation
- [ ] Validierung der Eingaben
- [ ] "Nächste Frage" Button
- [ ] "Simulation beenden" Button

**Tasks:**
- [ ] Antwort-Speicherung implementieren
- [ ] Validierung ohne Bewertung
- [ ] Navigation zwischen Fragen
- [ ] Beenden-Funktionalität

**Schwierigkeit:** 🟢 Einfach
**Geschätzte Zeit:** 2-3 Stunden

---

### S5 – Simulation Timer
**Als Benutzer möchte ich ein Zeitlimit für die Simulation setzen können, um realistische Bedingungen zu simulieren.**

**Akzeptanzkriterien:**
- [ ] Countdown-Timer anzeigen
- [ ] Warnung bei < 5 Minuten
- [ ] Warnung bei < 1 Minute
- [ ] Auto-Abschluss bei 0
- [ ] Timer pausieren können (optional)
- [ ] Verbleibende Zeit anzeigen

**Tasks:**
- [ ] Timer-Service implementieren
- [ ] Countdown-Logik
- [ ] Warnungen implementieren
- [ ] Auto-Abschluss
- [ ] Pause-Funktionalität

**Schwierigkeit:** 🟡 Mittel
**Geschätzte Zeit:** 2-3 Stunden

---

### S6 – Simulation Ergebnisse
**Als Benutzer möchte ich nach Abschluss der Simulation eine detaillierte Auswertung meiner Ergebnisse sehen.**

**Akzeptanzkriterien:**
- [ ] Route `/simulate/results` funktioniert
- [ ] Gesamtbewertung (Prozent, Anzahl richtig/falsch)
- [ ] Zeitverbrauch anzeigen (falls Timer aktiviert)
- [ ] Liste aller Fragen mit Antworten
- [ ] Falsche Antworten markieren
- [ ] Korrekte Lösungen anzeigen
- [ ] "Erneut simulieren" Button
- [ ] "Zur Katalogliste" Button

**Tasks:**
- [ ] Results-Komponente implementieren
- [ ] Ergebnisberechnung
- [ ] Detaillierte Auswertung
- [ ] Navigation zu Setup/Listen

**Schwierigkeit:** 🟡 Mittel
**Geschätzte Zeit:** 2-3 Stunden

---

### S7 – Simulation Statistiken
**Als Benutzer möchte ich detaillierte Statistiken zu meiner Simulation sehen.**

**Akzeptanzkriterien:**
- [ ] Richtig/Falsch pro Fragetyp
- [ ] Durchschnittliche Antwortzeit
- [ ] Schwierigkeitsverteilung
- [ ] Vergleich mit vorherigen Simulationen
- [ ] Grafische Darstellung (optional)

**Tasks:**
- [ ] Statistik-Service implementieren
- [ ] Datenanalyse
- [ ] Statistik-Komponente
- [ ] Grafische Darstellung

**Schwierigkeit:** 🔴 Schwer
**Geschätzte Zeit:** 3-4 Stunden

---

## EPIC T - Technische Verbesserungen

### T1 – Simulation Store
**Als Entwickler möchte ich einen zentralen Store für die Simulation, um den Zustand effizient zu verwalten.**

**Akzeptanzkriterien:**
- [ ] SimulationStore Service implementiert
- [ ] Konfiguration, Fragen, Antworten speichern
- [ ] Zustand zwischen Komponenten teilen
- [ ] LocalStorage Integration
- [ ] Reset-Funktionalität

**Tasks:**
- [ ] Store-Interface definieren
- [ ] Service implementieren
- [ ] LocalStorage Integration
- [ ] Reset-Methoden

**Schwierigkeit:** 🟡 Mittel
**Geschätzte Zeit:** 2-3 Stunden

---

### T2 – Fragen mischen
**Als Entwickler möchte ich einen Algorithmus zum Mischen der Fragen implementieren.**

**Akzeptanzkriterien:**
- [ ] Fisher-Yates Shuffle implementiert
- [ ] Seed-basierte Mischung (für Tests)
- [ ] Unit-Tests für Shuffle-Logik
- [ ] Performance optimiert

**Tasks:**
- [ ] Shuffle-Algorithmus implementieren
- [ ] Seed-Funktionalität
- [ ] Unit-Tests schreiben
- [ ] Performance testen

**Schwierigkeit:** 🟢 Einfach
**Geschätzte Zeit:** 1-2 Stunden

---

### T3 – Timer Service
**Als Entwickler möchte ich einen wiederverwendbaren Timer-Service implementieren.**

**Akzeptanzkriterien:**
- [ ] Timer starten, pausieren, stoppen
- [ ] Callback bei Timer-Ende
- [ ] Warnungen bei bestimmten Zeiten
- [ ] Pausierbar und fortsetzbar
- [ ] Unit-Tests

**Tasks:**
- [ ] Timer-Service implementieren
- [ ] Event-System
- [ ] Pause/Resume
- [ ] Unit-Tests

**Schwierigkeit:** 🟡 Mittel
**Geschätzte Zeit:** 2-3 Stunden

---

## Implementierungsreihenfolge

### **Woche 1: Grundlagen**
1. **S1 - Simulation Setup** (2-3h)
2. **T1 - Simulation Store** (2-3h)
3. **T2 - Fragen mischen** (1-2h)

### **Woche 2: Kernfunktionalität**
4. **S3 - Simulation Start** (3-4h)
5. **S4 - Simulation Antworten** (2-3h)
6. **T3 - Timer Service** (2-3h)

### **Woche 3: Erweiterungen**
7. **S2 - Simulation Konfiguration** (1-2h)
8. **S5 - Simulation Timer** (2-3h)
9. **S6 - Simulation Ergebnisse** (2-3h)

### **Woche 4: Optimierungen**
10. **S7 - Simulation Statistiken** (3-4h)
11. **Testing & Bugfixes** (2-3h)
12. **Dokumentation aktualisieren** (1-2h)

## Gesamtaufwand
- **Geschätzte Gesamtzeit:** 20-30 Stunden
- **Anzahl User Stories:** 10
- **Schwierigkeitsgrad:** 🟡 Mittel
- **Zeitrahmen:** 4 Wochen

## Definition of Done
- [ ] Akzeptanzkriterien erfüllt
- [ ] Unit-Tests geschrieben
- [ ] Responsive Design implementiert
- [ ] Error-Handling implementiert
- [ ] Dokumentation aktualisiert
- [ ] Code-Review abgeschlossen

## Nächste Schritte
1. **S1 - Simulation Setup** beginnen
2. **Grundstruktur** implementieren
3. **Schritt für Schritt** vorgehen
4. **Regelmäßig testen** und validieren

---

**Status:** 🚀 **Bereit für Implementation**
**Version:** 1.0
**Datum:** Heute
