# Vercel Setup Guide

This guide will help you deploy the Project Philo chat platform to Vercel in about 5 minutes.

## Prerequisites
- Your OpenRouter API key (from your OpenRouter account)
- Your GitHub Personal Access Token (with repo permissions)

## Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with your GitHub account (recommended)

## Step 2: Install Vercel CLI (Optional but recommended)
```bash
npm install -g vercel
```

## Step 3: Deploy to Vercel

### Option A: Deploy via CLI (Recommended)
1. In the project directory, run:
```bash
vercel
```

2. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **project-philo-chat** (or press enter for default)
   - Directory? **./** (press enter)
   - Override settings? **No**

3. Add your environment variables:
```bash
vercel env add OPENROUTER_API_KEY
# Paste your OpenRouter API key when prompted

vercel env add GITHUB_TOKEN  
# Paste your GitHub token when prompted
```

4. Deploy to production:
```bash
vercel --prod
```

### Option B: Deploy via GitHub
1. Push this code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables in the UI:
   - `OPENROUTER_API_KEY`: Your OpenRouter key
   - `GITHUB_TOKEN`: Your GitHub token
5. Click Deploy

## Step 4: Update Your Frontend

Once deployed, Vercel will give you a URL like `https://project-philo-chat.vercel.app`

1. Edit `app.js`
2. Update the `apiBaseUrl` in CONFIG to your Vercel URL:
```javascript
apiBaseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : 'https://YOUR-PROJECT.vercel.app/api'  // <- Update this
```

3. Commit and push the change
4. Redeploy your GitHub Pages site

## That's it! 🎉

Your team can now access the chat at your GitHub Pages URL with just the password "ProjectPhilo".
No API keys needed on their devices!

## Troubleshooting

### "Invalid password" error
- Make sure you're entering exactly: `ProjectPhilo`

### Chat not working
- Check Vercel dashboard for function logs
- Verify environment variables are set correctly
- Make sure the apiBaseUrl is updated in app.js

### CORS errors
- The allowed origins are already configured
- If you're using a custom domain, add it to the `allowedOrigins` array in both API functions