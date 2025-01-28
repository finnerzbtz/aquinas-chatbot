FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Run the web service
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app 