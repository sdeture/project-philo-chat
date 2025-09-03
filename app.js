// Configuration
const CONFIG = {
    password: 'ProjectPhilo',
    githubRepo: 'sdeture/project-philo-conversations',
    modelId: 'qwen/qwen3-coder',
    provider: 'fireworks',
};

// Get API keys from localStorage or prompt for them
function getApiKeys() {
    let keys = {
        openRouterApiKey: localStorage.getItem('openRouterApiKey'),
        githubToken: localStorage.getItem('githubToken')
    };
    
    if (!keys.openRouterApiKey || !keys.githubToken) {
        // For initial setup, you can manually set these in the browser console:
        // localStorage.setItem('openRouterApiKey', 'your-openrouter-key');
        // localStorage.setItem('githubToken', 'your-github-token');
        
        alert('API keys not configured. Please contact the administrator for setup instructions.');
        return null;
    }
    
    return keys;
}

// State
let isAuthenticated = false;
let currentSession = null;
let messages = [];

// DOM Elements
const authScreen = document.getElementById('authScreen');
const chatScreen = document.getElementById('chatScreen');
const authForm = document.getElementById('authForm');
const authError = document.getElementById('authError');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const modelName = document.getElementById('modelName');
const newSessionBtn = document.getElementById('newSession');
const logoutBtn = document.getElementById('logout');

// Authentication
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === CONFIG.password) {
        isAuthenticated = true;
        authScreen.classList.remove('active');
        chatScreen.classList.add('active');
        initializeSession();
        authError.textContent = '';
    } else {
        authError.textContent = 'Invalid password. Please try again.';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    isAuthenticated = false;
    chatScreen.classList.remove('active');
    authScreen.classList.add('active');
    document.getElementById('password').value = '';
});

// Initialize new session
function initializeSession() {
    currentSession = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        model: CONFIG.modelId,
    };
    messages = [];
    chatMessages.innerHTML = '';
    modelName.textContent = `Model: ${CONFIG.modelId || 'Not configured'}`;
}

// New session
newSessionBtn.addEventListener('click', () => {
    if (messages.length > 0) {
        saveConversation();
    }
    initializeSession();
});

// Chat functionality
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    messageInput.value = '';
    
    // Disable input while processing
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    try {
        // Add loading indicator
        const loadingId = addMessage('assistant', '<div class="loading"></div>', true);
        
        // Call OpenRouter API
        const response = await callOpenRouter(message);
        
        // Remove loading and add actual response
        removeMessage(loadingId);
        addMessage('assistant', response);
        
    } catch (error) {
        removeMessage(loadingId);
        addMessage('assistant', `Error: ${error.message}`);
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
});

// Add message to chat
function addMessage(role, content, isTemp = false) {
    const messageId = Date.now().toString();
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.id = `msg-${messageId}`;
    
    messageDiv.innerHTML = `
        <div class="message-role">${role === 'user' ? 'Human' : 'AI'}:</div>
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (!isTemp) {
        messages.push({
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        });
    }
    
    return messageId;
}

// Remove message
function removeMessage(messageId) {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
        element.remove();
    }
}

// Call OpenRouter API
async function callOpenRouter(userMessage) {
    const keys = getApiKeys();
    if (!keys) {
        throw new Error('API keys not configured');
    }
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${keys.openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Project Philo Interview Platform'
            },
            body: JSON.stringify({
                model: CONFIG.modelId,
                provider: {
                    order: [CONFIG.provider]
                },
                messages: [
                    ...messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    {
                        role: 'user',
                        content: userMessage
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        throw error;
    }
}

// Save conversation to GitHub
async function saveConversation() {
    if (messages.length === 0) return;
    
    const conversation = {
        session: currentSession,
        messages: messages,
        endTime: new Date().toISOString(),
    };
    
    const date = new Date();
    const dateFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const filename = `conversations/${dateFolder}/session_${currentSession.id}.json`;
    const content = JSON.stringify(conversation, null, 2);
    
    try {
        // Get the SHA of the file if it exists (for updates)
        let sha = null;
        const keys = getApiKeys();
        if (!keys) {
            throw new Error('API keys not configured');
        }
        
        try {
            const existingFile = await fetch(`https://api.github.com/repos/${CONFIG.githubRepo}/contents/${filename}`, {
                headers: {
                    'Authorization': `token ${keys.githubToken}`,
                }
            });
            if (existingFile.ok) {
                const data = await existingFile.json();
                sha = data.sha;
            }
        } catch (e) {
            // File doesn't exist, which is fine
        }
        
        // Create or update the file
        const response = await fetch(`https://api.github.com/repos/${CONFIG.githubRepo}/contents/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${keys.githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Save conversation from session ${currentSession.id}`,
                content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
                sha: sha // Include SHA if updating
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to save: ${response.status}`);
        }
        
        console.log(`Conversation saved to GitHub: ${filename}`);
        
    } catch (error) {
        console.error('Failed to save conversation:', error);
        // Store locally as backup
        localStorage.setItem(`backup_${currentSession.id}`, content);
        alert('Failed to save to GitHub. Conversation backed up locally.');
    }
}

// Auto-save on window unload
window.addEventListener('beforeunload', () => {
    if (isAuthenticated && messages.length > 0) {
        saveConversation();
    }
});

// Enable Enter to send (Shift+Enter for new line)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// Auto-save every 5 minutes
setInterval(() => {
    if (isAuthenticated && messages.length > 0) {
        saveConversation();
    }
}, 5 * 60 * 1000);