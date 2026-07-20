// FrankUI Input Mask Component
(function() {
    const InputMask = {
        init: function() {
            document.querySelectorAll('[data-role="input-mask"]').forEach(input => {
                if (input.dataset.initialized) return;
                input.dataset.initialized = 'true';
                this.create(input);
            });
        },

        create: function(input, options = {}) {
            const maskType = input.getAttribute('data-mask-type');
            
            // If it is a custom dynamic Dutch phone mask, handle it separately
            if (maskType === 'dutch-phone') {
                this.createDutchPhoneMask(input);
                return;
            }

            const mask = options.mask || input.getAttribute('data-mask');
            if (!mask) {
                console.error("InputMask: 'data-mask' attribute is required.");
                return;
            }

            const maskPattern = options.maskPattern || input.getAttribute('data-mask-pattern') || '.';
            const maskPlaceholder = options.maskPlaceholder || input.getAttribute('data-mask-placeholder') || '_';
            const editableStart = parseInt(options.maskEditableStart || input.getAttribute('data-mask-editable-start') || '0', 10);
            const onCharName = options.onChar || input.getAttribute('data-on-char');

            let onCharFn = null;
            if (onCharName && typeof window[onCharName] === 'function') {
                onCharFn = window[onCharName];
            } else if (typeof onCharName === 'function') {
                onCharFn = onCharName;
            }

            const regex = new RegExp(maskPattern);
            const placeholders = new Set(maskPlaceholder.split(''));

            const editableIndices = [];
            for (let i = 0; i < mask.length; i++) {
                if (placeholders.has(mask[i])) {
                    editableIndices.push(i);
                }
            }

            const firstEditableIndex = editableIndices.find(idx => idx >= editableStart) ?? editableIndices[0];

            if (!input.value) {
                input.value = mask;
            }

            function getUnmaskedValue() {
                let val = '';
                const currentVal = input.value;
                for (let i = 0; i < mask.length; i++) {
                    if (editableIndices.includes(i)) {
                        if (currentVal[i] && !placeholders.has(currentVal[i])) {
                            val += currentVal[i];
                        }
                    }
                }
                return val;
            }

            function setCursor(pos) {
                setTimeout(() => {
                    input.setSelectionRange(pos, pos);
                }, 0);
            }

            input.addEventListener('focus', () => {
                const currentVal = input.value;
                let targetPos = firstEditableIndex;
                for (let i = 0; i < editableIndices.length; i++) {
                    const idx = editableIndices[i];
                    if (idx >= firstEditableIndex) {
                        if (placeholders.has(currentVal[idx])) {
                            targetPos = idx;
                            break;
                        }
                    }
                }
                setCursor(targetPos);
            });

            input.addEventListener('click', () => {
                const currentVal = input.value;
                let selStart = input.selectionStart;
                if (selStart < firstEditableIndex) {
                    setCursor(firstEditableIndex);
                } else {
                    let lastFilledIndex = firstEditableIndex;
                    for (let i = 0; i < editableIndices.length; i++) {
                        const idx = editableIndices[i];
                        if (!placeholders.has(currentVal[idx])) {
                            lastFilledIndex = idx;
                        }
                    }
                    if (selStart > lastFilledIndex) {
                        const nextEmpty = editableIndices.find(idx => idx > lastFilledIndex && placeholders.has(currentVal[idx])) ?? (lastFilledIndex + 1);
                        setCursor(Math.min(nextEmpty, mask.length));
                    }
                }
            });

            input.addEventListener('keydown', (e) => {
                const key = e.key;
                let selStart = input.selectionStart;
                const valArray = input.value.split('');

                if (e.ctrlKey || e.altKey || e.metaKey || key === 'Tab' || key === 'Enter') return;

                if (key === 'Backspace') {
                    e.preventDefault();
                    const prevIdx = [...editableIndices].reverse().find(idx => idx < selStart);
                    if (prevIdx !== undefined && prevIdx >= firstEditableIndex) {
                        valArray[prevIdx] = mask[prevIdx];
                        input.value = valArray.join('');
                        setCursor(prevIdx);
                    }
                } else if (key === 'Delete') {
                    e.preventDefault();
                    const currentIdx = editableIndices.find(idx => idx >= selStart);
                    if (currentIdx !== undefined) {
                        valArray[currentIdx] = mask[currentIdx];
                        input.value = valArray.join('');
                        setCursor(currentIdx);
                    }
                } else if (key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevIdx = [...editableIndices].reverse().find(idx => idx < selStart);
                    if (prevIdx !== undefined && prevIdx >= firstEditableIndex) {
                        setCursor(prevIdx);
                    } else {
                        setCursor(firstEditableIndex);
                    }
                } else if (key === 'ArrowRight') {
                    e.preventDefault();
                    const nextIdx = editableIndices.find(idx => idx > selStart);
                    if (nextIdx !== undefined) {
                        setCursor(nextIdx);
                    }
                } else if (key === 'Home' || key === 'ArrowUp') {
                    e.preventDefault();
                    setCursor(firstEditableIndex);
                } else if (key === 'End' || key === 'ArrowDown') {
                    e.preventDefault();
                    let lastFilledIdx = firstEditableIndex;
                    for (let i = 0; i < editableIndices.length; i++) {
                        const idx = editableIndices[i];
                        if (!placeholders.has(input.value[idx])) {
                            lastFilledIdx = idx;
                        }
                    }
                    const nextEmpty = editableIndices.find(idx => idx > lastFilledIdx && placeholders.has(input.value[idx])) ?? mask.length;
                    setCursor(nextEmpty);
                } else if (key === ' ') {
                    e.preventDefault();
                    const nextIdx = editableIndices.find(idx => idx > selStart);
                    if (nextIdx !== undefined) {
                        setCursor(nextIdx);
                    }
                } else if (key.length === 1) {
                    if (!regex.test(key)) {
                        e.preventDefault();
                    }
                }
            });

            input.addEventListener('keypress', (e) => {
                if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Enter') return;

                e.preventDefault();
                let char = e.key;
                let selStart = input.selectionStart;

                const targetIdx = editableIndices.find(idx => idx >= selStart);
                if (targetIdx === undefined) return;

                if (onCharFn) {
                    char = onCharFn(char);
                }

                if (regex.test(char)) {
                    const valArray = input.value.split('');
                    valArray[targetIdx] = char;
                    input.value = valArray.join('');

                    const nextIdx = editableIndices.find(idx => idx > targetIdx) ?? (targetIdx + 1);
                    setCursor(nextIdx);
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                let selStart = input.selectionStart;
                const valArray = input.value.split('');

                let pasteCharIndex = 0;
                for (let i = 0; i < editableIndices.length; i++) {
                    const idx = editableIndices[i];
                    if (idx >= selStart && pasteCharIndex < pasteData.length) {
                        let char = pasteData[pasteCharIndex];
                        if (onCharFn) char = onCharFn(char);
                        
                        if (regex.test(char)) {
                            valArray[idx] = char;
                            pasteCharIndex++;
                        } else {
                            pasteCharIndex++;
                            i--;
                        }
                    }
                }

                input.value = valArray.join('');
                const nextEmpty = editableIndices.find(idx => idx >= selStart && placeholders.has(input.value[idx])) ?? mask.length;
                setCursor(nextEmpty);
            });

            input.inputMask = {
                destroy: () => {
                    input.value = '';
                    delete input.inputMask;
                },
                getUnmaskedValue: getUnmaskedValue
            };
        },

        createDutchPhoneMask: function(input) {
            // Dutch dynamic mask handler
            // Handles +31 ((0)6)________ formats and varying area code formats (3 or 4 digits)
            // Starts with prefix +31
            input.value = "+31 ";

            function formatDutchNumber(raw) {
                // Strips non-digits except maybe + at starting index
                let digits = raw.replace(/\D/g, '');
                
                // If it starts with 31, strip it to handle area code logic locally
                let hasCountryPrefix = false;
                if (digits.startsWith('31')) {
                    digits = digits.substring(2);
                    hasCountryPrefix = true;
                }

                // If starting with 0, keep track of it
                let hasLeadingZero = digits.startsWith('0');
                if (hasLeadingZero) {
                    digits = digits.substring(1);
                }

                if (digits.length === 0) {
                    return "+31 " + (hasLeadingZero ? "(0)" : "");
                }

                // 1. Mobile Format check: starts with 6
                if (digits.startsWith('6')) {
                    let mobileDigits = digits.substring(1, 9); // Max 8 digits after 6
                    let formatted = "+31 " + (hasLeadingZero ? "(0)" : "") + "6";
                    if (mobileDigits.length > 0) {
                        formatted += "-" + mobileDigits;
                    }
                    return formatted;
                }

                // 2. Landline format with 3-digit area code (e.g. 10, 20, 30, 40, 70, 80 etc.)
                // Standard area codes in NL are usually: 2-digit (e.g. 10 for Rotterdam, 20 for Amsterdam, 30, 40, 50, 70, 80)
                // When we omit the leading 0, these are 2 digits (e.g. '40' for Eindhoven)
                const shortAreaCodes = ['10', '13', '15', '20', '23', '24', '26', '30', '33', '35', '36', '38', '40', '43', '44', '45', '46', '50', '53', '55', '58', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80'];
                
                let areaCode2 = digits.substring(0, 2);
                if (shortAreaCodes.includes(areaCode2)) {
                    let localNum = digits.substring(2, 9); // Remaining max 7 digits
                    let formatted = "+31 " + (hasLeadingZero ? "(0)" : "") + areaCode2;
                    if (localNum.length > 0) {
                        formatted += "-" + localNum;
                    }
                    return formatted;
                }

                // 3. Landline format with 4-digit area code (e.g. 492 for Helmond)
                // Omitted leading 0 means 3 digits (e.g. '492')
                if (digits.length >= 3) {
                    let areaCode3 = digits.substring(0, 3);
                    let localNum = digits.substring(3, 9); // Remaining max 6 digits
                    let formatted = "+31 " + (hasLeadingZero ? "(0)" : "") + areaCode3;
                    if (localNum.length > 0) {
                        formatted += "-" + localNum;
                    }
                    return formatted;
                }

                // Fallback while typing initial digits
                return "+31 " + (hasLeadingZero ? "(0)" : "") + digits;
            }

            input.addEventListener('input', (e) => {
                let cursor = input.selectionStart;
                let oldVal = input.value;
                let newVal = formatDutchNumber(oldVal);
                input.value = newVal;

                // Adjust cursor position smoothly
                if (cursor > 4) {
                    let addedChars = newVal.length - oldVal.length;
                    input.setSelectionRange(cursor + addedChars, cursor + addedChars);
                } else {
                    input.setSelectionRange(newVal.length, newVal.length);
                }
            });

            input.addEventListener('keydown', (e) => {
                const key = e.key;
                // Don't allow deleting +31 prefix
                if (input.selectionStart <= 4 && (key === 'Backspace' || key === 'Delete')) {
                    e.preventDefault();
                }
                // Numbers, Backspace, Delete, and Nav keys are allowed
                if (key.length === 1 && !/\d/.test(key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                }
            });

            // Prevent focusing before prefix
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    if (input.selectionStart < 4) {
                        input.setSelectionRange(input.value.length, input.value.length);
                    }
                }, 0);
            });
        }
    };

    window.InputMask = InputMask;
    document.addEventListener('DOMContentLoaded', () => InputMask.init());
})();
