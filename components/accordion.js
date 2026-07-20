const Accordion = {
    init: function() {
        document.querySelectorAll('.accordion').forEach(accordion => {
            if (accordion.dataset.initialized) return;
            accordion.dataset.initialized = 'true';
            const headers = accordion.querySelectorAll('.accordion-header');
            const contents = accordion.querySelectorAll('.accordion-content');
            let selected = -1;

            accordion.setAttribute('role', 'presentation');

            headers.forEach((header, index) => {
                const content = contents[index];
                if (!content) return;

                const headerId = header.id || `accordion-header-${Math.random().toString(36).substr(2, 9)}`;
                const contentId = content.id || `accordion-content-${Math.random().toString(36).substr(2, 9)}`;

                header.id = headerId;
                header.setAttribute('role', 'button');
                header.setAttribute('tabindex', '0');
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('aria-controls', contentId);

                content.id = contentId;
                content.setAttribute('role', 'region');
                content.setAttribute('aria-labelledby', headerId);

                // Set initial active state if class active is present
                if (content.classList.contains('active')) {
                    header.setAttribute('aria-expanded', 'true');
                    selected = index;
                }

                const toggle = () => {
                    const oldValue = selected;
                    
                    if (selected === index) {
                        content.classList.remove('active');
                        header.setAttribute('aria-expanded', 'false');
                        selected = -1;
                    } else {
                        if (selected !== -1 && contents[selected]) {
                            contents[selected].classList.remove('active');
                            headers[selected].setAttribute('aria-expanded', 'false');
                        }
                        content.classList.add('active');
                        header.setAttribute('aria-expanded', 'true');
                        selected = index;
                    }
                    console.log(`Accordion state change: old=${oldValue}, new=${selected}`);
                };

                header.addEventListener('click', toggle);
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle();
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = headers[index + 1] || headers[0];
                        if (next) next.focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = headers[index - 1] || headers[headers.length - 1];
                        if (prev) prev.focus();
                    }
                });
            });
        });
    }
};

window.Accordion = Accordion;
