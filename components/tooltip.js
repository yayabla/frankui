const Tooltip = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        document.body.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip="true"], .tooltip, [title]');
            if (!target) return;

            // If we are hovering inside the same target, do nothing
            if (target.dataset.tooltipElement === 'true') return;

            const message = target.getAttribute('data-tooltip-message') || target.getAttribute('title');
            if (!message) return;

            // Remove any existing tooltips first to avoid duplicates
            const existingTooltip = document.querySelector('.frank-tooltip');
            if (existingTooltip) {
                const prevTarget = document.querySelector('[data-tooltip-element="true"]');
                if (prevTarget && prevTarget !== target) {
                    if (prevTarget.dataset.originalTitle) {
                        prevTarget.setAttribute('title', prevTarget.dataset.originalTitle);
                        delete prevTarget.dataset.originalTitle;
                    }
                    delete prevTarget.dataset.tooltipElement;
                }
                existingTooltip.remove();
            }

            // Store original title to avoid browser default tooltip
            if (target.hasAttribute('title')) {
                target.dataset.originalTitle = target.getAttribute('title');
                target.removeAttribute('title');
            }

            const tooltip = document.createElement('div');
            tooltip.className = 'frank-tooltip';
            
            const customClass = target.getAttribute('data-tooltip-class');
            if (customClass) {
                customClass.split(' ').forEach(cls => {
                    if (cls.trim()) tooltip.classList.add(cls.trim());
                });
            }
            
            const isHtml = target.getAttribute('data-tooltip-html') === 'true';
            if (isHtml) {
                tooltip.innerHTML = FrankUI.sanitizeHtml(message);
                tooltip.classList.add('html-content');
            } else {
                tooltip.textContent = message;
            }
            
            document.body.appendChild(tooltip);

            const rect = target.getBoundingClientRect();
            const position = target.dataset.tooltipPosition || 'top';
            
            let left, top;
            switch(position) {
                case 'right':
                    left = rect.right + window.scrollX + 5;
                    top = rect.top + window.scrollY + (rect.height / 2) - (tooltip.offsetHeight / 2);
                    break;
                case 'bottom':
                    left = rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2);
                    top = rect.bottom + window.scrollY + 5;
                    break;
                case 'left':
                    left = rect.left + window.scrollX - tooltip.offsetWidth - 5;
                    top = rect.top + window.scrollY + (rect.height / 2) - (tooltip.offsetHeight / 2);
                    break;
                case 'top':
                default:
                    left = rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2);
                    top = rect.top + window.scrollY - tooltip.offsetHeight - 5;
                    break;
            }
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            tooltip.classList.add('active');
            
            target.dataset.tooltipElement = 'true';
        });

        document.body.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip-element="true"]');
            if (!target) return;

            // If we are moving to a child of the target, ignore and keep tooltip visible
            if (e.relatedTarget && target.contains(e.relatedTarget)) {
                return;
            }

            const tooltip = document.querySelector('.frank-tooltip');
            if (tooltip) tooltip.remove();

            if (target.dataset.originalTitle) {
                target.setAttribute('title', target.dataset.originalTitle);
                delete target.dataset.originalTitle;
            }
            delete target.dataset.tooltipElement;
        });
    }
};

window.Tooltip = Tooltip;
