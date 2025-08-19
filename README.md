
# Lern- und Prüf-Simulator

## Projektbeschreibung
Der Lern- und Prüf-Simulator ist eine webbasierte Anwendung zur Vorbereitung auf Zertifizierungsprüfungen (z. B. LPIC-1).  
Die App bietet zwei zentrale Modi:  
- **Lernmodus**: Fragen können ohne Zeitlimit bearbeitet werden, mit optionaler Lösung und Erklärung.  
- **Prüfungssimulation**: Durchführung einer Prüfung unter realistischen Bedingungen mit Zeitvorgabe und Ergebnisübersicht.  

Ziel ist es, Lernenden eine flexible, intuitive und plattformunabhängige Möglichkeit zur Prüfungsvorbereitung bereitzustellen.

## Funktionen
- Unterstützung der Fragetypen: Single-Choice, Multiple-Choice, Fill-in  
- Sofortiges Feedback und Erklärungen im Lernmodus  
- Zeitgesteuerte Simulation mit abschließender Ergebnisübersicht  
- Fragen und Kataloge werden über eine externe Web-API bereitgestellt  
- Responsive Design für Desktop, Tablet und Smartphone  

## Technische Anforderungen
- **Frontend**: Angular (Version 17 oder höher), TypeScript  
- **Backend**: REST-API, bereitgestellt über JSON-Dateien oder vergleichbare Lösung  
- **Browser**: Aktuelle Versionen von Chrome, Firefox, Edge, Safari  
- **Internetverbindung**: Ab 3G, empfohlen ≥ 10 Mbit/s  

## Datenmodell
Fragen werden in einheitlichem JSON-Format bereitgestellt:  
- Eindeutige ID  
- Fragetext  
- Antwortoptionen mit Markierung der korrekten Lösung  
- Optional: Erklärung, Themenzuordnung, Schwierigkeitsgrad  

## API-Endpunkte
- `GET /api/kataloge` – Liste aller Kataloge  
- `GET /api/kataloge/{id}` – Alle Fragen eines Katalogs  
- `GET /api/fragen/{id}` – Detailinformationen zu einer einzelnen Frage  
- Optionale Parameter: `?shuffle=true`, `?limit=10`  

## Qualitätsziele
- Intuitive Bedienung und klare Trennung von Lern- und Prüfungsmodus  
- Hohe Performance (Laden eines Katalogs < 5 Sekunden)  
- Plattform- und geräteunabhängig nutzbar  
- Barrierearme Nutzung (Kontraste, Tastaturbedienung, Fokus-Indikatoren)  

## Lieferumfang
- Angular-Projekt (kompiliert, lauffähig im Browser)  
- REST-API mit Fragenkatalogen  
- Systemdokumentation, Benutzerhandbuch, API-Spezifikation  

## Entwickler-Setup
### Voraussetzungen
- Node.js (Version 20 oder höher)  
- Angular CLI (Version 17 oder höher)  
- npm oder yarn  

### Installation
```bash
git clone <repository-url>
cd lern-pruef-simulator
npm install
```

### Entwicklung starten
1. **API starten (JSON-Server)**  
   ```bash
   npx json-server --watch db.json --routes routes.json --port 3000
   ```
   API ist dann erreichbar unter: `http://localhost:3000/api`

2. **Angular-Entwicklung starten**  
   ```bash
   ng serve
   ```
   Anwendung ist erreichbar unter: `http://localhost:4200`

### Produktion
Für den Produktionsbetrieb wird das Angular-Projekt mit  
```bash
ng build --configuration production
```  
gebaut und auf einem Webserver bereitgestellt. Die API wird separat gehostet.
