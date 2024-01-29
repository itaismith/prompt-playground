interface MessageModel {
  id?: string;
  chatId?: string;
  created?: string;
  role: Role;
  content: string;
}

export enum Role {
  User = "user",
  Assistant = "assistant",
}

export default MessageModel;
