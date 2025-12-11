from enum import Enum
from pydantic import BaseModel
from typing import List, Optional

class AspectRatio(str, Enum):
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"
    RATIO_4_3 = "4:3"
    RATIO_3_4 = "3:4"

class ThumbnailVariation(BaseModel):
    id: str
    storage_path: str
    metadata: Optional[dict] = None

class ThumbnailResponse(BaseModel):
    request_id: str
    variations: List[ThumbnailVariation]
