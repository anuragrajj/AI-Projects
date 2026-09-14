# schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class RegisterRequest(BaseModel):
    name: Optional[str]
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str