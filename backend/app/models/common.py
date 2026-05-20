from datetime import datetime, timezone
from typing import Annotated, Any
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field
from bson import ObjectId


def _obj_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    return str(v) if v is not None else v


PyObjectId = Annotated[str, BeforeValidator(_obj_id)]


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class BaseDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, from_attributes=True)
    id: PyObjectId | None = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
