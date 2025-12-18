// Global variables
let markdownContent;
let pasteArea;
let githubUrlInput;

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
        const highlightThemes = {
            'light': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css',
            'dark': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
            'gray': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css',
            'sepia': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css',
            'green': 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
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
    const renderBtn = document.getElementById('renderBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loadBtn = document.getElementById('loadBtn');

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

    // Paste markdown
    pasteArea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            renderPastedMarkdown();
        }
    });
});

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

    markdownContent.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const fileUrl = parseGitHubUrl(input);
        const response = await fetch(fileUrl);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('File not found. Make sure the repository is public and the path is correct.');
            } else if (response.status === 403) {
                throw new Error('Access denied. The repository might be private or rate limited.');
            }
            throw new Error(`Failed to load file: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.content) {
            throw new Error('No content found in the file');
        }

        // Decode base64 content
        const markdownText = atob(data.content.replace(/\s/g, ''));
        
        // Also update paste area if in paste mode
        if (document.getElementById('sourceSelect').value === 'paste') {
            pasteArea.value = markdownText;
        }
        
        // Render markdown
        renderMarkdown(markdownText);
    } catch (error) {
        showError(error.message);
    }
}

function parseGitHubUrl(input) {
    // Handle full GitHub URLs
    let match = input.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
    if (match) {
        const [, owner, repo, branch, path] = match;
        return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    }

    // Handle raw GitHub URLs
    match = input.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/);
    if (match) {
        const [, owner, repo, branch, path] = match;
        return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    }

    // Handle repo path format: owner/repo/path/to/file.md
    match = input.match(/^([^\/]+)\/([^\/]+)\/(.+)$/);
    if (match) {
        const [, owner, repo, path] = match;
        return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    }

    throw new Error('Invalid GitHub URL format. Use: github.com/owner/repo/blob/branch/file.md or owner/repo/path/to/file.md');
}

function renderMarkdown(text) {
    // Configure marked options
    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight: function(code, lang) {
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
    markdownContent.innerHTML = html;

    // Highlight code blocks
    markdownContent.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

function showError(message) {
    markdownContent.innerHTML = `<div class="error">Error: ${message}</div>`;
}
