const Panel = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        document.querySelectorAll('[data-role="panel"]').forEach(panel => {
            panel.classList.add('panel');
            const title = panel.getAttribute('data-title-caption');
            if (title) {
                // Check if header already exists to avoid duplicates
                if (panel.querySelector('.panel-header')) return;
                
                const header = document.createElement('div');
                header.className = 'panel-header';
                header.textContent = title;
                panel.prepend(header);
            }
        });
    }
};

window.Panel = Panel;
