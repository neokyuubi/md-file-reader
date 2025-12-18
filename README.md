# MD File Reader

Simple markdown file reader that actually has a dark theme. Because let's be honest, most markdown readers out there don't, and reading docs at 2am with a bright white screen is not fun.

## Why I Built This

I got tired of reading markdown files online without dark mode. So I made this. It's pretty straightforward - paste a GitHub URL, get your markdown rendered with syntax highlighting, and switch between light/dark themes whenever you want.

## Features

- Dark theme (default, because why not)
- Light theme if you're into that
- Load markdown files from any public GitHub repo
- Syntax highlighting for code blocks
- Works on mobile too
- Theme preference saves automatically

## How to Use

Just paste a GitHub URL or repo path in the input field:

- Full URL: `https://github.com/owner/repo/blob/main/README.md`
- Or just: `owner/repo/path/to/file.md`

Hit Load and you're good to go. Click the moon/sun icon to switch themes.

## Setup

If you want to host this yourself:

1. Clone the repo
2. Push to GitHub (it's already set up)
3. Go to Settings → Pages in your repo
4. Select `main` branch and `/ (root)` folder
5. Save

That's it. Your site will be live at `https://yourusername.github.io/md-file-reader/`

## Tech Stack

Nothing fancy - just vanilla HTML, CSS, and JavaScript. Uses Marked.js for parsing and Highlight.js for code highlighting. No build step, no frameworks, just works.

## License

Do whatever you want with it. It's open source.

---

If you find this useful, feel free to star the repo or open an issue if something breaks.
