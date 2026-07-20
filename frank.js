/* FrankUI Core JS */
const FrankUI = {
    escapeHtml: function(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    },
    sanitizeHtml: function(html) {
        if (!html) return '';
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            doc.querySelectorAll('script, iframe, object, embed, link, style').forEach(el => el.remove());
            const allElements = doc.querySelectorAll('*');
            allElements.forEach(el => {
                Array.from(el.attributes).forEach(attr => {
                    const name = attr.name.toLowerCase();
                    const val = attr.value.toLowerCase();
                    if (name.startsWith('on') || val.includes('javascript:') || val.includes('data:') || val.includes('vbscript:')) {
                        el.removeAttribute(attr.name);
                    }
                });
            });
            return doc.body.innerHTML;
        } catch (e) {
            return FrankUI.escapeHtml(html);
        }
    },
    init: function() {
        console.log("FrankUI initialized.");
    }
};

document.addEventListener('DOMContentLoaded', FrankUI.init);
