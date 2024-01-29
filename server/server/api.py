import logging
from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException
from pydantic import UUID4
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocket, WebSocketDisconnect

from server.crud import create_chat, get_db_chats, rename_db_chat, delete_db_chat, get_db_chat_messages
from server.db import SessionLocal, engine
from server.models import DBChat, DBMessage, Base
from server.openai_messenger import OpenAIMessenger
from server.schemas import ChatSchema, MessageSchema, ChatRenameRequest, ChatTitleRequest
from server.websocket_manager import WebsocketManager

app = FastAPI()

logger = logging.getLogger(__name__)

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

messenger = OpenAIMessenger()


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    session = SessionLocal()
    try:
        yield session
    finally:
        await session.close()


@app.post("/new-chat", response_model=ChatSchema)
async def new_chat(session: Annotated[AsyncSession, Depends(get_session)]) -> DBChat:
    try:
        chat = await create_chat(session)
        return chat
    except Exception as e:
        logger.error(f"Failed to create a new chat: {e}")
        raise HTTPException(status_code=500, detail=f"Cannot chat at this time")


@app.put("/chats/{chat_id}/chat-title")
async def chat_title(chat_id: UUID4, request: ChatTitleRequest, session: Annotated[AsyncSession, Depends(get_session)]):
    try:
        new_title = messenger.get_chat_title(request.message)
        await rename_db_chat(session, chat_id, new_title)
        return {"chatId": chat_id, "title": new_title}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate chat title {e}")
        raise HTTPException(status_code=500, detail=f"Cannot get chat title at this time")


@app.put("/chats/{chat_id}/rename")
async def rename_chat(chat_id: UUID4, request: ChatRenameRequest, session: Annotated[AsyncSession, Depends(get_session)]):
    try:
        await rename_db_chat(session, chat_id, request.newTitle)
        return {"chatId": chat_id, "title": request.newTitle}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to rename chat {chat_id}: {e}")
        raise HTTPException(status_code=500, detail="Cannot rename chat at this time")


@app.put("/chats/{chat_id}/delete")
async def delete_chat(chat_id: UUID4, session: Annotated[AsyncSession, Depends(get_session)]):
    try:
        await delete_db_chat(session, chat_id)
        return {"chatId": chat_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete chat {chat_id}: {e}")
        raise HTTPException(status_code=500, detail="Cannot delete chat at this time")


@app.get("/chats/all", response_model=list[ChatSchema])
async def get_chats(session: Annotated[AsyncSession, Depends(get_session)]) -> list[DBChat]:
    try:
        chats = await get_db_chats(session)
        return chats
    except Exception as e:
        logger.error(f"Failed to get list of all chats: {e}")
        raise HTTPException(status_code=500, detail="Cannot get chats at this time")


@app.get("/chats/{chat_id}/messages", response_model=list[MessageSchema])
async def get_chat_messages(chat_id: UUID4, session: Annotated[AsyncSession, Depends(get_session)]) -> list[DBMessage]:
    try:
        messages = await get_db_chat_messages(session, chat_id)
        return messages
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get messages for chat {chat_id}: e")
        raise HTTPException(status_code=500, detail="Cannot get messages at this time")


@app.websocket("/chat-connection")
async def websocket_endpoint(session: Annotated[AsyncSession, Depends(get_session)], websocket: WebSocket):
    ws_manager = WebsocketManager(session)
    await ws_manager.connect(websocket)
    try:
        await ws_manager.receive_and_process(websocket, messenger)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected by client")
    except Exception as e:
        await ws_manager.disconnect(websocket, error=True)
        logger.error(f"WebSocket disconnected with error: {e}")
