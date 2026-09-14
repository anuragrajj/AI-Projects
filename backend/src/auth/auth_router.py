from fastapi import APIRouter
from src.auth.auth_controller import register, login
auth_router = APIRouter()


auth_router.post("/register")(register)
auth_router.post("/login")(login)