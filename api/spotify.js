export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  try {
    const { action, query, market, ids } = req.query;
    const creds = Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + creds, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    if (!token) return res.status(401).json({ error: 'Token alinamadi' });
    if (action === 'search') {
      const r = await fetch('https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track&limit=50&market=' + (market||'TR'), { headers: { 'Authorization': 'Bearer ' + token } });
      return res.status(200).json(await r.json());
    }
    if (action === 'features') {
      const r = await fetch('https://api.spotify.com/v1/audio-features?ids=' + ids, { headers: { 'Authorization': 'Bearer ' + token } });
      return res.status(200).json(await r.json());
    }
    return res.status(400).json({ error: 'Gecersiz action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
