from src.auth.auth_service import register_user, login_user
from src.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session
from src.auth.auth_schemas import RegisterRequest, LoginRequest

def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(
        db=db,
        name=req.name,
        email=req.email,
        password=req.password
    )

def login(req: LoginRequest, db: Session = Depends(get_db)):
    return login_user(
        db=db,
        email=req.email,
        password=req.password
    )