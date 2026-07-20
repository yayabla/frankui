const Select = {
    init: function() {
        if (!this.clickListenerBound) {
            this.clickListenerBound = true;
            document.addEventListener('click', (e) => {
                document.querySelectorAll('.fancy-select-header.open').forEach(header => {
                    const wrapper = header.closest('.fancy-select-wrapper');
                    if (wrapper && !wrapper.contains(e.target)) {
                        header.classList.remove('open');
                        const dropdown = wrapper.querySelector('.fancy-select-dropdown');
                        if (dropdown) dropdown.style.display = 'none';
                    }
                });
            });
        }
        document.querySelectorAll('select[data-role="select"]').forEach(sel => {
            if (sel.dataset.initialized) return;
            sel.dataset.initialized = 'true';
            this.loadRemoteData(sel);
        });
    },

    loadRemoteData: function(sel) {
        const source = sel.getAttribute('data-source');
        if (!source) return;

        const method = (sel.getAttribute('data-source-method') || 'GET').toUpperCase();
        const rawParams = sel.getAttribute('data-source-params') || '';
        
        let url = source;
        let fetchOptions = {
            method: method,
            headers: {}
        };

        if (method === 'GET') {
            if (rawParams) {
                const separator = url.includes('?') ? '&' : '?';
                url += separator + rawParams;
            }
        } else if (method === 'POST') {
            if (rawParams) {
                // If it is JSON format, send as JSON body
                if (rawParams.trim().startsWith('{') || rawParams.trim().startsWith('[')) {
                    fetchOptions.headers['Content-Type'] = 'application/json';
                    fetchOptions.body = rawParams;
                } else {
                    // Send as urlencoded query params body
                    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    fetchOptions.body = new URLSearchParams(rawParams).toString();
                }
            }
        }

        fetch(url, fetchOptions)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                this.populateSelect(sel, data);
                // Dispatch event when data is successfully loaded
                sel.dispatchEvent(new CustomEvent('selectDataLoaded', { detail: data }));
            })
            .catch(err => {
                console.error('FrankUI Select Error:', err);
                sel.innerHTML = `<option value="">Error loading options</option>`;
            });
    },

    populateSelect: function(sel, data) {
        // Keep placeholder if present (first option with empty value or custom attribute) and not "loading"
        const placeholderOption = sel.querySelector('option[value=""], option:not([value])');
        let placeholderHtml = '';
        if (placeholderOption && !placeholderOption.textContent.toLowerCase().includes('loading')) {
            placeholderHtml = placeholderOption.outerHTML;
        }
        
        sel.innerHTML = placeholderHtml;

        if (Array.isArray(data)) {
            data.forEach(item => {
                const option = document.createElement('option');
                if (typeof item === 'object' && item !== null) {
                    const value = item.value !== undefined ? item.value : (item.id !== undefined ? item.id : '');
                    const text = item.text !== undefined ? item.text : (item.name !== undefined ? item.name : (item.title !== undefined ? item.title : value));
                    option.value = value;
                    option.textContent = text;
                } else {
                    option.value = item;
                    option.textContent = item;
                }
                sel.appendChild(option);
            });
        }
    },

    fancy: function(sel) {
        if (!sel || sel.tagName !== 'SELECT') return;
        if (sel.dataset.fancyInitialized) return;
        sel.dataset.fancyInitialized = 'true';

        // Hide original select
        sel.style.display = 'none';

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'fancy-select-wrapper';
        sel.parentNode.insertBefore(wrapper, sel);
        wrapper.appendChild(sel);

        // Create header
        const header = document.createElement('div');
        header.className = 'fancy-select-header';
        header.setAttribute('role', 'combobox');
        header.setAttribute('aria-haspopup', 'listbox');
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('tabindex', '0');
        wrapper.appendChild(header);

        // Create dropdown container
        const dropdown = document.createElement('div');
        dropdown.className = 'fancy-select-dropdown';
        wrapper.appendChild(dropdown);

        // Create search container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'fancy-select-search-container';
        dropdown.appendChild(searchContainer);

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'fancy-select-search-input';
        searchInput.placeholder = sel.getAttribute('data-placeholder') || 'Search...';
        searchContainer.appendChild(searchInput);

        const searchIcon = document.createElement('span');
        searchIcon.className = 'fancy-select-search-icon';
        searchIcon.innerHTML = '🔍';
        searchContainer.appendChild(searchIcon);

        // Create options container
        const optionsContainer = document.createElement('ul');
        optionsContainer.className = 'fancy-select-options';
        optionsContainer.setAttribute('role', 'listbox');
        dropdown.appendChild(optionsContainer);

        // Function to update the header text and arrow
        const updateHeader = () => {
            const selectedOption = sel.options[sel.selectedIndex];
            const text = selectedOption ? selectedOption.textContent : (sel.getAttribute('data-placeholder') || 'Choose an option...');
            const arrow = dropdown.style.display === 'block' ? '▲' : '▼';
            header.innerHTML = `<span>${FrankUI.escapeHtml(text)}</span><span class="fancy-select-arrow">${arrow}</span>`;
        };

        // Function to rebuild the custom options list
        const rebuildOptions = () => {
            optionsContainer.innerHTML = '';
            Array.from(sel.options).forEach((opt, idx) => {
                const li = document.createElement('li');
                li.className = 'fancy-select-option';
                li.setAttribute('role', 'option');
                li.setAttribute('aria-selected', idx === sel.selectedIndex ? 'true' : 'false');
                li.textContent = opt.textContent;
                li.dataset.index = idx;
                
                if (idx === sel.selectedIndex) {
                    li.classList.add('selected');
                }

                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sel.selectedIndex = idx;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    closeDropdown();
                });

                optionsContainer.appendChild(li);
            });
            updateHeader();
        };

        // Toggle dropdown
        const toggleDropdown = () => {
            if (dropdown.style.display === 'block') {
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        const openDropdown = () => {
            document.querySelectorAll('.fancy-select-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.style.display = 'none';
                    const prevHdr = d.previousSibling;
                    if (prevHdr && prevHdr.classList) {
                        prevHdr.classList.remove('open');
                        if (typeof prevHdr.setAttribute === 'function') {
                            prevHdr.setAttribute('aria-expanded', 'false');
                        }
                    }
                }
            });

            dropdown.style.display = 'block';
            header.classList.add('open');
            header.setAttribute('aria-expanded', 'true');
            updateHeader();
            searchInput.value = '';
            filterOptions('');
            setTimeout(() => searchInput.focus(), 50);
        };

        const closeDropdown = () => {
            dropdown.style.display = 'none';
            header.classList.remove('open');
            header.setAttribute('aria-expanded', 'false');
            updateHeader();
        };

        // Filter options based on search input
        const filterOptions = (query) => {
            const items = optionsContainer.querySelectorAll('.fancy-select-option');
            const cleanQuery = query.toLowerCase().trim();
            let firstMatch = null;

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(cleanQuery)) {
                    item.style.display = '';
                    if (!firstMatch) firstMatch = item;
                } else {
                    item.style.display = 'none';
                }
            });

            items.forEach(item => item.classList.remove('hovered'));
            if (firstMatch) {
                firstMatch.classList.add('hovered');
            }
        };

        // Event listeners
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        searchInput.addEventListener('input', (e) => {
            filterOptions(e.target.value);
        });



        // Handle change event on the original select
        sel.addEventListener('change', () => {
            const items = optionsContainer.querySelectorAll('.fancy-select-option');
            items.forEach((item, idx) => {
                if (idx === sel.selectedIndex) {
                    item.classList.add('selected');
                    item.setAttribute('aria-selected', 'true');
                } else {
                    item.classList.remove('selected');
                    item.setAttribute('aria-selected', 'false');
                }
            });
            updateHeader();
        });

        // MutationObserver to watch for changes to the original select's options
        const observer = new MutationObserver(() => {
            rebuildOptions();
        });
        observer.observe(sel, { childList: true, subtree: true });

        // Initial build
        rebuildOptions();
    },

    multifancy: function(sel) {
        if (!sel || sel.tagName !== 'SELECT' || !sel.multiple) return;
        if (sel.dataset.fancyInitialized) return;
        sel.dataset.fancyInitialized = 'true';

        // Hide original select
        sel.style.display = 'none';

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'fancy-select-wrapper fancy-select-multi';
        sel.parentNode.insertBefore(wrapper, sel);
        wrapper.appendChild(sel);

        // Create header/tag container
        const header = document.createElement('div');
        header.className = 'fancy-select-header-multi';
        header.setAttribute('role', 'combobox');
        header.setAttribute('aria-haspopup', 'listbox');
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('tabindex', '0');
        wrapper.appendChild(header);

        // Create input for searching in the header
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'fancy-select-search-input-inline';
        searchInput.placeholder = sel.getAttribute('data-placeholder') || 'Choose options...';
        header.appendChild(searchInput);

        // Create dropdown container
        const dropdown = document.createElement('div');
        dropdown.className = 'fancy-select-dropdown';
        wrapper.appendChild(dropdown);

        // Create options container
        const optionsContainer = document.createElement('ul');
        optionsContainer.className = 'fancy-select-options';
        optionsContainer.setAttribute('role', 'listbox');
        dropdown.appendChild(optionsContainer);

        // Function to update the placeholder based on selection
        const updatePlaceholder = () => {
            const hasSelection = Array.from(sel.options).some(opt => opt.selected);
            if (hasSelection) {
                searchInput.placeholder = '';
            } else {
                searchInput.placeholder = sel.getAttribute('data-placeholder') || 'Choose options...';
            }
        };

        // Function to render tags inside the header
        const renderTags = () => {
            // Remove existing tags
            header.querySelectorAll('.fancy-select-tag').forEach(tag => tag.remove());

            // Add new tags before the search input
            Array.from(sel.options).forEach((opt, idx) => {
                if (opt.selected) {
                    const tag = document.createElement('span');
                    tag.className = 'fancy-select-tag';
                    tag.innerHTML = `${FrankUI.escapeHtml(opt.textContent)} <span class="fancy-select-tag-remove">&times;</span>`;
                    
                    // Handle remove click
                    tag.querySelector('.fancy-select-tag-remove').addEventListener('click', (e) => {
                        e.stopPropagation();
                        opt.selected = false;
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                        rebuildDropdownSelectedState();
                        renderTags();
                    });

                    header.insertBefore(tag, searchInput);
                }
            });
            updatePlaceholder();
        };

        // Rebuild/update the option list's selected (dimmed) styling
        const rebuildDropdownSelectedState = () => {
            const items = optionsContainer.querySelectorAll('.fancy-select-option');
            items.forEach((item, idx) => {
                const opt = sel.options[idx];
                if (opt.selected) {
                    item.classList.add('selected-dimmed');
                    item.setAttribute('aria-selected', 'true');
                } else {
                    item.classList.remove('selected-dimmed');
                    item.setAttribute('aria-selected', 'false');
                }
            });
        };

        // Function to rebuild the custom options list
        const rebuildOptions = () => {
            optionsContainer.innerHTML = '';
            Array.from(sel.options).forEach((opt, idx) => {
                const li = document.createElement('li');
                li.className = 'fancy-select-option';
                li.setAttribute('role', 'option');
                li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
                li.textContent = opt.textContent;
                li.dataset.index = idx;
                
                if (opt.selected) {
                    li.classList.add('selected-dimmed');
                }

                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (opt.selected) return; // Ignore if already selected
                    
                    opt.selected = true;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    rebuildDropdownSelectedState();
                    renderTags();
                    
                    searchInput.value = '';
                    filterOptions('');
                    searchInput.focus();
                });

                optionsContainer.appendChild(li);
            });
            renderTags();
        };

        // Toggle dropdown
        const toggleDropdown = () => {
            if (dropdown.style.display === 'block') {
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        const openDropdown = () => {
            document.querySelectorAll('.fancy-select-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.style.display = 'none';
                    const prevHdr = d.previousSibling;
                    if (prevHdr && prevHdr.classList) {
                        prevHdr.classList.remove('open');
                        if (typeof prevHdr.setAttribute === 'function') {
                            prevHdr.setAttribute('aria-expanded', 'false');
                        }
                    }
                }
            });

            dropdown.style.display = 'block';
            header.classList.add('open');
            header.setAttribute('aria-expanded', 'true');
            searchInput.focus();
        };

        const closeDropdown = () => {
            dropdown.style.display = 'none';
            header.classList.remove('open');
            header.setAttribute('aria-expanded', 'false');
            searchInput.value = '';
            filterOptions('');
        };

        // Filter options based on search input
        const filterOptions = (query) => {
            const items = optionsContainer.querySelectorAll('.fancy-select-option');
            const cleanQuery = query.toLowerCase().trim();
            let firstMatch = null;

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(cleanQuery)) {
                    item.style.display = '';
                    if (!firstMatch) firstMatch = item;
                } else {
                    item.style.display = 'none';
                }
            });

            items.forEach(item => item.classList.remove('hovered'));
            if (firstMatch) {
                firstMatch.classList.add('hovered');
            }
        };

        // Event listeners
        header.addEventListener('click', (e) => {
            if (e.target !== searchInput) {
                e.stopPropagation();
                toggleDropdown();
            }
        });

        searchInput.addEventListener('focus', () => {
            openDropdown();
        });

        searchInput.addEventListener('input', (e) => {
            filterOptions(e.target.value);
        });



        // Handle change event on the original select
        sel.addEventListener('change', () => {
            rebuildDropdownSelectedState();
            renderTags();
        });

        // MutationObserver to watch for changes to the original select's options
        const observer = new MutationObserver(() => {
            rebuildOptions();
        });
        observer.observe(sel, { childList: true, subtree: true });

        // Initial build
        rebuildOptions();
    }
};

window.Select = Select;
