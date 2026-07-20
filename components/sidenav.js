const Sidenav = {
    init: function() {
        document.querySelectorAll('[data-role="sidenav"]').forEach(sidenav => {
            if (sidenav.dataset.initialized) return;
            sidenav.dataset.initialized = 'true';
            sidenav.classList.add('sidenav');
        });
    }
};

window.Sidenav = Sidenav;
