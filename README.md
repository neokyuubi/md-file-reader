# 📖 MD File Reader

A beautiful, modern markdown file reader with **dark theme support** that can load and display markdown files from public GitHub repositories.

## ✨ Features

- 🌙 **Dark Theme** - Beautiful dark mode that's easy on the eyes
- ☀️ **Light Theme** - Classic light mode option
- 🔄 **Theme Toggle** - Switch between themes with one click
- 🌐 **GitHub Integration** - Load markdown files directly from public GitHub repositories
- 💻 **Syntax Highlighting** - Code blocks with syntax highlighting
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, beautiful interface

## 🚀 How to Use

1. **Enter a GitHub URL or path:**
   - Full URL: `https://github.com/owner/repo/blob/main/README.md`
   - Repo path: `owner/repo/path/to/file.md`

2. **Click "Load"** to fetch and display the markdown file

3. **Toggle themes** using the moon/sun icon in the header

## 📦 Deploy to GitHub Pages

### Quick Deploy Steps:

1. **Create a new repository on GitHub** (if you haven't already)
   - Go to https://github.com/new
   - Name it (e.g., `md-file-reader`)
   - Make it public
   - Don't initialize with README (we already have one)

2. **Add remote and push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select:
     - Branch: `main`
     - Folder: `/ (root)`
   - Click **Save**

4. **Your app will be live at:**
   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Alternative: Use the deployment script
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🛠️ Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with CSS variables for theming
- **Vanilla JavaScript** - No frameworks needed!
- **Marked.js** - Markdown parsing
- **Highlight.js** - Code syntax highlighting

## 📝 License

This project is open source and available for everyone to use and modify.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

---

Made with ❤️ for better markdown reading experience

