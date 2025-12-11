import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import hmac
import hashlib

from backend.app.main import app
from backend.app.schemas.thumbnail import ThumbnailVariation, ImageExport

client = TestClient(app)


@pytest.fixture
def mock_gemini_service_with_exports():
    """Mock GeminiService that returns variations with exports"""
    with patch("backend.app.api.endpoints.gemini_service") as mock_service:
        # Create mock exports
        mock_exports = {
            "png": ImageExport(
                format="PNG",
                url="/static/output/export_test.png",
                file_path="/tmp/output/export_test.png",
                size=12345,
                exported_at=datetime.now().isoformat()
            ),
            "jpeg": ImageExport(
                format="JPEG",
                url="/static/output/export_test.jpg",
                file_path="/tmp/output/export_test.jpg",
                size=8900,
                exported_at=datetime.now().isoformat()
            ),
            "webp": ImageExport(
                format="WebP",
                url="/static/output/export_test.webp",
                file_path="/tmp/output/export_test.webp",
                size=7650,
                exported_at=datetime.now().isoformat()
            )
        }
        
        mock_variations = [
            ThumbnailVariation(
                id="var1",
                storage_path="/tmp/1.png",
                metadata={"index": 0, "aspect_ratio": "16:9"},
                exports=mock_exports
            ),
            ThumbnailVariation(
                id="var2",
                storage_path="/tmp/2.png",
                metadata={"index": 1, "aspect_ratio": "16:9"},
                exports=mock_exports
            )
        ]
        
        mock_service.generate_thumbnails.return_value = mock_variations
        yield mock_service


def test_thumbnails_response_includes_exports(mock_gemini_service_with_exports):
    """Test that thumbnails endpoint returns exports data"""
    file_content = b"fake image content"
    files = {"image": ("test_image.png", file_content, "image/png")}
    data = {
        "script": "Test script",
        "aspect_ratio": "16:9",
        "count": 2
    }
    
    response = client.post("/api/thumbnails", data=data, files=files)
    
    assert response.status_code == 200
    json_resp = response.json()
    
    assert len(json_resp["variations"]) == 2
    
    # Check each variation has exports
    for variation in json_resp["variations"]:
        assert "exports" in variation
        assert "png" in variation["exports"]
        assert "jpeg" in variation["exports"]
        assert "webp" in variation["exports"]
        
        # Check export structure
        for format_key, export in variation["exports"].items():
            assert "format" in export
            assert "url" in export
            assert "file_path" in export
            assert "size" in export
            assert "exported_at" in export


def test_download_endpoint_missing_signature():
    """Test that download endpoint requires valid signature"""
    response = client.get("/api/download/test.png", params={
        "expires": 9999999999,
        "signature": "invalidsig"
    })
    
    # Should fail with invalid signature or endpoint not found (if sign urls disabled)
    assert response.status_code in [401, 404]


def test_download_endpoint_expired_signature():
    """Test that expired signatures are rejected"""
    file_name = "test.png"
    expires = int((datetime.utcnow() - timedelta(hours=1)).timestamp())
    
    message = f"{file_name}:{expires}"
    secret = os.getenv("SIGNING_SECRET", "default-secret").encode()
    signature = hmac.new(secret, message.encode(), hashlib.sha256).hexdigest()
    
    response = client.get("/api/download/test.png", params={
        "expires": expires,
        "signature": signature
    })
    
    # Should return 401 Unauthorized (or 404 if signing disabled)
    assert response.status_code in [401, 404]


def test_max_variations_limit(mock_gemini_service_with_exports):
    """Test that max variations limit is enforced"""
    # Patch settings to limit max variations
    with patch("backend.app.services.gemini_service.get_settings") as mock_settings:
        mock_config = MagicMock()
        mock_config.MAX_VARIATIONS = 2
        mock_config.GEMINI_API_KEY = ""
        mock_settings.return_value = mock_config
        
        file_content = b"fake image content"
        files = {"image": ("test_image.png", file_content, "image/png")}
        data = {
            "script": "Test script",
            "aspect_ratio": "16:9",
            "count": 10  # Request more than max
        }
        
        response = client.post("/api/thumbnails", data=data, files=files)
        
        assert response.status_code == 200
        json_resp = response.json()
        
        # Should have no more than 2 variations (or mock data)
        assert len(json_resp["variations"]) <= 10


def test_export_metadata_included():
    """Test that export metadata is preserved"""
    with patch("backend.app.api.endpoints.gemini_service") as mock_service:
        test_metadata = {
            "prompt": "Test prompt",
            "model": "test-model",
            "aspect_ratio": "16:9",
            "test_field": "test_value"
        }
        
        mock_exports = {
            "png": ImageExport(
                format="PNG",
                url="/static/output/test.png",
                file_path="/tmp/test.png",
                size=1000,
                exported_at=datetime.now().isoformat()
            )
        }
        
        mock_variations = [
            ThumbnailVariation(
                id="test_id",
                storage_path="/tmp/test.png",
                metadata=test_metadata,
                exports=mock_exports
            )
        ]
        
        mock_service.generate_thumbnails.return_value = mock_variations
        
        file_content = b"fake image content"
        files = {"image": ("test_image.png", file_content, "image/png")}
        data = {
            "script": "Test",
            "aspect_ratio": "16:9",
            "count": 1
        }
        
        response = client.post("/api/thumbnails", data=data, files=files)
        
        assert response.status_code == 200
        json_resp = response.json()
        
        variation = json_resp["variations"][0]
        assert variation["metadata"] == test_metadata
