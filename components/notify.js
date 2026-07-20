// FrankUI Notify Module
const Notify = {
    containers: {},

    getContainer: function(position = 'top-right') {
        if (this.containers[position]) return this.containers[position];

        const container = document.createElement('div');
        container.className = `notify-container ${position}`;
        document.body.appendChild(container);
        this.containers[position] = container;
        return container;
    },

    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        // Prepare default top-right container
        this.getContainer('top-right');
    },

    create: function(content, title = "", options = {}) {
        const position = options.position || options.pos || 'top-right';
        const container = this.getContainer(position);

        const notify = document.createElement('div');
        notify.className = `notify ${options.clsNotify || 'info'}`;
        if (options.width) {
            notify.style.width = `${options.width}px`;
        }

        const showClose = options.closeButton !== false;
        if (showClose) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'notify-close';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => {
                this.dismiss(notify);
            });
            notify.appendChild(closeBtn);
        }

        if (title) {
            const header = document.createElement('div');
            header.className = 'notify-header';
            header.textContent = title;
            notify.appendChild(header);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'notify-content';
        if (options.htmlContent) {
            contentDiv.innerHTML = content;
        } else {
            contentDiv.textContent = content;
        }
        notify.appendChild(contentDiv);

        container.appendChild(notify);

        if (!options.keepOpen) {
            const delay = options.duration || options.timeout || 3000;
            setTimeout(() => this.dismiss(notify), delay);
        }

        return notify;
    },

    dismiss: function(notify) {
        if (!notify || notify.classList.contains('dismissing')) return;
        notify.classList.add('dismissing');

        const onTransitionEnd = () => {
            notify.remove();
        };

        const style = window.getComputedStyle(notify);
        const duration = parseFloat(style.transitionDuration) || parseFloat(style.animationDuration) || 0;
        if (duration > 0) {
            notify.addEventListener('animationend', onTransitionEnd, { once: true });
            notify.addEventListener('transitionend', onTransitionEnd, { once: true });
            // Fallback safety timeout
            setTimeout(onTransitionEnd, duration * 1000 + 50);
        } else {
            onTransitionEnd();
        }
    }
};

window.FrankUI = window.FrankUI || {};
window.FrankUI.notify = Notify;
window.Notify = Notify;
