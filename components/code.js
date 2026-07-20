// FrankUI Lightweight Code Syntax Highlighter Module
const CodeHighlighter = {
    init: function() {
        document.querySelectorAll('pre.code').forEach(pre => {
            if (pre.dataset.initialized) return;
            pre.dataset.initialized = 'true';
            CodeHighlighter.highlightElement(pre);
        });
    },

    highlightElement: function(pre) {
        const code = pre.textContent;
        let highlighted = code;

        if (pre.classList.contains('html')) {
            highlighted = CodeHighlighter.highlightHTML(code);
        } else if (pre.classList.contains('css')) {
            highlighted = CodeHighlighter.highlightCSS(code);
        } else if (pre.classList.contains('js') || pre.classList.contains('javascript')) {
            highlighted = CodeHighlighter.highlightJS(code);
        } else if (pre.classList.contains('php')) {
            highlighted = CodeHighlighter.highlightPHP(code);
        } else {
            // General highlight fallback
            highlighted = CodeHighlighter.escapeHtml(code);
        }

        pre.innerHTML = highlighted;
    },

    escapeHtml: function(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    highlightHTML: function(code) {
        let escaped = this.escapeHtml(code);
        const tokens = [];
        let placeholderCount = 0;

        // 1. Extract Comments: <!-- ... -->
        escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (match) => {
            const tokenIndex = placeholderCount++;
            tokens.push(`<span class="token comment">${match}</span>`);
            return `___TOKEN_${tokenIndex}___`;
        });

        // 2. Extract Attributes: name="value" or name='value'
        escaped = escaped.replace(/(\s[a-zA-Z0-9:-]+)(=)(["'])(.*?)\3/g, (match, attrName, eq, quote, attrValue) => {
            const tokenIndex = placeholderCount++;
            tokens.push(` <span class="token attr-name">${attrName.trim()}</span>${eq}<span class="token attr-value">${quote}${attrValue}${quote}</span>`);
            return `___TOKEN_${tokenIndex}___`;
        });

        // 3. Highlight Tag names: </?tagname and closing tags &gt;
        escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="token tag">$1</span>');
        escaped = escaped.replace(/(\/?&gt;)/g, '<span class="token tag">$1</span>');

        // 4. Restore tokens
        for (let i = 0; i < tokens.length; i++) {
            escaped = escaped.replace(`___TOKEN_${i}___`, tokens[i]);
        }

        return escaped;
    },

    highlightCSS: function(code) {
        let escaped = this.escapeHtml(code);
        const tokens = [];
        let placeholderCount = 0;

        // 1. Extract Comments: /* ... */
        escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
            const tokenIndex = placeholderCount++;
            tokens.push(`<span class="token comment">${match}</span>`);
            return `___TOKEN_${tokenIndex}___`;
        });

        // 2. Rules: property: value;
        escaped = escaped.replace(/([a-zA-Z-]+)\s*:\s*([^;]+)\s*;/g, '<span class="token property">$1</span>: <span class="token value">$2</span>;');

        // 3. Selectors: before {
        escaped = escaped.replace(/([a-zA-Z0-9\s\.\#\:\,\-\[\]\=\'\"]+)\s*\{/g, '<span class="token selector">$1</span> {');

        // 4. Restore comments
        for (let i = 0; i < tokens.length; i++) {
            escaped = escaped.replace(`___TOKEN_${i}___`, tokens[i]);
        }

        return escaped;
    },

    highlightJS: function(code) {
        let escaped = this.escapeHtml(code);
        const tokens = [];
        let placeholderCount = 0;

        // Regex for JS comments and strings matched concurrently
        const matchRegex = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(`[\s\S]*?`)/g;

        // Replace strings and comments with placeholders
        escaped = escaped.replace(matchRegex, (match, m1, m2, m3, m4, m5) => {
            const tokenIndex = placeholderCount++;
            let tokenHtml = '';
            if (m1 || m2) {
                tokenHtml = `<span class="token comment">${match}</span>`;
            } else {
                tokenHtml = `<span class="token string">${match}</span>`;
            }
            tokens.push(tokenHtml);
            return `___TOKEN_${tokenIndex}___`;
        });

        // Highlight Keywords
        const keywords = /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|let|static)\b/g;
        escaped = escaped.replace(keywords, '<span class="token keyword">$1</span>');

        // Highlight Function calls: name()
        escaped = escaped.replace(/\b([a-zA-Z0-9_]+)(?=\s*\()/g, '<span class="token function">$1</span>');

        // Highlight Numbers
        escaped = escaped.replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');

        // Restore strings and comments
        for (let i = 0; i < tokens.length; i++) {
            escaped = escaped.replace(`___TOKEN_${i}___`, tokens[i]);
        }

        return escaped;
    },

    highlightPHP: function(code) {
        let escaped = this.escapeHtml(code);
        const tokens = [];
        let placeholderCount = 0;

        // Regex for PHP comments and strings matched concurrently
        const matchRegex = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|(#[^\n]*)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')/g;

        // Replace comments and strings with placeholders
        escaped = escaped.replace(matchRegex, (match, m1, m2, m3, m4, m5) => {
            const tokenIndex = placeholderCount++;
            let tokenHtml = '';
            if (m1 || m2 || m3) {
                tokenHtml = `<span class="token comment">${match}</span>`;
            } else {
                tokenHtml = `<span class="token string">${match}</span>`;
            }
            tokens.push(tokenHtml);
            return `___TOKEN_${tokenIndex}___`;
        });

        // Highlight Variables: $name
        escaped = escaped.replace(/(\$[a-zA-Z0-9_]+)/g, '<span class="token variable">$1</span>');

        // Highlight Keywords
        const keywords = /\b(echo|print|if|else|elseif|endif|foreach|endforeach|for|endfor|while|endwhile|switch|case|default|break|continue|function|return|class|public|private|protected|static|new|extends|implements|namespace|use|include|require|include_once|require_once|as)\b/g;
        escaped = escaped.replace(keywords, '<span class="token keyword">$1</span>');

        // Highlight Function calls: name()
        escaped = escaped.replace(/\b([a-zA-Z0-9_]+)(?=\s*\()/g, '<span class="token function">$1</span>');

        // Highlight Numbers
        escaped = escaped.replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');

        // Highlight PHP Tags: <?php or ?>, etc. (Moved here so "class" inside span is not matched by keywords)
        escaped = escaped.replace(/(&lt;\?php|&lt;\?|\?&gt;)/g, '<span class="token php-tag">$1</span>');

        // Restore comments and strings
        for (let i = 0; i < tokens.length; i++) {
            escaped = escaped.replace(`___TOKEN_${i}___`, tokens[i]);
        }

        return escaped;
    }
};

// Expose globally
window.CodeHighlighter = CodeHighlighter;
