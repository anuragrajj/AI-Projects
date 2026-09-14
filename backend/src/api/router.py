from fastapi import APIRouter
from src.api.routes.auth_router import auth_router
router = APIRouter()

router.include_router(auth_router, tags=["Authentication"])