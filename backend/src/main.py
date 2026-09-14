from fastapi import FastAPI
from dotenv import load_dotenv
import os
from src.api.router import router
from fastapi.middleware.cors import CORSMiddleware
import httpx
load_dotenv()  # reads .env file into environment
import src.models

port = int(os.getenv("PORT", 8000))

app = FastAPI(
    title="GenAI Project",
    version="1.0.0",
)

# Allow all origins for local development — tighten this in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
        "http://127.0.0.1:5173","*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get('/')
def get_todos():
    response = httpx.get("https://jsonplaceholder.typicode.com/todos")
    return response.json()
    # async with httpx.AsyncClient() as client: