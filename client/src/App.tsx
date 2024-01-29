import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ChatArea from "./components/chat/ChatArea";
import { UIContextProvider } from "./context/UIContext";
import { ChatContextProvider } from "./context/ChatContext";

function App() {
  useEffect(() => {
    document.body.classList.add("overscroll-none");
  }, []);

  return (
    <BrowserRouter>
      <UIContextProvider>
        <ChatContextProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<ChatArea />} />
              <Route path="/chats/:chatId" element={<ChatArea />} />
            </Route>
          </Routes>
        </ChatContextProvider>
      </UIContextProvider>
    </BrowserRouter>
  );
}

export default App;
