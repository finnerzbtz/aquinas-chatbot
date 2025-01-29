(function() {
    // Base URL for assets
    const BASE_URL = "https://finnerz.github.io/aquinas-chatbot";

    // Load CSS
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = `${BASE_URL}/styles.css`;
    document.head.appendChild(style);

    // Create widget HTML
    const widgetHTML = `
        <div class="widget-container">
            <button class="widget-toggle-button" aria-label="Toggle chat widget">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
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

    // Create container and add widget
    const container = document.createElement("div");
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstElementChild);

    // Load main script
    const script = document.createElement("script");
    script.src = `${BASE_URL}/script.js`;
    document.body.appendChild(script);
})(); 
