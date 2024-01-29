import React, { useContext, useEffect, useRef } from "react";
import { Role } from "../../model/MessageModel";
import ChatContext from "../../context/ChatContext";
import Message from "./Message";
import ErrorBanner from "../../layouts/ErrorBanner";
import UIContext from "../../context/UIContext";

const MessageList: React.FC = () => {
  const { messages, activeResponse, typing } = useContext(ChatContext);
  const { appErrors } = useContext(UIContext);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [activeResponse, messages]);

  return (
    <div
      className="w-[65%] pb-16 self-center flex-grow flex flex-col items-start overflow-y-scroll scroll-smooth my-5 text-gray-800"
      ref={listRef}
    >
      {messages.map((message, index) => (
        <Message message={message} key={index} />
      ))}
      {typing && (
        <Message
          message={{
            id: "typed",
            role: Role.Assistant,
            content: activeResponse,
          }}
        />
      )}
      {appErrors.chat && <ErrorBanner errorMessage={appErrors.chat} />}
    </div>
  );
};
export default MessageList;
