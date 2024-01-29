import logging
import os

from openai import OpenAI

from server.messanger import Messenger, MessageStream, BasicMessenger
from server.models import DBMessage
from server.schemas import Role

openai_api_key = os.getenv("OPENAI_API_KEY") or ""
client = OpenAI(api_key=openai_api_key)
logger = logging.getLogger(__name__)


class OpenAIMessenger(Messenger):

    def get_message(self, messages: list[DBMessage], message_content: str) -> MessageStream:
        try:
            system_prompt = """You are a helpful assistant. 
            """

            system_message = {"role": "system", "content": system_prompt}
            user_message = {"role": "user", "content": message_content}
            messages = [{"role": Role(m.role).value, "content": str(m.content)} for m in messages]

            messages.insert(0, system_message)
            messages.append(user_message)

            stream = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                stream=True,
            )
            return MessageStream(
                stream=stream,
                extract=lambda chunk: chunk.choices[0].delta.content
            )
        except Exception as e:
            logger.error(f"Failed to generate OpenAI response: {e}")
            return BasicMessenger().get_message(messages, message_content)

    def get_chat_title(self, message_content: str) -> str:
        try:
            prompt = """Your task is to provide a short title for a conversation starting with some message. 
                The title should be short and its maximum length is 5 words. 
                Do not wrap your answer in double quotes. The message is:
                """

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": f"{prompt} {message_content}"},
                ]
            )
            title = response.choices[0].message.content
            if title[0] == title[-1] == '"':
                title = title[1:-1]
            return title
        except Exception as e:
            logger.error(f"Failed to generate OpenAI chat title: {e}")
            return BasicMessenger().get_chat_title(message_content)
