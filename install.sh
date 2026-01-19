#!/bin/bash

echo "🛸 Installing Orbital Mission Control..."
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Found Node.js $NODE_VERSION"
echo ""

# Install root dependencies
echo "📦 Installing extension dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install extension dependencies"
    exit 1
fi
echo "✅ Extension dependencies installed"
echo ""

# Install webview dependencies
echo "📦 Installing webview dependencies..."
cd webview
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install webview dependencies"
    exit 1
fi
cd ..
echo "✅ Webview dependencies installed"
echo ""

# Build everything
echo "🔨 Building extension..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Press F5 in VSCode to launch the extension"
echo "  2. Or run 'npm run watch' and 'npm run watch:webview' for development"
echo ""
echo "Happy coding! 🚀"
