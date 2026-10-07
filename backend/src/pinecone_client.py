from functools import lru_cache

from pinecone import Pinecone, ServerlessSpec

from src.config import settings


@lru_cache
def get_pinecone() -> Pinecone:
    if not settings.PINECONE_API_KEY:
        raise RuntimeError("Pinecone API key is missing: set PINECONE in backend/.env")
    return Pinecone(api_key=settings.PINECONE_API_KEY)


@lru_cache
def get_index():
    # Connects on first use and creates the index if this Pinecone project doesn't have it yet.
    pc = get_pinecone()
    if not pc.has_index(settings.PINECONE_INDEX):
        pc.create_index(
            name=settings.PINECONE_INDEX, dimension=settings.EMBEDDING_DIMENSION, metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    return pc.index(name=settings.PINECONE_INDEX)
