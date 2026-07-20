const Collapse = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        document.querySelectorAll('details[data-role="collapse"]').forEach(details => {
            const summary = details.querySelector('summary');
            const content = details.querySelector('.collapse-content');
            if (!summary || !content) return;

            details.dataset.animating = 'false';

            summary.addEventListener('click', (e) => {
                e.preventDefault(); // Intercept browser default jump toggle
                
                if (details.dataset.animating === 'true') return;
                
                if (details.open) {
                    this.close(details, content);
                } else {
                    this.open(details, content);
                }
            });
        });
    },

    open: function(details, content) {
        details.dataset.animating = 'true';
        details.open = true;

        const endHeight = content.scrollHeight;

        content.style.height = '0px';
        content.style.overflow = 'hidden';
        
        // Force reflow
        content.offsetHeight;

        content.style.transition = 'height 0.3s ease-out';
        content.style.height = `${endHeight}px`;

        let completed = false;
        let safetyTimeout = setTimeout(() => {
            onEnd();
        }, 350);

        const onEnd = () => {
            if (completed) return;
            completed = true;
            clearTimeout(safetyTimeout);
            content.style.height = '';
            content.style.overflow = '';
            content.style.transition = '';
            details.dataset.animating = 'false';
            content.removeEventListener('transitionend', onEnd);
        };
        content.addEventListener('transitionend', onEnd);
    },

    close: function(details, content) {
        details.dataset.animating = 'true';
        
        const startHeight = content.offsetHeight;
        
        content.style.height = `${startHeight}px`;
        content.style.overflow = 'hidden';

        // Force reflow
        content.offsetHeight;

        content.style.transition = 'height 0.3s ease-out';
        content.style.height = '0px';

        let completed = false;
        let safetyTimeout = setTimeout(() => {
            onEnd();
        }, 350);

        const onEnd = () => {
            if (completed) return;
            completed = true;
            clearTimeout(safetyTimeout);
            details.open = false;
            content.style.height = '';
            content.style.overflow = '';
            content.style.transition = '';
            details.dataset.animating = 'false';
            content.removeEventListener('transitionend', onEnd);
        };
        content.addEventListener('transitionend', onEnd);
    }
};

window.Collapse = Collapse;
