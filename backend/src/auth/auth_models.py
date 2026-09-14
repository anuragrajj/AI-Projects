from sqlalchemy import Column, Text, TIMESTAMP,DateTime, ForeignKey, String, Integer
# from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
# from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from sqlalchemy.ext.declarative import declarative_base
from src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())