document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const soundToggle = document.querySelector('.sound-toggle');
    const voiceButton = document.querySelector('.voice-button');
    let currentMessageGroup = null;
    let isProcessing = false;
    let isSoundEnabled = true;
    let currentThreadId = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let ws = null;

    // Backend API URL
    const API_URL = 'https://aquinas-assistant-384571950984.europe-west2.run.app';

    // Initialize sounds
    const messageSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    const sendSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1432/1432-preview.mp3');
    messageSound.volume = 0.3;
    sendSound.volume = 0.2;

    // Sound toggle functionality
    soundToggle.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundToggle.textContent = isSoundEnabled ? '🔊' : '🔇';
    });

    function playSound(sound) {
        if (isSoundEnabled) {
            const clone = sound.cloneNode();
            clone.play().catch(e => console.log('Sound play prevented:', e));
        }
    }

    // Time formatting helper
    function formatMessageTime(date) {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    }

    // Initialize the conversation by creating a new thread
    async function initializeChat() {
        try {
            const response = await fetch(`${API_URL}/start`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.thread_id) {
                currentThreadId = data.thread_id;
                console.log('Chat initialized with thread ID:', currentThreadId);
                
                // Show initial messages
                addMessageWithAnimation('bot', "Hello! I'm your very own Aquinas assistant ⭐");
                setTimeout(() => {
                    addMessageWithAnimation('bot', "How can I help?");
                }, 1000);
            } else {
                console.error('Failed to initialize chat:', data.error);
                addMessageWithAnimation('bot', 'Sorry, I had trouble connecting. Please refresh the page to try again.');
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
            addMessageWithAnimation('bot', 'Sorry, I had trouble connecting. Please refresh the page to try again.');
        }
    }

    // Add welcome message timestamp
    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = 'Today';
    chatMessages.appendChild(messageTime);

    // Initialize the chat
    initializeChat();

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message || isProcessing || !currentThreadId) return;

        isProcessing = true;
        userInput.value = '';
        
        // Play send sound and add user message
        playSound(sendSound);
        addMessageWithAnimation('user', message);
        currentMessageGroup = null;

        showTypingIndicator();
        
        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    thread_id: currentThreadId,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response) {
                hideTypingIndicator();
                addMessageWithAnimation('bot', data.response);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            addMessageWithAnimation('bot', 'Sorry, there was an error processing your message. Please try again.');
        } finally {
            isProcessing = false;
        }
    });

    // Add keyboard support
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    function addMessageWithAnimation(sender, content) {
        const now = new Date();
        
        // Only add timestamp if it's the first message
        if (!chatMessages.querySelector('.message-time')) {
            const messageTime = document.createElement('div');
            messageTime.classList.add('message-time');
            messageTime.textContent = 'Today';
            chatMessages.appendChild(messageTime);
        }

        if (sender === 'bot') {
            playSound(messageSound);
        }

        // Check if we can group with the previous message
        const lastGroup = chatMessages.querySelector('.message-group:last-of-type');
        const canGroupWithLast = lastGroup && 
            ((sender === 'bot' && lastGroup.classList.contains('bot-group')) ||
             (sender === 'user' && lastGroup.classList.contains('user-group')));

        if (canGroupWithLast) {
            currentMessageGroup = lastGroup;
        } else {
            currentMessageGroup = createMessageGroup(sender);
            chatMessages.appendChild(currentMessageGroup);
        }

        const messageContent = currentMessageGroup.querySelector('.message-content');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const messageTextContainer = document.createElement('div');
        messageTextContainer.classList.add('message-text');
        
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-timestamp');
        timeSpan.textContent = formatMessageTime(now);
        
        if (sender === 'bot') {
            messageTextContainer.textContent = ''; // Initialize empty
            messageElement.appendChild(messageTextContainer);
            messageElement.appendChild(timeSpan);
            
            const words = content.split(' ');
            let currentText = '';
            words.forEach((word, index) => {
                setTimeout(() => {
                    currentText += (index === 0 ? '' : ' ') + word;
                    messageTextContainer.textContent = currentText;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, index * 100);
            });
        } else {
            messageTextContainer.textContent = content;
            messageElement.appendChild(messageTextContainer);
            messageElement.appendChild(timeSpan);
        }

        messageContent.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createMessageGroup(sender) {
        const group = document.createElement('div');
        group.classList.add('message-group');
        
        if (sender === 'bot') {
            const iconDiv = document.createElement('div');
            iconDiv.classList.add('bot-icon');
            const iconImg = document.createElement('img');
            iconImg.src = 'images.png';
            iconImg.alt = 'Aquinas Bot';
            iconDiv.appendChild(iconImg);
            group.appendChild(iconDiv);
        }
        
        group.classList.add(sender === 'user' ? 'user-group' : 'bot-group');
        
        const content = document.createElement('div');
        content.classList.add('message-content');
        group.appendChild(content);
        
        return group;
    }

    function showTypingIndicator() {
        if (!currentMessageGroup || currentMessageGroup.querySelector('.user-message')) {
            currentMessageGroup = createMessageGroup('bot');
            chatMessages.appendChild(currentMessageGroup);
        }
        
        const content = currentMessageGroup.querySelector('.message-content');
        const typing = document.createElement('div');
        typing.classList.add('typing-indicator');
        typing.innerHTML = '<span></span><span></span><span></span>';
        content.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicators = document.querySelectorAll('.typing-indicator');
        typingIndicators.forEach(indicator => indicator.remove());
    }

    // Handle placeholder text cycling
    const placeholderTexts = document.querySelectorAll('.placeholder-text');
    let currentTextIndex = 0;

    function showNextPlaceholder() {
        placeholderTexts.forEach(text => {
            text.classList.remove('active');
        });
        
        placeholderTexts[currentTextIndex].classList.add('active');
        currentTextIndex = (currentTextIndex + 1) % placeholderTexts.length;
    }

    // Start the cycle
    showNextPlaceholder();
    setInterval(showNextPlaceholder, 3000);

    // Mobile viewport height fix
    function setVhProperty() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Set initial viewport height
    setVhProperty();

    // Update viewport height on resize and orientation change
    window.addEventListener('resize', setVhProperty);
    window.addEventListener('orientationchange', () => {
        setTimeout(setVhProperty, 100);
    });

    // Handle keyboard showing/hiding on mobile
    if ('virtualKeyboard' in navigator) {
        navigator.virtualKeyboard.overlaysContent = true;
        navigator.virtualKeyboard.addEventListener('geometrychange', (event) => {
            document.body.classList.toggle('keyboard-open', event.target.boundingRect.height > 0);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    } else {
        // Fallback for browsers without VirtualKeyboard API
        userInput.addEventListener('focus', () => {
            document.body.classList.add('keyboard-open');
            setTimeout(() => chatMessages.scrollTop = chatMessages.scrollHeight, 100);
        });
        
        userInput.addEventListener('blur', () => {
            document.body.classList.remove('keyboard-open');
        });
    }

    // Prevent elastic scrolling on iOS
    document.body.addEventListener('touchmove', (e) => {
        if (e.target.closest('.chat-messages')) return;
        e.preventDefault();
    }, { passive: false });

    // Add touch feedback
    const addTouchFeedback = (element) => {
        element.addEventListener('touchstart', () => {
            element.style.transform = 'scale(0.98)';
        });
        
        ['touchend', 'touchcancel'].forEach(event => {
            element.addEventListener(event, () => {
                element.style.transform = '';
            });
        });
    };

    // Add touch feedback to buttons
    document.querySelectorAll('.send-button, .sound-toggle, .close-button').forEach(addTouchFeedback);

    // Handle pull-to-refresh
    let touchStartY = 0;
    let isPulling = false;

    chatMessages.addEventListener('touchstart', (e) => {
        if (chatMessages.scrollTop === 0) {
            touchStartY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });

    chatMessages.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        
        const pull = e.touches[0].clientY - touchStartY;
        if (pull > 0 && pull < 100) {
            chatMessages.style.transform = `translateY(${pull / 2}px)`;
        }
    }, { passive: true });

    chatMessages.addEventListener('touchend', () => {
        if (!isPulling) return;
        
        isPulling = false;
        chatMessages.style.transform = '';
        chatMessages.style.transition = 'transform 0.3s ease-out';
        setTimeout(() => {
            chatMessages.style.transition = '';
        }, 300);
    });

    // Voice chat functionality
    async function initializeVoiceChat() {
        console.log('Initializing voice chat...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Got audio stream');
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                console.log('Audio data available, size:', event.data.size);
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        console.log('Sending audio chunk to server');
                        ws.send(event.data);
                    }
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('MediaRecorder stopped');
                if (ws) {
                    ws.close();
                }
                audioChunks = [];
            };

        } catch (error) {
            console.error('Error accessing microphone:', error);
            addMessageWithAnimation('bot', 'Unable to access microphone. Please check your permissions and try again.');
        }
    }

    async function startRecording() {
        if (!mediaRecorder) {
            await initializeVoiceChat();
        }

        if (mediaRecorder && mediaRecorder.state === 'inactive') {
            audioChunks = [];
            isRecording = true;
            voiceButton.classList.add('recording');
            document.body.classList.add('recording-active');

            // Initialize WebSocket connection
            console.log('Attempting to connect to WebSocket...');
            ws = new WebSocket(`${API_URL.replace('https', 'wss')}/voice`);
            
            ws.onopen = () => {
                console.log('WebSocket connection opened');
                mediaRecorder.start(250); // Send audio chunks every 250ms
            };

            ws.onmessage = (event) => {
                console.log('Received WebSocket message:', event.data);
                try {
                    const response = JSON.parse(event.data);
                    if (response.type === 'text') {
                        console.log('Received text response:', response.content);
                        addMessageWithAnimation('bot', response.content);
                    } else if (response.type === 'audio') {
                        console.log('Received audio response');
                        const audio = new Audio(response.content);
                        audio.play();
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                stopRecording();
                addMessageWithAnimation('bot', 'Sorry, there was an error with the voice chat. Please try again.');
            };

            ws.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                stopRecording();
            };
        }
    }

    function stopRecording() {
        console.log('Stopping recording...');
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            console.log('MediaRecorder state:', mediaRecorder.state);
            mediaRecorder.stop();
            isRecording = false;
            voiceButton.classList.remove('recording');
            document.body.classList.remove('recording-active');
        }
        if (ws) {
            console.log('Closing WebSocket connection...');
            ws.close();
        }
    }

    voiceButton.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    // Add keyboard shortcut for voice input (Space key when input is empty)
    userInput.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && userInput.value.trim() === '') {
            e.preventDefault();
            if (!isRecording) {
                startRecording();
            }
        } else if (e.key === 'Escape' && isRecording) {
            stopRecording();
        }
    });

    // Initialize voice capability check
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
            voiceButton.style.display = 'flex';
        })
        .catch(() => {
            voiceButton.style.display = 'none';
        });
}); 