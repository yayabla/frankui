// IBAN Handler
const IBAN = {
    init: function() {
        document.querySelectorAll('input[data-iban="true"]').forEach(input => {
            if (input.dataset.initialized) return;
            input.dataset.initialized = 'true';
            input.addEventListener('focus', (e) => {
                // If we saved the formatted version (with spaces), restore it
                if (input.dataset.formattedValue) {
                    input.value = input.dataset.formattedValue;
                }
            });

            input.addEventListener('blur', (e) => {
                // Save the current input (with spaces)
                input.dataset.formattedValue = input.value;
                // Remove spaces for internal value
                input.value = input.value.replace(/\s+/g, '').toUpperCase();
            });
        });
    }
};

window.IBAN = IBAN;
