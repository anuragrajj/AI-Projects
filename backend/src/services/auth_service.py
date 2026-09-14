# services/auth_service.py
from sqlalchemy.orm import Session
import bcrypt
from fastapi import HTTPException
from src.models.auth_models import User
from datetime import datetime, timedelta, timezone
from jose import jwt
from src.schemas.validationSchemas.auth_validation_schema import UserOut

SECRET_KEY = "supersecret"
ALGORITHM = "HS256"
EXPIRE_MINUTES = 60 * 24

def generate_token(user_id: str) -> str:
    payload = {
        "id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def register_user(db: Session, name: str, email: str, password: str):
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(
        name=name,
        email=email,
        password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "user": UserOut.model_validate(user),
    }


def login_user(db: Session, email: str, password: str):
    print("Login attempt:", email)

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    is_match = bcrypt.checkpw(password.encode(), user.password.encode())

    if not is_match:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = generate_token(str(user.id))

    return {
        "success": True,
        "message": "Logged in successfully",
        "data": {
            "user_details": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            },
            "token": token
        }
    }