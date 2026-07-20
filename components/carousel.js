const Carousel = {
    init: function() {
        document.querySelectorAll('[data-role="carousel"], .carousel').forEach(el => {
            this.initCarousel(el);
        });
    },

    initCarousel: function(container) {
        if (container.dataset.initialized) return;
        container.dataset.initialized = 'true';

        const items = Array.from(container.querySelectorAll('.carousel-item'));
        const indicators = Array.from(container.querySelectorAll('.carousel-indicators li'));
        const prevBtn = container.querySelector('.carousel-control-prev');
        const nextBtn = container.querySelector('.carousel-control-next');

        if (items.length === 0) return;

        let activeIdx = items.findIndex(item => item.classList.contains('active'));
        if (activeIdx === -1) {
            activeIdx = 0;
            items[0].classList.add('active');
        }

        const showSlide = (idx) => {
            items[activeIdx].classList.remove('active');
            if (indicators[activeIdx]) indicators[activeIdx].classList.remove('active');

            activeIdx = (idx + items.length) % items.length;

            items[activeIdx].classList.add('active');
            if (indicators[activeIdx]) indicators[activeIdx].classList.add('active');
        };

        // Prev / Next bindings
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showSlide(activeIdx - 1);
                resetInterval();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showSlide(activeIdx + 1);
                resetInterval();
            });
        }

        // Indicators bindings
        indicators.forEach((indicator, idx) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                showSlide(idx);
                resetInterval();
            });
        });

        // Auto slide interval logic
        const intervalTime = parseInt(container.dataset.interval) || 5000;
        let slideTimer = null;

        const startInterval = () => {
            if (intervalTime > 0) {
                slideTimer = setInterval(() => {
                    showSlide(activeIdx + 1);
                }, intervalTime);
            }
        };

        const resetInterval = () => {
            if (slideTimer) {
                clearInterval(slideTimer);
                startInterval();
            }
        };

        startInterval();
    }
};

window.Carousel = Carousel;
