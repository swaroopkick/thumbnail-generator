from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from ..schemas.thumbnail import ThumbnailResponse, AspectRatio
from ..services.gemini_service import GeminiService
from ..utils.file_storage import save_upload_file
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Dependency injection for service could be done, but for simplicity we instantiate here or use a global
# In a real app, we'd use Depends(get_gemini_service)
gemini_service = GeminiService()

@router.post("/thumbnails", response_model=ThumbnailResponse)
async def create_thumbnails(
    script: str = Form(...),
    image: UploadFile = File(...),
    aspect_ratio: str = Form(...),
    count: Optional[int] = Form(1)
):
    # Validation
    if not script.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Script text cannot be empty"
        )
    
    # Normalize aspect ratio
    # Attempt to match input string to Enum
    try:
        # Simple normalization: remove spaces, convert to lower case
        normalized_ratio = aspect_ratio.strip().replace(" ", "")
        ratio_enum = AspectRatio(normalized_ratio)
    except ValueError:
        # specific handling if we want to support "16x9" or similar
        if "x" in normalized_ratio:
             normalized_ratio = normalized_ratio.replace("x", ":")
             try:
                 ratio_enum = AspectRatio(normalized_ratio)
             except ValueError:
                 raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Invalid aspect ratio. Supported values: {[e.value for e in AspectRatio]}"
                )
        else:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Invalid aspect ratio. Supported values: {[e.value for e in AspectRatio]}"
            )

    # Validate image content type (basic check)
    if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid image format. Supported formats: JPEG, PNG, WEBP"
        )
    
    try:
        # Stream file to temp storage
        file_path = await save_upload_file(image)
        
        # Call service
        variations = gemini_service.generate_thumbnails(
            script=script, 
            image_path=file_path, 
            aspect_ratio=ratio_enum, 
            count=count
        )
        
        return ThumbnailResponse(
            request_id="req_" + file_path.split("/")[-1].split(".")[0], # simplified request ID
            variations=variations
        )
        
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        )
