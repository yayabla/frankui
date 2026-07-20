/* Alert Component Javascript */

const Alert = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        // Auto-inject close button into dismissible alerts
        this.setupDismissibleAlerts();

        // Global delegated listener for alert close buttons
        document.body.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.alert .btn-close');
            if (closeBtn) {
                e.preventDefault();
                const alertEl = closeBtn.closest('.alert');
                if (alertEl) {
                    this.dismiss(alertEl);
                }
            }
        });
    },

    setupDismissibleAlerts: function() {
        document.querySelectorAll('.alert.dismissible').forEach(alertEl => {
            if (!alertEl.querySelector('.btn-close')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'btn-close';
                closeBtn.innerHTML = '&times;';
                alertEl.appendChild(closeBtn);
            }
        });
    },

    dismiss: function(alertEl) {
        if (!alertEl) return;
        
        // Trigger CSS transition fadeout
        alertEl.classList.add('dismissing');
        
        const onTransitionEnd = () => {
            alertEl.dispatchEvent(new CustomEvent('closed.frankui.alert', { bubbles: true }));
            alertEl.remove();
        };

        // Wait for transition if it exists, otherwise remove immediately
        const style = window.getComputedStyle(alertEl);
        const duration = parseFloat(style.transitionDuration) || 0;
        if (duration > 0) {
            alertEl.addEventListener('transitionend', onTransitionEnd, { once: true });
        } else {
            onTransitionEnd();
        }
    }
};

window.Alert = Alert;
