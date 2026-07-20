class Pagination {
    constructor(element, options = {}) {
        this.container = typeof element === 'string' ? document.querySelector(element) : element;
        if (!this.container) return;

        this.options = Object.assign({
            page: 1,
            size: 10,
            totalPages: 1,
            maxVisible: 5
        }, options);

        // Inherit from data-attributes if present
        if (this.container.dataset.page) this.options.page = parseInt(this.container.dataset.page);
        if (this.container.dataset.size) this.options.size = parseInt(this.container.dataset.size);
        if (this.container.dataset.totalPages) this.options.totalPages = parseInt(this.container.dataset.totalPages);
        if (this.container.dataset.maxVisible) this.options.maxVisible = parseInt(this.container.dataset.maxVisible);

        this.init();
    }

    init() {
        this.container.classList.add('pagination-container');
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        const ul = document.createElement('ul');
        ul.className = 'pagination';

        const { page, totalPages, maxVisible } = this.options;

        // 1. Previous Button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${page <= 1 ? 'disabled' : ''}`;
        const prevA = document.createElement('a');
        prevA.className = 'page-link';
        prevA.textContent = 'Previous';
        prevA.addEventListener('click', (e) => {
            e.preventDefault();
            if (page > 1) this.changePage(page - 1);
        });
        prevLi.appendChild(prevA);
        ul.appendChild(prevLi);

        // 2. Generate Page Links (with ellipses if needed)
        const pages = this.getPageNumbers(page, totalPages, maxVisible);
        pages.forEach(p => {
            const li = document.createElement('li');
            
            if (p === '...') {
                li.className = 'page-item disabled';
                const span = document.createElement('a');
                span.className = 'page-link';
                span.textContent = '...';
                li.appendChild(span);
            } else {
                li.className = `page-item ${page === p ? 'active' : ''}`;
                const a = document.createElement('a');
                a.className = 'page-link';
                a.textContent = p;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (page !== p) this.changePage(p);
                });
                li.appendChild(a);
            }

            ul.appendChild(li);
        });

        // 3. Next Button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${page >= totalPages ? 'disabled' : ''}`;
        const nextA = document.createElement('a');
        nextA.className = 'page-link';
        nextA.textContent = 'Next';
        nextA.addEventListener('click', (e) => {
            e.preventDefault();
            if (page < totalPages) this.changePage(page + 1);
        });
        nextLi.appendChild(nextA);
        ul.appendChild(nextLi);

        this.container.appendChild(ul);
    }

    getPageNumbers(current, total, maxVisible) {
        const pages = [];

        if (total <= maxVisible + 2) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
            return pages;
        }

        // Always show page 1
        pages.push(1);

        const leftOffset = Math.floor(maxVisible / 2);
        let start = current - leftOffset;
        let end = current + leftOffset;

        // Balance boundary constraints
        if (start <= 2) {
            start = 2;
            end = maxVisible;
        }
        if (end >= total - 1) {
            end = total - 1;
            start = total - maxVisible + 1;
        }

        if (start > 2) {
            pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            if (i > 1 && i < total) {
                pages.push(i);
            }
        }

        if (end < total - 1) {
            pages.push('...');
        }

        // Always show last page
        if (total > 1) {
            pages.push(total);
        }

        return pages;
    }

    changePage(newPage) {
        this.options.page = newPage;
        
        // Sync attributes for consistency
        this.container.dataset.page = newPage;

        this.render();

        // Dispatch selection event
        this.container.dispatchEvent(new CustomEvent('change', {
            detail: {
                page: this.options.page,
                size: this.options.size,
                totalPages: this.options.totalPages
            }
        }));
    }

    static scan(scope = document) {
        scope.querySelectorAll('[data-role="pagination"]').forEach(el => {
            if (el.dataset.initialized) return;
            el.dataset.initialized = 'true';
            new Pagination(el);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Pagination.scan();
});

window.Pagination = Pagination;
