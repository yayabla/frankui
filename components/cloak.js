const Cloak = {
    init: function() {
        // Auto-reveal elements with the class 'cloak' that aren't set to manual control
        document.querySelectorAll('.cloak').forEach(el => {
            if (el.dataset.initialized) return;
            el.dataset.initialized = 'true';

            if (el.getAttribute('data-cloak-manual') !== 'true') {
                window.Cloak.show(el);
            }
        });
    },

    show: function(element) {
        if (!element) return;
        element.classList.add('remove-cloak');
        element.offsetHeight; // Force browser reflow to register transition
        element.classList.remove('cloak');
        element.classList.remove('add-cloak');

        const handleTransitionEnd = (e) => {
            if (e.propertyName === 'opacity') {
                element.classList.remove('remove-cloak');
                element.removeEventListener('transitionend', handleTransitionEnd);
            }
        };
        element.addEventListener('transitionend', handleTransitionEnd);
    },

    hide: function(element) {
        if (!element) return;
        element.classList.remove('remove-cloak');
        element.classList.add('add-cloak');

        const handleTransitionEnd = (e) => {
            if (e.propertyName === 'opacity') {
                element.classList.add('cloak');
                element.classList.remove('add-cloak');
                element.removeEventListener('transitionend', handleTransitionEnd);
            }
        };
        element.addEventListener('transitionend', handleTransitionEnd);
    }
};

window.Cloak = Cloak;
