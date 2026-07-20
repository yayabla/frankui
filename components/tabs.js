const Tabs = {
    init: function() {
        document.querySelectorAll('.tab-container').forEach(container => {
            if (container.dataset.initialized) return;
            container.dataset.initialized = 'true';
            // Only select direct child tab-buttons/content
            const btns = container.querySelectorAll(':scope > .tab-header > .tab-btn');
            const contents = container.querySelectorAll(':scope > .tab-content');
            
            const tabHeader = container.querySelector(':scope > .tab-header');
            if (tabHeader) tabHeader.setAttribute('role', 'tablist');

            btns.forEach((btn, i) => {
                const content = contents[i];
                const btnId = btn.id || `tab-btn-${Math.random().toString(36).substr(2, 9)}`;
                btn.id = btnId;
                btn.setAttribute('role', 'tab');
                
                const isActive = btn.classList.contains('active');
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
                btn.setAttribute('tabindex', isActive ? '0' : '-1');

                if (content) {
                    const contentId = content.id || `tab-content-${Math.random().toString(36).substr(2, 9)}`;
                    content.id = contentId;
                    content.setAttribute('role', 'tabpanel');
                    content.setAttribute('aria-labelledby', btnId);
                    content.setAttribute('tabindex', '0');
                    btn.setAttribute('aria-controls', contentId);
                }

                const activate = () => {
                    btns.forEach((b, idx) => {
                        const active = idx === i;
                        b.classList.toggle('active', active);
                        b.setAttribute('aria-selected', active ? 'true' : 'false');
                        b.setAttribute('tabindex', active ? '0' : '-1');
                        if (contents[idx]) {
                            contents[idx].classList.toggle('active', active);
                        }
                    });
                };

                btn.addEventListener('click', activate);
                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextBtn = btns[i + 1] || btns[0];
                        if (nextBtn) {
                            nextBtn.focus();
                            nextBtn.click();
                        }
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevBtn = btns[i - 1] || btns[btns.length - 1];
                        if (prevBtn) {
                            prevBtn.focus();
                            prevBtn.click();
                        }
                    }
                });
            });
        });
    }
};
window.Tabs = Tabs;
