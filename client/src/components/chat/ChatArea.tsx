import React, { useContext, useEffect } from "react";
import MessageList from "./MessageList";
import MessageField from "./MessageField";
import { useParams } from "react-router-dom";
import ChatContext from "../../context/ChatContext";
import { getMessages } from "../../api";
import UIContext from "../../context/UIContext";
import { AppErrorTypes } from "../../model/AppError";

const ChatArea: React.FC = () => {
  const { chatId } = useParams();
  const { messages, setMessages, activeChat, setActiveChat } =
    useContext(ChatContext);
  const { setAppErrors } = useContext(UIContext);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setActiveChat("");
    } else if (chatId !== activeChat) {
      setActiveChat(chatId);
      getMessages(chatId)
        .then((chatMessages) => setMessages(chatMessages))
        .catch((e) =>
          setAppErrors((prev) => ({
            ...prev,
            chat: AppErrorTypes.ChatMessages,
          })),
        );
    }
  }, [chatId]);

  return (
    <div className="flex flex-col w-full bg-user-gray ml-0">
      <MessageList />
      <MessageField />
    </div>
  );
};

export default ChatArea;
