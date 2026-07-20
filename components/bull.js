const Bull = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        document.querySelectorAll('[data-role="bull"]').forEach(el => {
            this.render(el);
        });
    },

    render: function(el) {
        if (el.dataset.rendered) return;
        el.dataset.rendered = 'true';

        const type = el.getAttribute('data-type') || 'info';
        const size = el.getAttribute('data-size') || '18';
        
        let svgHtml = '';

        if (type === 'success') {
            svgHtml = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="bull-svg">
                <circle cx="12" cy="12" r="10" class="bull-bg bull-color-success" />
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#ffffff" />
            </svg>`;
        } else if (type === 'pending') {
            svgHtml = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="bull-svg">
                <circle cx="12" cy="12" r="9" fill="none" class="bull-stroke bull-stroke-warning" stroke-width="2" />
                <circle cx="12" cy="12" r="4.5" class="bull-bg bull-color-warning" />
            </svg>`;
        } else if (type === 'fail' || type === 'failure' || type === 'danger') {
            svgHtml = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="bull-svg">
                <circle cx="12" cy="12" r="10" class="bull-bg bull-color-danger" />
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#ffffff" />
            </svg>`;
        } else if (type === 'warning') {
            svgHtml = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="bull-svg">
                <path d="M12 2L2 22h20L12 2z" class="bull-bg bull-color-warning" />
                <rect x="11" y="9" width="2" height="5" fill="#ffffff" rx="0.5" />
                <circle cx="12" cy="16.5" r="1.2" fill="#ffffff" />
            </svg>`;
        } else if (type === 'info') {
            svgHtml = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="bull-svg">
                <circle cx="12" cy="12" r="10" class="bull-bg bull-color-info" />
                <path d="M12 17h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#ffffff" />
            </svg>`;
        } else if (type === 'bulb') {
            // Glowing bulb indicator
            const colorClass = el.getAttribute('data-color-class') || 'bull-color-success';
            svgHtml = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="bull-svg bull-bulb-svg">
                <circle cx="12" cy="12" r="8" class="bull-bg ${colorClass} bull-glow" />
            </svg>`;
        } else {
            // Default simple colored bullet
            svgHtml = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="bull-svg">
                <circle cx="12" cy="12" r="7" fill="currentColor" />
            </svg>`;
        }

        el.innerHTML = svgHtml;
    }
};

window.Bull = Bull;
