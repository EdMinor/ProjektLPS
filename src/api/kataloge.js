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
    const kataloge = [
      {
        "id": 98,
        "topicId": 1,
        "code": "FUNKTIONEN SCHNELL TEST",
        "title": "SCHNELL TEST - 5 FRAGEN",
        "questionCount": 5
      },
      {
        "id": 99,
        "topicId": 1,
        "code": "Fehler behandlung TEST",
        "title": "Leeres Katalog - TEST",
        "questionCount": 0
      },
      {
        "id": 100,
        "topicId": 1,
        "code": "lpic101a",
        "title": "LPIC-101 - Block A",
        "questionCount": 85
      },
      {
        "id": 101,
        "topicId": 1,
        "code": "lpic101b",
        "title": "LPIC-101 - Block B",
        "questionCount": 95
      },
      {
        "id": 102,
        "topicId": 1,
        "code": "lpic101c",
        "title": "LPIC-101 - Block C",
        "questionCount": 120
      },
      {
        "id": 103,
        "topicId": 2,
        "code": "lpic102a",
        "title": "LPIC-102 - Block A",
        "questionCount": 90
      },
      {
        "id": 104,
        "topicId": 2,
        "code": "lpic102b",
        "title": "LPIC-102 - Block B",
        "questionCount": 85
      },
      {
        "id": 105,
        "topicId": 2,
        "code": "lpic102c",
        "title": "LPIC-102 - Block C",
        "questionCount": 110
      }
    ];

    res.status(200).json(kataloge);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
