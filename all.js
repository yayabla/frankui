// Micro-jQuery: Lightweight selector and DOM wrapper helper
(function(global) {
    class ElementWrapper {
        constructor(selector) {
            if (typeof selector === 'string') {
                this.elements = Array.from(document.querySelectorAll(selector));
            } else if (selector instanceof HTMLElement || selector === document || selector === window) {
                this.elements = [selector];
            } else if (selector instanceof ElementWrapper) {
                this.elements = selector.elements;
            } else if (Array.isArray(selector)) {
                this.elements = selector;
            } else if (selector && selector.length !== undefined) {
                this.elements = Array.from(selector);
            } else {
                this.elements = [];
            }
            this.length = this.elements.length;
            this.elements.forEach((el, index) => {
                this[index] = el;
            });
        }

        each(callback) {
            this.elements.forEach((el, index) => callback.call(el, index, el));
            return this;
        }

        val(value) {
            if (value === undefined) {
                const el = this.elements[0];
                return el ? el.value : '';
            }
            return this.each(function() {
                this.value = value;
            });
        }

        prop(name, value) {
            if (value === undefined) {
                const el = this.elements[0];
                return el ? el[name] : undefined;
            }
            return this.each(function() {
                this[name] = value;
            });
        }

        is(selector) {
            const el = this.elements[0];
            if (!el) return false;
            if (typeof selector === 'string') {
                return el.matches(selector);
            }
            if (selector instanceof HTMLElement) {
                return el === selector;
            }
            if (selector instanceof ElementWrapper) {
                return this.elements.some(item => selector.elements.includes(item));
            }
            return false;
        }

        on(events, selector, handler) {
            const hasDelegation = typeof selector === 'string';
            const actualHandler = hasDelegation ? handler : selector;
            const targetSelector = hasDelegation ? selector : null;

            return this.each(function() {
                const self = this;
                events.split(' ').forEach(evt => {
                    const eventName = evt.split('.')[0];
                    const listener = function(e) {
                        if (targetSelector) {
                            const target = e.target.closest(targetSelector);
                            if (target && self.contains(target)) {
                                if (actualHandler.call(target, e) === false) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }
                        } else {
                            if (actualHandler.call(this, e) === false) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }
                    };
                    self.addEventListener(eventName, listener);
                    if (!self._listeners) self._listeners = [];
                    self._listeners.push({ original: evt, name: eventName, handler: actualHandler, actualListener: listener });
                });
            });
        }

        bind(events, handler) {
            return this.on(events, handler);
        }

        unbind(events, handler) {
            return this.each(function() {
                if (!this._listeners) return;
                const self = this;
                events.split(' ').forEach(evt => {
                    const parts = evt.split('.');
                    const eventName = parts[0];
                    const namespace = parts.slice(1).join('.');
                    
                    self._listeners = self._listeners.filter(listener => {
                        const matchesType = !eventName || listener.name === eventName;
                        const matchesNamespace = !namespace || listener.original.includes('.' + namespace);
                        const matchesHandler = !handler || listener.handler === handler;
                        
                        if (matchesType && matchesNamespace && matchesHandler) {
                            self.removeEventListener(listener.name, listener.actualListener || listener.handler);
                            return false;
                        }
                        return true;
                    });
                });
            });
        }

        click(handler) {
            return this.on('click', handler);
        }

        addClass(className) {
            return this.each(function() {
                className.split(' ').forEach(cls => {
                    if (cls.trim()) this.classList.add(cls.trim());
                });
            });
        }

        removeClass(className) {
            return this.each(function() {
                className.split(' ').forEach(cls => {
                    if (cls.trim()) this.classList.remove(cls.trim());
                });
            });
        }

        toggleClass(className) {
            return this.each(function() {
                className.split(' ').forEach(cls => {
                    if (cls.trim()) this.classList.toggle(cls.trim());
                });
            });
        }

        find(selector) {
            let found = [];
            this.each(function() {
                found = found.concat(Array.from(this.querySelectorAll(selector)));
            });
            return new ElementWrapper(found);
        }

        parent() {
            const el = this.elements[0];
            return new ElementWrapper(el ? el.parentElement : null);
        }

        closest(selector) {
            const el = this.elements[0];
            return new ElementWrapper(el ? el.closest(selector) : null);
        }

        attr(name, value) {
            if (value === undefined) {
                const el = this.elements[0];
                return el ? el.getAttribute(name) : null;
            }
            return this.each(function() {
                if (value === null) {
                    this.removeAttribute(name);
                } else {
                    this.setAttribute(name, value);
                }
            });
        }

        text(content) {
            if (content === undefined) {
                const el = this.elements[0];
                return el ? el.textContent : '';
            }
            return this.each(function() {
                this.textContent = content;
            });
        }

        html(content) {
            if (content === undefined) {
                const el = this.elements[0];
                return el ? el.innerHTML : '';
            }
            return this.each(function() {
                this.innerHTML = content;
            });
        }

        css(prop, value) {
            if (value === undefined && typeof prop === 'string') {
                const el = this.elements[0];
                return el ? getComputedStyle(el)[prop] : '';
            }
            if (typeof prop === 'object') {
                return this.each(function() {
                    for (const [key, val] of Object.entries(prop)) {
                        this.style[key] = val;
                    }
                });
            }
            return this.each(function() {
                this.style[prop] = value;
            });
        }

        trigger(eventName) {
            return this.each(function() {
                const event = new Event(eventName, { bubbles: true, cancelable: true });
                this.dispatchEvent(event);
            });
        }

        add(selector) {
            const extra = new ElementWrapper(selector);
            const combined = this.elements.concat(extra.elements).filter((el, idx, self) => self.indexOf(el) === idx);
            return new ElementWrapper(combined);
        }

        filter(selector) {
            let filtered;
            if (typeof selector === 'string') {
                filtered = this.elements.filter(el => el.matches(selector));
            } else if (typeof selector === 'function') {
                filtered = this.elements.filter((el, index) => selector.call(el, index, el));
            } else {
                filtered = this.elements;
            }
            return new ElementWrapper(filtered);
        }

        submit(handler) {
            if (handler === undefined) {
                return this.trigger('submit');
            }
            return this.on('submit', handler);
        }

        appendTo(parent) {
            const parentEl = parent instanceof ElementWrapper ? parent.elements[0] : (typeof parent === 'string' ? document.querySelector(parent) : parent);
            if (parentEl) {
                this.each(function() {
                    parentEl.appendChild(this);
                });
            }
            return this;
        }

        remove() {
            return this.each(function() {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            });
        }

        empty() {
            return this.each(function() {
                this.innerHTML = '';
            });
        }

        append(content) {
            return this.each(function() {
                if (typeof content === 'string') {
                    this.insertAdjacentHTML('beforeend', content);
                } else if (content instanceof HTMLElement) {
                    this.appendChild(content);
                } else if (content instanceof ElementWrapper) {
                    content.each((idx, el) => this.appendChild(el));
                }
            });
        }

        prepend(content) {
            return this.each(function() {
                if (typeof content === 'string') {
                    this.insertAdjacentHTML('afterbegin', content);
                } else if (content instanceof HTMLElement) {
                    this.insertBefore(content, this.firstChild);
                } else if (content instanceof ElementWrapper) {
                    content.each((idx, el) => this.insertBefore(el, this.firstChild));
                }
            });
        }

        focus() {
            const el = this.elements[0];
            if (el) el.focus();
            return this;
        }

        blur() {
            const el = this.elements[0];
            if (el) el.blur();
            return this;
        }

        change(handler) {
            return this.on('change', handler);
        }

        show() {
            return this.each(function() {
                this.style.display = '';
            });
        }

        hide() {
            return this.each(function() {
                this.style.display = 'none';
            });
        }

        removeAttr(name) {
            return this.attr(name, null);
        }
    }

    const $ = function(selector) {
        return new ElementWrapper(selector);
    };

    $.fn = ElementWrapper.prototype;

    $.extend = $.fn.extend = function() {
        let options, name, src, copy,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length;
        if (typeof target !== "object" && typeof target !== "function") {
            target = {};
        }
        if (i === length) {
            target = this;
            i--;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };

    const dataStore = new WeakMap();
    $.data = function(el, key, value) {
        if (!el) return undefined;
        if (value === undefined) {
            const store = dataStore.get(el);
            return store ? store[key] : undefined;
        }
        let store = dataStore.get(el);
        if (!store) {
            store = {};
            dataStore.set(el, store);
        }
        store[key] = value;
        return value;
    };

    $.each = function(obj, callback) {
        if (Array.isArray(obj) || (obj && typeof obj.length === 'number')) {
            for (let i = 0; i < obj.length; i++) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        } else {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (callback.call(obj[key], key, obj[key]) === false) {
                        break;
                    }
                }
            }
        }
        return obj;
    };

    $.isFunction = function(obj) { return typeof obj === 'function'; };
    $.isArray = Array.isArray;
    $.trim = function(str) { return str == null ? "" : (str + "").trim(); };
    $.makeArray = function(arr) { return Array.from(arr || []); };
    $.expr = { ":": {} };
    $.event = { special: {} };

    $.ajax = function(options) {
        const url = options.url;
        const type = (options.type || 'GET').toUpperCase();
        const dataType = options.dataType || 'json';
        const data = options.data || {};
        
        let body = null;
        let headers = {};
        
        if (type === 'POST') {
            if (data instanceof FormData) {
                body = data;
            } else if (typeof data === 'object') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = new URLSearchParams(data).toString();
            } else {
                body = data;
            }
        }
        
        if (options.beforeSend) {
            if (options.beforeSend() === false) return;
        }
        
        fetch(url, {
            method: type,
            headers: headers,
            body: body
        })
        .then(res => {
            if (!res.ok) throw new Error('HTTP status ' + res.status);
            return dataType === 'json' ? res.json() : res.text();
        })
        .then(parsed => {
            if (options.success) options.success(parsed, 'success');
        })
        .catch(err => {
            if (options.error) {
                const fakeXhr = {
                    readyState: 4,
                    status: 500,
                    statusText: err.message,
                    responseText: err.toString()
                };
                options.error(fakeXhr, 'error', err);
            }
        })
        .finally(() => {
            if (options.complete) options.complete();
        });
    };

    global.$ = global.jQuery = $;
})(window);

// All Components
const FrankUI = {
    init: function() {
        console.log("FrankUI initialized.");
        FrankUI.scan(true); // Run the initial scan synchronously on DOMContentLoaded

        // Set up MutationObserver to automatically initialize dynamically added components
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                let shouldScan = false;
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length > 0) {
                        // Check if the added node is a text node or empty
                        const hasElements = Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE);
                        if (hasElements) {
                            shouldScan = true;
                            break;
                        }
                    }
                }
                if (shouldScan) {
                    FrankUI.scan(false); // Dynamic mutations remain safely debounced
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    },
    scanTimeout: null,
    scan: function(forceSync = false) {
        const runScan = () => {
            FrankUI.scanTimeout = null;
            const components = [
                'Accordion', 'Alert', 'CodeHighlighter', 'ContextMenu', 'Desktop', 'Dialog', 
                'FileUploader', 'IBAN', 'Notify', 'Panel', 'Progress', 'Rating', 'Sidenav', 
                'Tabs', 'Toolbar', 'Tooltip', 'Tree', 'Window', 'Taskbar', 'Select', 
                'Dropdown', 'Ribbon', 'ActionButton', 'AppBar', 'AudioButton', 
                'Bull', 'Cloak', 'Collapse', 'InputMask', 'WorkingTree', 'Tile', 'Splitter', 'NavView', 'Menu', 'DatePicker', 'Forms', 'Carousel', 'Pagination', 'Navbar'
            ];
            components.forEach(name => {
                const comp = window[name];
                if (comp && typeof comp.init === 'function') {
                    comp.init();
                }
            });
        };

        if (forceSync) {
            if (FrankUI.scanTimeout) {
                if (typeof cancelAnimationFrame !== 'undefined') {
                    cancelAnimationFrame(FrankUI.scanTimeout);
                } else {
                    clearTimeout(FrankUI.scanTimeout);
                }
                FrankUI.scanTimeout = null;
            }
            runScan();
        } else {
            if (FrankUI.scanTimeout) return;
            if (typeof requestAnimationFrame !== 'undefined') {
                FrankUI.scanTimeout = requestAnimationFrame(runScan);
            } else {
                FrankUI.scanTimeout = setTimeout(runScan, 0);
            }
        }
    },
    toggleDarkMode: function() {
        const root = document.documentElement;
        const isDark = root.getAttribute('data-theme') === 'dark';
        if (isDark) {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', 'dark');
        }
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: isDark ? 'light' : 'dark' } }));
    }
};

window.FrankUI = FrankUI;
// Expose utilities globally safely without triggering Temporal Dead Zone (TDZ)
const globals = [
    'Alert', 'CodeHighlighter', 'ContextMenu', 'Desktop', 'Dialog', 'FileUploader', 'IBAN', 
    'Notify', 'Panel', 'Progress', 'Rating', 'Sidenav', 'Tabs', 'Toolbar', 
    'Tooltip', 'Tree', 'Window', 'Taskbar', 'Select', 'Dropdown', 'Ribbon', 
    'ActionButton', 'AppBar', 'AudioButton', 'Bull', 'Cloak', 'Collapse', 
    'InputMask', 'Cookie', 'WorkingTree', 'Tile', 'Splitter', 'NavView', 'Menu', 'DatePicker', 'Forms', 'Carousel', 'Pagination', 'Navbar'
];
globals.forEach(name => {
    window[name] = window[name] || {};
});

window.FrankUI.notify = window.Notify;
window.FrankUI.cookie = window.Cookie;
window.FrankUI.toggleDarkMode = FrankUI.toggleDarkMode;

document.addEventListener('DOMContentLoaded', FrankUI.init);

