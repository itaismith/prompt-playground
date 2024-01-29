import React, { useContext } from "react";
import MessageModel, { Role } from "../../model/MessageModel";
import { CpuChipIcon, UserIcon } from "@heroicons/react/24/outline";
import ChatContext from "../../context/ChatContext";

const Message: React.FC<{ message: MessageModel }> = (props) => {
  const { typing } = useContext(ChatContext);
  return (
    <div className="flex gap-3 items-start my-3">
      <div
        className={`flex items-center justify-center w-7 h-7 p-1 rounded-full ${
          props.message.role === Role.Assistant
            ? "bg-purple-400"
            : "bg-gray-400"
        }`}
      >
        {props.message.role === Role.Assistant ? (
          <CpuChipIcon className="w-5 h-5 text-white" />
        ) : (
          <UserIcon className="w-5 h-5 text-white" />
        )}
      </div>
      <div>
        <p className="font-bold">
          {props.message.role === Role.Assistant ? "Assistant" : "You"}
        </p>
        <p>
          {props.message.content}
          {typing && props.message.id === "typed" && (
            <span className="inline-block w-1 h-3 bg-gray-400 ml-0.5 animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
};

export default Message;
