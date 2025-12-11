# Thumbnail Generator Backend

FastAPI backend for generating thumbnails using Google Generative AI.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
# or using Poetry:
poetry install
```

3. Configure environment variables:
```bash
cp ../config/.env.example .env
```

Edit `.env` and add your Google Gemini API key.

## Running the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`
