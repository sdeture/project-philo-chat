// Vercel serverless function to proxy OpenRouter API calls
// This keeps your API key secure on the server side

export default async function handler(req, res) {
  // Enable CORS for your GitHub Pages site
  const allowedOrigins = [
    'https://sdeture.github.io',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Password');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check password
  const password = req.headers['x-password'];
  if (password !== 'ProjectPhilo') {
    return res.status(401).json({ error: 'Invalid password' });
  }

  try {
    // Forward the request to OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sdeture.github.io/project-philo-chat',
        'X-Title': 'Project Philo Interview Platform'
      },
      body: JSON.stringify(req.body)
    });

    if (!openRouterResponse.ok) {
      const error = await openRouterResponse.json();
      return res.status(openRouterResponse.status).json(error);
    }

    const data = await openRouterResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}