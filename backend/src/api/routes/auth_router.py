from fastapi import APIRouter
from src.controllers.auth_controller import register, login

auth_router = APIRouter(prefix="/auth")

auth_router.post("/register")(register)
auth_router.post("/login")(login)
