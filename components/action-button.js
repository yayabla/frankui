const ActionButton = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        document.body.addEventListener('click', (e) => {
            const mainAction = e.target.closest('.main-action');
            if (mainAction) {
                e.preventDefault();
                e.stopPropagation();
                const container = mainAction.closest('[data-role="action-button"]');
                if (container) {
                    this.toggle(container);
                }
                return;
            }

            // Close all open action buttons if clicking outside
            this.closeAll();
        });
    },

    toggle: function(container) {
        const isActive = container.classList.contains('active');
        this.closeAll();
        
        if (!isActive) {
            this.calculatePositions(container);
            container.classList.add('active');
        }
    },

    calculatePositions: function(container) {
        const startAngle = parseFloat(container.getAttribute('data-angle-start')) !== undefined && !isNaN(parseFloat(container.getAttribute('data-angle-start'))) ? parseFloat(container.getAttribute('data-angle-start')) : 0;
        const endAngle = parseFloat(container.getAttribute('data-angle-end')) !== undefined && !isNaN(parseFloat(container.getAttribute('data-angle-end'))) ? parseFloat(container.getAttribute('data-angle-end')) : 360;
        const radius = parseFloat(container.getAttribute('data-radius')) || 80;
        
        const items = container.querySelectorAll('.actions li');
        const n = items.length;
        if (n === 0) return;

        items.forEach((item, index) => {
            let angle;
            // If it covers a full circle, distribute steps as 360/n
            if (Math.abs(endAngle - startAngle) >= 360) {
                angle = startAngle + (index * (360 / n));
            } else {
                // Otherwise distribute over the arc segment
                angle = n > 1 ? startAngle + (index * (endAngle - startAngle) / (n - 1)) : startAngle;
            }

            // Convert angle to radians
            const rad = (angle * Math.PI) / 180;
            const x = Math.round(radius * Math.cos(rad));
            const y = Math.round(radius * Math.sin(rad));

            // Set positions as CSS custom properties
            item.style.setProperty('--x', `${x}px`);
            item.style.setProperty('--y', `${y}px`);
        });
    },

    closeAll: function() {
        document.querySelectorAll('[data-role="action-button"].active').forEach(c => {
            c.classList.remove('active');
        });
    }
};

window.ActionButton = ActionButton;
