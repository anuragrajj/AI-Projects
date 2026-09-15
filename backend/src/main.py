from fastapi import FastAPI
from dotenv import load_dotenv
import os
from src.api import api_router
from fastapi.middleware.cors import CORSMiddleware
import httpx
# from src.database import Base, engine
# from src.auth import auth_models  # noqa: F401 — registers models on Base.metadata
load_dotenv()  # reads .env file into environment

port = int(os.getenv("PORT", 8000))

app = FastAPI(
    title="GenAI Project",
    version="1.0.0",
)

# Creates any tables declared on Base that don't exist yet.
# Does not alter existing tables — use a migration tool (e.g. Alembic) for schema changes.
# Base.metadata.create_all(bind=engine)

# Allow all origins for local development — tighten this in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
        "http://127.0.0.1:5173","*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get('/')
def get_todos():
    response = httpx.get("https://jsonplaceholder.typicode.com/todos")
    return response.json()
    # async with httpx.AsyncClient() as client: