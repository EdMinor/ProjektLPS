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
    const themen = [
      {
        "id": 1,
        "name": "LPIC-101",
        "description": "System Architecture, Linux Installation and Package Management"
      },
      {
        "id": 2,
        "name": "LPIC-102",
        "description": "Linux Shells and Scripting, User Interfaces and Desktops"
      }
    ];

    res.status(200).json(themen);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
