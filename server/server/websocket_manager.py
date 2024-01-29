import asyncio
import json
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from starlette.websockets import WebSocket, WebSocketState

from server.crud import create_message, get_db_chat_messages
from server.messanger import Messenger
from server.models import DBMessage
from server.schemas import MessageSchema, Role

logger = logging.getLogger(__name__)


class WebsocketManager:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    async def connect(websocket: WebSocket):
        await websocket.accept()

    async def receive_and_process(self, websocket: WebSocket, messenger: Messenger):
        while True:
            data = await websocket.receive_text()
            json_data = json.loads(data)
            user_message = MessageSchema(**json_data)

            chat_messages = await get_db_chat_messages(self.session, user_message.chatId)
            response_stream = messenger.get_message(chat_messages, user_message.content)

            assistant_message = ""
            if response_stream.add_delay:
                await asyncio.sleep(0.3)

            for chunk in response_stream.stream:
                message = response_stream.extract(chunk)
                if message:
                    if response_stream.add_delay:
                        await asyncio.sleep(0.3)
                    assistant_message += message
                    await self.send_response(websocket, {
                        "chatId": str(user_message.chatId),
                        "chunk": message,
                    })

            await create_message(self.session, chat_id=user_message.chatId, role=user_message.role,
                                 content=user_message.content)
            server_response: DBMessage = await create_message(self.session, chat_id=user_message.chatId,
                                                              role=Role.Assistant,
                                                              content=assistant_message)
            await self.send_response(websocket, {
                "id": str(server_response.id),
                "created": str(server_response.created),
                "chatId": str(server_response.chat_id)
            })

    @staticmethod
    async def send_response(websocket: WebSocket, response):
        await websocket.send_text(json.dumps(response))

    @staticmethod
    async def disconnect(websocket: WebSocket, error: bool=False):
        logger.info(f"WebSocket disconnected: {websocket.client}")
        if websocket.application_state != WebSocketState.DISCONNECTED:
            await websocket.close()
