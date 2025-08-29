# Vercel Deployment Guide - LPIC Lern- und Prüfungssimulator

## Übersicht
Diese Anleitung erklärt, wie du die Angular-App mit den neuen Vercel Serverless Functions deployst.

## Was wurde geändert

### 1. Neue API-Struktur
- **`src/api/kataloge.js`** - Endpunkt für Katalog-Daten
- **`src/api/themen.js`** - Endpunkt für Themen-Daten  
- **`src/api/fragen.js`** - Endpunkt für Fragen-Daten (mit Filterung)

### 2. API-Service angepasst
- Base-URL von `localhost:3000` auf `/api` geändert
- Endpunkte an neue Vercel-Funktionen angepasst

### 3. Vercel-Konfiguration
- **`vercel.json`** für Routing und Build-Konfiguration
- API-Routen werden korrekt zu Serverless Functions weitergeleitet

## Deployment-Schritte

### Schritt 1: Code committen
```bash
git add .
git commit -m "Add Vercel API functions and configuration"
git push origin main
```

### Schritt 2: Vercel verbinden
1. Gehe zu [vercel.com](https://vercel.com)
2. Melde dich an oder erstelle ein Konto
3. Klicke auf "New Project"
4. Importiere dein GitHub-Repository

### Schritt 3: Build-Einstellungen
Vercel erkennt automatisch, dass es sich um ein Angular-Projekt handelt:
- **Framework Preset:** Angular
- **Build Command:** `ng build`
- **Output Directory:** `dist/projekt-lps`
- **Install Command:** `npm install`

### Schritt 4: Deploy
- Klicke auf "Deploy"
- Warte bis der Build abgeschlossen ist
- Deine App ist live!

## API-Endpunkte

Nach dem Deployment sind folgende Endpunkte verfügbar:

- **`/api/kataloge`** - Alle verfügbaren Kataloge
- **`/api/themen`** - Alle verfügbaren Themen
- **`/api/fragen?catalogId=X`** - Fragen für einen spezifischen Katalog

## Wichtige Hinweise

### 1. CORS
Alle API-Endpunkte haben CORS-Header für Cross-Origin Requests.

### 2. Datenstruktur
Die API-Funktionen enthalten Beispieldaten. Für Produktionsnutzung solltest du:
- Alle Fragen aus deiner ursprünglichen `db.json` einbetten
- Datenbank-Integration für größere Datenmengen erwägen

### 3. Kosten
- **Hobby-Plan:** Kostenlos (100GB Bandwidth/Monat)
- **Pro-Plan:** $20/Monat für mehr Bandwidth und Funktionen

## Troubleshooting

### Build-Fehler
```bash
# Lokal testen
ng build

# API-Funktionen testen
curl https://your-app.vercel.app/api/kataloge
```

### API-Fehler
- Überprüfe die Vercel-Logs im Dashboard
- Stelle sicher, dass alle API-Dateien im `src/api/` Ordner sind
- Überprüfe die `vercel.json` Konfiguration

## Nächste Schritte

1. **Vollständige Daten einbetten:** Alle Fragen aus der ursprünglichen `db.json` in die API-Funktionen kopieren
2. **Datenbank-Integration:** Für größere Datenmengen eine echte Datenbank einbinden
3. **Caching:** Vercel Edge Caching für bessere Performance
4. **Monitoring:** Vercel Analytics für Performance-Überwachung

## Support

Bei Problemen:
1. Überprüfe die Vercel-Logs
2. Teste die API-Endpunkte lokal
3. Überprüfe die Build-Logs
4. Konsultiere die [Vercel-Dokumentation](https://vercel.com/docs)
