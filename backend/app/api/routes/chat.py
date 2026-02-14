"""
Chat API routes
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.services.chat_service import ChatService
from app.services.ai_service import AIService
from app.schemas.chat import (
    ChatSessionCreate, ChatSessionUpdate,
    ChatSessionResponse, ChatSessionWithMessagesResponse,
    ChatMessageResponse, SendMessageRequest,
    ExtractLearningRequest, ExtractLearningResponse, ExtractedLearning,
)

router = APIRouter()


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    session_data: ChatSessionCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    session = await ChatService.create_session(db, user_id, session_data)
    await db.commit()
    return session


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    user_id: str = Depends(get_current_user_id),
    status_filter: str = Query("active", alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    sessions = await ChatService.list_sessions(db, user_id, status_filter, limit, offset)
    return sessions


@router.get("/sessions/{session_id}", response_model=ChatSessionWithMessagesResponse)
async def get_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    session = await ChatService.get_session(db, session_id, user_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

    messages = await ChatService.get_session_messages(db, session_id, limit=1000)
    return ChatSessionWithMessagesResponse(**session.__dict__, messages=messages)


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_chat_session(
    session_id: str,
    update_data: ChatSessionUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    session = await ChatService.update_session(db, session_id, user_id, update_data)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    await db.commit()
    return session


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    deleted = await ChatService.delete_session(db, session_id, user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    await db.commit()
    return None


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    message: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        ai_message = await ChatService.process_user_message(
            db, session_id, user_id, message.content,
        )
        return ai_message
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(50, ge=1, le=200),
    before_sequence: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    session = await ChatService.get_session(db, session_id, user_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

    messages = await ChatService.get_session_messages(db, session_id, limit, before_sequence)
    return messages


@router.get("/sessions/{session_id}/export")
async def export_chat_session(
    session_id: str,
    format: str = Query("openfree", pattern="^(openfree|json|markdown)$"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    try:
        export_data = await ChatService.export_session(db, session_id, user_id, format)
        return export_data
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/extract-learning", response_model=ExtractLearningResponse)
async def extract_learning(
    request: ExtractLearningRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Extract learnings from a chat session using AI."""
    session = await ChatService.get_session(db, request.session_id, user_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

    messages = await ChatService.get_session_messages(db, request.session_id, limit=1000)
    message_dicts = [{"role": m.role, "content": m.content} for m in messages]

    raw_learnings = await AIService.extract_learnings_from_chat(message_dicts)

    extracted = [
        ExtractedLearning(
            concept=l.get("concept", ""),
            category=l.get("category", "OTHER"),
            what_learned=l.get("what_learned", ""),
            when_to_use=l.get("when_to_use", ""),
            when_not_to_use=l.get("when_not_to_use", ""),
            confidence_level=l.get("confidence_level", "LEARNING"),
        )
        for l in raw_learnings
    ]

    return ExtractLearningResponse(learnings=extracted, session_id=request.session_id)
