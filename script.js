// Global variables
let markdownContent;
let pasteArea;
let githubUrlInput;
let fileSelect;
let fileSelectContainer;
let currentRepoInfo = null;

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
            const repoResponse = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}`);
            if (!repoResponse.ok) {
                if (repoResponse.status === 404) throw new Error('Repository not found');
                throw new Error('Failed to fetch repository details');
            }
            const repoData = await repoResponse.json();
            branch = repoData.default_branch;
        }

        currentRepoInfo = { owner: info.owner, repo: info.repo, branch };

        // 2. Fetch file tree
        const treeUrl = `https://api.github.com/repos/${info.owner}/${info.repo}/git/trees/${branch}?recursive=1`;
        const treeResponse = await fetch(treeUrl);
        if (!treeResponse.ok) throw new Error('Failed to fetch file tree');

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
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) throw new Error('File not found');
            if (response.status === 403) throw new Error('Access denied (rate limit or private repo)');
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
    match = input.match(/^([^\/]+)\/([^\/]+)(?:\/(.*))?$/);
    if (match) {
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
    markdownContent.innerHTML = html;

    // Highlight code blocks
    markdownContent.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

function showError(message) {
    markdownContent.innerHTML = `<div class="error">Error: ${message}</div>`;
}
