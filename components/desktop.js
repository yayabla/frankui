const Desktop = {
    init: function() {
        document.querySelectorAll('.desktop-container').forEach(desk => {
            if (desk.dataset.initialized) return;
            desk.dataset.initialized = 'true';
            const taskbar = desk.querySelector('.taskbar');
            if (!taskbar) return;
            
            // Find existing windows
            desk.querySelectorAll('.window').forEach(win => {
                if (win.dataset.taskbarItemAdded) return;
                win.dataset.taskbarItemAdded = 'true';
                this.addTaskbarItem(win, taskbar);
            });
        });
    },

    addTaskbarItem: function(win, taskbar) {
        const title = win.querySelector('.window-header span').textContent;
        const item = document.createElement('div');
        item.className = 'taskbar-item';
        item.textContent = title;
        
        item.onclick = () => {
            if (typeof win.animateMinimize === 'function') {
                if (win.classList.contains('minimized')) {
                    win.animateMinimize(false);
                    win.dispatchEvent(new Event('mousedown')); // focus
                } else {
                    const isActive = win.classList.contains('active-window');
                    if (isActive) {
                        win.animateMinimize(true);
                    } else {
                        win.dispatchEvent(new Event('mousedown')); // focus
                    }
                }
            } else {
                win.style.display = 'block';
                win.classList.remove('minimized');
                win.style.zIndex = 1000; // Bring to front
            }
        };

        // Hook close button to remove taskbar item
        win.querySelector('.btn-close').addEventListener('click', () => {
            item.remove();
        });

        taskbar.appendChild(item);
    }
};

window.Desktop = Desktop;
