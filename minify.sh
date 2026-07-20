#!/bin/bash

# Directories
FRAMEWORK_DIR="/home/frank/Bureaublad/bscss/frankui/framework"

# Temporary bundle files
TEMP_JS="$FRAMEWORK_DIR/temp_bundle.js"
TEMP_CSS="$FRAMEWORK_DIR/temp_bundle.css"

# Clean up temp files on exit
cleanup() {
    rm -f "$TEMP_JS" "$TEMP_CSS"
}
trap cleanup EXIT

echo "=== Bundling FrankUI Javascript ==="
# Read all JS files, prioritizing all.js, then add other components
if [ -f "$FRAMEWORK_DIR/all.js" ]; then
    cat "$FRAMEWORK_DIR/all.js" > "$TEMP_JS"
    echo "" >> "$TEMP_JS"
else
    > "$TEMP_JS"
fi

for file in "$FRAMEWORK_DIR"/components/*.js; do
    if [ -f "$file" ]; then
        cat "$file" >> "$TEMP_JS"
        echo "" >> "$TEMP_JS"
    fi
done

# Try minifying Javascript
echo "=== Minifying FrankUI Javascript ==="
if command -v npx &> /dev/null && npx --yes esbuild --version &> /dev/null; then
    echo "⚡ Minifying Javascript using esbuild..."
    npx --yes esbuild "$TEMP_JS" --minify --outfile="$FRAMEWORK_DIR/frankui.bundle.min.js"
else
    echo "⚠️ npx/esbuild not found or failed, falling back to safe Perl minifier..."
    # Perform simple minification (strip comments and whitespace safely using lookbehinds)
    cat "$TEMP_JS" | \
        perl -0777 -pe 's/\/\*[\s\S]*?\*\///g' | \
        perl -pe 's/(?<!:)(?<!\x27)(?<!\x22)(?<!\x60)\/\/.*//g' | \
        tr -s '\n' ' ' | \
        tr -s ' ' ' ' > "$FRAMEWORK_DIR/frankui.bundle.min.js"
fi
echo "✔ Created Javascript bundle at: $FRAMEWORK_DIR/frankui.bundle.min.js"

echo "=== Bundling FrankUI CSS ==="
# Read all CSS files, prioritizing frank.css, then add other components
if [ -f "$FRAMEWORK_DIR/frank.css" ]; then
    grep -v '^@import.*components/' "$FRAMEWORK_DIR/frank.css" > "$TEMP_CSS"
    echo "" >> "$TEMP_CSS"
else
    > "$TEMP_CSS"
fi

for file in "$FRAMEWORK_DIR"/components/*.css; do
    if [ -f "$file" ]; then
        cat "$file" >> "$TEMP_CSS"
        echo "" >> "$TEMP_CSS"
    fi
done

# Try minifying CSS
echo "=== Minifying FrankUI CSS ==="
if command -v npx &> /dev/null && npx --yes esbuild --version &> /dev/null; then
    echo "⚡ Minifying CSS using esbuild..."
    npx --yes esbuild "$TEMP_CSS" --minify --outfile="$FRAMEWORK_DIR/frankui.bundle.min.css"
else
    echo "⚠️ npx/esbuild not found or failed, falling back to simple Perl minifier..."
    # Perform simple CSS minification
    cat "$TEMP_CSS" | \
        perl -0777 -pe 's/\/\*[\s\S]*?\*\///g' | \
        perl -pe 's/\s*([\{\}:;,])\s*/\1/g' | \
        tr -s '\n' ' ' | \
        tr -s ' ' ' ' > "$FRAMEWORK_DIR/frankui.bundle.min.css"
fi
echo "✔ Created CSS bundle at: $FRAMEWORK_DIR/frankui.bundle.min.css"

# Copy files to target directories
echo "=== Copying files to target directories ==="

# 1. npm/
NPM_DIR="/home/frank/Bureaublad/bscss/frankui/npm"
if [ -d "$NPM_DIR" ]; then
    cp "$FRAMEWORK_DIR/frankui.bundle.min.js" "$NPM_DIR/frankui.bundle.min.js"
    cp "$FRAMEWORK_DIR/frankui.bundle.min.css" "$NPM_DIR/frankui.bundle.min.css"
    # Copy README if it exists in git repo
    if [ -f "/home/frank/Bureaublad/bscss/frankui/production/git-repo/frankui/README.md" ]; then
        cp "/home/frank/Bureaublad/bscss/frankui/production/git-repo/frankui/README.md" "$NPM_DIR/README.md"
    fi
    # Copy LICENSE if it exists in git repo
    if [ -f "/home/frank/Bureaublad/bscss/frankui/production/git-repo/frankui/LICENSE" ]; then
        cp "/home/frank/Bureaublad/bscss/frankui/production/git-repo/frankui/LICENSE" "$NPM_DIR/LICENSE"
    fi
    echo "✔ Copied bundle files to: $NPM_DIR"
fi

# 2. production/www/
PROD_WWW_JS="/home/frank/Bureaublad/bscss/frankui/production/www/js"
PROD_WWW_CSS="/home/frank/Bureaublad/bscss/frankui/production/www/css"
if [ -d "$PROD_WWW_JS" ]; then
    cp "$FRAMEWORK_DIR/frankui.bundle.min.js" "$PROD_WWW_JS/frankui.bundle.min.js"
    echo "✔ Copied JS bundle to: $PROD_WWW_JS"
fi
if [ -d "$PROD_WWW_CSS" ]; then
    cp "$FRAMEWORK_DIR/frankui.bundle.min.css" "$PROD_WWW_CSS/frankui.bundle.min.css"
    echo "✔ Copied CSS bundle to: $PROD_WWW_CSS"
fi

# 3. production/plugins/framework/
PROD_PLUGINS_FW="/home/frank/Bureaublad/bscss/frankui/production/plugins/framework"
if [ -d "$PROD_PLUGINS_FW" ]; then
    cp "$FRAMEWORK_DIR/frankui.bundle.min.js" "$PROD_PLUGINS_FW/frankui.bundle.min.js"
    cp "$FRAMEWORK_DIR/frankui.bundle.min.css" "$PROD_PLUGINS_FW/frankui.bundle.min.css"
    echo "✔ Copied bundle files to: $PROD_PLUGINS_FW"
fi

# 4. production/git-repo/frankui/www/
GIT_REPO_WWW_JS="/home/frank/Bureaublad/bscss/frankui/production/git-repo/frankui/www/js"
GIT_REPO_WWW_CSS="/home/frank/Bureaublad/bscss/frankui/production/git-repo/frankui/www/css"
if [ -d "$GIT_REPO_WWW_JS" ]; then
    cp "$FRAMEWORK_DIR/frankui.bundle.min.js" "$GIT_REPO_WWW_JS/frankui.bundle.min.js"
    echo "✔ Copied JS bundle to: $GIT_REPO_WWW_JS"
fi
if [ -d "$GIT_REPO_WWW_CSS" ]; then
    cp "$FRAMEWORK_DIR/frankui.bundle.min.css" "$GIT_REPO_WWW_CSS/frankui.bundle.min.css"
    echo "✔ Copied CSS bundle to: $GIT_REPO_WWW_CSS"
fi

echo "=== Minification Done! ==="

