(function() {
    console.log('Widget script starting...');

    // Base URL for assets
    const BASE_URL = "https://finnerz.github.io/aquinas-chatbot";

    // Add styles inline
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
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
            z-index: 999998;
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

        .header-controls {
            display: flex;
            gap: 10px;
        }

        .sound-toggle, .close-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
        }

        .chatbot-title {
            margin: 0;
            font-size: 18px;
        }

        .welcome-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            text-align: center;
        }

        .welcome-logo {
            width: 80px;
            height: 80px;
            margin-bottom: 10px;
            border-radius: 50%;
            background-color: #CC1F36;
            padding: 15px;
            box-sizing: border-box;
        }

        .welcome-container h2 {
            margin: 10px 0 5px;
            font-size: 20px;
        }

        .welcome-container p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .message-group {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            animation: fadeInUp 0.4s ease-out forwards;
        }

        .message-group:last-child {
            margin-bottom: 0;
        }

        .bot-group {
            padding-left: 36px;
            position: relative;
        }

        .bot-group .bot-icon {
            position: absolute;
            left: 0;
            top: 0;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: #CC1F36;
            padding: 4px;
            box-sizing: border-box;
        }

        .bot-icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .message-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .message {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 12px;
            max-width: 80%;
            font-size: 14px;
            line-height: 1.4;
            animation: fadeInUp 0.3s ease-out forwards;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .message-text {
            word-wrap: break-word;
            flex-grow: 1;
        }

        .message-timestamp {
            font-size: 11px;
            color: #999;
            margin-left: 8px;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .user-message {
            background-color: #CC1F36;
            color: white;
            margin-left: auto;
        }

        .user-message .message-timestamp {
            color: rgba(255, 255, 255, 0.8);
        }

        .bot-message {
            background-color: white;
            color: #333;
            margin-right: auto;
        }

        .chat-form {
            padding: 15px;
            background-color: white;
            border-top: 1px solid #eee;
            position: relative;
        }

        .input-wrapper {
            position: relative;
            margin-bottom: 10px;
        }

        #user-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            background: transparent;
            position: relative;
            z-index: 2;
        }

        .placeholder-animation {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            pointer-events: none;
        }

        .placeholder-text {
            position: absolute;
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
            color: #999;
            font-size: 14px;
            opacity: 0;
            animation: cycleText 24s infinite;
        }

        .placeholder-text:nth-child(2) { animation-delay: 3s; }
        .placeholder-text:nth-child(3) { animation-delay: 6s; }
        .placeholder-text:nth-child(4) { animation-delay: 9s; }
        .placeholder-text:nth-child(5) { animation-delay: 12s; }
        .placeholder-text:nth-child(6) { animation-delay: 15s; }
        .placeholder-text:nth-child(7) { animation-delay: 18s; }

        @keyframes cycleText {
            0%, 3%, 100% { opacity: 0; }
            4%, 13% { opacity: 0.3; }
        }

        .voice-button, .send-button {
            background: none;
            border: none;
            padding: 8px;
            cursor: pointer;
            color: #CC1F36;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .voice-button:hover, .send-button:hover {
            color: #a01829;
        }

        .voice-button svg, .send-button svg {
            width: 24px;
            height: 24px;
        }

        .voice-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #CC1F36;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .voice-button.recording .voice-indicator {
            opacity: 1;
            animation: pulse 1.5s ease infinite;
        }

        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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
                    <div class="header-controls">
                        <button class="sound-toggle">🔊</button>
                        <button class="close-button">✕</button>
                    </div>
                </div>
                <div id="chat-messages" class="chat-messages">
                    <div class="welcome-container">
                        <img src="${BASE_URL}/images.png" alt="Aquinas Logo" class="welcome-logo">
                        <h2>Aquinas Bot</h2>
                        <p>Let's chat</p>
                    </div>
                </div>
                <form id="chat-form" class="chat-form">
                    <div class="input-wrapper">
                        <input type="text" id="user-input" required>
                        <div class="placeholder-animation">
                            <div class="placeholder-text">How can I get help with my studies?</div>
                            <div class="placeholder-text">Who can I speak to about a problem I'm having?</div>
                            <div class="placeholder-text">When do we break up for Summer?</div>
                            <div class="placeholder-text">Which Enrichment activity is best for me?</div>
                            <div class="placeholder-text">What are some good study techniques?</div>
                            <div class="placeholder-text">What school trips can I get involved with?</div>
                            <div class="placeholder-text">How do I book a practice room?</div>
                        </div>
                    </div>
                    <button type="button" class="voice-button" aria-label="Toggle voice input">
                        <div class="voice-indicator"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                    </button>
                    <button type="submit" class="send-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    `;

    // Global variables
    let currentThreadId = null;
    let isProcessing = false;
    let isSoundEnabled = true;

    // Initialize sounds
    const messageSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    const sendSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1432/1432-preview.mp3');
    messageSound.volume = 0.3;
    sendSound.volume = 0.2;

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
        const messageInput = document.getElementById('user-input');
        const chatForm = document.getElementById('chat-form');
        const chatMessages = document.getElementById('chat-messages');
        const soundToggle = document.querySelector('.sound-toggle');

        console.log('Elements found:', {
            toggleButton: !!toggleButton,
            chatbotWidget: !!chatbotWidget,
            closeButton: !!closeButton,
            messageInput: !!messageInput,
            chatForm: !!chatForm,
            chatMessages: !!chatMessages,
            soundToggle: !!soundToggle
        });

        function playSound(sound) {
            if (isSoundEnabled) {
                const clone = sound.cloneNode();
                clone.play().catch(e => console.log('Sound play prevented:', e));
            }
        }

        soundToggle.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            soundToggle.textContent = isSoundEnabled ? '🔊' : '🔇';
        });

        function formatMessageTime(date) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }

        function createMessageGroup(sender) {
            const group = document.createElement('div');
            group.classList.add('message-group', `${sender}-group`);
            
            if (sender === 'bot') {
                group.innerHTML = `
                    <div class="bot-icon">
                        <img src="${BASE_URL}/images.png" alt="Bot">
                    </div>
                `;
            }
            
            const content = document.createElement('div');
            content.classList.add('message-content');
            group.appendChild(content);
            
            return group;
        }

        let currentMessageGroup = null;

        function addMessage(message, isUser = false) {
            const now = new Date();
            
            if (isUser) {
                playSound(sendSound);
            } else {
                playSound(messageSound);
            }

            const lastGroup = chatMessages.querySelector('.message-group:last-of-type');
            const canGroupWithLast = lastGroup && 
                ((isUser && lastGroup.classList.contains('user-group')) ||
                (!isUser && lastGroup.classList.contains('bot-group')));

            if (canGroupWithLast) {
                currentMessageGroup = lastGroup;
            } else {
                currentMessageGroup = createMessageGroup(isUser ? 'user' : 'bot');
                chatMessages.appendChild(currentMessageGroup);
            }

            const messageContent = currentMessageGroup.querySelector('.message-content');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');
            
            const messageTextContainer = document.createElement('div');
            messageTextContainer.classList.add('message-text');
            
            const timeSpan = document.createElement('span');
            timeSpan.classList.add('message-timestamp');
            timeSpan.textContent = formatMessageTime(now);
            
            if (!isUser) {
                messageTextContainer.textContent = '';
                messageElement.appendChild(messageTextContainer);
                messageElement.appendChild(timeSpan);
                
                const words = message.split(' ');
                let currentText = '';
                words.forEach((word, index) => {
                    setTimeout(() => {
                        currentText += (index === 0 ? '' : ' ') + word;
                        messageTextContainer.textContent = currentText;
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, index * 50);
                });
            } else {
                messageTextContainer.textContent = message;
                messageElement.appendChild(messageTextContainer);
                messageElement.appendChild(timeSpan);
            }

            messageContent.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function handleSendMessage(e) {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (!message || isProcessing || !currentThreadId) return;

            isProcessing = true;
            messageInput.value = '';
            messageInput.disabled = true;

            addMessage(message, true);

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

                if (data.response) {
                    addMessage(data.response);
                } else {
                    throw new Error('No response from bot');
                }
            } catch (error) {
                console.error('Error:', error);
                addMessage('Sorry, I had trouble processing your message. Please try again.');
            } finally {
                isProcessing = false;
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

        toggleButton.addEventListener('click', toggleWidget);
        closeButton.addEventListener('click', toggleWidget);
        chatForm.addEventListener('submit', handleSendMessage);

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
