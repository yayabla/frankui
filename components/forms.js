const Forms = {
    init: function() {
        document.querySelectorAll('input[data-prepend-text], input[data-append-text]').forEach(input => {
            if (input.dataset.groupInitialized) return;
            input.dataset.groupInitialized = 'true';

            // Create input-group wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'input-group';

            // Inherit sizing classes to wrapper
            if (input.classList.contains('form-control-lg')) {
                wrapper.classList.add('input-group-lg');
            }
            if (input.classList.contains('form-control-sm')) {
                wrapper.classList.add('input-group-sm');
            }

            // Insert wrapper into parent, then move input inside it
            input.parentNode.insertBefore(wrapper, input);

            // Handle Prepend Text
            if (input.dataset.prependText) {
                const prependSpan = document.createElement('span');
                prependSpan.className = 'input-group-text';
                prependSpan.textContent = input.dataset.prependText;
                wrapper.appendChild(prependSpan);
            }

            wrapper.appendChild(input);

            // Handle Append Text
            if (input.dataset.appendText) {
                const appendSpan = document.createElement('span');
                appendSpan.className = 'input-group-text';
                appendSpan.textContent = input.dataset.appendText;
                wrapper.appendChild(appendSpan);
            }
        });

        // Clear Button logic
        document.querySelectorAll('input[data-btn-clear="true"]').forEach(input => {
            if (input.dataset.clearInitialized) return;
            input.dataset.clearInitialized = 'true';

            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'input-clear-wrapper';

            // Swap input in DOM
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            // Create (x) clear button
            const clearBtn = document.createElement('span');
            clearBtn.className = 'input-clear-btn';
            clearBtn.innerHTML = '×';
            wrapper.appendChild(clearBtn);

            // Toggle visibility function
            const toggleBtn = () => {
                clearBtn.style.display = input.value ? 'block' : 'none';
            };

            // Listeners
            input.addEventListener('input', toggleBtn);
            input.addEventListener('change', toggleBtn);
            
            // Initial check
            toggleBtn();

            // Clear behavior
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                input.value = '';
                toggleBtn();
                input.focus();
                
                // Dispatch triggers to update search filters
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    }
};

window.Forms = Forms;

