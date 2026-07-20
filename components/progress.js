const Progress = {
    init: function() {
        document.querySelectorAll('[data-role="progress"]').forEach(el => {
            if (el.dataset.initialized) return;
            el.dataset.initialized = 'true';

            const type = el.dataset.type || 'bar';
            const value = parseFloat(el.dataset.value) || 0;
            const buffer = parseFloat(el.dataset.buffer) || 0;

            el.className = `progress ${type}`;

            if (type === 'bar') {
                el.innerHTML = `<div class="progress-bar" style="width: ${value}%"></div>`;
            } else if (type === 'buffer') {
                el.innerHTML = `
                    <div class="progress-buffer" style="width: ${buffer}%"></div>
                    <div class="progress-bar" style="width: ${value}%"></div>
                `;
            } else if (type === 'ring') {
                // Classic Metro circular progress ring with 5 rotating dots
                el.innerHTML = `
                    <div class="progress-ring-wrap">
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="circle"></div>
                        <div class="circle"></div>
                    </div>
                `;
            } else if (type === 'indeterminate') {
                // Classic Metro horizontal indeterminate bar with 5 sliding dots
                el.innerHTML = `
                    <div class="progress-indeterminate-wrap">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                `;
            }
        });
    },

    // A utility method to dynamically update progress value
    setValue: function(el, value) {
        if (typeof el === 'string') {
            el = document.querySelector(el);
        }
        if (el) {
            el.dataset.value = value;
            const progressBar = el.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${value}%`;
            }
        }
    }
};

window.Progress = Progress;
