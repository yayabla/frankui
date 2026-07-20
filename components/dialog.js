// FrankUI Dialog Module
const Dialog = {
    create: function(options) {
        const dialog = document.createElement('dialog');
        const color = options.color || options.type || 'info';
        dialog.className = `dialog ${color}`;
        
        // Header
        const header = document.createElement('div');
        header.className = 'dialog-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = options.title || 'Dialog';
        header.appendChild(titleSpan);
        
        if (options.closeButton) {
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'X';
            closeBtn.onclick = () => dialog.close();
            header.appendChild(closeBtn);
        }
        dialog.appendChild(header);
        
        // Content
        const content = document.createElement('div');
        content.className = 'dialog-content';
        if (options.htmlContent) {
            content.innerHTML = options.content || '';
        } else {
            content.textContent = options.content || '';
        }
        dialog.appendChild(content);
        
        // Footer
        if (options.defaultActions) {
            const footer = document.createElement('div');
            footer.className = 'dialog-footer';
            const okBtn = document.createElement('button');
            okBtn.textContent = 'OK';
            okBtn.onclick = () => dialog.close();
            footer.appendChild(okBtn);
            dialog.appendChild(footer);
        }
        
        document.body.appendChild(dialog);
        dialog.showModal();
        
        dialog.addEventListener('close', () => dialog.remove());

        // Close on backdrop click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
        });
        
        return dialog;
    },
    
    get: function(selector) {
        const el = document.querySelector(selector);
        return {
            setTitle: function(title) { 
                if (el) {
                    const span = el.querySelector('.dialog-header span') || el.querySelector('.dialog-header');
                    if (span) span.textContent = title;
                }
            },
            setContent: function(content) { 
                if (el) {
                    const cntEl = el.querySelector('.dialog-content');
                    if (cntEl) cntEl.textContent = content;
                }
            },
            open: function() { if (el) el.showModal(); },
            close: function() { if (el) el.close(); }
        };
    }
};

window.Dialog = Dialog;
