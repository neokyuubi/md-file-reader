// Global variables
let markdownContent;
let pasteArea;
let githubUrlInput;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Theme management
    const themeBtn = document.getElementById('themeBtn');
    const themeIcon = themeBtn.querySelector('.theme-icon');
    const body = document.body;
    const highlightTheme = document.getElementById('highlight-theme');

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updateHighlightTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        updateHighlightTheme(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }

    function updateHighlightTheme(theme) {
        if (theme === 'dark') {
            highlightTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
        } else {
            highlightTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css';
        }
    }

    // Display options
    const layoutSelect = document.getElementById('layoutSelect');
    const sourceSelect = document.getElementById('sourceSelect');
    const splitContainer = document.querySelector('.split-container');
    const inputPanel = document.getElementById('inputPanel');
    const outputPanel = document.getElementById('outputPanel');
    const githubInput = document.getElementById('githubInput');
    const pasteInput = document.getElementById('pasteInput');

    // Load saved layout preference
    const savedLayout = localStorage.getItem('layout') || 'split';
    layoutSelect.value = savedLayout;
    updateLayout(savedLayout);

    layoutSelect.addEventListener('change', (e) => {
        const layout = e.target.value;
        localStorage.setItem('layout', layout);
        updateLayout(layout);
    });

    function updateLayout(layout) {
        splitContainer.className = `split-container layout-${layout}`;
    }

    // Source switching
    sourceSelect.addEventListener('change', (e) => {
        const source = e.target.value;
        if (source === 'github') {
            githubInput.style.display = 'flex';
            pasteInput.style.display = 'none';
        } else {
            githubInput.style.display = 'none';
            pasteInput.style.display = 'flex';
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
        markdownContent.innerHTML = '<div class="welcome-message"><h2>Welcome to MD File Reader!</h2><p>Paste your markdown on the left or load from GitHub to see it rendered here.</p></div>';
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

    // Auto-render on paste (optional - can be removed if too aggressive)
    let pasteTimeout;
    pasteArea.addEventListener('input', () => {
        clearTimeout(pasteTimeout);
        // Auto-render after 1 second of no typing (debounced)
        // pasteTimeout = setTimeout(() => {
        //     if (pasteArea.value.trim()) {
        //         renderPastedMarkdown();
        //     }
        // }, 1000);
    });
});

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
