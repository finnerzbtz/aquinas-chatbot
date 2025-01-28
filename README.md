# Aquinas College Chatbot Widget

A customizable chat widget for Aquinas College that can be embedded into any website.

## Features

- Text-based chat interface
- Voice chat support
- Responsive design
- Customizable appearance
- Easy to embed

## Usage

Add this single line of code to your HTML:

```html
<script src="https://YOUR_GITHUB_USERNAME.github.io/aquinas-chatbot/widget.js"></script>
```

## Development

The project consists of:
- Frontend widget (in /docs)
- Backend service (in /Backend)

### Frontend Files
- `widget.js` - Embeddable widget code
- `script.js` - Main chat functionality
- `styles.css` - Widget styling
- `index.html` - Demo page

### Backend Files
- `main.py` - Flask server with OpenAI integration
- `functions.py` - Helper functions
- `requirements.txt` - Python dependencies

## Setup

1. Clone the repository
2. Install backend dependencies: `pip install -r Backend/requirements.txt`
3. Set up environment variables in `.env`
4. Run the backend server
5. Update `BASE_URL` in widget.js with your domain

## License

MIT License 