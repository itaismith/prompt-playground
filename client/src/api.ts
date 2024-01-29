import axios from "axios";

const host: string = process.env.APP_ENV ? "server" : "localhost";

const fetchData = async (endpoint: string) => {
  try {
    const response = await axios.get(`http://${host}:8000/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error("An error occurred while fetching data: ", error);
    throw error;
  }
};

const postData = async (endpoint: string, data?: any) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/${endpoint}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while posting data: ", error);
    throw error;
  }
};

const putData = async (endpoint: string, data?: any) => {
  try {
    const response = await axios.put(`http://localhost:8000/${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error("An error occurred while posting data: ", error);
    throw error;
  }
};

const getNewChat = async () => {
  const response = await postData("new-chat");
  return { chatId: response.id, created: response.created };
};

export const getChatTitle = async (chatId: string, message: string) => {
  const response = await putData(`chats/${chatId}/chat-title`, {
    chatId,
    message,
  });
  return response.title;
};

export const getChatConnection = () => {
  return new WebSocket(`ws://${host}:8000/chat-connection`);
};

export const getChats = async () => {
  return await fetchData("chats/all");
};

export const renameChat = async (chatId: string, newTitle: string) => {
  return await putData(`chats/${chatId}/rename`, { chatId, newTitle });
};

export const deleteChat = async (chatId: string) => {
  return await putData(`chats/${chatId}/delete`);
};

export const getMessages = async (chatId: string) => {
  return await fetchData(`chats/${chatId}/messages`);
};

export default getNewChat;
