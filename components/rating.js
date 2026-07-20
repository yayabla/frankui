const Rating = {
    init: function() {
        document.querySelectorAll('input[data-role="rating"]').forEach(input => {
            if (input.dataset.initialized) return;
            input.dataset.initialized = 'true';
            input.style.display = 'none';
            const starsContainer = document.createElement('div');
            starsContainer.className = 'rating';
            
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.className = 'star';
                star.innerHTML = '&#9733;'; // Unicode star
                star.dataset.value = i;
                
                star.addEventListener('click', () => {
                    input.value = i;
                    this.updateStars(starsContainer, i);
                });
                
                starsContainer.appendChild(star);
            }
            
            input.parentNode.insertBefore(starsContainer, input.nextSibling);
        });
    },
    
    updateStars: function(container, value) {
        container.querySelectorAll('.star').forEach(star => {
            star.classList.toggle('active', parseInt(star.dataset.value) <= value);
        });
    }
};

window.Rating = Rating;
