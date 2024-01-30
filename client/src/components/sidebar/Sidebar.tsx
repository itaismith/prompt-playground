import React, { useContext } from "react";
import SidebarToggleButton from "./SidebarToggleButton";
import UIContext from "../../context/UIContext";
import NewChatButton from "./NewChatButton";
import ChatList from "./ChatList";
import ErrorBanner from "../../layouts/ErrorBanner";

const Sidebar: React.FC = () => {
  const { sideBarCollapsed, appErrors } = useContext(UIContext);

  return (
    <div className="flex-shrink-0 flex">
      <div
        className={`flex-shrink-0 transition-width ease-in-out duration-500 bg-cyan-950 ${
          sideBarCollapsed ? "w-0" : "w-64"
        }`}
      >
        <div
          className={`${
            sideBarCollapsed ? "opacity-0" : "opacity-100"
          } flex flex-col h-full transition-opacity ease-in duration-300`}
        >
          <div className="flex-shrink-0 h-16">
            <NewChatButton />
          </div>
          <ChatList />
          <div className="flex-shrink-0 h-20">
            {appErrors.sidebar && (
              <ErrorBanner errorMessage={appErrors.sidebar} />
            )}
          </div>
        </div>
      </div>
      <SidebarToggleButton />
    </div>
  );
};

export default Sidebar;
