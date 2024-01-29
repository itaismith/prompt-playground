import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTransition, animated } from "react-spring";
import ChatModel from "../../model/ChatModel";
import ChatContext from "../../context/ChatContext";
import ChatButton from "./ChatButton";

const ChatList: React.FC = () => {
  const { chats, activeChat } = useContext(ChatContext);
  const navigate = useNavigate();

  const height = 20;

  const transitions = useTransition<ChatModel, { y: number }>(
    chats.map((chat, i) => ({ ...chat, y: i * height })),
    {
      keys: (chat: ChatModel) => chat.id,
      from: { height, opacity: 0, position: "absolute" },
      leave: { height: 0, opacity: 0 },
      enter: ({ y }: { y: number }) => ({ delay: 200, y, opacity: 1 }),
      update: ({ y }: { y: number }) => ({ delay: 200, y }),
      config: {
        duration: 250,
      },
    },
  );

  return (
    <div className="relative flex-grow overflow-y-scroll scroll-smooth">
      {transitions((props, chat) => {
        return (
          <animated.div
            key={chat.id}
            style={{
              transform: props.y.to((y) => `translate3d(0,${y}px,0)`),
              zIndex: activeChat === chat.id ? 10 : undefined,
              ...props,
            }}
          >
            <ChatButton chat={chat} />
          </animated.div>
        );
      })}
    </div>
  );
};

export default ChatList;
