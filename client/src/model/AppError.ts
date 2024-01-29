interface AppError {
  sidebar?: AppErrorTypes;
  chat?: AppErrorTypes;
}

export enum AppErrorTypes {
  GetChats = "Can't get chats",
  RenameChat = "Failed to rename chat",
  NewChat = "Failed to start a new chat",
  ChatMessages = "Failed to get chat messages",
  WebSocketError = "Failed to connect with the assistant",
}

export default AppError;
