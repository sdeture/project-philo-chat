# Project Philo - AI Interview Chat Platform

A simple, secure chat interface for conducting AI model interviews with automatic conversation logging to GitHub.

## Features

- 🔐 Password-protected access (shared team password)
- 💬 Clean chat interface for AI interviews
- 🤖 Powered by OpenRouter API (using qwen/qwen3-coder model via Fireworks)
- 📝 Automatic conversation saving to GitHub
- 💾 Auto-save every 5 minutes + on session end
- 🔄 Local backup if GitHub save fails

## Setup Instructions

### 1. Create GitHub Repository for Conversations

The repository for storing conversations has already been created at:
`https://github.com/sdeture/project-philo-conversations`

### 2. Deploy to GitHub Pages

1. Push this code to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click Save

Your site will be available at: `https://[your-username].github.io/[repo-name]/`

### 3. Deploy Backend to Vercel (One-time setup)

To keep your API keys secure and allow team access without sharing keys:

1. See `VERCEL_SETUP.md` for detailed instructions
2. This takes about 5 minutes and is free
3. Your team only needs the password, not API keys!

### 4. Update Frontend Configuration

After Vercel deployment, update `app.js` with your Vercel URL:
```javascript
apiBaseUrl: 'https://YOUR-PROJECT.vercel.app/api'
```

### 5. Access the Platform

1. Navigate to your GitHub Pages URL (main index.html, not setup.html)
2. Enter password: `ProjectPhilo`
3. Start interviewing!

## Usage

### For Researchers

1. Go to the deployed site
2. Enter the shared password: `ProjectPhilo`
3. You'll see the chat interface with the AI model
4. Type your questions and press Enter to send
5. Conversations are automatically saved to GitHub

### Features

- **New Session**: Start a fresh conversation (saves current one)
- **Logout**: Return to password screen
- **Auto-save**: Conversations save every 5 minutes and when you leave
- **Shift+Enter**: Add new line without sending

## File Structure

```
project-philo-chat/
├── index.html          # Main HTML structure
├── styles.css          # Styling
├── app.js             # Application logic
└── README.md          # This file
```

## Conversation Storage

Conversations are saved to the GitHub repository with this structure:

```
conversations/
└── 2025-09-03/
    ├── session_1234567890.json
    └── session_1234567891.json
```

Each conversation includes:
- Session metadata (ID, start time, model used)
- Full message history with timestamps
- End time

## Security Notes

- The password is hardcoded as `ProjectPhilo` for simplicity
- API keys are embedded in the client-side code (acceptable for short-term research)
- Budget controls should be set on your OpenRouter account
- Consider making the conversations repo private if needed

## Troubleshooting

### "Failed to save to GitHub"
- Check that the repository exists
- Verify the GitHub token hasn't expired
- Conversations are backed up to browser localStorage as fallback

### Chat not working
- Check browser console for errors
- Verify OpenRouter API key is valid
- Ensure you have credits on OpenRouter

## Quick Local Test

To test locally before deploying:

```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

## Model Information

Currently configured to use:
- Model: `qwen/qwen3-coder`
- Provider: `fireworks`
- No system prompt (blank)