import os

from dotenv import load_dotenv

load_dotenv()  # main.py only loads .env after the routers (and so this module) have been imported


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    PINECONE_API_KEY: str | None = os.getenv("PINECONE")
    PINECONE_INDEX: str = "rag-documents"
    EMBEDDING_MODEL: str = "multilingual-e5-large"  # hosted by Pinecone, so the Pinecone key covers embeddings too
    EMBEDDING_DIMENSION: int = 1024  # must match the model above; the index is created with this size

    # While True, chat replies are a placeholder instead of a real LLM answer.
    # Set to False once ANTHROPIC_API_KEY is in .env.
    USE_DUMMY_ANSWERS: bool = True


settings = Settings()
