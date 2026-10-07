import shutil
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.database import get_db
from src.core.deps import get_current_user
from src.auth.auth_models import User
from src.rag import rag_models, rag_schemas, rag_service

rag_router = APIRouter()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ---------- Documents ----------

@rag_router.post("/documents/upload", response_model=rag_schemas.DocumentOut)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    print(file)
    print(db)
    print(current_user)
    print("current_user")
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in rag_service.LOADER_MAP:
        raise HTTPException(400, f"Unsupported file type: {file_ext}")

    dest_path = UPLOAD_DIR / f"{current_user.id}_{file.filename}"
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    document = rag_models.Document(
        user_id=current_user.id, file_name=file.filename, file_type=file_ext,
        file_size=dest_path.stat().st_size, storage_path=str(dest_path), status="processing",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    rag_service.process_document(db, document)
    db.refresh(document)
    return document


@rag_router.get("/documents", response_model=list[rag_schemas.DocumentOut])
def list_documents(status: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(rag_models.Document).filter(rag_models.Document.user_id == current_user.id)
    if status:
        q = q.filter(rag_models.Document.status == status)
    return q.order_by(rag_models.Document.created_at.desc()).all()


@rag_router.delete("/documents/{document_id}")
def delete_document(document_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = db.query(rag_models.Document).filter_by(id=document_id, user_id=current_user.id).first()
    if not document:
        raise HTTPException(404, "Document not found")
    rag_service.delete_document_vectors(document_id, current_user.id)
    db.delete(document)
    db.commit()
    return {"message": "Document deleted"}


# ---------- Chat sessions ----------

@rag_router.post("/chat/sessions", response_model=rag_schemas.ChatSessionOut)
def create_session(payload: rag_schemas.ChatSessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = rag_models.ChatSession(user_id=current_user.id, title=payload.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@rag_router.get("/chat/sessions", response_model=list[rag_schemas.ChatSessionOut])
def list_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(rag_models.ChatSession).filter(rag_models.ChatSession.user_id == current_user.id)\
        .order_by(rag_models.ChatSession.updated_at.desc()).all()


@rag_router.patch("/chat/sessions/{session_id}", response_model=rag_schemas.ChatSessionOut)
def update_session(session_id: UUID, payload: rag_schemas.ChatSessionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(rag_models.ChatSession).filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        raise HTTPException(404, "Session not found")
    if payload.document_id is not None:
        if session.started_at is not None:
            raise HTTPException(409, "Chat already started — create a new session to use a different document")
        session.document_id = payload.document_id
    if payload.title is not None:
        session.title = payload.title
    db.commit()
    db.refresh(session)
    return session


# ---------- Messages ----------

@rag_router.post("/chat/sessions/{session_id}/messages", response_model=rag_schemas.MessageOut)
def send_message(session_id: UUID, payload: rag_schemas.MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(rag_models.ChatSession).filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        raise HTTPException(404, "Session not found")
    if not session.document_id:
        raise HTTPException(400, "Attach a document to this session before chatting")

    prior_messages = db.query(rag_models.ChatMessage).filter_by(session_id=session.id)\
        .order_by(rag_models.ChatMessage.created_at).all()
    history = [{"role": m.role, "content": m.content} for m in prior_messages]

    user_message = rag_models.ChatMessage(session_id=session.id, role="user", content=payload.content)
    db.add(user_message)
    if session.started_at is None:
        session.started_at = func.now()  # the message's created_at is only filled in by the database on commit
    db.commit()

    results = rag_service.retrieve_context(current_user.id, session.document_id, payload.content)
    chunks = [doc.page_content for doc, _ in results]
    answer = rag_service.generate_answer(payload.content, chunks, history)

    assistant_message = rag_models.ChatMessage(session_id=session.id, role="assistant", content=answer)
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    for doc, score in results:
        db.add(rag_models.MessageSource(
            message_id=assistant_message.id, document_id=session.document_id,
            chunk_id=f"{doc.metadata['document_id']}::{doc.metadata['chunk_index']}",
            chunk_text=doc.page_content, score=float(score),
        ))
    db.commit()

    return assistant_message


@rag_router.get("/chat/sessions/{session_id}/messages", response_model=list[rag_schemas.MessageOut])
def get_messages(session_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(rag_models.ChatSession).filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        raise HTTPException(404, "Session not found")
    return db.query(rag_models.ChatMessage).filter_by(session_id=session.id)\
        .order_by(rag_models.ChatMessage.created_at).all()