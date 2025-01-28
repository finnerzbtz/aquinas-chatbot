import os
import re
import logging
from flask import Flask, request, jsonify, Response
from openai import OpenAI
from time import sleep
from flask_cors import CORS
from flask_sock import Sock
import json
import websocket
import threading
import base64
from io import BytesIO

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
sock = Sock(app)

# Initialize the client
client = OpenAI(
    api_key=os.environ['OPENAI_API_KEY'],
    default_headers={"OpenAI-Beta": "assistants=v2"},
    http_client=None
)

# Existing assistant ID
ASSISTANT_ID = "asst_IMEUawIvZJ2rUKZoBLNyxNAQ"

# OpenAI Realtime API URL
REALTIME_API_URL = "wss://api.openai.com/v1/realtime"
REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17"

def clean_response(text):
    # Remove references like 【12:0†Untitled document (1).docx】
    cleaned = re.sub(r'【[^】]*】', '', text)
    # Remove any remaining whitespace artifacts
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()

class VoiceChat:
    def __init__(self, ws):
        self.client_ws = ws
        self.openai_ws = None
        self.is_active = True
        self.thread_id = None
        # Create a new thread for this voice conversation
        try:
            thread = client.beta.threads.create()
            self.thread_id = thread.id
            logger.info(f"Created new thread: {self.thread_id}")
        except Exception as e:
            logger.error(f"Error creating thread: {e}")

    def process_voice_to_text(self, audio_data):
        try:
            logger.info("Processing voice to text")
            # Create a temporary file-like object
            audio_buffer = BytesIO(audio_data)
            audio_buffer.name = 'voice.webm'  # Set a filename with appropriate extension
            
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_buffer
            )
            logger.info(f"Transcription result: {transcript.text}")
            return transcript.text
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            return None

    def get_assistant_response(self, text):
        try:
            logger.info(f"Getting assistant response for text: {text}")
            # Add user message to thread
            client.beta.threads.messages.create(
                thread_id=self.thread_id,
                role="user",
                content=text
            )

            # Run the assistant
            run = client.beta.threads.runs.create(
                thread_id=self.thread_id,
                assistant_id=ASSISTANT_ID
            )

            # Wait for response
            response = wait_for_response(self.thread_id, run.id)
            logger.info(f"Assistant response: {response}")
            return response
        except Exception as e:
            logger.error(f"Error getting assistant response: {e}")
            return None

    def start_openai_connection(self):
        logger.info("Starting OpenAI connection")
        headers = [
            f"Authorization: Bearer {os.environ['OPENAI_API_KEY']}",
            "OpenAI-Beta: realtime=v1"
        ]
        
        def on_message(ws, message):
            if self.is_active and self.client_ws:
                try:
                    logger.info(f"Received message from OpenAI: {message[:100]}...")  # Log first 100 chars
                    response = json.loads(message)
                    
                    if response.get('type') == 'speech.final':
                        audio_data = base64.b64decode(response.get('audio', ''))
                        text = self.process_voice_to_text(audio_data)
                        if text:
                            assistant_response = self.get_assistant_response(text)
                            if assistant_response:
                                # Send text response
                                self.client_ws.send(json.dumps({
                                    'type': 'text',
                                    'content': assistant_response
                                }))
                                
                                # Convert response to speech
                                try:
                                    speech_response = client.audio.speech.create(
                                        model="tts-1",
                                        voice="alloy",
                                        input=assistant_response
                                    )
                                    audio_base64 = base64.b64encode(speech_response.content).decode('utf-8')
                                    self.client_ws.send(json.dumps({
                                        'type': 'audio',
                                        'content': audio_base64
                                    }))
                                except Exception as e:
                                    logger.error(f"Error converting to speech: {e}")
                                    
                except Exception as e:
                    logger.error(f"Error processing message: {e}")

        def on_error(ws, error):
            logger.error(f"OpenAI WebSocket error: {error}")

        def on_close(ws, close_status_code, close_msg):
            logger.info(f"OpenAI WebSocket connection closed: {close_status_code} - {close_msg}")
            self.is_active = False

        def on_open(ws):
            logger.info("Connected to OpenAI Realtime API")
            init_message = {
                "type": "response.create",
                "response": {
                    "modalities": ["audio"],
                    "instructions": f"Process audio for Aquinas Bot assistant (ID: {ASSISTANT_ID})"
                }
            }
            ws.send(json.dumps(init_message))

        self.openai_ws = websocket.WebSocketApp(
            f"{REALTIME_API_URL}?model={REALTIME_MODEL}",
            header=headers,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )

        wst = threading.Thread(target=self.openai_ws.run_forever)
        wst.daemon = True
        wst.start()
        logger.info("Started OpenAI WebSocket thread")

    def stop(self):
        logger.info("Stopping voice chat")
        self.is_active = False
        if self.openai_ws:
            self.openai_ws.close()

@sock.route('/voice')
def voice_endpoint(ws):
    logger.info("New voice chat connection")
    voice_chat = VoiceChat(ws)
    voice_chat.start_openai_connection()
    
    try:
        while voice_chat.is_active:
            message = ws.receive()
            if message:
                logger.info(f"Received audio chunk, size: {len(message)}")
                if voice_chat.openai_ws and voice_chat.openai_ws.sock:
                    voice_chat.openai_ws.send(message)
    except Exception as e:
        logger.error(f"Error in voice endpoint: {e}")
    finally:
        voice_chat.stop()

@app.route('/', methods=['GET'])
def home():
    return "Server is running!"

@app.route('/start', methods=['GET'])
def create_thread():
    try:
        thread = client.beta.threads.create()
        return jsonify({"thread_id": thread.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

def wait_for_response(thread_id, run_id):
    while True:
        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run_id
        )
        
        if run.status == "completed":
            messages = client.beta.threads.messages.list(
                thread_id=thread_id,
                order="desc",
                limit=1
            )
            raw_response = messages.data[0].content[0].text.value
            cleaned_response = clean_response(raw_response)
            return cleaned_response
        elif run.status == "failed":
            return "Error: Assistant run failed"
        elif run.status in ["requires_action", "expired", "cancelling", "cancelled"]:
            return f"Error: Run status: {run.status}"
        
        sleep(0.5)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        thread_id = data.get('thread_id')
        user_message = data.get('message')
        
        if not thread_id or not user_message:
            return jsonify({"error": "Missing thread_id or message"}), 400

        # Add user message to thread
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_message
        )

        # Run the assistant
        run = client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=ASSISTANT_ID
        )

        # Wait for and return complete response
        response = wait_for_response(thread_id, run.id)
        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)