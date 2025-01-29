(function() {
    // Base URL for assets
    const BASE_URL = "https://finnerz.github.io/aquinas-chatbot";

    // Add styles inline
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: Arial, sans-serif;
        }

        .widget-toggle-button {
            position: absolute;
            bottom: 0;
            right: 0;
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
            z-index: 10000;
        }

        .widget-toggle-button:hover {
            transform: scale(1.05);
        }

        .chatbot-widget {
            position: absolute;
            bottom: 80px;
            right: 0;
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
    `;
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
                    <input type="text" placeholder="Type your message...">
                    <button type="submit">Send</button>
                </div>
            </div>
        </div>
    `;

    // Create container and add widget
    const container = document.createElement("div");
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstElementChild);

    // Add widget functionality
    const toggleButton = document.querySelector('.widget-toggle-button');
    const chatbotWidget = document.getElementById('chatbot-widget');
    const closeButton = document.querySelector('.close-button');

    function toggleWidget() {
        chatbotWidget.classList.toggle('active');
    }

    toggleButton.addEventListener('click', toggleWidget);
    closeButton.addEventListener('click', toggleWidget);

    // Close widget when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = chatbotWidget.contains(e.target) || toggleButton.contains(e.target);
        if (!isClickInside && chatbotWidget.classList.contains('active')) {
            toggleWidget();
        }
    });
})(); 
