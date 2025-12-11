import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.app.main import app
from backend.app.schemas.thumbnail import ThumbnailVariation

client = TestClient(app)

# Mocking the GeminiService
@pytest.fixture
def mock_gemini_service():
    with patch("backend.app.api.endpoints.gemini_service") as mock_service:
        yield mock_service

def test_create_thumbnails_success(mock_gemini_service):
    # Setup mock return value
    mock_variations = [
        ThumbnailVariation(
            id="1", 
            storage_path="/tmp/1.png", 
            metadata={"index": 0},
            exports=None
        ),
        ThumbnailVariation(
            id="2", 
            storage_path="/tmp/2.png", 
            metadata={"index": 1},
            exports=None
        )
    ]
    mock_gemini_service.generate_thumbnails.return_value = mock_variations
    
    # Create dummy image file
    file_content = b"fake image content"
    files = {"image": ("test_image.png", file_content, "image/png")}
    data = {
        "script": "This is a test script",
        "aspect_ratio": "16:9",
        "count": 2
    }
    
    response = client.post("/api/thumbnails", data=data, files=files)
    
    assert response.status_code == 200
    json_resp = response.json()
    assert len(json_resp["variations"]) == 2
    assert json_resp["variations"][0]["id"] == "1"
    
    # Verify service called with correct args
    mock_gemini_service.generate_thumbnails.assert_called_once()
    call_args = mock_gemini_service.generate_thumbnails.call_args
    assert call_args.kwargs["script"] == "This is a test script"
    # Use .value for enum comparison to be safe
    assert call_args.kwargs["aspect_ratio"].value == "16:9"
    assert call_args.kwargs["count"] == 2

def test_invalid_aspect_ratio(mock_gemini_service):
    file_content = b"fake image content"
    files = {"image": ("test_image.png", file_content, "image/png")}
    data = {
        "script": "Test",
        "aspect_ratio": "invalid_ratio",
        "count": 1
    }
    
    response = client.post("/api/thumbnails", data=data, files=files)
    assert response.status_code == 400
    assert "Invalid aspect ratio" in response.json()["detail"]

def test_missing_script(mock_gemini_service):
    file_content = b"fake image content"
    files = {"image": ("test_image.png", file_content, "image/png")}
    # Use whitespace to ensure it's sent but invalid by our logic
    data = {
        "script": "   ",
        "aspect_ratio": "16:9",
        "count": 1
    }
    
    response = client.post("/api/thumbnails", data=data, files=files)
    
    assert response.status_code == 400
    assert "Script text cannot be empty" in response.json()["detail"]

def test_invalid_image_type(mock_gemini_service):
    file_content = b"fake text content"
    files = {"image": ("test.txt", file_content, "text/plain")}
    data = {
        "script": "Test",
        "aspect_ratio": "16:9"
    }
    
    response = client.post("/api/thumbnails", data=data, files=files)
    assert response.status_code == 400
    assert "Invalid image format" in response.json()["detail"]

def test_aspect_ratio_normalization(mock_gemini_service):
    # Test normalization of "16x9" to "16:9"
    mock_gemini_service.generate_thumbnails.return_value = []
    
    file_content = b"fake image content"
    files = {"image": ("test_image.png", file_content, "image/png")}
    data = {
        "script": "Test",
        "aspect_ratio": "16x9",
        "count": 1
    }
    
    response = client.post("/api/thumbnails", data=data, files=files)
    assert response.status_code == 200
    
    call_args = mock_gemini_service.generate_thumbnails.call_args
    assert call_args.kwargs["aspect_ratio"].value == "16:9"

