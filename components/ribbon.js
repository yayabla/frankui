const Ribbon = {
    init: function() {
        document.querySelectorAll('.ribbon-container').forEach(ribbon => {
            this.setupRibbon(ribbon);
        });
    },

    setupRibbon: function(ribbon) {
        if (ribbon.dataset.initialized) return;
        ribbon.dataset.initialized = 'true';

        const tabs = ribbon.querySelectorAll('.ribbon-tab-btn');
        const panes = ribbon.querySelectorAll('.ribbon-tab-pane');

        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => {
                // If ribbon is collapsed, clicking a tab expands it
                if (ribbon.classList.contains('collapsed')) {
                    ribbon.classList.remove('collapsed');
                    const toggleBtn = ribbon.querySelector('.ribbon-toggle-btn');
                    if (toggleBtn) toggleBtn.textContent = '▲';
                }

                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                if (panes[i]) panes[i].classList.add('active');
            });
        });

        // Toggle collapse button
        const toggleBtn = ribbon.querySelector('.ribbon-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ribbon.classList.toggle('collapsed');
                toggleBtn.textContent = ribbon.classList.contains('collapsed') ? '▼' : '▲';
            });
        }
    }
};

window.Ribbon = Ribbon;
