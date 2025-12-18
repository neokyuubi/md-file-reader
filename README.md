# MD File Reader

A modern markdown file reader with **10 eye-friendly color themes** and a beautiful split-view interface. Because let's be honest, most markdown readers out there don't have dark themes or good reading options, and reading docs at 2am with a bright white screen is not fun.

## 🌐 Live Demo

**[Try it now →](https://neokyuubi.github.io/md-file-reader/)**

## Why I Built This

I got tired of reading markdown files online without proper dark themes and eye-friendly color options. So I made this. It's pretty straightforward - paste markdown directly or load from GitHub, get it rendered with syntax highlighting, and choose from multiple scientifically-backed color themes.

## Features

- **10 Eye-Friendly Themes**: Dark, Light, Gray, Dark Gray, Sepia, Solarized Light/Dark, Warm, Midnight, and High Contrast
- **Split View**: Editor on the left, preview on the right with a draggable splitter to adjust panel sizes
- **Multiple Input Methods**: Paste markdown directly or load from GitHub public repos
- **View Options**: Switch between Split, Editor-only, or Preview-only modes
- **Syntax Highlighting**: Code blocks with proper syntax highlighting that adapts to each theme
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Auto-Save Preferences**: Your theme and layout choices are saved automatically

## How to Use

### Loading from GitHub

1. Select "GitHub" from the Source dropdown
2. Enter a GitHub URL or repo path:
   - Full URL: `https://github.com/owner/repo/blob/main/README.md`
   - Or just: `owner/repo/path/to/file.md`
3. Click "Load"

### Pasting Markdown

1. Select "Paste" from the Source dropdown
2. Paste your markdown in the editor
3. Click "Render" or press `Ctrl+Enter`

### Customizing Your View

- **Layout**: Choose Split, Editor-only, or Preview-only from the View dropdown
- **Theme**: Pick from 10 different color themes optimized for reading
- **Splitter**: In split view, drag the divider between panels to adjust their widths

## Available Themes

1. **Dark** - Classic dark mode, reduces eye strain in low light
2. **Light** - High contrast, classic reading mode
3. **Gray** - Neutral gray tones, balanced and modern
4. **Dark Gray** - Darker neutral gray, easier on eyes
5. **Sepia** - Warm sepia tones, reduces blue light
6. **Solarized Light** - Scientifically designed light theme
7. **Solarized Dark** - Scientifically designed dark theme
8. **Warm** - Soft warm tones, reduces blue light exposure
9. **Midnight** - Deep blue-black, easy on the eyes
10. **High Contrast** - Black on yellow, maximum readability

All themes are based on research about eye-friendly colors and reading comfort.

## Setup

If you want to host this yourself:

1. Clone the repo
2. Push to GitHub
3. Go to Settings → Pages in your repo
4. Select `main` branch and `/ (root)` folder
5. Save

That's it. Your site will be live at `https://YOUR_USERNAME.github.io/md-file-reader/`

**Live example:** [https://neokyuubi.github.io/md-file-reader/](https://neokyuubi.github.io/md-file-reader/)

## Tech Stack

Nothing fancy - just vanilla HTML, CSS, and JavaScript. Uses:
- **Marked.js** for markdown parsing
- **Highlight.js** for code syntax highlighting
- No build step, no frameworks, just works

## License

Do whatever you want with it. It's open source.

---

If you find this useful, feel free to star the repo or open an issue if something breaks.
