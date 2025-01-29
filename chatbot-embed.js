(function() {
    console.log('Widget script starting...');

    // Base URL for assets
    const BASE_URL = "https://finnerz.github.io/aquinas-chatbot";

    // Add styles inline
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        /* Debug outline */
        .widget-container * {
            outline: 1px solid rgba(255, 0, 0, 0.1);
        }

        .widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: Arial, sans-serif;
        }

        .widget-toggle-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #CC1F36;
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            padding: 0;
        }

        .widget-toggle-button:hover {
            transform: scale(1.05);
        }

        .widget-toggle-button svg {
            width: 24px;
            height: 24px;
        }

        .chatbot-widget {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 350px;
            height: 500px;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            background-color: white;
            transition: transform 0.3s ease, opacity 0.3s ease;
            transform: translateY(20px);
            opacity: 0;
            pointer-events: none;
            z-index: 999999;
        }

        .chatbot-widget.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
        }

        .chatbot-header {
            background-color: #CC1F36;
            color: white;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .chatbot-title {
            margin: 0;
            font-size: 18px;
        }

        .close-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            padding: 5px;
        }

        #chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background-color: #f5f5f5;
        }

        #chat-input {
            display: flex;
            padding: 15px;
            background-color: white;
            border-top: 1px solid #eee;
        }

        #chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
            font-size: 14px;
        }

        #chat-input button {
            padding: 10px 20px;
            background-color: #CC1F36;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        #chat-input button:hover {
            background-color: #a01829;
        }

        #chat-input button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }

        .message {
            margin-bottom: 10px;
            max-width: 80%;
            padding: 10px;
            border-radius: 10px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .bot-message {
            background-color: white;
            margin-right: auto;
        }

        .user-message {
            background-color: #CC1F36;
            color: white;
            margin-left: auto;
        }

        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 10px;
            background: white;
            border-radius: 10px;
            margin-bottom: 10px;
            width: fit-content;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            background: #CC1F36;
            border-radius: 50%;
            animation: typing 1.4s infinite;
            opacity: 0.3;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    `;
    
    console.log('Adding styles to document...');
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const widgetHTML = `
        <div class="widget-container">
            <button class="widget-toggle-button" aria-label="Toggle chat widget">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
            </button>
            <div id="chatbot-widget" class="chatbot-widget">
                <div class="chatbot-header">
                    <h1 class="chatbot-title">Aquinas Bot</h1>
                    <button class="close-button">✕</button>
                </div>
                <div id="chat-messages"></div>
                <div id="chat-input">
                    <input type="text" placeholder="Type your message..." id="message-input">
                    <button type="submit" id="send-button">Send</button>
                </div>
            </div>
        </div>
    `;

    // Global variables
    let currentThreadId = null;
    let isProcessing = false;

    function initializeWidget() {
        console.log('Initializing widget...');
        
        // Create container and add widget
        const container = document.createElement("div");
        container.innerHTML = widgetHTML;
        document.body.appendChild(container.firstElementChild);
        
        console.log('Widget HTML added to document');

        // Add widget functionality
        const toggleButton = document.querySelector('.widget-toggle-button');
        const chatbotWidget = document.getElementById('chatbot-widget');
        const closeButton = document.querySelector('.close-button');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const chatMessages = document.getElementById('chat-messages');

        console.log('Elements found:', {
            toggleButton: !!toggleButton,
            chatbotWidget: !!chatbotWidget,
            closeButton: !!closeButton,
            messageInput: !!messageInput,
            sendButton: !!sendButton,
            chatMessages: !!chatMessages
        });

        function showTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            chatMessages.appendChild(indicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return indicator;
        }

        function removeTypingIndicator() {
            const indicator = chatMessages.querySelector('.typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        }

        async function handleSendMessage() {
            const message = messageInput.value.trim();
            if (!message || isProcessing || !currentThreadId) return;

            isProcessing = true;
            messageInput.value = '';
            sendButton.disabled = true;
            messageInput.disabled = true;

            addMessage(message, true);
            const typingIndicator = showTypingIndicator();

            try {
                const response = await fetch('https://aquinas-assistant-384571950984.europe-west2.run.app/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        thread_id: currentThreadId
                    })
                });

                const data = await response.json();
                removeTypingIndicator();

                if (data.response) {
                    addMessage(data.response);
                } else {
                    throw new Error('No response from bot');
                }
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator();
                addMessage('Sorry, I had trouble processing your message. Please try again.');
            } finally {
                isProcessing = false;
                sendButton.disabled = false;
                messageInput.disabled = false;
                messageInput.focus();
            }
        }

        async function initializeChat() {
            try {
                const response = await fetch('https://aquinas-assistant-384571950984.europe-west2.run.app/start', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (data.thread_id) {
                    currentThreadId = data.thread_id;
                    console.log('Chat initialized with thread ID:', currentThreadId);
                    addMessage('Hello! How can I help you today?');
                } else {
                    throw new Error('No thread ID received');
                }
            } catch (error) {
                console.error('Error initializing chat:', error);
                addMessage('Sorry, I had trouble connecting. Please refresh the page to try again.');
            }
        }

        // Initialize the chat when the widget is first opened
        let isInitialized = false;
        
        function toggleWidget() {
            console.log('Toggle widget clicked');
            chatbotWidget.classList.toggle('active');
            
            // Initialize chat on first open
            if (!isInitialized && chatbotWidget.classList.contains('active')) {
                isInitialized = true;
                initializeChat();
            }
            
            if (chatbotWidget.classList.contains('active')) {
                messageInput.focus();
            }
        }

        function addMessage(message, isUser = false) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        toggleButton.addEventListener('click', toggleWidget);
        closeButton.addEventListener('click', toggleWidget);
        sendButton.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        document.addEventListener('click', (e) => {
            const isClickInside = chatbotWidget.contains(e.target) || toggleButton.contains(e.target);
            if (!isClickInside && chatbotWidget.classList.contains('active')) {
                toggleWidget();
            }
        });

        console.log('Widget initialization complete');
    }

    console.log('Current document readyState:', document.readyState);
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        console.log('Document still loading, adding DOMContentLoaded listener');
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        console.log('Document already loaded, initializing immediately');
        initializeWidget();
    }
})(); 
