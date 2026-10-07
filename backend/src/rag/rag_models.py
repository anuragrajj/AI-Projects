import uuid

from sqlalchemy import CheckConstraint, Column, DateTime, Double, ForeignKey, Index, Integer, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.auth.auth_models import User
from src.database import Base

# These mirror the tables that already exist in gen_ai_db (columns, defaults, checks, indexes).
# Changing a model here does not change the table: alter the table as well.


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (
        CheckConstraint("status IN ('processing', 'ready', 'failed')", name="documents_status_check"),
        Index("idx_documents_user_id", "user_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(Integer, ForeignKey(User.id, ondelete="CASCADE"), nullable=False)
    file_name = Column(Text, nullable=False)
    file_type = Column(Text)
    file_size = Column(Integer)
    storage_path = Column(Text, nullable=False)
    status = Column(Text, nullable=False, server_default="processing")
    chunk_count = Column(Integer, server_default="0")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (
        # A session belongs to a logged-in user or to a guest, never both and never neither.
        CheckConstraint(
            "(user_id IS NOT NULL AND guest_id IS NULL) OR (user_id IS NULL AND guest_id IS NOT NULL)",
            name="chk_owner",
        ),
        Index("idx_chat_sessions_user_id", "user_id"),
        Index("idx_chat_sessions_document_id", "document_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(Integer, ForeignKey(User.id, ondelete="CASCADE"))
    guest_id = Column(UUID(as_uuid=True))
    # Deleting a document keeps its chats (and their history) but detaches them.
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"))
    title = Column(Text)
    started_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant')", name="chat_messages_role_check"),
        Index("idx_chat_messages_session_id", "session_id", "created_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class MessageSource(Base):
    __tablename__ = "message_sources"
    __table_args__ = (Index("idx_message_sources_message_id", "message_id"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    message_id = Column(UUID(as_uuid=True), ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_id = Column(Text, nullable=False)
    chunk_text = Column(Text)
    score = Column(Double)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
