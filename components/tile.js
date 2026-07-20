/* Live Tiles Component Javascript */

const Tile = {
    init: function() {
        document.querySelectorAll('[data-role="tile"]').forEach(tile => {
            if (tile.dataset.initialized) return;
            tile.dataset.initialized = 'true';

            const effect = tile.dataset.effect || 'slide'; // 'flip' or 'slide'
            const interval = parseInt(tile.dataset.interval || '3000', 10);

            if (effect === 'slide') {
                this.setupSlide(tile, interval);
            } else if (effect === 'flip') {
                this.setupFlip(tile, interval);
            }
        });
    },

    setupSlide: function(tile, interval) {
        const slides = tile.querySelectorAll('.tile-slide');
        if (slides.length <= 1) return;

        let currentIndex = 0;
        // Make the first slide active
        slides[currentIndex].classList.add('active');

        setInterval(() => {
            slides[currentIndex].classList.remove('active');
            slides[currentIndex].classList.add('out');

            const prevIndex = currentIndex;
            currentIndex = (currentIndex + 1) % slides.length;

            slides[currentIndex].classList.remove('out');
            slides[currentIndex].classList.add('active');

            // Remove the 'out' class after transition completes
            setTimeout(() => {
                slides[prevIndex].classList.remove('out');
            }, 600); // matches transition time
        }, interval);
    },

    setupFlip: function(tile, interval) {
        setInterval(() => {
            tile.classList.toggle('flipped');
        }, interval);
    }
};

window.Tile = Tile;
