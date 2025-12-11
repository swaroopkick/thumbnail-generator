import os
import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("backend/storage/uploads")
GENERATED_DIR = Path("backend/storage/generated")

def init_storage():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    init_storage()
    file_extension = Path(upload_file.filename).suffix
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return str(file_path)

def save_generated_image(image_data: bytes, extension: str = ".png") -> str:
    init_storage()
    file_name = f"{uuid.uuid4()}{extension}"
    file_path = GENERATED_DIR / file_name
    
    with open(file_path, "wb") as f:
        f.write(image_data)
        
    return str(file_path)
