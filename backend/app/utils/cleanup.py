import logging
from ..services.image_export_service import ImageExportService
from ..config import get_settings

logger = logging.getLogger(__name__)


def cleanup_old_files():
    """
    Cleanup old temporary and output files.
    
    This can be called periodically (e.g., via a background task or cron job).
    """
    settings = get_settings()
    export_service = ImageExportService()
    
    try:
        # Clean up temp files older than 1 day
        temp_deleted = export_service.cleanup_temp_files(days=1)
        logger.info(f"Cleaned up {temp_deleted} temporary files")
        
        # Clean up output files older than 7 days
        output_deleted = export_service.cleanup_output_files(days=7)
        logger.info(f"Cleaned up {output_deleted} output files")
        
        return {
            "temp_files_deleted": temp_deleted,
            "output_files_deleted": output_deleted
        }
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
        raise
