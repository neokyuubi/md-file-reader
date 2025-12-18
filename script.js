// Global variables
let markdownContent;
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

    // GitHub API integration
    const loadBtn = document.getElementById('loadBtn');
    githubUrlInput = document.getElementById('githubUrl');
    markdownContent = document.getElementById('markdown-content');

    loadBtn.addEventListener('click', loadMarkdown);
    githubUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadMarkdown();
        }
    });
});

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
        // Try main branch first, then master
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
