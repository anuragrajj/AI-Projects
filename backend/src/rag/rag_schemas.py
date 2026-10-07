from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class DocumentOut(BaseModel):
    id: UUID
    file_name: str
    file_type: Optional[str]
    status: str
    chunk_count: int
    created_at: datetime
    class Config: from_attributes = True

class ChatSessionCreate(BaseModel):
    title: Optional[str] = None
    document_id: Optional[UUID] = None

class ChatSessionUpdate(BaseModel):
    document_id: Optional[UUID] = None
    title: Optional[str] = None


class ChatSessionOut(BaseModel):
    id: UUID
    document_id: Optional[UUID]
    title: Optional[str]
    started_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config: from_attributes = True

class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: UUID
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime
    class Config: from_attributes = True
