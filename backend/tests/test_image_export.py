import os
import pytest
from pathlib import Path
from PIL import Image
from io import BytesIO
import tempfile
from unittest.mock import patch, MagicMock

from backend.app.services.image_export_service import ImageExportService
from backend.app.config import get_settings


@pytest.fixture
def image_export_service():
    """Create an ImageExportService instance for testing"""
    return ImageExportService()


@pytest.fixture
def sample_image_bytes():
    """Create a sample image as bytes for testing"""
    img = Image.new("RGB", (800, 600), color="red")
    img_bytes = BytesIO()
    img.save(img_bytes, format="PNG")
    return img_bytes.getvalue()


@pytest.fixture
def sample_transparent_image():
    """Create a sample RGBA image for testing"""
    img = Image.new("RGBA", (800, 600), color=(255, 0, 0, 128))
    img_bytes = BytesIO()
    img.save(img_bytes, format="PNG")
    return img_bytes.getvalue()


@pytest.fixture
def sample_base_image():
    """Create a sample base image file"""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        img = Image.new("RGB", (800, 600), color="blue")
        img.save(f, format="PNG")
        yield f.name
    os.unlink(f.name)


def test_normalize_image_rgb_conversion(image_export_service, sample_transparent_image):
    """Test that transparent images are converted to RGB with white background"""
    img = Image.open(BytesIO(sample_transparent_image))
    assert img.mode == "RGBA"
    
    normalized = image_export_service._normalize_image(img)
    
    assert normalized.mode == "RGB"
    assert normalized.size == (800, 600)


def test_normalize_image_resize(image_export_service, sample_image_bytes):
    """Test that images are resized to specified dimensions"""
    img = Image.open(BytesIO(sample_image_bytes))
    original_size = img.size
    
    target_size = (1280, 720)
    normalized = image_export_service._normalize_image(img, target_size)
    
    assert normalized.size == target_size
    assert normalized.mode == "RGB"


def test_export_formats_creates_all_formats(image_export_service, sample_image_bytes):
    """Test that all three formats (PNG, JPEG, WebP) are exported"""
    img = Image.open(BytesIO(sample_image_bytes))
    
    exports = image_export_service._export_formats(img)
    
    assert "png" in exports
    assert "jpeg" in exports
    assert "webp" in exports
    
    # Verify all exports have required fields
    for format_key, export_data in exports.items():
        assert "format" in export_data
        assert "file_path" in export_data
        assert "url" in export_data
        assert "size" in export_data
        assert "exported_at" in export_data
        assert export_data["size"] > 0
        assert os.path.exists(export_data["file_path"])


def test_export_png_format(image_export_service, sample_image_bytes):
    """Test PNG export specifically"""
    img = Image.open(BytesIO(sample_image_bytes))
    
    png_path = image_export_service._export_png(img, "test_png")
    
    assert png_path.endswith(".png")
    assert os.path.exists(png_path)
    
    # Verify it's a valid PNG
    exported_img = Image.open(png_path)
    assert exported_img.size == img.size
    os.remove(png_path)


def test_export_jpeg_format(image_export_service, sample_image_bytes):
    """Test JPEG export specifically"""
    img = Image.open(BytesIO(sample_image_bytes))
    
    jpeg_path = image_export_service._export_jpeg(img, "test_jpeg")
    
    assert jpeg_path.endswith(".jpg")
    assert os.path.exists(jpeg_path)
    
    # Verify it's a valid JPEG
    exported_img = Image.open(jpeg_path)
    assert exported_img.size == img.size
    os.remove(jpeg_path)


def test_export_webp_format(image_export_service, sample_image_bytes):
    """Test WebP export specifically"""
    img = Image.open(BytesIO(sample_image_bytes))
    
    webp_path = image_export_service._export_webp(img, "test_webp")
    
    assert webp_path.endswith(".webp")
    assert os.path.exists(webp_path)
    
    # Verify it's a valid WebP
    exported_img = Image.open(webp_path)
    assert exported_img.size == img.size
    os.remove(webp_path)


def test_composite_images_without_base_image(image_export_service, sample_image_bytes):
    """Test that compositing works when no base image is provided"""
    img = Image.open(BytesIO(sample_image_bytes))
    
    result = image_export_service._composite_images(img, "/nonexistent/path.png")
    
    # Should return original image if base image doesn't exist
    assert result.size == img.size


def test_composite_images_with_base_image(image_export_service, sample_image_bytes, sample_base_image):
    """Test that compositing works with a valid base image"""
    img = Image.open(BytesIO(sample_image_bytes))
    
    result = image_export_service._composite_images(img, sample_base_image)
    
    # Result should have same size as input
    assert result.size == img.size
    assert result.mode == "RGB"


def test_process_and_export_image(image_export_service, sample_image_bytes):
    """Test end-to-end image processing and export"""
    metadata = {"test_key": "test_value"}
    
    exports = image_export_service.process_and_export_image(
        image_data=sample_image_bytes,
        metadata=metadata
    )
    
    assert "png" in exports
    assert "jpeg" in exports
    assert "webp" in exports
    
    # Verify all exported files exist
    for format_key, export_data in exports.items():
        assert os.path.exists(export_data["file_path"])
        assert export_data["metadata"] == metadata
        # Clean up
        os.remove(export_data["file_path"])


def test_process_and_export_with_normalization(image_export_service, sample_image_bytes):
    """Test image processing with dimension normalization"""
    target_dims = (1920, 1080)
    
    exports = image_export_service.process_and_export_image(
        image_data=sample_image_bytes,
        normalize_dimensions=target_dims
    )
    
    # Verify images were resized
    for format_key, export_data in exports.items():
        img = Image.open(export_data["file_path"])
        assert img.size == target_dims
        # Clean up
        os.remove(export_data["file_path"])


def test_cleanup_temp_files(image_export_service, sample_image_bytes):
    """Test cleanup of temporary files"""
    # Create some temp files
    temp_paths = []
    for i in range(3):
        temp_path = image_export_service._save_temp_image(sample_image_bytes)
        temp_paths.append(temp_path)
        assert os.path.exists(temp_path)
    
    # Verify files exist
    for temp_path in temp_paths:
        assert os.path.exists(temp_path)
    
    # Clean up (with 0 days threshold to delete all)
    deleted_count = image_export_service.cleanup_temp_files(days=0)
    
    assert deleted_count >= len(temp_paths)
    
    # Verify files are deleted
    for temp_path in temp_paths:
        assert not os.path.exists(temp_path)


def test_cleanup_output_files(image_export_service, sample_image_bytes):
    """Test cleanup of output files"""
    # Create some output files
    exports = image_export_service.process_and_export_image(sample_image_bytes)
    
    output_paths = []
    for format_key, export_data in exports.items():
        output_paths.append(export_data["file_path"])
        assert os.path.exists(export_data["file_path"])
    
    # Clean up (with 0 days threshold to delete all)
    deleted_count = image_export_service.cleanup_output_files(days=0)
    
    assert deleted_count >= len(output_paths)
    
    # Verify files are deleted
    for output_path in output_paths:
        assert not os.path.exists(output_path)


def test_url_generation_static_files(image_export_service):
    """Test URL generation for StaticFiles mode"""
    with patch.object(image_export_service.settings, "SIGN_URLS", False):
        url = image_export_service._generate_url("/path/to/export_test.png")
        assert url == "/static/output/export_test.png"


def test_url_generation_signed(image_export_service):
    """Test URL generation for signed mode"""
    with patch.object(image_export_service.settings, "SIGN_URLS", True):
        url = image_export_service._generate_url("export_test.png")
        assert "/api/download/export_test.png" in url
        assert "expires=" in url
        assert "signature=" in url


def test_url_signing_expiry(image_export_service):
    """Test that signed URLs include expiry"""
    with patch.object(image_export_service.settings, "SIGN_URLS", True):
        with patch.object(image_export_service.settings, "URL_SIGNATURE_EXPIRY", 3600):
            url = image_export_service._generate_url("test_file.png")
            
            # Extract expires parameter
            assert "expires=" in url
            parts = url.split("expires=")
            assert len(parts) == 2


def test_settings_environment_variables():
    """Test that configuration loads from environment variables"""
    settings = get_settings()
    
    assert hasattr(settings, "OUTPUT_DIR")
    assert hasattr(settings, "TEMP_DIR")
    assert hasattr(settings, "MAX_VARIATIONS")
    assert hasattr(settings, "OUTPUT_QUALITY")
    assert hasattr(settings, "JPEG_QUALITY")
    assert hasattr(settings, "WEBP_QUALITY")
    assert hasattr(settings, "PNG_COMPRESSION")


def test_settings_defaults():
    """Test that default settings are reasonable"""
    settings = get_settings()
    
    assert settings.MAX_VARIATIONS > 0
    assert settings.JPEG_QUALITY > 0 and settings.JPEG_QUALITY <= 100
    assert settings.WEBP_QUALITY > 0 and settings.WEBP_QUALITY <= 100
    assert settings.PNG_COMPRESSION >= 0 and settings.PNG_COMPRESSION <= 9
    assert settings.URL_SIGNATURE_EXPIRY > 0
