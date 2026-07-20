function formatDate(date, pattern) {
    if (!date) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return pattern.replace('YYYY', yyyy).replace('MM', mm).replace('DD', dd);
}

function parseDate(dateStr, pattern) {
    if (!dateStr) return null;
    let yyyy = new Date().getFullYear();
    let mm = new Date().getMonth();
    let dd = 1;
    const yIdx = pattern.indexOf('YYYY');
    const mIdx = pattern.indexOf('MM');
    const dIdx = pattern.indexOf('DD');
    if (yIdx !== -1) yyyy = parseInt(dateStr.substr(yIdx, 4));
    if (mIdx !== -1) mm = parseInt(dateStr.substr(mIdx, 2)) - 1;
    if (dIdx !== -1) dd = parseInt(dateStr.substr(dIdx, 2));
    const d = new Date(yyyy, mm, dd);
    if (isNaN(d.getTime())) return null;
    return d;
}

const DatePicker = {
    init: function() {
        document.querySelectorAll('[data-role="datepicker"]').forEach(el => {
            this.initDatePicker(el);
        });
    },

    initDatePicker: function(container) {
        if (container.dataset.initialized) return;
        container.dataset.initialized = 'true';

        container.classList.add('datepicker-container');

        const input = container.querySelector('input') || document.createElement('input');
        if (!input.parentElement) {
            input.className = 'datepicker-input';
            input.type = 'text';
            input.placeholder = container.dataset.placeholder || 'Select Date...';
            container.appendChild(input);
        }

        const button = container.querySelector('.datepicker-button') || document.createElement('button');
        if (!button.parentElement) {
            button.className = 'datepicker-button';
            button.innerHTML = '<i data-lucide="calendar" style="width: 16px; height: 16px;"></i>';
            container.appendChild(button);
        }

        const locale = container.dataset.locale || navigator.language || 'default';
        const sourceFormat = container.dataset.sourceFormat || 'YYYY-MM-DD';
        const outputFormat = container.dataset.outputFormat || 'DD-MM-YYYY';

        // Setup hidden value input for form submission
        let hiddenInput = container.querySelector('.datepicker-value-input');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.className = 'datepicker-value-input';
            hiddenInput.name = container.dataset.name || input.name || '';
            if (input.name) {
                input.removeAttribute('name');
            }
            container.appendChild(hiddenInput);
        }

        let selectedDate = null;
        if (input.value) {
            selectedDate = parseDate(input.value, sourceFormat);
            if (selectedDate) {
                input.value = formatDate(selectedDate, outputFormat);
                hiddenInput.value = formatDate(selectedDate, sourceFormat);
            }
        }

        // Native Mobile Picker Support
        const isMobile = window.matchMedia('(pointer: coarse)').matches;
        if (isMobile) {
            const nativeInput = document.createElement('input');
            nativeInput.type = 'date';
            nativeInput.className = 'datepicker-native-input';
            
            // Cover container transparently
            Object.assign(nativeInput.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                opacity: '0',
                cursor: 'pointer',
                zIndex: '2'
            });
            container.appendChild(nativeInput);

            // Pre-fill native date input in YYYY-MM-DD format if selectedDate exists
            if (selectedDate) {
                nativeInput.value = formatDate(selectedDate, 'YYYY-MM-DD');
            }

            nativeInput.addEventListener('change', () => {
                if (nativeInput.value) {
                    const date = parseDate(nativeInput.value, 'YYYY-MM-DD');
                    if (date) {
                        selectedDate = date;
                        input.value = formatDate(date, outputFormat);
                        hiddenInput.value = formatDate(date, sourceFormat);
                        container.dispatchEvent(new CustomEvent('change', { detail: date }));
                    }
                }
            });
            return;
        }

        // Desktop Custom Calendar Dropdown
        const calendar = document.createElement('div');
        calendar.className = 'datepicker-calendar';
        container.appendChild(calendar);

        let viewedMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();
        let viewedYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();

        // Render localized calendar dropdown contents
        const renderCalendar = () => {
            calendar.innerHTML = '';

            // 1. Header Bar
            const header = document.createElement('div');
            header.className = 'calendar-header';

            const prevBtn = document.createElement('button');
            prevBtn.className = 'calendar-btn';
            prevBtn.innerHTML = '←';
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                viewedMonth--;
                if (viewedMonth < 0) {
                    viewedMonth = 11;
                    viewedYear--;
                }
                renderCalendar();
            });

            const title = document.createElement('div');
            title.className = 'calendar-title';
            title.style.display = 'flex';
            title.style.gap = '5px';

            // Month select
            const monthSelect = document.createElement('select');
            monthSelect.className = 'calendar-select';
            monthSelect.style.background = 'transparent';
            monthSelect.style.border = 'none';
            monthSelect.style.color = 'var(--text-color)';
            monthSelect.style.fontWeight = 'bold';
            monthSelect.style.cursor = 'pointer';
            monthSelect.style.outline = 'none';
            monthSelect.style.fontSize = '13.5px';

            const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
            for (let m = 0; m < 12; m++) {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = monthFormatter.format(new Date(2025, m, 1));
                opt.style.backgroundColor = 'var(--bg-color)';
                opt.style.color = 'var(--text-color)';
                if (m === viewedMonth) opt.selected = true;
                monthSelect.appendChild(opt);
            }
            monthSelect.addEventListener('change', (e) => {
                viewedMonth = parseInt(monthSelect.value);
                renderCalendar();
            });

            // Year select
            const yearSelect = document.createElement('select');
            yearSelect.className = 'calendar-select';
            yearSelect.style.background = 'transparent';
            yearSelect.style.border = 'none';
            yearSelect.style.color = 'var(--text-color)';
            yearSelect.style.fontWeight = 'bold';
            yearSelect.style.cursor = 'pointer';
            yearSelect.style.outline = 'none';
            yearSelect.style.fontSize = '13.5px';

            const currentYear = new Date().getFullYear();
            const startYear = currentYear - 80;
            const endYear = currentYear + 20;
            for (let y = startYear; y <= endYear; y++) {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                opt.style.backgroundColor = 'var(--bg-color)';
                opt.style.color = 'var(--text-color)';
                if (y === viewedYear) opt.selected = true;
                yearSelect.appendChild(opt);
            }
            yearSelect.addEventListener('change', (e) => {
                viewedYear = parseInt(yearSelect.value);
                renderCalendar();
            });

            title.appendChild(monthSelect);
            title.appendChild(yearSelect);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'calendar-btn';
            nextBtn.innerHTML = '→';
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                viewedMonth++;
                if (viewedMonth > 11) {
                    viewedMonth = 0;
                    viewedYear++;
                }
                renderCalendar();
            });

            header.appendChild(prevBtn);
            header.appendChild(title);
            header.appendChild(nextBtn);
            calendar.appendChild(header);

            // 2. Weekdays Header starting on Sunday
            const weekdaysContainer = document.createElement('div');
            weekdaysContainer.className = 'calendar-weekdays';
            
            const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
            for (let i = 5; i <= 11; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = weekdayFormatter.format(new Date(2025, 0, i));
                weekdaysContainer.appendChild(dayDiv);
            }
            calendar.appendChild(weekdaysContainer);

            // 3. Days Grid
            const daysContainer = document.createElement('div');
            daysContainer.className = 'calendar-days';

            const firstDayIndex = new Date(viewedYear, viewedMonth, 1).getDay();
            const daysInMonth = new Date(viewedYear, viewedMonth + 1, 0).getDate();

            // Blank spacer cells for start offset
            for (let i = 0; i < firstDayIndex; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day empty';
                daysContainer.appendChild(emptyCell);
            }

            // Fill actual calendar days
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-day';
                dayCell.textContent = day;

                // Today styling
                if (viewedYear === today.getFullYear() && viewedMonth === today.getMonth() && day === today.getDate()) {
                    dayCell.classList.add('today');
                }

                // Selected styling
                if (selectedDate && viewedYear === selectedDate.getFullYear() && viewedMonth === selectedDate.getMonth() && day === selectedDate.getDate()) {
                    dayCell.classList.add('selected');
                }

                dayCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedDate = new Date(viewedYear, viewedMonth, day);
                    
                    input.value = formatDate(selectedDate, outputFormat);
                    hiddenInput.value = formatDate(selectedDate, sourceFormat);
                    calendar.classList.remove('open');
                    
                    container.dispatchEvent(new CustomEvent('change', { detail: selectedDate }));
                });

                daysContainer.appendChild(dayCell);
            }
            calendar.appendChild(daysContainer);
        };

        // Click to toggle calendar visibility
        const toggleCalendar = (e) => {
            e.stopPropagation();
            const isOpen = calendar.classList.contains('open');
            // Close other open calendars first
            document.querySelectorAll('.datepicker-calendar.open').forEach(c => {
                c.classList.remove('open');
            });
            if (!isOpen) {
                if (selectedDate) {
                    viewedMonth = selectedDate.getMonth();
                    viewedYear = selectedDate.getFullYear();
                }
                renderCalendar();
                calendar.classList.add('open');
            }
        };

        input.addEventListener('click', toggleCalendar);
        button.addEventListener('click', toggleCalendar);

        // Close when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                calendar.classList.remove('open');
            }
        });
    }
};

window.DatePicker = DatePicker;
