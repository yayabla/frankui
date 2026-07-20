const AppBar = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        // Setup theme toggles
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            this.setupThemeToggle(toggle);
        });

        document.body.addEventListener('click', (e) => {
            const hamburger = e.target.closest('.app-bar-hamburger');
            if (hamburger) {
                e.preventDefault();
                e.stopPropagation();
                const appBar = hamburger.closest('.app-bar');
                if (appBar) {
                    appBar.classList.toggle('open');
                }
            }
        });
    },

    setupThemeToggle: function(toggle) {
        const lightSymbol = toggle.getAttribute('data-light-symbol') || '🌞';
        const darkSymbol = toggle.getAttribute('data-dark-symbol') || '🌙';
        const input = toggle.querySelector('input[type="checkbox"]');
        const slider = toggle.querySelector('.theme-slider');
        
        if (!slider || !input) return;

        let symbolEl = slider.querySelector('.theme-symbol');
        if (!symbolEl) {
            symbolEl = document.createElement('span');
            symbolEl.className = 'theme-symbol';
            slider.appendChild(symbolEl);
        }

        const updateSymbol = () => {
            symbolEl.textContent = input.checked ? darkSymbol : lightSymbol;
            if (input.checked) {
                symbolEl.classList.remove('light-mode');
                symbolEl.classList.add('dark-mode');
            } else {
                symbolEl.classList.remove('dark-mode');
                symbolEl.classList.add('light-mode');
            }
        };

        input.addEventListener('change', updateSymbol);
        updateSymbol();
    }
};

window.AppBar = AppBar;
