import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import UIContext from "../context/UIContext";

const AppLayout: React.FC = () => {
  const { showChatMenu, setShowChatMenu } = useContext(UIContext);
  return (
    <div className="relative flex h-screen bg-amber-100">
      {showChatMenu && (
        <div
          className="absolute w-full h-full bg-transparent z-10"
          onClick={() => setShowChatMenu(false)}
        />
      )}
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default AppLayout;
