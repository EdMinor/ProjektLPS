export default function handler(req, res) {
  // CORS-Header für Cross-Origin Requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS Request für CORS Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { catalogId } = req.query;

    // Beispieldaten für verschiedene Kataloge
    const fragen = {
      "98": [ // SCHNELL TEST - 5 FRAGEN
        {
          "id": 1,
          "catalogId": 98,
          "type": "single",
          "question": "Was ist der Befehl, um den aktuellen Benutzer anzuzeigen?",
          "options": ["whoami", "who", "user", "id"],
          "correctAnswer": 0,
          "explanation": "Der Befehl 'whoami' zeigt den aktuell angemeldeten Benutzer an."
        },
        {
          "id": 2,
          "catalogId": 98,
          "type": "multiple",
          "question": "Welche Befehle zeigen Verzeichnisinhalte an?",
          "options": ["ls", "dir", "cat", "pwd"],
          "correctAnswer": [0, 1],
          "explanation": "Sowohl 'ls' als auch 'dir' zeigen Verzeichnisinhalte an."
        },
        {
          "id": 3,
          "catalogId": 98,
          "type": "fill",
          "question": "Der Befehl zum Wechseln des Verzeichnisses ist _____.",
          "correctAnswer": "cd",
          "explanation": "Der Befehl 'cd' (change directory) wird zum Wechseln von Verzeichnissen verwendet."
        },
        {
          "id": 4,
          "catalogId": 98,
          "type": "single",
          "question": "Welcher Befehl zeigt den aktuellen Pfad an?",
          "options": ["pwd", "path", "current", "where"],
          "correctAnswer": 0,
          "explanation": "Der Befehl 'pwd' (print working directory) zeigt den aktuellen Pfad an."
        },
        {
          "id": 5,
          "catalogId": 98,
          "type": "single",
          "question": "Was bedeutet 'ls -la'?",
          "options": ["Alle Dateien anzeigen", "Versteckte Dateien anzeigen", "Lange Liste mit versteckten Dateien", "Nur Verzeichnisse anzeigen"],
          "correctAnswer": 2,
          "explanation": "'ls -la' zeigt eine lange Liste aller Dateien inklusive versteckter Dateien an."
        }
      ],
      "99": [], // Leerer Katalog für Fehlerbehandlung
      "100": [ // LPIC-101 - Block A (Beispiel)
        {
          "id": 1,
          "catalogId": 100,
          "type": "single",
          "question": "Welche Architektur verwendet der x86_64 Prozessor?",
          "options": ["32-bit", "64-bit", "128-bit", "16-bit"],
          "correctAnswer": 1,
          "explanation": "x86_64 ist eine 64-bit Architektur."
        }
        // Hier würden weitere 84 Fragen folgen...
      ]
    };

    if (catalogId && fragen[catalogId]) {
      res.status(200).json(fragen[catalogId]);
    } else {
      res.status(404).json({ message: 'Katalog nicht gefunden' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
