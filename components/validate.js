// FrankUI Native Validation Component
(function() {
    const FrankUI_Validate = {
        init: function() {
            document.querySelectorAll('form[data-validate]').forEach(form => {
                if (form.dataset.initialized) return;
                form.dataset.initialized = 'true';
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            });
        },

        validateForm: function(form) {
            let isValid = true;
            form.querySelectorAll('input, select, textarea').forEach(input => {
                if (input.hasAttribute('required') || input.hasAttribute('minlength') || input.hasAttribute('maxlength') || input.hasAttribute('regex')) {
                    if (!this.checkInput(input)) {
                        isValid = false;
                        this.showError(input);
                    } else {
                        this.clearError(input);
                    }
                }
            });
            return isValid;
        },

        checkInput: function(input) {
            const val = input.value.trim();
            
            // Required check
            if (input.hasAttribute('required') && val.length === 0) return false;
            
            // Email check
            if (input.type === 'email' && val.length > 0) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
            }
            
            // Minlength check
            if (input.hasAttribute('minlength') && val.length > 0 && val.length < parseInt(input.getAttribute('minlength'))) return false;
            
            // Maxlength check
            if (input.hasAttribute('maxlength') && val.length > parseInt(input.getAttribute('maxlength'))) return false;

            // Regex check
            if (input.hasAttribute('regex') && val.length > 0) {
                try {
                    const regex = new RegExp(input.getAttribute('regex'));
                    if (!regex.test(val)) return false;
                } catch (e) {
                    console.warn("Invalid regex pattern on input: " + input.name);
                }
            }

            return true;
        },

        showError: function(input) {
            input.classList.add('error');
            let errorLabel = input.parentNode.querySelector('.error-label');
            if (!errorLabel) {
                errorLabel = document.createElement('div');
                errorLabel.className = 'error-label';
                errorLabel.style.color = 'red';
                errorLabel.style.fontSize = '0.8rem';
                errorLabel.textContent = input.dataset.errorMsg || 'Invalid field value';
                input.parentNode.appendChild(errorLabel);
            }
        },

        clearError: function(input) {
            input.classList.remove('error');
            let errorLabel = input.parentNode.querySelector('.error-label');
            if (errorLabel) errorLabel.remove();
        }
    };

    window.FrankUI.validate = FrankUI_Validate;
    document.addEventListener('DOMContentLoaded', () => FrankUI_Validate.init());
})();
