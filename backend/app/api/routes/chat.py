"""
Chat API routes
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.services.chat_service import ChatService
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionUpdate,
    ChatSessionResponse,
    ChatSessionWithMessagesResponse,
    ChatMessageResponse,
    SendMessageRequest,
)

router = APIRouter()


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    session_data: ChatSessionCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new chat session

    Args:
        session_data: Session creation data
        user_id: Current user ID from token
        db: Database session

    Returns:
        Created chat session
    """
    try:
        session = await ChatService.create_session(db, user_id, session_data)
        await db.commit()
        return session
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create chat session: {str(e)}"
        )


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    user_id: str = Depends(get_current_user_id),
    status_filter: str = Query("active", alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    List user's chat sessions

    Args:
        user_id: Current user ID from token
        status_filter: Filter by status (active, archived, deleted)
        limit: Maximum number of sessions to return
        offset: Pagination offset
        db: Database session

    Returns:
        List of chat sessions
    """
    try:
        sessions = await ChatService.list_sessions(
            db=db,
            user_id=user_id,
            status=status_filter,
            limit=limit,
            offset=offset
        )
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list chat sessions: {str(e)}"
        )


@router.get("/sessions/{session_id}", response_model=ChatSessionWithMessagesResponse)
async def get_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a chat session with its messages

    Args:
        session_id: Session ID
        user_id: Current user ID from token
        db: Database session

    Returns:
        Chat session with messages
    """
    try:
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )

        # Get messages
        messages = await ChatService.get_session_messages(db, session_id, limit=1000)

        # Return session with messages
        return ChatSessionWithMessagesResponse(
            **session.__dict__,
            messages=messages
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get chat session: {str(e)}"
        )


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_chat_session(
    session_id: str,
    update_data: ChatSessionUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a chat session

    Args:
        session_id: Session ID
        update_data: Update data
        user_id: Current user ID from token
        db: Database session

    Returns:
        Updated chat session
    """
    try:
        session = await ChatService.update_session(db, session_id, user_id, update_data)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )

        await db.commit()
        return session
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update chat session: {str(e)}"
        )


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete (soft delete) a chat session

    Args:
        session_id: Session ID
        user_id: Current user ID from token
        db: Database session

    Returns:
        No content
    """
    try:
        deleted = await ChatService.delete_session(db, session_id, user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )

        await db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete chat session: {str(e)}"
        )


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    message: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message and get AI response

    Args:
        session_id: Session ID
        message: Message content and optional overrides
        user_id: Current user ID from token
        db: Database session

    Returns:
        AI response message
    """
    try:
        # Process message and get AI response
        ai_message = await ChatService.process_user_message(
            db=db,
            session_id=session_id,
            user_id=user_id,
            content=message.content,
            model_override=message.ai_model.value if message.ai_model else None,
            teaching_method_override=message.teaching_method.value if message.teaching_method else None,
        )

        return ai_message
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(50, ge=1, le=200),
    before_sequence: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get messages from a chat session

    Args:
        session_id: Session ID
        user_id: Current user ID from token
        limit: Maximum number of messages
        before_sequence: Get messages before this sequence number
        db: Database session

    Returns:
        List of messages
    """
    try:
        # Verify session ownership
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )

        messages = await ChatService.get_session_messages(
            db=db,
            session_id=session_id,
            limit=limit,
            before_sequence=before_sequence
        )

        return messages
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}"
        )


@router.get("/sessions/{session_id}/export")
async def export_chat_session(
    session_id: str,
    format: str = Query("openfree", regex="^(openfree|json|markdown)$"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Export chat session in specified format

    Args:
        session_id: Session ID
        format: Export format (openfree, json, markdown)
        user_id: Current user ID from token
        db: Database session

    Returns:
        Exported session data
    """
    try:
        export_data = await ChatService.export_session(
            db=db,
            session_id=session_id,
            user_id=user_id,
            format=format
        )

        if format == "markdown":
            # Return as plain text for markdown
            return JSONResponse(
                content={"markdown": export_data},
                headers={"Content-Type": "application/json"}
            )

        return export_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export session: {str(e)}"
        )
