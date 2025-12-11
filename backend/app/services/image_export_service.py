import os
import logging
from pathlib import Path
from typing import List, Optional, Tuple
from PIL import Image
import uuid
import shutil
from datetime import datetime, timedelta
import hashlib
import hmac

from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ImageExportService:
    """Service for post-processing and exporting images in multiple formats"""

    def __init__(self):
        self.settings = settings
        self._init_directories()

    def _init_directories(self):
        """Initialize output and temp directories"""
        self.settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        self.settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)

    def process_and_export_image(
        self,
        image_data: bytes,
        base_image_path: Optional[str] = None,
        normalize_dimensions: Optional[Tuple[int, int]] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Process an image and export it in multiple formats.

        Args:
            image_data: The generated image data (bytes)
            base_image_path: Optional path to a base image for compositing
            normalize_dimensions: Optional (width, height) to normalize to
            metadata: Optional metadata dictionary

        Returns:
            Dictionary with exported file paths and URLs for each format
        """
        try:
            # Create a temporary file for the image
            temp_file = self._save_temp_image(image_data)

            # Load image and convert to RGB if needed
            img = Image.open(temp_file)
            img = self._normalize_image(img, normalize_dimensions)

            # Composite with base image if provided
            if base_image_path:
                img = self._composite_images(img, base_image_path)

            # Export in multiple formats
            export_files = self._export_formats(img, metadata)

            # Clean up temp file
            if os.path.exists(temp_file):
                os.remove(temp_file)

            return export_files

        except Exception as e:
            logger.error(f"Error processing image: {e}")
            raise

    def _save_temp_image(self, image_data: bytes) -> str:
        """Save image data to a temporary file"""
        temp_file = self.settings.TEMP_DIR / f"temp_{uuid.uuid4()}.png"
        temp_file.parent.mkdir(parents=True, exist_ok=True)

        with open(temp_file, "wb") as f:
            f.write(image_data)

        return str(temp_file)

    def _normalize_image(
        self, img: Image.Image, dimensions: Optional[Tuple[int, int]] = None
    ) -> Image.Image:
        """
        Normalize image: convert to RGB, resize if dimensions provided.

        Args:
            img: PIL Image object
            dimensions: Optional (width, height) tuple

        Returns:
            Normalized PIL Image object
        """
        # Convert to RGB (handle RGBA, P, etc.)
        if img.mode != "RGB":
            # If image has transparency, create white background
            if img.mode in ("RGBA", "LA", "PA"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background
            else:
                img = img.convert("RGB")

        # Resize if dimensions provided
        if dimensions:
            img = img.resize(dimensions, Image.Resampling.LANCZOS)

        return img

    def _composite_images(self, generated_img: Image.Image, base_image_path: str) -> Image.Image:
        """
        Composite generated image with base image.

        Args:
            generated_img: The generated image
            base_image_path: Path to the base/uploaded image

        Returns:
            Composited image
        """
        try:
            base_img = Image.open(base_image_path)
            base_img = self._normalize_image(base_img, generated_img.size)

            # Simple alpha blend if both images are same size
            if base_img.size == generated_img.size:
                # 70% generated, 30% base
                composited = Image.blend(generated_img, base_img, 0.3)
                return composited

            return generated_img

        except Exception as e:
            logger.warning(f"Failed to composite with base image: {e}. Returning generated image.")
            return generated_img

    def _export_formats(self, img: Image.Image, metadata: Optional[dict] = None) -> dict:
        """
        Export image in PNG, JPEG, and WebP formats.

        Args:
            img: PIL Image object
            metadata: Optional metadata dictionary

        Returns:
            Dictionary with format keys mapping to (file_path, url) tuples
        """
        export_files = {}

        # Generate unique ID for this export batch
        export_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        # PNG export
        png_path = self._export_png(img, export_id)
        png_url = self._generate_url(png_path)
        export_files["png"] = {
            "file_path": png_path,
            "url": png_url,
            "format": "PNG",
            "size": os.path.getsize(png_path),
            "exported_at": timestamp,
        }

        # JPEG export
        jpeg_path = self._export_jpeg(img, export_id)
        jpeg_url = self._generate_url(jpeg_path)
        export_files["jpeg"] = {
            "file_path": jpeg_path,
            "url": jpeg_url,
            "format": "JPEG",
            "size": os.path.getsize(jpeg_path),
            "exported_at": timestamp,
        }

        # WebP export
        webp_path = self._export_webp(img, export_id)
        webp_url = self._generate_url(webp_path)
        export_files["webp"] = {
            "file_path": webp_path,
            "url": webp_url,
            "format": "WebP",
            "size": os.path.getsize(webp_path),
            "exported_at": timestamp,
        }

        # Add metadata if provided
        if metadata:
            for format_key in export_files:
                export_files[format_key]["metadata"] = metadata

        return export_files

    def _export_png(self, img: Image.Image, export_id: str) -> str:
        """Export image as PNG"""
        file_path = self.settings.OUTPUT_DIR / f"export_{export_id}.png"
        img.save(file_path, "PNG", compress_level=self.settings.PNG_COMPRESSION)
        logger.info(f"Exported PNG: {file_path}")
        return str(file_path)

    def _export_jpeg(self, img: Image.Image, export_id: str) -> str:
        """Export image as JPEG"""
        file_path = self.settings.OUTPUT_DIR / f"export_{export_id}.jpg"
        img.save(file_path, "JPEG", quality=self.settings.JPEG_QUALITY, optimize=True)
        logger.info(f"Exported JPEG: {file_path}")
        return str(file_path)

    def _export_webp(self, img: Image.Image, export_id: str) -> str:
        """Export image as WebP"""
        file_path = self.settings.OUTPUT_DIR / f"export_{export_id}.webp"
        img.save(file_path, "WEBP", quality=self.settings.WEBP_QUALITY)
        logger.info(f"Exported WebP: {file_path}")
        return str(file_path)

    def _generate_url(self, file_path: str) -> str:
        """
        Generate download URL for a file.

        If SIGN_URLS is enabled, signs the URL with a timestamp.
        Otherwise, returns relative path for StaticFiles serving.

        Args:
            file_path: Full path to the exported file

        Returns:
            URL string
        """
        # Get relative path from output directory
        file_name = Path(file_path).name

        if self.settings.SIGN_URLS:
            return self._sign_url(file_name)
        else:
            # Return static file path for FastAPI StaticFiles
            return f"/static/output/{file_name}"

    def _sign_url(self, file_name: str) -> str:
        """
        Sign a URL with expiry timestamp and HMAC.

        Args:
            file_name: Name of the exported file

        Returns:
            Signed URL string
        """
        expiry = datetime.utcnow() + timedelta(seconds=self.settings.URL_SIGNATURE_EXPIRY)
        expiry_timestamp = int(expiry.timestamp())

        # Create signature: HMAC-SHA256 of "filename:timestamp"
        message = f"{file_name}:{expiry_timestamp}"
        secret = os.getenv("SIGNING_SECRET", "default-secret").encode()
        signature = hmac.new(secret, message.encode(), hashlib.sha256).hexdigest()

        return f"/api/download/{file_name}?expires={expiry_timestamp}&signature={signature}"

    def cleanup_temp_files(self, days: int = 1) -> int:
        """
        Clean up temporary files older than specified days.

        Args:
            days: Age threshold in days

        Returns:
            Number of files deleted
        """
        if not self.settings.TEMP_DIR.exists():
            return 0

        deleted_count = 0
        threshold = datetime.now() - timedelta(days=days)

        try:
            for file_path in self.settings.TEMP_DIR.glob("*"):
                if file_path.is_file():
                    file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    if file_mtime < threshold:
                        os.remove(file_path)
                        deleted_count += 1
                        logger.info(f"Cleaned up temp file: {file_path}")

            return deleted_count

        except Exception as e:
            logger.error(f"Error cleaning up temp files: {e}")
            return 0

    def cleanup_output_files(self, days: int = 7) -> int:
        """
        Clean up output files older than specified days.

        Args:
            days: Age threshold in days

        Returns:
            Number of files deleted
        """
        if not self.settings.OUTPUT_DIR.exists():
            return 0

        deleted_count = 0
        threshold = datetime.now() - timedelta(days=days)

        try:
            for file_path in self.settings.OUTPUT_DIR.glob("*"):
                if file_path.is_file():
                    file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    if file_mtime < threshold:
                        os.remove(file_path)
                        deleted_count += 1
                        logger.info(f"Cleaned up output file: {file_path}")

            return deleted_count

        except Exception as e:
            logger.error(f"Error cleaning up output files: {e}")
            return 0
