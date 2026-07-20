const Splitter = {
    init: function() {
        document.querySelectorAll('[data-role="splitter"], .splitter').forEach(el => {
            this.initSplitter(el);
        });
    },

    initSplitter: function(container) {
        if (container.dataset.initialized) return;
        container.dataset.initialized = 'true';

        // Add splitter class if not present
        container.classList.add('splitter');

        const mode = container.dataset.splitMode || 'horizontal';
        container.setAttribute('data-split-mode', mode);

        // Get direct child panels (ignoring any existing gutters)
        const panels = Array.from(container.children).filter(child => {
            return !child.classList.contains('splitter-gutter');
        });

        if (panels.length === 0) return;

        // Apply panel classes
        panels.forEach(panel => {
            panel.classList.add('splitter-panel');
        });

        const N = panels.length;

        // Parse initial sizes
        let sizes = [];
        if (container.dataset.splitSizes) {
            sizes = container.dataset.splitSizes.split(',').map(s => parseFloat(s.strip ? s.strip() : s.trim()));
        } else {
            // Equal share
            const equalSize = 100 / N;
            sizes = Array(N).fill(equalSize);
        }

        // Apply initial dimensions
        panels.forEach((panel, i) => {
            const size = sizes[i] || (100 / N);
            if (mode === 'horizontal') {
                panel.style.width = `${size}%`;
                panel.style.height = '100%';
            } else {
                panel.style.height = `${size}%`;
                panel.style.width = '100%';
            }
        });

        // Parse minimum sizes (in pixels, default 50px)
        let minSizes = [];
        if (container.dataset.minSizes) {
            minSizes = container.dataset.minSizes.split(',').map(s => parseFloat(s.strip ? s.strip() : s.trim()));
        }

        // Insert gutters between panels
        const gutters = [];
        for (let i = 0; i < N - 1; i++) {
            const gutter = document.createElement('div');
            gutter.className = 'splitter-gutter';
            
            // Insert gutter right after current panel
            panels[i].insertAdjacentElement('afterend', gutter);
            gutters.push(gutter);

            // Drag event handler
            gutter.addEventListener('mousedown', (e) => {
                e.preventDefault();

                const prevPanel = panels[i];
                const nextPanel = panels[i + 1];

                const prevRect = prevPanel.getBoundingClientRect();
                const nextRect = nextPanel.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const minSizePrev = minSizes[i] !== undefined ? minSizes[i] : 50;
                const minSizeNext = minSizes[i + 1] !== undefined ? minSizes[i + 1] : 50;

                gutter.classList.add('dragging');
                container.classList.add('dragging');

                let totalSize, minBound, maxBound, containerSize;

                if (mode === 'horizontal') {
                    totalSize = prevRect.width + nextRect.width;
                    minBound = prevRect.left;
                    maxBound = nextRect.right;
                    containerSize = containerRect.width;
                } else {
                    totalSize = prevRect.height + nextRect.height;
                    minBound = prevRect.top;
                    maxBound = nextRect.bottom;
                    containerSize = containerRect.height;
                }

                const onMouseMove = (moveEvent) => {
                    let mousePos = (mode === 'horizontal') ? moveEvent.clientX : moveEvent.clientY;

                    // Constrain mouse inside bounds with min sizes
                    const minClamp = minBound + minSizePrev;
                    const maxClamp = maxBound - minSizeNext;
                    mousePos = Math.max(minClamp, Math.min(mousePos, maxClamp));

                    const prevSize = mousePos - minBound;
                    const nextSize = maxBound - mousePos;

                    const prevPercent = (prevSize / containerSize) * 100;
                    const nextPercent = (nextSize / containerSize) * 100;

                    if (mode === 'horizontal') {
                        prevPanel.style.width = `${prevPercent}%`;
                        nextPanel.style.width = `${nextPercent}%`;
                    } else {
                        prevPanel.style.height = `${prevPercent}%`;
                        nextPanel.style.height = `${nextPercent}%`;
                    }

                    // Dispatch layout change event
                    container.dispatchEvent(new CustomEvent('splitter:resize', {
                        detail: { index: i, prevPercent, nextPercent }
                    }));
                };

                const onMouseUp = () => {
                    gutter.classList.remove('dragging');
                    container.classList.remove('dragging');
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        }
    }
};

window.Splitter = Splitter;
