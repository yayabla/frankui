// FrankUI Chat Component Module
const Chat = {
    init: function() {
        document.querySelectorAll('[data-role="chat"], .chat-container').forEach(el => {
            this.initChat(el);
        });
    },

    initChat: function(container) {
        if (container.dataset.initialized) return container.chat;
        container.dataset.initialized = 'true';

        const messageInput = container.querySelector('.chat-input');
        const sendBtn = container.querySelector('.chat-send');
        const messagesContainer = container.querySelector('.chat-messages');

        // Helper to append a message
        const appendMessage = (text, type = 'incoming', options = {}) => {
            if (!messagesContainer) return;

            const msgEl = document.createElement('div');
            msgEl.className = `chat-message ${type}`;

            // Build the static bubble HTML structure
            msgEl.innerHTML = `
                <div class="chat-message-bubble">
                    <div class="chat-message-text"></div>
                    <div class="chat-message-time"></div>
                </div>
            `;

            // Render sender element dynamically if provided
            if (options.sender) {
                const senderEl = document.createElement('div');
                senderEl.className = 'chat-message-sender';
                senderEl.textContent = options.sender;
                msgEl.querySelector('.chat-message-bubble').insertBefore(senderEl, msgEl.querySelector('.chat-message-text'));
            }

            // Render and insert avatar element dynamically
            let avatarEl = null;
            if (options.avatar) {
                const avatarUrl = String(options.avatar).trim();
                // Block javascript: and other executable protocol schemes
                if (!/^\s*(javascript|data|vbscript):/i.test(avatarUrl)) {
                    avatarEl = document.createElement('img');
                    avatarEl.className = 'chat-avatar';
                    avatarEl.alt = 'avatar';
                    avatarEl.src = avatarUrl;
                }
            } else if (options.initials) {
                avatarEl = document.createElement('div');
                avatarEl.className = 'chat-avatar-initials';
                avatarEl.textContent = options.initials;
            }

            if (avatarEl) {
                if (type === 'incoming') {
                    msgEl.insertBefore(avatarEl, msgEl.firstChild);
                } else {
                    msgEl.appendChild(avatarEl);
                }
            }

            // Populate the text and time fields safely
            const time = options.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            msgEl.querySelector('.chat-message-time').textContent = time;
            msgEl.querySelector('.chat-message-text').textContent = text;

            messagesContainer.appendChild(msgEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        const handleSend = () => {
            if (!messageInput) return;
            const text = messageInput.value.trim();
            if (!text) return;

            // Trigger custom event
            const event = new CustomEvent('chat-send', {
                detail: { 
                    text: text, 
                    append: (txt, opts) => appendMessage(txt, 'outgoing', opts) 
                },
                cancelable: true,
                bubbles: true
            });

            container.dispatchEvent(event);

            // If the custom event was not prevented, append the outgoing message and clear the input
            if (!event.defaultPrevented) {
                appendMessage(text, 'outgoing');
                messageInput.value = '';
                
                // Reset textarea height if any
                messageInput.style.height = 'auto';
            }
        };

        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleSend();
            });
        }

        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            });

            // Auto-grow textarea
            messageInput.addEventListener('input', () => {
                messageInput.style.height = 'auto';
                messageInput.style.height = (messageInput.scrollHeight) + 'px';
            });
        }

        // Expose API
        const api = {
            appendIncoming: (text, options) => appendMessage(text, 'incoming', options),
            appendOutgoing: (text, options) => appendMessage(text, 'outgoing', options),
            clear: () => {
                if (messagesContainer) messagesContainer.innerHTML = '';
            },
            onSend: (callback) => {
                container.addEventListener('chat-send', (e) => {
                    callback(e.detail.text, e.detail.append);
                });
            },
            connectWebSocket: (url, options = {}) => {
                let ws;
                try {
                    ws = new WebSocket(url);
                } catch (err) {
                    console.error("Failed to create WebSocket:", err);
                    if (options.onError) options.onError(err, api);
                    return null;
                }

                ws.onmessage = (e) => {
                    let data = e.data;
                    try {
                        data = JSON.parse(e.data);
                    } catch (err) {
                        // Keep as string
                    }

                    if (options.onMessage) {
                        options.onMessage(data, api);
                    } else {
                        const text = typeof data === 'object' ? (data.text || data.message || '') : data;
                        const sender = typeof data === 'object' ? data.sender : 'Server';
                        const avatar = typeof data === 'object' ? data.avatar : null;
                        const initials = typeof data === 'object' ? data.initials : null;
                        api.appendIncoming(text, { sender, avatar, initials });
                    }
                };

                api.onSend((text) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        const payload = options.formatPayload ? 
                            options.formatPayload(text) : 
                            JSON.stringify({ message: text });
                        ws.send(payload);
                    } else {
                        console.error("WebSocket is not open. ReadyState: " + ws.readyState);
                        api.appendIncoming("Error: Connection closed. Unable to send message.", { sender: "System" });
                    }
                });

                ws.onopen = (e) => {
                    if (options.onOpen) options.onOpen(e, api);
                };

                ws.onclose = (e) => {
                    if (options.onClose) options.onClose(e, api);
                };

                ws.onerror = (e) => {
                    if (options.onError) options.onError(e, api);
                };

                return ws;
            }
        };

        container.chat = api;
        return api;
    },

    get: function(selector) {
        const el = document.querySelector(selector);
        return el ? el.chat : null;
    }
};

// Auto-initialize when content is loaded
document.addEventListener('DOMContentLoaded', () => {
    Chat.init();
});

window.Chat = Chat;
