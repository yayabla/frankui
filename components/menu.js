const Menu = {
    init: function() {
        document.querySelectorAll('[data-role="menu"], .menubar').forEach(el => {
            this.initMenu(el);
        });
    },

    initMenu: function(menubar) {
        if (menubar.dataset.initialized) return;
        menubar.dataset.initialized = 'true';

        menubar.classList.add('menubar');

        // Helper to close all menus in a container/subtree
        const closeAllSubmenus = (container) => {
            container.querySelectorAll('.menu-item.open').forEach(item => {
                item.classList.remove('open');
            });
        };

        // Top level items
        const topLevelItems = Array.from(menubar.children).filter(child => {
            return child.classList.contains('menu-item');
        });

        topLevelItems.forEach(item => {
            const link = item.querySelector(':scope > a');
            
            // Handle Top Level clicks
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const isOpen = item.classList.contains('open');
                    
                    // Close all top level items first
                    topLevelItems.forEach(i => i.classList.remove('open'));

                    if (!isOpen) {
                        item.classList.add('open');
                        menubar.dataset.activeState = 'true';
                    } else {
                        menubar.dataset.activeState = 'false';
                    }
                });

                // Handle Top Level hover switching (standard OS file menus)
                item.addEventListener('mouseenter', () => {
                    if (menubar.dataset.activeState === 'true') {
                        topLevelItems.forEach(i => i.classList.remove('open'));
                        item.classList.add('open');
                    }
                });
            }
        });

        // Handle submenu hovers (nested .menu-item blocks inside .menu-dropdowns)
        const dropdownItems = menubar.querySelectorAll('.menu-dropdown .menu-item');
        dropdownItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                
                // Get parent dropdown to only close siblings at the same depth level
                const parentDropdown = item.closest('.menu-dropdown');
                if (parentDropdown) {
                    Array.from(parentDropdown.children).forEach(sibling => {
                        if (sibling !== item && sibling.classList.contains('menu-item')) {
                            sibling.classList.remove('open');
                            // Recursively close nested sub-menus inside siblings
                            closeAllSubmenus(sibling);
                        }
                    });
                }
                
                // Open this item's submenu
                item.classList.add('open');
            });
        });

        // Close all dropdowns when clicking outside the menubar
        document.addEventListener('click', (e) => {
            if (!menubar.contains(e.target)) {
                topLevelItems.forEach(i => i.classList.remove('open'));
                closeAllSubmenus(menubar);
                menubar.dataset.activeState = 'false';
            }
        });
    }
};

window.Menu = Menu;
