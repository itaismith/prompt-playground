from abc import ABC, abstractmethod
from typing import Any, Callable

from server.models import DBMessage


class MessageStream:
    """
    A class representing a stream of an AI generated response

    Attributes:
        stream: the stream itself. If the response is pre-generated, as opposed to streamed in real-time, this can be a
                string or a list of strings
        extract: a function extracting message or message chunks from the stream
        add_delay: set to True if the response is not streamed in real-time, and we want to create
                    a "typing" effect for the client

    """
    def __init__(self, stream: Any, extract: Callable[[Any], str], add_delay: bool = False):
        self.stream = stream
        self.extract = extract
        self.add_delay = add_delay


class Messenger(ABC):

    @abstractmethod
    def get_message(self, messages: list[DBMessage], message_content: str) -> MessageStream:
        """
        Given a user message, returns an AI generated response

        Args:
            messages (list[DBMessage]): A list of the messages in that chat so far
            message_content (str): The content of a new user message

        Returns:
            MessageStream: A stream of an AI-generated response
        """
        pass

    @abstractmethod
    def get_chat_title(self, message_content: str) -> str:
        """
        Given the content of the first message in a chat, get a title for the chat

        Arguments:
            message_content (str): The content of the first message in a chat

        Returns:
             str: The title of a chat
        """
        pass


class BasicMessenger(Messenger):
    def get_message(self, messages: list[DBMessage], message_content: str) -> MessageStream:
        return MessageStream(
            stream=[
                "I'm a basic AI. ", "I always say the same thing. ", "Maybe you forgot to ", "set your OpenAI API key? "
            ],
            extract=lambda chunk: chunk,
            add_delay=True
        )

    def get_chat_title(self, message_content: str) -> str:
        return f"Chatting about: {message_content[:10]}"
