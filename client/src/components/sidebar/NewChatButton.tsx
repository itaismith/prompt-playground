import React, { useContext } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import ChatContext from "../../context/ChatContext";
import { v4 as uuidv4 } from "uuid";

const NewChatButton: React.FC = () => {
  const { setActiveChat } = useContext(ChatContext);
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-3 m-3 p-3 rounded-lg text-gray-200 bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700 cursor-pointer"
      onClick={() => {
        navigate("/");
        setActiveChat("");
      }}
    >
      <PencilSquareIcon className="flex-shrink-0 w-5 h-5" />
      <p className="flex-shrink-0 text-sm select-none">New Chat</p>
    </div>
  );
};

export default NewChatButton;
