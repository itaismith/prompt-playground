import React, { useContext, useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useNavigate, useParams } from "react-router-dom";
import MessageModel, { Role } from "../../model/MessageModel";
import getNewChat from "../../api";
import ChatContext from "../../context/ChatContext";
import UIContext from "../../context/UIContext";
import { AppErrorTypes } from "../../model/AppError";

const MessageField: React.FC = () => {
  const { chatId } = useParams();
  const { sendMessage, typing, setChats, setActiveChat } =
    useContext(ChatContext);
  const { setAppErrors } = useContext(UIContext);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [hasInput, setHasInput] = useState<boolean>(false);
  const navigate = useNavigate();

  const lineHeight: number = -7;
  const maxHeight: number = 170;

  const disabledStyle: string =
    "bg-gray-200 hover:bg-gray-300 active:bg-gray-400";
  const enabledStyle: string =
    "bg-green-200 hover:bg-green-300 active:bg-green-400";

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
    }
    clear();
  }, [chatId]);

  const clear = () => {
    const textarea = textRef.current;
    if (textarea) {
      textarea.value = "";
      resizeTextArea();
    }
  };

  const resizeTextArea = () => {
    const textarea = textRef.current;
    const field = fieldRef.current;
    if (textarea && fieldRef) {
      setHasInput(textarea.value.length > 0);
      textarea.style.height = "0px";
      const scroll = textarea.scrollHeight;
      if (scroll > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        field!.style.top = `${lineHeight - maxHeight}px`;
      } else {
        textarea.style.height = `${scroll}px`;
        field!.style.top = `${lineHeight - scroll}px`;
      }
    }
  };

  const submitMessage = async () => {
    const textarea = textRef.current;
    if (!hasInput || typing) {
      return;
    }
    let redirect = false;
    let newChatId = "";
    if (!chatId) {
      try {
        const newChat = await getNewChat();
        newChatId = newChat.chatId;
        setActiveChat(newChatId);
        redirect = true;
        setChats((prev) => [
          { id: newChat.chatId, title: "New Chat", created: newChat.created },
          ...prev,
        ]);
      } catch (e) {
        setAppErrors((prev) => ({ ...prev, chat: AppErrorTypes.NewChat }));
        return;
      }
    }
    if (textarea) {
      const message: MessageModel = {
        chatId: chatId || newChatId,
        role: Role.User,
        content: textarea.value,
      };
      sendMessage(message);
    }
    clear();
    if (redirect) {
      navigate(`/chats/${newChatId}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="relative flex-shrink-0 h-14 bg-user-gray">
      <div
        className="absolute w-2/3 flex items-center justify-between p-3 -top-[31px] left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-[0px_-3px_20px_rgba(128,128,128,0.5)]"
        ref={fieldRef}
      >
        <textarea
          className="flex-grow bg-transparent resize-none select-none outline-0 text-gray-600 h-6"
          placeholder="Send a message"
          ref={textRef}
          onChange={resizeTextArea}
          onKeyDown={handleKeyDown}
        />
        <div
          className={`p-1.5 rounded-lg bg-gray-300 cursor-pointer ${
            hasInput && !typing ? enabledStyle : disabledStyle
          }`}
          onClick={submitMessage}
        >
          <PaperAirplaneIcon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
};

export default MessageField;
