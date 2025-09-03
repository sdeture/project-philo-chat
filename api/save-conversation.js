// Vercel serverless function to save conversations to GitHub
// This keeps your GitHub token secure on the server side

export default async function handler(req, res) {
  // Enable CORS
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
    const { filename, content } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ error: 'Missing filename or content' });
    }

    // Check if file exists to get SHA
    let sha = null;
    try {
      const checkResponse = await fetch(
        `https://api.github.com/repos/sdeture/project-philo-conversations/contents/${filename}`,
        {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
      }
    } catch (e) {
      // File doesn't exist, which is fine
    }

    // Save to GitHub
    const githubResponse = await fetch(
      `https://api.github.com/repos/sdeture/project-philo-conversations/contents/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Save conversation: ${filename}`,
          content: Buffer.from(content).toString('base64'),
          sha: sha
        })
      }
    );

    if (!githubResponse.ok) {
      const error = await githubResponse.json();
      return res.status(githubResponse.status).json(error);
    }

    const result = await githubResponse.json();
    return res.status(200).json({ success: true, path: result.content.path });

  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ 
      error: 'Failed to save conversation', 
      message: error.message 
    });
  }
}