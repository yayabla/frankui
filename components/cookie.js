/* FrankUI Cookie Utility Module */

const Cookie = {
    defaults: {
        path: "/",
        secure: false,
        sameSite: "Lax",
        domain: ""
    },

    setup: function(options) {
        if (options && typeof options === 'object') {
            // Support both camelCase sameSite and lowercase samesite
            const sSite = options.sameSite !== undefined ? options.sameSite : options.samesite;
            const normalized = Object.assign({}, options);
            if (sSite !== undefined) {
                normalized.sameSite = sSite;
            }
            this.defaults = Object.assign({}, this.defaults, normalized);
        }
    },

    set: function(name, value, daysOrOptions) {
        let expires = "";
        
        // Load default configs
        let path = this.defaults.path ? "; path=" + this.defaults.path : "; path=/";
        let domain = this.defaults.domain ? "; domain=" + this.defaults.domain : "";
        let secure = this.defaults.secure ? "; secure" : "";
        let sameSite = this.defaults.sameSite ? "; SameSite=" + this.defaults.sameSite : "; SameSite=Lax";

        if (daysOrOptions !== undefined) {
            if (typeof daysOrOptions === 'number') {
                const date = new Date();
                date.setTime(date.getTime() + (daysOrOptions * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            } else if (typeof daysOrOptions === 'object' && daysOrOptions !== null) {
                if (daysOrOptions.expires) {
                    if (typeof daysOrOptions.expires === 'number') {
                        const date = new Date();
                        date.setTime(date.getTime() + (daysOrOptions.expires * 24 * 60 * 60 * 1000));
                        expires = "; expires=" + date.toUTCString();
                    } else if (daysOrOptions.expires instanceof Date) {
                        expires = "; expires=" + daysOrOptions.expires.toUTCString();
                    }
                }
                
                // Allow overriding defaults locally
                if (daysOrOptions.path !== undefined) {
                    path = daysOrOptions.path ? "; path=" + daysOrOptions.path : "";
                }
                if (daysOrOptions.domain !== undefined) {
                    domain = daysOrOptions.domain ? "; domain=" + daysOrOptions.domain : "";
                }
                if (daysOrOptions.secure !== undefined) {
                    secure = daysOrOptions.secure ? "; secure" : "";
                }
                
                const ssite = daysOrOptions.sameSite !== undefined ? daysOrOptions.sameSite : daysOrOptions.samesite;
                if (ssite !== undefined) {
                    sameSite = ssite ? "; SameSite=" + ssite : "";
                }
            }
        }

        document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + path + domain + secure + sameSite;
    },

    get: function(name) {
        const nameEQ = encodeURIComponent(name) + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    },

    del: function(name) {
        this.set(name, "", -1);
    },

    getCookies: function() {
        const cookies = {};
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            const eqIdx = c.indexOf('=');
            if (eqIdx > 0) {
                const key = decodeURIComponent(c.substring(0, eqIdx));
                const val = decodeURIComponent(c.substring(eqIdx + 1));
                cookies[key] = val;
            }
        }
        return cookies;
    }
};

// Bind to global namespaces
if (typeof window.FrankUI === 'undefined') {
    window.FrankUI = {};
}
window.FrankUI.cookie = Cookie;

if (typeof window.Metro === 'undefined') {
    window.Metro = {};
}
window.Metro.cookie = Cookie;

// If we compile into standard window objects
window.Cookie = Cookie;
