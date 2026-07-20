function safeEval(expr) {
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
        throw new Error("Invalid characters in expression");
    }
    return Function(`"use strict"; return (${expr})`)();
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

const Taskbar = {
    pinnedApps: [
        { id: 'browser', title: 'Web Browser', icon: '🌐' },
        { id: 'explorer', title: 'File Explorer', icon: '📁' },
        { id: 'settings', title: 'Settings', icon: '⚙️' },
        { id: 'calculator', title: 'Calculator', icon: '🧮' },
        { id: 'terminal', title: 'Terminal', icon: '💻' }
    ],

    init: function() {
        document.querySelectorAll('.taskbar').forEach(tb => {
            this.setupTaskbar(tb);
        });
    },

    setupTaskbar: function(tb) {
        if (tb.dataset.initialized) return;
        tb.dataset.initialized = 'true';

        // Clear default simple content
        tb.innerHTML = '';

        // Determine parent container (desktop-container or body)
        const container = tb.parentElement || document.body;
        container.style.position = 'relative';

        // 1. Create taskbar HTML structure
        const tbContainer = document.createElement('div');
        tbContainer.className = 'taskbar-container';

        // Left section (Start & Widgets)
        const leftSec = document.createElement('div');
        leftSec.className = 'taskbar-left';
        
        const startBtn = document.createElement('button');
        startBtn.className = 'taskbar-start-btn';
        startBtn.title = 'Start Menu';
        startBtn.innerHTML = '<span class="start-icon">❖</span>';
        leftSec.appendChild(startBtn);

        const widgetsBtn = document.createElement('button');
        widgetsBtn.className = 'taskbar-widgets-btn';
        widgetsBtn.title = 'Widgets Board';
        widgetsBtn.innerHTML = '<span class="widgets-icon">📊</span>';
        leftSec.appendChild(widgetsBtn);

        tbContainer.appendChild(leftSec);

        // Center section (Pinned & Running Tasks)
        const centerSec = document.createElement('div');
        centerSec.className = 'taskbar-center';
        tbContainer.appendChild(centerSec);

        // Right section (Tray & Clock)
        const rightSec = document.createElement('div');
        rightSec.className = 'taskbar-right';

        const sysTray = document.createElement('div');
        sysTray.className = 'system-tray';

        const netBtn = document.createElement('button');
        netBtn.className = 'tray-item tray-network';
        netBtn.title = 'Network Settings';
        netBtn.textContent = '📶';
        sysTray.appendChild(netBtn);

        const volBtn = document.createElement('button');
        volBtn.className = 'tray-item tray-volume';
        volBtn.title = 'Volume Control';
        volBtn.textContent = '🔊';
        sysTray.appendChild(volBtn);

        const batBtn = document.createElement('button');
        batBtn.className = 'tray-item tray-battery';
        batBtn.title = 'Battery Status';
        batBtn.textContent = '🔋';
        sysTray.appendChild(batBtn);

        rightSec.appendChild(sysTray);

        const clock = document.createElement('div');
        clock.className = 'taskbar-clock';
        clock.title = 'Clock & Calendar';
        clock.innerHTML = `
            <span class="clock-time">00:00:00</span>
            <span class="clock-date">01/01/2026</span>
        `;
        rightSec.appendChild(clock);

        tbContainer.appendChild(rightSec);
        tb.appendChild(tbContainer);

        // 2. Create popover overlays (Start Menu, Widgets, Clock flyout, Vol, Net)
        this.createOverlays(container);

        // 3. Setup Clock updates
        this.startClock(clock);

        // 4. Setup Pinned Apps
        this.renderPinnedApps(centerSec);

        // 5. Setup Window Observers to track running applications
        this.setupWindowObservers(container, centerSec);

        // 6. Hook Event Listeners for Buttons
        this.setupEventHandlers(startBtn, widgetsBtn, netBtn, volBtn, clock, container);
    },

    createOverlays: function(container) {
        // Start Menu
        const startMenu = document.createElement('div');
        startMenu.className = 'start-menu-panel taskbar-flyout';
        startMenu.innerHTML = `
            <div class="start-menu-header">
                <input type="text" class="start-menu-search" placeholder="Type here to search apps...">
            </div>
            <div class="start-menu-content">
                <div class="start-menu-section-title">Pinned Applications</div>
                <div class="start-apps-grid"></div>
                <div class="start-menu-section-title" style="margin-top: 15px;">Recent Actions</div>
                <div class="start-recent-list">
                    <div class="recent-item" data-action="open-welcome">👋 Welcome to FrankUI</div>
                    <div class="recent-item" data-action="open-settings">⚙️ Edit System Settings</div>
                    <div class="recent-item" data-action="open-terminal">💻 Launch Command Terminal</div>
                </div>
            </div>
            <div class="start-menu-footer">
                <div class="start-user-profile">
                    <div class="user-avatar">👤</div>
                    <div class="user-name">Administrator</div>
                </div>
                <button class="start-power-btn" title="Restart / Reset Desktop">⏻</button>
            </div>
        `;
        container.appendChild(startMenu);

        // Populate Start Menu App Grid
        const grid = startMenu.querySelector('.start-apps-grid');
        this.pinnedApps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'start-app-item';
            item.innerHTML = `
                <div class="start-app-icon">${app.icon}</div>
                <div class="start-app-title">${app.title}</div>
            `;
            item.onclick = () => {
                this.launchApp(app.id);
                this.closeAllFlyouts();
            };
            grid.appendChild(item);
        });

        // Search filter in start menu
        const searchInput = startMenu.querySelector('.start-menu-search');
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            startMenu.querySelectorAll('.start-app-item').forEach(item => {
                const title = item.querySelector('.start-app-title').textContent.toLowerCase();
                item.style.display = title.includes(val) ? 'flex' : 'none';
            });
        });

        // Power button behavior
        startMenu.querySelector('.start-power-btn').onclick = () => {
            if (confirm('Would you like to reset all open windows?')) {
                document.querySelectorAll('.window').forEach(w => w.remove());
                this.closeAllFlyouts();
            }
        };

        startMenu.querySelectorAll('.recent-item').forEach(item => {
            item.onclick = () => {
                const action = item.dataset.action;
                if (action === 'open-welcome') {
                    Window.create({
                        title: 'Welcome to FrankUI',
                        content: '<h3>Welcome Administrator!</h3><p>This desktop layout features our brand new Windows-inspired taskbar. You can use widgets, view the clock flyout, change system tray settings, and launch simulated applications.</p><button class="btn btn-primary" onclick="this.closest(\'.window\').remove()">Get Started</button>',
                        width: '380px'
                    });
                } else if (action === 'open-settings') {
                    this.launchApp('settings');
                } else if (action === 'open-terminal') {
                    this.launchApp('terminal');
                }
                this.closeAllFlyouts();
            };
        });

        // Widgets Board
        const widgetsPanel = document.createElement('div');
        widgetsPanel.className = 'widgets-panel taskbar-flyout';
        widgetsPanel.innerHTML = `
            <div class="widgets-header">
                <h3>Widgets Board</h3>
                <span class="widgets-time-header">Tuesday, July 14</span>
            </div>
            <div class="widgets-content">
                <!-- Weather Widget -->
                <div class="widget-card weather-widget">
                    <div class="widget-title">🌤️ Weather</div>
                    <div class="weather-info">
                        <div class="weather-temp">21°C</div>
                        <div class="weather-details">
                            <span class="weather-city">Amsterdam</span>
                            <span class="weather-desc">Partly Cloudy</span>
                        </div>
                    </div>
                </div>

                <!-- Resource Monitor Widget -->
                <div class="widget-card resource-widget">
                    <div class="widget-title">📊 System Performance</div>
                    <div class="resource-item">
                        <div class="resource-label"><span>CPU Usage</span><span class="cpu-val">12%</span></div>
                        <div class="resource-bar"><div class="resource-progress cpu-progress" style="width: 12%"></div></div>
                    </div>
                    <div class="resource-item" style="margin-top: 10px;">
                        <div class="resource-label"><span>Memory (RAM)</span><span class="ram-val">48%</span></div>
                        <div class="resource-bar"><div class="resource-progress ram-progress" style="width: 48%"></div></div>
                    </div>
                </div>

                <!-- Notes Widget -->
                <div class="widget-card notes-widget">
                    <div class="widget-title">📌 Quick Notes</div>
                    <div class="notes-input-wrapper">
                        <input type="text" class="new-note-input" placeholder="Type a note...">
                        <button class="add-note-btn">+</button>
                    </div>
                    <ul class="notes-list">
                        <li>Buy groceries <span class="delete-note">×</span></li>
                        <li>Update FrankUI Docs <span class="delete-note">×</span></li>
                    </ul>
                </div>
            </div>
        `;
        container.appendChild(widgetsPanel);

        // Sticky notes logic
        const noteInput = widgetsPanel.querySelector('.new-note-input');
        const addNoteBtn = widgetsPanel.querySelector('.add-note-btn');
        const notesList = widgetsPanel.querySelector('.notes-list');

        const addNote = () => {
            const text = noteInput.value.trim();
            if (text) {
                const li = document.createElement('li');
                li.innerHTML = `${text} <span class="delete-note">×</span>`;
                notesList.appendChild(li);
                noteInput.value = '';
                
                li.querySelector('.delete-note').onclick = () => li.remove();
            }
        };

        addNoteBtn.onclick = addNote;
        noteInput.onkeydown = (e) => { if (e.key === 'Enter') addNote(); };
        widgetsPanel.querySelectorAll('.delete-note').forEach(btn => {
            btn.onclick = () => btn.parentElement.remove();
        });

        // Animate Resource Monitor Widget
        setInterval(() => {
            const cpuVal = Math.floor(Math.random() * 25) + 5; // 5% - 30%
            const ramVal = Math.floor(Math.random() * 10) + 40; // 40% - 50%
            
            const cpuLabel = widgetsPanel.querySelector('.cpu-val');
            const cpuProgress = widgetsPanel.querySelector('.cpu-progress');
            const ramLabel = widgetsPanel.querySelector('.ram-val');
            const ramProgress = widgetsPanel.querySelector('.ram-progress');
            
            if (cpuLabel && cpuProgress) {
                cpuLabel.textContent = `${cpuVal}%`;
                cpuProgress.style.width = `${cpuVal}%`;
            }
            if (ramLabel && ramProgress) {
                ramLabel.textContent = `${ramVal}%`;
                ramProgress.style.width = `${ramVal}%`;
            }
        }, 3000);

        // Volume Flyout
        const volPanel = document.createElement('div');
        volPanel.className = 'volume-panel taskbar-flyout';
        volPanel.innerHTML = `
            <div class="vol-header">Volume: <span class="vol-percent">80%</span></div>
            <div class="vol-control-row">
                <span class="vol-icon">🔊</span>
                <input type="range" class="vol-slider" min="0" max="100" value="80">
            </div>
        `;
        container.appendChild(volPanel);

        const slider = volPanel.querySelector('.vol-slider');
        const volPercent = volPanel.querySelector('.vol-percent');
        const volIcon = volPanel.querySelector('.vol-icon');
        slider.oninput = (e) => {
            const val = e.target.value;
            volPercent.textContent = `${val}%`;
            if (val == 0) {
                volIcon.textContent = '🔇';
            } else if (val < 33) {
                volIcon.textContent = '🔈';
            } else if (val < 66) {
                volIcon.textContent = '🔉';
            } else {
                volIcon.textContent = '🔊';
            }
        };

        // Network Flyout
        const netPanel = document.createElement('div');
        netPanel.className = 'network-panel taskbar-flyout';
        netPanel.innerHTML = `
            <div class="net-header">Wi-Fi Connections</div>
            <div class="net-list">
                <div class="net-item active">
                    <span class="net-wifi-icon">📶</span>
                    <div class="net-info">
                        <span class="net-name">FrankUI_Guest</span>
                        <span class="net-status">Connected, Secure</span>
                    </div>
                </div>
                <div class="net-item">
                    <span class="net-wifi-icon">📶</span>
                    <div class="net-info">
                        <span class="net-name">Home_Network_5G</span>
                        <span class="net-status">Saved</span>
                    </div>
                </div>
                <div class="net-item">
                    <span class="net-wifi-icon">📶</span>
                    <div class="net-info">
                        <span class="net-name">Coffee_Shop_Free</span>
                        <span class="net-status">Open</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(netPanel);

        netPanel.querySelectorAll('.net-item').forEach(item => {
            item.onclick = () => {
                netPanel.querySelectorAll('.net-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const name = item.querySelector('.net-name').textContent;
                Notify.create(`Switching to network: ${name}`, 'Network Manager', {clsNotify: 'info'});
            };
        });

        // Calendar / Clock Flyout
        const calendarPanel = document.createElement('div');
        calendarPanel.className = 'calendar-panel taskbar-flyout';
        calendarPanel.innerHTML = `
            <div class="calendar-header">
                <div class="calendar-current-time">12:15 PM</div>
                <div class="calendar-current-date">Tuesday, July 14, 2026</div>
            </div>
            <div class="calendar-month-selector">
                <span class="calendar-month-name">July 2026</span>
                <div class="calendar-month-nav">
                    <button class="cal-prev">▲</button>
                    <button class="cal-next">▼</button>
                </div>
            </div>
            <div class="calendar-grid">
                <div class="cal-day-header">Su</div>
                <div class="cal-day-header">Mo</div>
                <div class="cal-day-header">Tu</div>
                <div class="cal-day-header">We</div>
                <div class="cal-day-header">Th</div>
                <div class="cal-day-header">Fr</div>
                <div class="cal-day-header">Sa</div>
                <!-- Empty padding for July 2026 starts on Wednesday (3) -->
                <div class="cal-day-empty"></div>
                <div class="cal-day-empty"></div>
                <div class="cal-day-empty"></div>
                <!-- Calendar days 1 - 31 -->
                ${Array.from({length: 31}, (_, i) => `<div class="cal-day${i+1 === 14 ? ' current-day' : ''}">${i+1}</div>`).join('')}
            </div>
        `;
        container.appendChild(calendarPanel);
    },

    startClock: function(clockEl) {
        const timeEl = clockEl.querySelector('.clock-time');
        const dateEl = clockEl.querySelector('.clock-date');

        const update = () => {
            const now = new Date();
            // Format time: HH:MM:SS
            let hh = String(now.getHours()).padStart(2, '0');
            let mm = String(now.getMinutes()).padStart(2, '0');
            let ss = String(now.getSeconds()).padStart(2, '0');
            timeEl.textContent = `${hh}:${mm}:${ss}`;

            // Format date: MM/DD/YYYY
            let month = String(now.getMonth() + 1).padStart(2, '0');
            let day = String(now.getDate()).padStart(2, '0');
            let year = now.getFullYear();
            dateEl.textContent = `${month}/${day}/${year}`;

            // Also update calendar time headers if they are open
            const calTime = document.querySelector('.calendar-current-time');
            const calDate = document.querySelector('.calendar-current-date');
            if (calTime && calDate) {
                let options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
                calTime.textContent = now.toLocaleTimeString([], options);

                let dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                calDate.textContent = now.toLocaleDateString([], dateOpts);
            }
        };

        update();
        setInterval(update, 1000);
    },

    renderPinnedApps: function(centerEl) {
        this.pinnedApps.forEach(app => {
            const btn = document.createElement('div');
            btn.className = 'task-btn pinned-app';
            btn.dataset.appId = app.id;
            btn.title = app.title;
            btn.innerHTML = `
                <span class="task-btn-icon">${app.icon}</span>
                <span class="task-btn-indicator"></span>
            `;
            btn.onclick = () => {
                this.handlePinnedAppClick(app.id);
            };
            centerEl.appendChild(btn);
        });
    },

    handlePinnedAppClick: function(appId) {
        // Find if a window associated with this application is already open
        const existingWin = Array.from(document.querySelectorAll('.window')).find(w => w.dataset.appId === appId);
        if (existingWin) {
            this.toggleWindowMinMax(existingWin);
        } else {
            this.launchApp(appId);
        }
    },

    toggleWindowMinMax: function(win) {
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
            if (win.classList.contains('minimized')) {
                win.classList.remove('minimized');
                win.dispatchEvent(new Event('mousedown')); // focus
            } else {
                const isActive = win.classList.contains('active-window');
                if (isActive) {
                    win.classList.add('minimized');
                } else {
                    win.dispatchEvent(new Event('mousedown')); // focus
                }
            }
        }
    },

    launchApp: function(appId) {
        let title = 'Application';
        let content = 'App content goes here';
        let width = '400px';
        let height = 'auto';

        if (appId === 'browser') {
            title = 'Web Browser';
            content = `
                <div class="browser-app-container" style="display: flex; flex-direction: column; height: 350px;">
                    <div class="browser-url-bar" style="display: flex; gap: 5px; margin-bottom: 10px;">
                        <input type="text" class="form-control browser-input" value="https://google.com" style="flex-grow: 1; padding: 4px 8px; font-size: 13px;">
                        <button class="btn btn-primary btn-sm browser-go-btn" style="padding: 2px 10px;">Go</button>
                    </div>
                    <div class="browser-frame-viewport" style="flex-grow: 1; background: white; border: 1px solid #ccc; padding: 15px; overflow-y: auto; color: #333;">
                        <div class="mock-google" style="text-align: center; margin-top: 40px;">
                            <h1 style="color: #4285F4; font-size: 32px; font-family: 'Product Sans', Arial, sans-serif; margin-bottom: 20px;">
                                <span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span>
                            </h1>
                            <input type="text" placeholder="Search Google..." style="width: 80%; max-width: 400px; padding: 10px; border: 1px solid #dfe1e5; border-radius: 24px; outline: none; margin-bottom: 10px;">
                            <div>
                                <button class="btn secondary btn-sm" style="margin: 5px; font-size: 12px;">Google Search</button>
                                <button class="btn secondary btn-sm" style="margin: 5px; font-size: 12px;">I'm Feeling Lucky</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            width = '550px';
            height = '430px';
        } else if (appId === 'explorer') {
            title = 'File Explorer';
            content = `
                <div class="explorer-app-container" style="display: flex; gap: 10px; height: 300px; font-size: 13px;">
                    <div class="explorer-sidebar" style="width: 100px; border-right: 1px solid var(--secondary-color); display: flex; flex-direction: column; gap: 8px;">
                        <span style="font-weight: bold; padding: 4px;">Quick Access</span>
                        <a href="#" style="text-decoration: none; padding: 4px; color: var(--text-color); background: var(--secondary-color); border-radius: 4px;">📂 Home</a>
                        <a href="#" style="text-decoration: none; padding: 4px; color: var(--text-color);">📁 Documents</a>
                        <a href="#" style="text-decoration: none; padding: 4px; color: var(--text-color);">📁 Downloads</a>
                    </div>
                    <div class="explorer-files-grid" style="flex-grow: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 15px; align-content: start; overflow-y: auto; padding: 5px;">
                        <div class="file-icon-item" style="text-align: center; cursor: pointer;">
                            <div style="font-size: 32px;">📄</div>
                            <div style="word-break: break-all; font-size: 11px;">Readme.md</div>
                        </div>
                        <div class="file-icon-item" style="text-align: center; cursor: pointer;">
                            <div style="font-size: 32px;">🖼️</div>
                            <div style="word-break: break-all; font-size: 11px;">Logo.png</div>
                        </div>
                        <div class="file-icon-item" style="text-align: center; cursor: pointer;">
                            <div style="font-size: 32px;">📁</div>
                            <div style="word-break: break-all; font-size: 11px;">System</div>
                        </div>
                    </div>
                </div>
            `;
            width = '480px';
            height = '370px';
        } else if (appId === 'settings') {
            title = 'System Settings';
            content = `
                <div class="settings-app-container" style="font-size: 13px; height: 280px; overflow-y: auto; padding-right: 5px;">
                    <div style="margin-bottom: 12px; font-weight: bold; border-bottom: 1px solid var(--secondary-color); padding-bottom: 5px;">🎨 Taskbar Position</div>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <label><input type="radio" name="tb-pos" value="bottom" checked> Bottom</label>
                        <label><input type="radio" name="tb-pos" value="top"> Top</label>
                    </div>
                    <div style="margin-bottom: 12px; font-weight: bold; border-bottom: 1px solid var(--secondary-color); padding-bottom: 5px;">🌓 Color Theme</div>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button class="btn secondary btn-sm" onclick="toggleDarkMode()">Toggle Dark Mode</button>
                    </div>
                    <div style="margin-bottom: 12px; font-weight: bold; border-bottom: 1px solid var(--secondary-color); padding-bottom: 5px;">🔧 Accent Color</div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="color" id="settings-accent" value="#0078d7" style="border: none; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">
                        <span>Choose Accent Color</span>
                    </div>
                </div>
            `;
            width = '360px';
            height = '350px';
        } else if (appId === 'calculator') {
            title = 'Calculator';
            content = `
                <div class="calc-app" style="display: flex; flex-direction: column; width: 220px; gap: 8px;">
                    <input type="text" class="form-control calc-screen" readonly value="0" style="text-align: right; font-size: 20px; font-family: monospace; height: 40px; padding: 5px;">
                    <div class="calc-buttons" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                        <button class="btn secondary calc-btn" value="C">C</button>
                        <button class="btn secondary calc-btn" value="/">/</button>
                        <button class="btn secondary calc-btn" value="*">*</button>
                        <button class="btn secondary calc-btn" value="-">-</button>
                        <button class="btn secondary calc-btn" value="7">7</button>
                        <button class="btn secondary calc-btn" value="8">8</button>
                        <button class="btn secondary calc-btn" value="9">9</button>
                        <button class="btn secondary calc-btn" value="+" style="grid-row: span 2; height: 100%;">+</button>
                        <button class="btn secondary calc-btn" value="4">4</button>
                        <button class="btn secondary calc-btn" value="5">5</button>
                        <button class="btn secondary calc-btn" value="6">6</button>
                        <button class="btn secondary calc-btn" value="1">1</button>
                        <button class="btn secondary calc-btn" value="2">2</button>
                        <button class="btn secondary calc-btn" value="3">3</button>
                        <button class="btn primary calc-btn" value="=" style="grid-row: span 2; height: 100%;">=</button>
                        <button class="btn secondary calc-btn" value="0" style="grid-column: span 2;">0</button>
                        <button class="btn secondary calc-btn" value=".">.</button>
                    </div>
                </div>
            `;
            width = '250px';
            height = '340px';
        } else if (appId === 'terminal') {
            title = 'Command Terminal';
            content = `
                <div class="terminal-app-container" style="background: #000; color: #0f0; font-family: monospace; padding: 10px; height: 280px; overflow-y: auto; display: flex; flex-direction: column; font-size: 12px; border-radius: 4px;">
                    <div class="term-history" style="flex-grow: 1; overflow-y: auto; margin-bottom: 5px; white-space: pre-wrap;">Welcome to FrankUI Terminal v1.0.0\nType "help" for a list of commands.\n\n</div>
                    <div class="term-input-row" style="display: flex; align-items: center;">
                        <span>C:\\&gt;</span>
                        <input type="text" class="term-input" style="flex-grow: 1; background: transparent; border: none; outline: none; color: #0f0; font-family: monospace; font-size: 12px; margin-left: 5px;">
                    </div>
                </div>
            `;
            width = '500px';
            height = '370px';
        }

        const win = Window.create({
            title: title,
            content: content,
            width: width,
            height: height
        });

        win.dataset.appId = appId;

        // Custom app interactive initializations
        if (appId === 'calculator') {
            this.initCalcApp(win);
        } else if (appId === 'terminal') {
            this.initTerminalApp(win);
        } else if (appId === 'settings') {
            this.initSettingsApp(win);
        } else if (appId === 'browser') {
            this.initBrowserApp(win);
        }
    },

    initCalcApp: function(win) {
        const screen = win.querySelector('.calc-screen');
        let expression = '';

        win.querySelectorAll('.calc-btn').forEach(btn => {
            btn.onclick = () => {
                const val = btn.value;
                if (val === 'C') {
                    expression = '';
                    screen.value = '0';
                } else if (val === '=') {
                    try {
                        if (expression) {
                            const result = safeEval(expression);
                            screen.value = String(result);
                            expression = String(result);
                        }
                    } catch (err) {
                        screen.value = 'Error';
                        expression = '';
                    }
                } else {
                    if (screen.value === '0' && !isNaN(val)) {
                        expression = val;
                    } else {
                        expression += val;
                    }
                    screen.value = expression;
                }
            };
        });
    },

    initTerminalApp: function(win) {
        const history = win.querySelector('.term-history');
        const input = win.querySelector('.term-input');

        // Focus input on console click
        win.querySelector('.terminal-app-container').onclick = () => input.focus();

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const cmdLine = input.value.trim();
                input.value = '';
                if (!cmdLine) return;

                history.textContent += `C:\\> ${cmdLine}\n`;
                const parts = cmdLine.split(' ');
                const cmd = parts[0].toLowerCase();
                const args = parts.slice(1);

                let output = '';
                switch (cmd) {
                    case 'help':
                        output = 'Available Commands:\n' +
                                 '  help            - Display this help information\n' +
                                 '  clear           - Clear terminal window\n' +
                                 '  date            - Display current date & time\n' +
                                 '  theme [dark/lt] - Toggle themes\n' +
                                 '  calc [expr]     - Quick calculator evaluation (e.g. calc 5*9)\n' +
                                 '  notify [msg]    - Send a FrankUI Notification\n';
                        break;
                    case 'clear':
                        history.textContent = '';
                        break;
                    case 'date':
                        output = new Date().toString() + '\n';
                        break;
                    case 'theme':
                        const darkBtn = document.getElementById('theme-dialog') ? toggleDarkMode : null;
                        if (typeof toggleDarkMode !== 'undefined') {
                            toggleDarkMode();
                            output = 'Theme toggled successfully.\n';
                        } else {
                            output = 'Theme function toggleDarkMode is not loaded.\n';
                        }
                        break;
                    case 'calc':
                        const expr = args.join('');
                        try {
                            const result = safeEval(expr);
                            output = `${expr} = ${result}\n`;
                        } catch (err) {
                            output = `Calculation Error: ${err.message}\n`;
                        }
                        break;
                    case 'notify':
                        const msg = args.join(' ');
                        if (typeof Notify !== 'undefined') {
                            Notify.create(msg || 'Test Notification from terminal!', 'Terminal CLI');
                            output = 'Notification triggered.\n';
                        } else {
                            output = 'Notify class not loaded.\n';
                        }
                        break;
                    default:
                        output = `Unknown command: "${cmd}". Type "help" for a list of commands.\n`;
                }

                history.textContent += output + '\n';
                // Scroll to bottom
                const termContainer = win.querySelector('.terminal-app-container');
                termContainer.scrollTop = termContainer.scrollHeight;
            }
        };
    },

    initSettingsApp: function(win) {
        // Position Switcher
        win.querySelectorAll('input[name="tb-pos"]').forEach(radio => {
            radio.onchange = (e) => {
                const pos = e.target.value;
                const taskbar = document.querySelector('.taskbar');
                if (taskbar) {
                    if (pos === 'top') {
                        taskbar.style.bottom = 'auto';
                        taskbar.style.top = '0';
                        taskbar.style.borderTop = 'none';
                        taskbar.style.borderBottom = '1px solid #444';
                        // Adjust windows start position slightly
                        document.querySelectorAll('.taskbar-flyout').forEach(panel => {
                            panel.style.bottom = 'auto';
                            panel.style.top = '52px';
                        });
                    } else {
                        taskbar.style.top = 'auto';
                        taskbar.style.bottom = '0';
                        taskbar.style.borderBottom = 'none';
                        taskbar.style.borderTop = '1px solid #444';
                        document.querySelectorAll('.taskbar-flyout').forEach(panel => {
                            panel.style.top = 'auto';
                            panel.style.bottom = '52px';
                        });
                    }
                }
            };
        });

        // Color Accent Picker
        const accentInput = win.querySelector('#settings-accent');
        accentInput.oninput = (e) => {
            const color = e.target.value;
            const styleTag = document.getElementById('custom-theme-styles') || document.createElement('style');
            styleTag.id = 'custom-theme-styles';
            document.head.appendChild(styleTag);
            
            // Retain other customizer values if any
            let css = `:root { --primary-color: ${color} !important; }`;
            styleTag.innerHTML = css;
        };
    },

    initBrowserApp: function(win) {
        const input = win.querySelector('.browser-input');
        const goBtn = win.querySelector('.browser-go-btn');
        const viewport = win.querySelector('.browser-frame-viewport');

        const navigate = () => {
            let url = input.value.trim();
            if (!url) return;

            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
                input.value = url;
            }

            viewport.innerHTML = `<div style="padding: 10px; text-align: center; color: #666; font-size: 13px;">🌐 Mock Loading <b>${escapeHtml(url)}</b>...</div>`;
            
            setTimeout(() => {
                let hostname = '';
                try {
                    const parsed = new URL(url);
                    hostname = parsed.hostname.toLowerCase();
                } catch (e) {
                    hostname = url.replace('https://', '').replace('http://', '').split('/')[0].toLowerCase();
                }

                const isGoogle = hostname === 'google.com' || hostname.endsWith('.google.com');
                const isWikipedia = hostname === 'wikipedia.org' || hostname.endsWith('.wikipedia.org');

                if (isGoogle) {
                    viewport.innerHTML = `
                        <div class="mock-google" style="text-align: center; margin-top: 40px; color: #333;">
                            <h1 style="color: #4285F4; font-size: 32px; font-family: sans-serif; margin-bottom: 20px;">Google</h1>
                            <input type="text" value="frankui css framework" style="width: 80%; max-width: 400px; padding: 10px; border: 1px solid #dfe1e5; border-radius: 24px; outline: none; margin-bottom: 10px;">
                            <div>
                                <button class="btn secondary btn-sm" style="margin: 5px;">Google Search</button>
                            </div>
                            <div style="margin-top: 20px; text-align: left; max-width: 450px; margin-left: auto; margin-right: auto; font-size: 13px;">
                                <div style="margin-bottom: 15px;">
                                    <a href="#" style="color: #1a0dab; text-decoration: none; font-size: 16px; font-weight: bold;">FrankUI Framework - Metro Inspired</a>
                                    <div style="color: #006621; font-size: 12px;">https://frankui.org</div>
                                    <div style="color: #545454;">FrankUI is a clean, modern, Metro-style design framework. Lightweight, simple, and extensible!</div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (isWikipedia) {
                    viewport.innerHTML = `
                        <div style="color: #222; font-family: serif; padding: 10px;">
                            <h2 style="border-bottom: 1px solid #a2a9b1; font-weight: normal; font-size: 26px;">FrankUI</h2>
                            <p style="font-size: 14px; line-height: 1.6;">From Wikipedia, the free encyclopedia.</p>
                            <p style="font-size: 14px; line-height: 1.6;"><b>FrankUI</b> is a Metro-inspired CSS/JS framework designed for responsive desktop-in-browser simulation environments. It includes accordion modules, modular tabs, draggable modal windows, a powerful custom taskbar, and highly-stylized CSS utilities.</p>
                        </div>
                    `;
                } else {
                    viewport.innerHTML = `
                        <div style="padding: 20px; text-align: center; color: #333;">
                            <h3 style="margin-bottom: 10px;">Successfully Connected to ${hostname}</h3>
                            <p style="font-size: 13px; color: #666; line-height: 1.5;">This is a sandbox viewport simulation. The mock website is rendering inside a safe environment.</p>
                            <div class="card" style="margin-top: 15px; text-align: left; padding: 10px; background: #f8f9fa;">
                                <b>Domain details:</b><br>
                                Secure Socket Layer (SSL): Active<br>
                                Response Time: 42ms<br>
                                Server: FrankUI-Virtual-Host
                            </div>
                        </div>
                    `;
                }
            }, 600);
        };

        goBtn.onclick = navigate;
        input.onkeydown = (e) => { if (e.key === 'Enter') navigate(); };
    },

    setupWindowObservers: function(container, centerEl) {
        // Track running windows and update indicators or list them in task list
        const updateTasks = () => {
            const runningWindows = container.querySelectorAll('.window');
            
            // Update pinned items active indicator
            const pinnedButtons = centerEl.querySelectorAll('.task-btn.pinned-app');
            pinnedButtons.forEach(btn => {
                const appId = btn.dataset.appId;
                const win = Array.from(runningWindows).find(w => w.dataset.appId === appId);
                if (win) {
                    btn.classList.add('running');
                    if (win.classList.contains('active-window') && !win.classList.contains('minimized')) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                    btn.oncontextmenu = (e) => {
                        this.showWindowContextMenu(e, win, btn);
                    };
                } else {
                    btn.classList.remove('running', 'active');
                    btn.oncontextmenu = null;
                }
            });

            // Handle unpinned apps / general tasks list
            // Remove existing non-pinned buttons
            centerEl.querySelectorAll('.task-btn.unpinned-task').forEach(b => b.remove());

            runningWindows.forEach(win => {
                // If it is a pinned app, the indicator is already updated
                if (win.dataset.appId && this.pinnedApps.some(app => app.id === win.dataset.appId)) {
                    return;
                }

                // If not pinned, dynamically list it as a running task
                const title = win.querySelector('.window-header span') ? win.querySelector('.window-header span').textContent : 'Window';
                const btn = document.createElement('div');
                btn.className = 'task-btn unpinned-task';
                if (win.classList.contains('active-window') && !win.classList.contains('minimized')) {
                    btn.classList.add('active');
                }
                btn.classList.add('running');
                btn.title = title;
                
                // Get an emoji/first letter for the task icon
                let iconChar = '🪟';
                if (title.toLowerCase().includes('welcome')) iconChar = '👋';
                if (title.toLowerCase().includes('help')) iconChar = 'ℹ️';

                btn.innerHTML = `
                    <span class="task-btn-icon">${iconChar}</span>
                    <span class="task-btn-title">${escapeHtml(title)}</span>
                    <span class="task-btn-indicator"></span>
                `;
                
                btn.onclick = () => {
                    this.toggleWindowMinMax(win);
                };

                btn.oncontextmenu = (e) => {
                    this.showWindowContextMenu(e, win, btn);
                };

                centerEl.appendChild(btn);
            });
        };

        // MutationObserver to observe window insertions/deletions/class changes
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach(mut => {
                // Ignore mutations inside the taskbar or its flyouts to avoid infinite feedback loops
                if (mut.target.closest('.taskbar') || mut.target.closest('.taskbar-flyout')) {
                    return;
                }

                if (mut.type === 'childList') {
                    // Check if any added/removed node is a window
                    const hasWindowChange = Array.from(mut.addedNodes).some(n => n.classList && n.classList.contains('window')) ||
                                            Array.from(mut.removedNodes).some(n => n.classList && n.classList.contains('window'));
                    if (hasWindowChange) {
                        shouldUpdate = true;
                    }
                } else if (mut.type === 'attributes') {
                    // Check if the attribute change is on a window
                    if (mut.target.classList && mut.target.classList.contains('window')) {
                        shouldUpdate = true;
                    }
                }
            });
            if (shouldUpdate) updateTasks();
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });

        // Handle custom windowCreated event
        container.addEventListener('windowCreated', () => {
            updateTasks();
        });

        // Run initial update
        updateTasks();
    },

    setupEventHandlers: function(startBtn, widgetsBtn, netBtn, volBtn, clock, container) {
        const toggleFlyout = (btn, selector) => {
            const panel = container.querySelector(selector);
            if (!panel) return;
            const isOpen = panel.classList.contains('open');

            this.closeAllFlyouts();

            if (!isOpen) {
                panel.classList.add('open');
                btn.classList.add('active-tray-btn');
                
                // Position panel directly above button
                const btnRect = btn.getBoundingClientRect();
                const parentRect = container.getBoundingClientRect();
                const isTop = document.querySelector('.taskbar').style.top === '0px';

                if (isTop) {
                    panel.style.top = '52px';
                    panel.style.bottom = 'auto';
                } else {
                    panel.style.bottom = '52px';
                    panel.style.top = 'auto';
                }

                // If aligning horizontally
                if (selector === '.widgets-panel') {
                    panel.style.left = `${btnRect.left - parentRect.left}px`;
                    panel.style.right = 'auto';
                } else if (selector === '.start-menu-panel') {
                    panel.style.left = `${btnRect.left - parentRect.left}px`;
                    panel.style.right = 'auto';
                } else {
                    // Tray flyouts (network, volume, calendar) align to the right
                    const rightOffset = parentRect.right - btnRect.right;
                    panel.style.right = `${rightOffset}px`;
                    panel.style.left = 'auto';
                }
            }
        };

        startBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFlyout(startBtn, '.start-menu-panel');
        };

        widgetsBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFlyout(widgetsBtn, '.widgets-panel');
        };

        netBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFlyout(netBtn, '.network-panel');
        };

        volBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFlyout(volBtn, '.volume-panel');
        };

        clock.onclick = (e) => {
            e.stopPropagation();
            toggleFlyout(clock, '.calendar-panel');
        };

        // Close on outside clicks
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.taskbar-flyout') && !e.target.closest('.taskbar') && !e.target.closest('.tray-item')) {
                this.closeAllFlyouts();
            }
        });

        // ESC key closes flyouts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllFlyouts();
            }
        });
    },

    closeAllFlyouts: function() {
        document.querySelectorAll('.taskbar-flyout').forEach(panel => {
            panel.classList.remove('open');
        });
        document.querySelectorAll('.taskbar-start-btn, .taskbar-widgets-btn, .tray-item, .taskbar-clock').forEach(btn => {
            btn.classList.remove('active-tray-btn');
        });
    },

    showWindowContextMenu: function(e, win, button) {
        e.preventDefault();
        e.stopPropagation();

        if (window.ContextMenu && typeof window.ContextMenu.hide === 'function') {
            window.ContextMenu.hide();
        } else {
            const existingMenu = document.querySelector('.context-menu');
            if (existingMenu) existingMenu.remove();
        }

        const rect = button.getBoundingClientRect();
        const buttonTop = rect.top + window.scrollY;
        const buttonLeft = rect.left + window.scrollX;

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.display = 'block';
        menu.style.left = `${buttonLeft}px`;

        const isMaximized = win.classList.contains('maximized');
        const isMinimized = win.classList.contains('minimized');

        const items = [
            {
                text: isMaximized ? 'Restore' : 'Maximize',
                icon: isMaximized ? '🔲' : '🔳',
                onclick: () => {
                    // Ensure any minimization animation/classes are cleared
                    if (win.classList.contains('minimized') || win.classList.contains('minimizing') || win.classList.contains('restoring')) {
                        if (typeof win.animateMinimize === 'function') {
                            win.animateMinimize(false);
                        } else {
                            win.classList.remove('minimized', 'minimizing', 'restoring');
                        }
                        win.dispatchEvent(new Event('mousedown'));
                    }
                    // Then toggle maximize state with animation
                    if (typeof win.animateMaximize === 'function') {
                        win.animateMaximize(!isMaximized);
                    } else {
                        win.classList.toggle('maximized');
                    }
                }
            },
            {
                text: isMinimized ? 'Restore' : 'Minimize',
                icon: isMinimized ? '🔲' : '➖',
                onclick: () => {
                    // If already minimized, restore; otherwise minimize
                    if (win.classList.contains('minimized')) {
                        // Restore
                        if (typeof win.animateMinimize === 'function') {
                            win.animateMinimize(false);
                        } else {
                            win.classList.remove('minimized');
                        }
                        win.dispatchEvent(new Event('mousedown'));
                    } else {
                        // Minimize
                        if (typeof win.animateMinimize === 'function') {
                            win.animateMinimize(true);
                        } else {
                            win.classList.add('minimized');
                        }
                    }
                }
            },
            {
                text: 'Close',
                icon: '❌',
                onclick: () => {
                    const btnClose = win.querySelector('.btn-close');
                    if (btnClose) {
                        btnClose.click();
                    } else {
                        win.remove();
                    }
                }
            }
        ];

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `<span><span class="icon" style="margin-right: 8px;">${item.icon}</span>${item.text}</span>`;
            menuItem.onclick = (event) => {
                event.stopPropagation();
                item.onclick();
                menu.remove();
            };
            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        // Adjust position dynamically to dropup above the clicked button
        const menuHeight = menu.offsetHeight;
        menu.style.top = `${buttonTop - menuHeight - 2}px`;

        const closeMenu = () => {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        };
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }
};

window.Taskbar = Taskbar;
