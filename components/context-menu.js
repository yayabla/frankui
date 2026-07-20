const ContextMenu = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        document.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('[data-context-menu]');
            if (!target) return;

            e.preventDefault();
            this.show(e, target);
        });

        document.addEventListener('click', () => this.hide());
    },

    show: function(e, target) {
        this.hide();
        const menuId = target.dataset.contextMenu;
        const menuTemplate = document.getElementById(menuId);
        if (!menuTemplate) return;

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.display = 'block';
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;

        menuTemplate.querySelectorAll('li').forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `<span>${item.dataset.icon ? `<span class="icon">${item.dataset.icon}</span>` : ''}${item.textContent}</span>
                                  ${item.dataset.hotkey ? `<span class="hotkey">${item.dataset.hotkey}</span>` : ''}`;
            menuItem.onclick = item.onclick;
            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);
    },

    hide: function() {
        const menu = document.querySelector('.context-menu');
        if (menu) menu.remove();
    }
};

window.ContextMenu = ContextMenu;
