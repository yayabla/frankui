const NavView = {
    init: function() {
        document.querySelectorAll('[data-role="navview"], .navview').forEach(el => {
            this.initNavView(el);
        });
    },

    initNavView: function(container) {
        if (container.dataset.initialized) return;
        container.dataset.initialized = 'true';

        container.classList.add('navview');

        const pane = container.querySelector('.navview-pane');
        const pullBtn = container.querySelector('.pull-button');

        // Toggle compact class on pull button click
        if (pullBtn) {
            pullBtn.addEventListener('click', (e) => {
                e.preventDefault();
                container.classList.toggle('compact');
                // Store user preference
                container.dataset.userCollapsed = container.classList.contains('compact') ? 'true' : 'false';
            });
        }

        // Set up active links selector behavior
        const menuLinks = container.querySelectorAll('.navview-menu li a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                container.querySelectorAll('.navview-menu li').forEach(li => {
                    li.classList.remove('active');
                });
                link.parentElement.classList.add('active');
            });
        });

        // Breakpoint matching for responsive layout state
        const breakpoints = {
            'fs': 0, 'sx': 360, 'sm': 576, 'ld': 640,
            'md': 768, 'lg': 992, 'xl': 1200, 'xxl': 1400, 'xxxl': 2000
        };

        const expandPoint = container.dataset.expandPoint || 'md';
        const minWidth = breakpoints[expandPoint] !== undefined ? breakpoints[expandPoint] : 768;

        if (typeof window.matchMedia === 'function') {
            const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
            const handleViewportChange = (e) => {
                if (e.matches) {
                    // Wide screen: restore expanded unless user manually collapsed it
                    if (container.dataset.userCollapsed !== 'true') {
                        container.classList.remove('compact');
                    }
                } else {
                    // Narrow screen: force compact
                    container.classList.add('compact');
                }
            };

            // Register query change handler
            mediaQuery.addEventListener('change', handleViewportChange);
            // Run initial check
            handleViewportChange(mediaQuery);
        }
    }
};

window.NavView = NavView;
