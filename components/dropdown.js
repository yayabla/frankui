const Dropdown = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        // Setup initial aria attributes on current dropdown toggles
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.setAttribute('aria-haspopup', 'true');
            toggle.setAttribute('aria-expanded', 'false');
        });

        // Toggle dropdown on click
        document.body.addEventListener('click', (e) => {
            const toggle = e.target.closest('.dropdown-toggle');
            if (toggle) {
                e.preventDefault();
                e.stopPropagation();
                
                // Ensure attributes are present (defensive check for dynamic elements)
                if (!toggle.getAttribute('aria-haspopup')) {
                    toggle.setAttribute('aria-haspopup', 'true');
                }

                const dropdown = toggle.closest('.dropdown');
                if (dropdown) {
                    const isOpen = dropdown.classList.contains('open');
                    this.closeAll();
                    if (!isOpen) {
                        dropdown.classList.add('open');
                        toggle.setAttribute('aria-expanded', 'true');
                    }
                }
                return;
            }

            // Close all if clicking outside
            if (!e.target.closest('.dropdown-menu')) {
                this.closeAll();
            }
        });
    },

    closeAll: function() {
        document.querySelectorAll('.dropdown.open').forEach(d => {
            d.classList.remove('open');
            const toggle = d.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
};

window.Dropdown = Dropdown;
