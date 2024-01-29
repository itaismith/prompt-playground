import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, UUID4, Field, ConfigDict


class Role(str, Enum):
    Assistant = "assistant",
    User = "user"


class ChatSchema(BaseModel):
    id: UUID4
    title: str
    created: datetime.datetime


class MessageSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: Optional[UUID4] = None
    chatId: UUID4 = Field(..., alias='chat_id')
    created: Optional[datetime.datetime] = None
    role: Role
    content: str


class ChatRenameRequest(BaseModel):
    chatId: UUID4
    newTitle: str


class ChatTitleRequest(BaseModel):
    chatId: UUID4
    message: str
