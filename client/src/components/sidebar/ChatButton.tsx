import React, { useContext, useEffect, useRef, useState } from "react";
import ChatModel from "../../model/ChatModel";
import ChatContext from "../../context/ChatContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import UIContext from "../../context/UIContext";
import { TypeAnimation } from "react-type-animation";
import { getChatTitle, renameChat } from "../../api";
import { AppErrorTypes } from "../../model/AppError";

const ChatButton: React.FC<{ chat: ChatModel }> = (props) => {
  const {
    renaming,
    setRenaming,
    deleting,
    setDeleting,
    showChatMenu,
    setShowChatMenu,
    setAppErrors,
  } = useContext(UIContext);
  const { activeChat, setActiveChat, handleDeleteChat, messages } =
    useContext(ChatContext);
  const [title, setTitle] = useState<string>(props.chat.title);
  const [animate, setAnimate] = useState<string>("");
  const navigate = useNavigate();
  const { chatId } = useParams();
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming === props.chat.id && renameRef.current) {
      renameRef.current.focus();
    }
  }, [renaming]);

  useEffect(() => {
    if (
      activeChat === props.chat.id &&
      messages.length > 1 &&
      title === "New Chat"
    ) {
      getChatTitle(props.chat.id, messages[0].content)
        .then((t) => setAnimate(t))
        .catch((e) => {});
    }
  }, [messages]);

  const handleRenameEnter = () => {
    setShowChatMenu(false);
    setRenaming(props.chat.id);
  };

  const handleRenameExit = () => {
    if (renameRef.current) {
      const newTitle = renameRef.current.value;
      setTitle(newTitle);
      setRenaming("");
      renameChat(props.chat.id, newTitle)
        .then(() => console.log(`Renamed chat ${chatId} to ${newTitle}`))
        .catch((e) =>
          setAppErrors((prev) => ({
            ...prev,
            sidebar: AppErrorTypes.RenameChat,
          })),
        );
    }
  };

  const handleChatClick = () => {
    if (chatId !== props.chat.id) {
      navigate(`/chats/${props.chat.id}`);
    }
  };

  const handleDelete = () => {
    setDeleting("");
    setShowChatMenu(false);
    navigate("/");
    handleDeleteChat(props.chat.id);
  };

  return (
    <div
      className={`absolute group mx-4 flex flex-shrink-0 w-56 justify-between p-2 my-1 rounded-lg text-gray-200 text-sm select-none cursor-pointer hover:bg-cyan-800 whitespace-nowrap ${
        activeChat === props.chat.id && "bg-cyan-700 hover:bg-cyan-700"
      }`}
      onClick={handleChatClick}
    >
      {activeChat === props.chat.id && animate ? (
        <div className="overflow-x-hidden">
          <TypeAnimation
            sequence={[
              `${animate}`,
              () => {
                setAnimate((prev) => {
                  setTitle(prev);
                  return "";
                });
              },
            ]}
            wrapper="span"
            cursor={true}
            repeat={0}
            speed={40}
            style={{ fontSize: "0.875rem", display: "inline-block" }}
          />
        </div>
      ) : renaming !== props.chat.id ? (
        <div className="overflow-x-hidden">{title}</div>
      ) : (
        <input
          className="w-[80%] bg-transparent"
          defaultValue={title}
          ref={renameRef}
          onBlur={handleRenameExit}
        />
      )}
      {activeChat !== props.chat.id ? (
        <div className="absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-cyan-950 from-10% to-transparent rounded-r-lg group-hover:from-cyan-800" />
      ) : (
        <div className="absolute flex justify-end items-center  top-0 right-0 h-full w-16 bg-gradient-to-l from-cyan-700 from-50% to-transparent rounded-r-lg">
          <EllipsisHorizontalIcon
            className="w-5 h-5 mr-2 text-gray-200"
            onClick={() => setShowChatMenu((prev) => !prev)}
          />
        </div>
      )}
      {showChatMenu && activeChat === props.chat.id && (
        <div className="absolute flex flex-col gap-3 p-4 h-20 rounded-xl z-20 right-0 top-9 bg-gray-900">
          <div
            className="flex items-center justify-start gap-2 text-gray-200 text-xs cursor-pointer"
            onClick={handleRenameEnter}
          >
            <PencilIcon className="w-5 h-5" />
            <p>Rename</p>
          </div>
          {deleting !== props.chat.id && (
            <div
              className="flex items-center justify-start gap-2 text-red-500 text-xs cursor-pointer"
              onClick={() => setDeleting(props.chat.id)}
            >
              <TrashIcon className="w-5 h-5" />
              <p>Delete</p>
            </div>
          )}
          {deleting === props.chat.id && (
            <div className="flex items-center justify-center gap-2 cursor-pointer">
              <div
                className="p-1 rounded-lg border border-gray-400 hover:border-gray-300"
                onClick={handleDelete}
              >
                <CheckIcon className="w-3 h-3 text-red-500" />
              </div>
              <div
                className="p-1 rounded-lg border border-gray-400 hover:border-gray-300"
                onClick={() => setDeleting("")}
              >
                <XMarkIcon className="w-3 h-3 text-gray-300" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatButton;
