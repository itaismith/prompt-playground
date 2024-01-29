import logging

from fastapi import HTTPException
from sqlalchemy import UUID, select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from server.models import DBChat, DBMessage
from server.schemas import Role

logger = logging.getLogger(__name__)


async def create_chat(session: AsyncSession) -> DBChat:
    try:
        new_chat = DBChat()
        session.add(new_chat)
        await session.commit()
        await session.refresh(new_chat)
        return new_chat
    except Exception as e:
        logger.error(f"DB failure to create chat: {e}")
        raise e


async def create_message(session: AsyncSession, chat_id: UUID, role: Role, content: str) -> DBMessage:
    try:
        new_message = DBMessage(chat_id=chat_id, role=role, content=content)
        session.add(new_message)
        await session.commit()
        await session.refresh(new_message)
        return new_message
    except Exception as e:
        logger.error(f"DB failure to create a message for {role} in chat {chat_id}: {e}")
        raise e


async def get_db_chats(session: AsyncSession) -> list[DBChat]:
    try:
        select_chats = select(DBChat).order_by(desc(DBChat.created))
        chats = (await session.execute(select_chats)).scalars().all()
        return list(chats)
    except Exception as e:
        logger.error(f"DB failure to get chat list: {e}")
        raise e


async def get_db_chat_messages(session: AsyncSession, chat_id: UUID) -> list[DBMessage]:
    try:
        chat = await get_db_chat(session, chat_id)
        select_messages = select(DBMessage).where(DBMessage.chat_id == chat.id).order_by(DBMessage.created)
        messages = (await session.execute(select_messages)).scalars().all()
        return list(messages)
    except Exception as e:
        logger.error(f"DB failure to get messages for chat {chat_id}: {e}")
        raise e


async def get_db_chat(session: AsyncSession, chat_id: UUID):
    try:
        select_chat = select(DBChat).where(DBChat.id == chat_id)
        result = await session.execute(select_chat)
        chat = result.scalars().first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        return chat
    except Exception as e:
        logger.error(f"DB failure to query chat {chat_id}: {e}")
        raise e


async def rename_db_chat(session: AsyncSession, chat_id: UUID, new_title: str):
    try:
        chat = await get_db_chat(session, chat_id)
        chat.title = new_title
        await session.commit()
    except Exception as e:
        logger.error(f"DB failure to rename chat {chat_id}: e")
        raise e


async def delete_db_chat(session: AsyncSession, chat_id: UUID):
    try:
        chat = await get_db_chat(session, chat_id)
        await session.delete(chat)
        await session.commit()
    except Exception as e:
        logger.error(f"DB failure to delete chat {chat_id}: {e}")
        raise e
