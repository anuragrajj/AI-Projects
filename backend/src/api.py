from fastapi import APIRouter

from src.auth.auth_router import auth_router
# from src.rag.router import router as rag_router
# from app.resume_screener.router import router as resume_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
# api_router.include_router(rag_router, prefix="/rag", tags=["rag"])
# api_router.include_router(resume_router, prefix="/resume-screener", tags=["resume-screener"])