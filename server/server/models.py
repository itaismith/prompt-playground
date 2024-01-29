import datetime
import uuid

from sqlalchemy import Enum, ForeignKey, UUID, DateTime
from sqlalchemy.orm import Mapped, declarative_base, relationship
from sqlalchemy.orm import mapped_column


Base = declarative_base()


class DBChat(Base):
    __tablename__ = 'chat'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(default="New Chat", nullable=False)
    created: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.timezone.utc))
    messages = relationship("DBMessage", back_populates="chat", cascade="all, delete, delete-orphan")


class DBMessage(Base):
    __tablename__ = 'message'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("chat.id"))
    created: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.timezone.utc))
    role: Mapped[str] = mapped_column(Enum("assistant", "user", name="role_types"))
    content: Mapped[str]
    chat = relationship("DBChat", back_populates="messages")
