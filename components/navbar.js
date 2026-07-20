const Navbar = {
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        document.body.addEventListener('click', (e) => {
            const toggle = e.target.closest('.navbar-toggle');
            if (toggle) {
                e.preventDefault();
                e.stopPropagation();
                const navbar = toggle.closest('.navbar');
                if (navbar) {
                    navbar.classList.toggle('open');
                }
            }
        });
    }
};

window.Navbar = Navbar;
