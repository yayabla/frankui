#!/bin/bash

# Directories
FRAMEWORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

echo "=== Minification Done! ==="
