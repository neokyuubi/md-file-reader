// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChy-6Hq36YfWGHlTWnqKkmbLOB9uUTm-k",
    authDomain: "md-file-reader-auth.firebaseapp.com",
    projectId: "md-file-reader-auth",
    storageBucket: "md-file-reader-auth.firebasestorage.app",
    messagingSenderId: "925673728288",
    appId: "1:925673728288:web:307c896a5305c1cb378f45",
    measurementId: "G-XV9RDXZ0M3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GithubAuthProvider();
// Request repo scope (needed for private repos)
provider.addScope('repo');

// Global variables
let markdownContent;
let pasteArea;
let githubUrlInput;
let fileSelect;
let fileSelectContainer;
let currentRepoInfo = null;
let githubAccessToken = null;

// Auth UI Elements
let loginBtn;
let userProfile;
let userAvatar;
let userName;
let logoutBtn;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Theme management
    const themeSelect = document.getElementById('themeSelect');
    const body = document.body;
    const highlightTheme = document.getElementById('highlight-theme');

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;
    updateHighlightTheme(savedTheme);

    themeSelect.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateHighlightTheme(newTheme);
    });

    function updateHighlightTheme(theme) {
        const baseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/';
        const highlightThemes = {
            'light': baseUrl + 'github.min.css',
            'dark': baseUrl + 'github-dark.min.css',
            'gray': baseUrl + 'vs.min.css',
            'darkgray': baseUrl + 'vs.min.css',
            'sepia': baseUrl + 'vs.min.css',
            'solarizedlight': baseUrl + 'github.min.css',
            'solarizeddark': baseUrl + 'github-dark.min.css',
            'warm': baseUrl + 'github.min.css',
            'midnight': baseUrl + 'github-dark.min.css',
            'highcontrast': baseUrl + 'vs2015.min.css'
        };
        highlightTheme.href = highlightThemes[theme] || highlightThemes['dark'];
    }

    // Display options
    const layoutSelect = document.getElementById('layoutSelect');
    const sourceSelect = document.getElementById('sourceSelect');
    const mainContainer = document.getElementById('mainContainer');
    const githubInput = document.getElementById('githubInput');
    const pasteInput = document.getElementById('pasteInput');

    // Load saved preferences
    const savedLayout = localStorage.getItem('layout') || 'split';
    layoutSelect.value = savedLayout;
    updateLayout(savedLayout);

    layoutSelect.addEventListener('change', (e) => {
        const layout = e.target.value;
        localStorage.setItem('layout', layout);
        updateLayout(layout);
    });

    function updateLayout(layout) {
        mainContainer.className = `main-container layout-${layout}`;
    }

    // Source switching
    sourceSelect.addEventListener('change', (e) => {
        const source = e.target.value;
        if (source === 'github') {
            githubInput.style.display = 'block';
            pasteInput.style.display = 'none';
        } else {
            githubInput.style.display = 'none';
            pasteInput.style.display = 'block';
        }
    });

    // Get elements
    markdownContent = document.getElementById('markdown-content');
    pasteArea = document.getElementById('pasteArea');
    githubUrlInput = document.getElementById('githubUrl');
    fileSelect = document.getElementById('fileSelect');
    fileSelectContainer = document.getElementById('fileSelectContainer');
    const renderBtn = document.getElementById('renderBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loadBtn = document.getElementById('loadBtn');

    // Auth Elements
    loginBtn = document.getElementById('loginBtn');
    userProfile = document.getElementById('userProfile');
    userAvatar = document.getElementById('userAvatar');
    userName = document.getElementById('userName');
    logoutBtn = document.getElementById('logoutBtn');

    // Auth Listeners
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // Auth State Observer
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            loginBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            const displayName = user.displayName || user.email || 'User';
            userName.textContent = displayName;

            if (user.photoURL) {
                userAvatar.src = user.photoURL;
                userAvatar.style.display = 'block';
            } else {
                userAvatar.style.display = 'none';
            }
        } else {
            // User is signed out
            loginBtn.style.display = 'flex';
            userProfile.style.display = 'none';
            githubAccessToken = null; // Clear token
        }
    });

    // Render button
    renderBtn.addEventListener('click', () => {
        if (sourceSelect.value === 'github') {
            loadMarkdown();
        } else {
            renderPastedMarkdown();
        }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        if (sourceSelect.value === 'github') {
            githubUrlInput.value = '';
            fileSelect.innerHTML = '';
            fileSelectContainer.style.display = 'none';
            currentRepoInfo = null;
        } else {
            pasteArea.value = '';
        }
        showEmptyState();
    });

    // Load from GitHub
    loadBtn.addEventListener('click', loadMarkdown);
    githubUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadMarkdown();
        }
    });

    // File select listener
    fileSelect.addEventListener('change', (e) => {
        if (currentRepoInfo && e.target.value) {
            loadFile(currentRepoInfo.owner, currentRepoInfo.repo, currentRepoInfo.branch, e.target.value);
        }
    });

    // Paste markdown
    pasteArea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            renderPastedMarkdown();
        }
    });

    // Resizable splitter
    const splitter = document.getElementById('splitter');
    const editorPanel = document.getElementById('editorPanel');
    const previewPanel = document.getElementById('previewPanel');

    let isResizing = false;
    let startX = 0;
    let startEditorWidth = 0;

    splitter.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startEditorWidth = editorPanel.offsetWidth;
        splitter.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerWidth = mainContainer.offsetWidth;
        const deltaX = e.clientX - startX;
        const newEditorWidth = startEditorWidth + deltaX;
        const minWidth = 200;
        const maxWidth = containerWidth - minWidth - 4; // 4px for splitter

        if (newEditorWidth >= minWidth && newEditorWidth <= maxWidth) {
            const editorPercent = (newEditorWidth / containerWidth) * 100;
            editorPanel.style.flex = `0 0 ${editorPercent}%`;
            previewPanel.style.flex = `0 0 ${100 - editorPercent}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            splitter.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
});

async function handleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const credential = GithubAuthProvider.credentialFromResult(result);
        githubAccessToken = credential.accessToken;

        // Note: githubAccessToken is stored in memory. 
        // If the user refreshes, they might need to sign in again to get a new fresh Access Token 
        // because Firebase Auth persistence caches the *User* session but not always the *Provider* Access Token.
        // However, standard silent re-authentication flows often handle this, or we can prompt login if token is missing.

        showError("Logged in successfully!"); // Using error display for success message temporarily
        setTimeout(showEmptyState, 2000);
    } catch (error) {
        showError(`Login failed: ${error.message}`);
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        githubAccessToken = null;
        fileSelectContainer.style.display = 'none';
        fileSelect.innerHTML = '';
        showEmptyState();
    } catch (error) {
        showError(`Logout failed: ${error.message}`);
    }
}

function getGitHubHeaders() {
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (githubAccessToken) {
        headers['Authorization'] = `token ${githubAccessToken}`;
    }
    return headers;
}

function showEmptyState() {
    markdownContent.innerHTML = `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <h3>Ready to render</h3>
            <p>Paste your markdown in the editor or load from GitHub to see the preview here.</p>
        </div>
    `;
}

function renderPastedMarkdown() {
    const text = pasteArea.value.trim();
    if (!text) {
        showError('Please paste some markdown content');
        return;
    }
    renderMarkdown(text);
}

async function loadMarkdown() {
    const input = githubUrlInput.value.trim();
    if (!input) {
        showError('Please enter a GitHub URL or repo path');
        return;
    }

    markdownContent.innerHTML = '<div class="loading">Loading repository info...</div>';
    fileSelectContainer.style.display = 'none';
    fileSelect.innerHTML = '';
    currentRepoInfo = null;

    try {
        const info = parseGitHubUrl(input);

        // 1. Resolve branch if necessary
        let branch = info.branch;
        if (!branch) {
            const repoResponse = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}`, {
                headers: getGitHubHeaders()
            });
            if (!repoResponse.ok) {
                if (repoResponse.status === 404) throw new Error('Repository not found. If private, please sign in.');
                if (repoResponse.status === 401 || repoResponse.status === 403) throw new Error('Access denied. If private, please sign in.');
                throw new Error(`Failed to fetch repository details: ${repoResponse.statusText}`);
            }
            const repoData = await repoResponse.json();
            branch = repoData.default_branch;
        }

        currentRepoInfo = { owner: info.owner, repo: info.repo, branch };

        // 2. Fetch file tree
        const treeUrl = `https://api.github.com/repos/${info.owner}/${info.repo}/git/trees/${branch}?recursive=1`;
        const treeResponse = await fetch(treeUrl, {
            headers: getGitHubHeaders()
        });

        if (!treeResponse.ok) {
            if (treeResponse.status === 404) throw new Error('Tree not found. If private, please sign in.');
            if (treeResponse.status === 401 || treeResponse.status === 403) throw new Error('Access denied. If private, please sign in.');
            throw new Error('Failed to fetch file tree');
        }

        const treeData = await treeResponse.json();

        // 3. Filter for Markdown files
        if (treeData.truncated) {
            console.warn('Tree truncated, some files might be missing');
        }

        const mdFiles = treeData.tree.filter(item => item.path.endsWith('.md') && item.type === 'blob');

        if (mdFiles.length === 0) {
            throw new Error('No markdown files found in this repository');
        }

        // 4. Populate dropdown
        // Sort files: README first, then alphabetical
        mdFiles.sort((a, b) => {
            const aLower = a.path.toLowerCase();
            const bLower = b.path.toLowerCase();
            if (aLower === 'readme.md') return -1;
            if (bLower === 'readme.md') return 1;
            return aLower.localeCompare(bLower);
        });

        fileSelect.innerHTML = mdFiles.map(file =>
            `<option value="${file.path}">${file.path}</option>`
        ).join('');

        fileSelectContainer.style.display = 'flex';

        // 5. Determine initial file
        // If the user specified a path, try to use it. verify it exists in the list (or case insensitive match)
        let targetPath = null;
        if (info.path) {
            const exactMatch = mdFiles.find(f => f.path === info.path);
            if (exactMatch) targetPath = exactMatch.path;
            else {
                // Try loose match
                const looseMatch = mdFiles.find(f => f.path.toLowerCase() === info.path.toLowerCase());
                if (looseMatch) targetPath = looseMatch.path;
            }
        }

        if (!targetPath) {
            // Default to first file (which is README due to sort)
            targetPath = mdFiles[0].path;
        }

        fileSelect.value = targetPath;

        // 6. Load content
        await loadFile(info.owner, info.repo, branch, targetPath);

    } catch (error) {
        showError(error.message);
    }
}

async function loadFile(owner, repo, branch, path) {
    markdownContent.innerHTML = '<div class="loading">Loading content...</div>';

    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        const response = await fetch(url, {
            headers: getGitHubHeaders()
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error('File not found');
            if (response.status === 403 || response.status === 401) throw new Error('Access denied (rate limit or check login)');
            throw new Error(`Failed to load file: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.content) throw new Error('No content found');

        const markdownText = atob(data.content.replace(/\s/g, ''));

        // Also update paste area if in paste mode
        if (document.getElementById('sourceSelect').value === 'paste') {
            pasteArea.value = markdownText;
        }

        renderMarkdown(markdownText);
    } catch (error) {
        showError(error.message);
    }
}

function parseGitHubUrl(input) {
    // Returns { owner, repo, branch, path }
    // branch and path can be null/undefined

    // 1. Full Blob URL
    // github.com/owner/repo/blob/branch/path
    let match = input.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
    if (match) {
        return { owner: match[1], repo: match[2], branch: match[3], path: match[4] };
    }

    // 2. Raw URL
    // raw.githubusercontent.com/owner/repo/branch/path
    match = input.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/);
    if (match) {
        return { owner: match[1], repo: match[2], branch: match[3], path: match[4] };
    }

    // 3. Repo Root 
    // github.com/owner/repo
    match = input.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/);
    if (match) {
        return { owner: match[1], repo: match[2], branch: null, path: null };
    }

    // 4. Path format (owner/repo/path or owner/repo)
    // matches owner/repo followed by optional /path
    // This allows for 'owner/repo/some/path'
    // But be careful not to match just any random string as a repo if it's not a github URL.
    // However, the tool is for reading MD from github, so assuming owner/repo format is safe contextually.

    // We already handle full URLs. 
    // If it DOESN'T start with http or github.com, assume owner/repo

    // Simplest regex for owner/repo with optional path parts
    match = input.match(/^([^\/]+)\/([^\/]+)(?:\/(.*))?$/);

    // We need to validatate that it's not a URL
    if (match && !input.includes('://')) {
        return { owner: match[1], repo: match[2], branch: null, path: match[3] || null };
    }

    throw new Error('Invalid GitHub URL format. Supports: github.com/owner/repo, owner/repo, or full file path.');
}

function renderMarkdown(text) {
    // Configure marked options
    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {
                    console.error('Highlight error:', err);
                }
            }
            return hljs.highlightAuto(code).value;
        }
    });

    // Convert markdown to HTML
    const html = marked.parse(text);
    // Sanitize HTML to prevent XSS
    const cleanHtml = DOMPurify.sanitize(html);
    markdownContent.innerHTML = cleanHtml;

    // Highlight code blocks
    markdownContent.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

function showError(message) {
    markdownContent.innerHTML = `<div class="error">Error: ${message}</div>`;
}
