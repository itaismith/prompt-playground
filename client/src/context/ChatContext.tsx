import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import MessageModel, { Role } from "../model/MessageModel";
import { deleteChat, getChatConnection, getChats } from "../api";
import ChatModel from "../model/ChatModel";
import UIContext from "./UIContext";
import { AppErrorTypes } from "../model/AppError";

export interface ChatContextValue {
  messages: MessageModel[];
  setMessages: React.Dispatch<React.SetStateAction<MessageModel[]>>;
  activeResponse: string;
  setActiveResponse: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (message: MessageModel) => void;
  typing: boolean;
  setTyping: React.Dispatch<React.SetStateAction<boolean>>;
  chats: ChatModel[];
  setChats: React.Dispatch<React.SetStateAction<ChatModel[]>>;
  activeChat: string;
  setActiveChat: React.Dispatch<React.SetStateAction<string>>;
  handleDeleteChat: (chatId: string) => void;
}

export interface ChatContextProviderProps {
  children?: ReactNode;
}

const ChatContextDefaultValue = {
  messages: [],
  setMessages: () => {},
  activeResponse: "",
  setActiveResponse: () => {},
  sendMessage: () => {},
  typing: false,
  setTyping: () => {},
  chats: [],
  setChats: () => {},
  activeChat: "",
  setActiveChat: () => {},
  handleDeleteChat: (chatId: string) => {},
};

const ChatContext = React.createContext<ChatContextValue>(
  ChatContextDefaultValue,
);

export const ChatContextProvider: React.FC<ChatContextProviderProps> = (
  props,
) => {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [activeResponse, setActiveResponse] = useState<string>("");
  const [typing, setTyping] = useState<boolean>(false);
  const [chats, setChats] = useState<ChatModel[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");
  const { setAppErrors } = useContext(UIContext);
  const ws = useRef<WebSocket | null>(null);

  const onMessageHandler = (event: MessageEvent<any>) => {
    const data = JSON.parse(event.data);
    if (data.id) {
      setActiveResponse((prev) => {
        const message: MessageModel = {
          id: data.id,
          chatId: data.chatId,
          created: data.created,
          role: Role.Assistant,
          content: prev,
        };
        setMessages((prevMessages) => [...prevMessages, message]);
        return "";
      });
      setTyping(false);
    } else {
      setActiveResponse((prev) => prev + data.chunk);
    }
  };

  const onDisconnectHandler = () => {
    setTyping(false);
    setAppErrors((prev) => ({ ...prev, chat: AppErrorTypes.WebSocketError }));
  };

  const reconnect = () => {
    return new Promise((resolve, reject) => {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = getChatConnection();

      ws.current.onopen = () => resolve(true);
      ws.current.onerror = (error) => {
        onDisconnectHandler();
        reject(error);
      };
      ws.current.onclose = onDisconnectHandler;

      ws.current.onmessage = onMessageHandler;
    });
  };

  const sendMessage = async (message: MessageModel) => {
    setMessages((prev) => [...prev, message]);
    setTyping(true);
    try {
      if (!ws.current || ws.current?.readyState !== WebSocket.OPEN) {
        await reconnect();
      }
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
      } else {
        onDisconnectHandler();
      }
    } catch (e) {
      onDisconnectHandler();
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    deleteChat(chatId)
      .then(() => console.log(`Deleted chat ${chatId}`))
      .catch((e) => {});
  };

  useEffect(() => {
    getChats()
      .then((serverChats) => setChats(serverChats))
      .catch((e) =>
        setAppErrors((prev) => ({ ...prev, sidebar: AppErrorTypes.GetChats })),
      );

    if (ws.current) {
      return;
    }
    ws.current = getChatConnection();

    ws.current.onmessage = onMessageHandler;
    ws.current.onerror = onDisconnectHandler;
    ws.current.onclose = onDisconnectHandler;

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        activeResponse,
        setActiveResponse,
        sendMessage,
        typing,
        setTyping,
        chats,
        setChats,
        activeChat,
        setActiveChat,
        handleDeleteChat,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
