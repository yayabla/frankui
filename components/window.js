const Window = {
    init: function() {
        document.querySelectorAll('.window').forEach(win => {
            this.initWindow(win);
        });
    },

    initWindow: function(win) {
        if (win.dataset.initialized) return;
        win.dataset.initialized = 'true';

        const header = win.querySelector('.window-header');
        
        // Focus window on click/mousedown
        win.addEventListener('mousedown', () => {
            document.querySelectorAll('.window').forEach(w => {
                if (w !== win) {
                    w.style.zIndex = '100';
                    w.classList.remove('active-window');
                }
            });
            win.style.zIndex = '101';
            win.classList.add('active-window');
        });

        if (header) {
            header.addEventListener('mousedown', (e) => {
                // If minimized or maximized, don't allow dragging
                if (win.classList.contains('minimized') || win.classList.contains('maximized')) return;

                const container = win.parentElement;
                const containerRect = container.getBoundingClientRect();
                
                const winRect = win.getBoundingClientRect();
                let shiftX = e.clientX - winRect.left;
                let shiftY = e.clientY - winRect.top;
                
                function moveAt(clientX, clientY) {
                    let newLeft = clientX - shiftX - containerRect.left;
                    let newTop = clientY - shiftY - containerRect.top;

                    const maxX = containerRect.width - win.offsetWidth;
                    const maxY = containerRect.height - win.offsetHeight;

                    win.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
                    win.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
                }
                
                win.style.position = 'absolute';
                
                function onMouseMove(e) { moveAt(e.clientX, e.clientY); }
                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        }

        // Helper to perform the custom minimize/restore animation
        const animateMinimize = (toMinimize) => {
            const container = win.parentElement;
            if (!container) return;

            // Find corresponding taskbar item button
            let targetBtn = null;
            
            // 1. Check if we have desktop.js taskbar items
            const taskbarItems = container.querySelectorAll('.taskbar-item');
            const titleText = win.querySelector('.window-header span')?.textContent;
            taskbarItems.forEach(item => {
                if (item.textContent === titleText) {
                    targetBtn = item;
                }
            });

            // 2. Check if we have taskbar.js task buttons
            if (!targetBtn) {
                const taskBtns = document.querySelectorAll('.taskbar .task-btn, .taskbar-container .task-btn');
                taskBtns.forEach(btn => {
                    const titleSpan = btn.querySelector('.task-btn-title');
                    if (titleSpan && titleSpan.textContent === titleText) {
                        targetBtn = btn;
                    }
                });
            }

            // 3. Fallback to app ID matches if title isn't a direct text match
            if (!targetBtn && win.dataset.appId) {
                const appId = win.dataset.appId;
                const appBtns = document.querySelectorAll(`.task-btn[data-app-id="${appId}"], [data-app-id="${appId}"]`);
                if (appBtns.length > 0) {
                    targetBtn = appBtns[0];
                }
            }

            if (!targetBtn) {
                if (toMinimize) {
                    win.classList.add('minimized');
                } else {
                    win.classList.remove('minimized');
                }
                return;
            }

            const winRect = win.getBoundingClientRect();
            const btnRect = targetBtn.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate target coordinates relative to container
            const startLeft = winRect.left - containerRect.left;
            const startTop = winRect.top - containerRect.top;
            const startWidth = winRect.width;
            const startHeight = winRect.height;

            const targetLeft = btnRect.left - containerRect.left;
            const targetTop = btnRect.top - containerRect.top;
            const targetWidth = btnRect.width;
            const targetHeight = btnRect.height;

            // If we are minimizing, save original styles first
            if (toMinimize) {
                // If it is currently maximized, we shouldn't save the full-screen (100%) dimensions as the restoration target!
                // We should keep the original floating window dimensions instead.
                if (win.classList.contains('maximized')) {
                    win.dataset.wasMaximized = 'true';
                } else {
                    win.dataset.wasMaximized = 'false';
                    win.dataset.origLeft = win.style.left || (startLeft + 'px');
                    win.dataset.origTop = win.style.top || (startTop + 'px');
                    win.dataset.origWidth = win.style.width || (startWidth + 'px');
                    win.dataset.origHeight = win.style.height || (startHeight + 'px');
                }
                win.dataset.origOpacity = win.style.opacity || '1';
                win.dataset.origTransform = win.style.transform || 'none';

                win.style.left = startLeft + 'px';
                win.style.top = startTop + 'px';
                win.style.width = startWidth + 'px';
                win.style.height = startHeight + 'px';
                win.style.transition = 'all 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)';
                win.classList.add('minimizing');

                requestAnimationFrame(() => {
                    win.style.left = targetLeft + 'px';
                    win.style.top = targetTop + 'px';
                    win.style.width = targetWidth + 'px';
                    win.style.height = targetHeight + 'px';
                    win.style.opacity = '0';
                    win.style.transform = 'scale(0.1)';
                });

                setTimeout(() => {
                    win.classList.add('minimized');
                    win.classList.remove('minimizing');
                    win.style.display = 'none';
                }, 400);

            } else {
                win.style.display = 'block';
                win.classList.remove('minimized');
                win.classList.add('restoring');

                win.style.transition = 'none';
                win.style.left = targetLeft + 'px';
                win.style.top = targetTop + 'px';
                win.style.width = targetWidth + 'px';
                win.style.height = targetHeight + 'px';
                win.style.opacity = '0';
                win.style.transform = 'scale(0.1)';

                win.offsetHeight; // trigger reflow

                requestAnimationFrame(() => {
                    win.style.transition = 'all 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)';
                    if (win.dataset.wasMaximized === 'true') {
                        win.style.left = '0px';
                        win.style.top = '0px';
                        win.style.width = '100%';
                        win.style.height = '100%';
                        win.classList.add('maximized');
                    } else {
                        win.style.left = win.dataset.origLeft || (startLeft + 'px');
                        win.style.top = win.dataset.origTop || (startTop + 'px');
                        win.style.width = win.dataset.origWidth || (startWidth + 'px');
                        win.style.height = win.dataset.origHeight || (startHeight + 'px');
                        win.classList.remove('maximized');
                    }
                    win.style.opacity = win.dataset.origOpacity || '1';
                    win.style.transform = win.dataset.origTransform || 'none';
                });

                setTimeout(() => {
                    win.classList.remove('restoring');
                    win.style.transition = '';
                    win.style.opacity = '';
                    win.style.transform = '';
                }, 400);
            }
        };

        // Helper to perform the custom maximize/restore animation
        const animateMaximize = (toMaximize) => {
            const container = win.parentElement;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const winRect = win.getBoundingClientRect();

            const startLeft = winRect.left - containerRect.left;
            const startTop = winRect.top - containerRect.top;
            const startWidth = winRect.width;
            const startHeight = winRect.height;

            // Clean up any lingering minimize animation classes
            win.classList.remove('minimizing', 'restoring');

            if (toMaximize) {
                // Save original styles before maximizing
                win.dataset.origLeft = win.style.left || (startLeft + 'px');
                win.dataset.origTop = win.style.top || (startTop + 'px');
                win.dataset.origWidth = win.style.width || (startWidth + 'px');
                win.dataset.origHeight = win.style.height || (startHeight + 'px');

                // Set initial state for animation
                win.style.left = startLeft + 'px';
                win.style.top = startTop + 'px';
                win.style.width = startWidth + 'px';
                win.style.height = startHeight + 'px';
                win.style.opacity = '0';
                win.style.transform = 'scale(0.1)';
                win.style.transition = 'all 0.35s cubic-bezier(0.1, 0.9, 0.2, 1)';

                // Trigger reflow
                win.offsetHeight;

                requestAnimationFrame(() => {
                    win.style.left = '0px';
                    win.style.top = '0px';
                    win.style.width = '100%';
                    win.style.height = '100%';
                    win.style.opacity = '1';
                    win.style.transform = 'scale(1)';
                    win.classList.add('maximized');
                });

                setTimeout(() => {
                    win.style.transition = '';
                }, 350);
            } else {
                // Restore from maximized
                win.style.transition = 'all 0.35s cubic-bezier(0.1, 0.9, 0.2, 1)';
                win.classList.remove('maximized');

                requestAnimationFrame(() => {
                    win.style.left = win.dataset.origLeft;
                    win.style.top = win.dataset.origTop;
                    win.style.width = win.dataset.origWidth;
                    win.style.height = win.dataset.origHeight;
                    win.style.opacity = '1';
                    win.style.transform = 'none';
                });

                setTimeout(() => {
                    win.style.transition = '';
                }, 350);
            }
        };


        win.animateMinimize = animateMinimize;
        win.animateMaximize = animateMaximize;

        // Controls
        const btnMin = win.querySelector('.btn-min');
        if (btnMin) {
            btnMin.onclick = (e) => {
                e.stopPropagation();
                if (win.classList.contains('minimized')) {
                    animateMinimize(false);
                } else {
                    animateMinimize(true);
                }
            };
        }
        const btnMax = win.querySelector('.btn-max');
        if (btnMax) {
            btnMax.onclick = (e) => {
                e.stopPropagation();
                if (win.classList.contains('maximized')) {
                    animateMaximize(false);
                } else {
                    animateMaximize(true);
                }
                if (win.classList.contains('minimized')) {
                    animateMinimize(false);
                }
            };
        }
        const btnClose = win.querySelector('.btn-close');
        if (btnClose) {
            btnClose.onclick = (e) => {
                e.stopPropagation();
                win.remove();
            };
        }
    },

    create: function(options = {}) {
        const title = options.title || 'Window';
        const content = options.content || '';
        const width = options.width || '350px';
        const height = options.height || 'auto';
        let x = options.x;
        let y = options.y;

        if (x === undefined && y === undefined) {
            let container = options.container || document.querySelector('.desktop-container') || document.body;
            if (typeof container === 'string') {
                container = document.querySelector(container) || document.body;
            }
            const openWindows = container.querySelectorAll('.window');
            if (openWindows.length > 0) {
                const lastWin = openWindows[openWindows.length - 1];
                const lastLeft = parseInt(lastWin.style.left) || 80;
                const lastTop = parseInt(lastWin.style.top) || 80;
                // Cascade down and right by 30px (approx title height)
                x = (lastLeft + 30) + 'px';
                y = (lastTop + 30) + 'px';
            } else {
                x = '80px';
                y = '80px';
            }
        } else {
            x = x || '80px';
            y = y || '80px';
        }

        const win = document.createElement('div');
        win.className = 'window';
        win.style.width = width;
        win.style.height = height;
        win.style.left = x;
        win.style.top = y;
        win.style.position = 'absolute';

        const safeTitle = FrankUI.escapeHtml(title);
        const safeContent = options.htmlContent !== false ? content : FrankUI.escapeHtml(content);

        win.innerHTML = `
            <div class="window-header">
                <span>${safeTitle}</span>
                <div class="window-controls">
                    <button class="btn-min">−</button>
                    <button class="btn-max">□</button>
                    <button class="btn-close">×</button>
                </div>
            </div>
            <div class="window-content">${safeContent}</div>
        `;

        let container = options.container || document.querySelector('.desktop-container') || document.body;
        if (typeof container === 'string') {
            container = document.querySelector(container) || document.body;
        }
        container.appendChild(win);

        this.initWindow(win);
        
        // Dispatch custom event for taskbar detection
        const event = new CustomEvent('windowCreated', { detail: win });
        container.dispatchEvent(event);

        return win;
    },

    loadFromUrl: function(url, options = {}) {
        const title = options.title || url.split('/').pop() || 'Loaded Window';
        
        const winOptions = Object.assign({
            title: title,
            content: '<div class="window-loading" style="padding: 20px; text-align: center; font-size: 14px; opacity: 0.7;">Loading...</div>',
            htmlContent: true
        }, options);

        const win = this.create(winOptions);
        const contentDiv = win.querySelector('.window-content');

        fetch(url)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.text();
            })
            .then(html => {
                contentDiv.innerHTML = html;
                if (typeof FrankUI !== 'undefined' && typeof FrankUI.scan === 'function') {
                    FrankUI.scan(false);
                }
            })
            .catch(err => {
                contentDiv.innerHTML = `<div style="padding: 20px; color: var(--alert-color); font-weight: 600;">Failed to load content: ${FrankUI.escapeHtml(err.message)}</div>`;
            });

        return win;
    }
};

window.Window = Window;
