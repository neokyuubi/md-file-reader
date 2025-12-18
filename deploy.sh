#!/bin/bash

# MD File Reader - Deployment Script
echo "🚀 MD File Reader Deployment Helper"
echo ""

# Check if remote exists
if git remote | grep -q origin; then
    echo "✅ Remote 'origin' already exists"
    git remote -v
else
    echo "📝 No remote configured yet."
    echo ""
    echo "To add your GitHub repository, run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    read -p "Enter your GitHub repository URL (or press Enter to skip): " repo_url
    
    if [ ! -z "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✅ Remote added: $repo_url"
    fi
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to your repository on GitHub"
    echo "2. Navigate to Settings → Pages"
    echo "3. Select branch: main"
    echo "4. Select folder: / (root)"
    echo "5. Click Save"
    echo ""
    echo "Your app will be live at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "  - You have a GitHub repository created"
    echo "  - The remote URL is correct"
    echo "  - You have push permissions"
fi

