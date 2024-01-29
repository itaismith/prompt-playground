import React, { ReactNode, useEffect, useState } from "react";
import AppError from "../model/AppError";
import { useNavigate } from "react-router-dom";

export interface UIContextValue {
  sideBarCollapsed: boolean;
  setSideBarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  showChatMenu: boolean;
  setShowChatMenu: React.Dispatch<React.SetStateAction<boolean>>;
  renaming: string;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
  deleting: string;
  setDeleting: React.Dispatch<React.SetStateAction<string>>;
  appErrors: AppError;
  setAppErrors: React.Dispatch<React.SetStateAction<AppError>>;
}

export interface UIContextProviderProps {
  children?: ReactNode;
}

const UIContextDefaultValue = {
  sideBarCollapsed: false,
  setSideBarCollapsed: () => {},
  showChatMenu: false,
  setShowChatMenu: () => {},
  renaming: "",
  setRenaming: () => {},
  deleting: "",
  setDeleting: () => {},
  appErrors: {},
  setAppErrors: () => {},
};

const UIContext = React.createContext<UIContextValue>(UIContextDefaultValue);

export const UIContextProvider: React.FC<UIContextProviderProps> = (props) => {
  const [sideBarCollapsed, setSideBarCollapsed] = useState<boolean>(false);
  const [showChatMenu, setShowChatMenu] = useState<boolean>(false);
  const [renaming, setRenaming] = useState<string>("");
  const [deleting, setDeleting] = useState<string>("");
  const [appErrors, setAppErrors] = useState<AppError>({});
  const navigate = useNavigate();

  useEffect(() => {
    setAppErrors({});
  }, []);

  useEffect(() => {}, [appErrors]);

  return (
    <UIContext.Provider
      value={{
        sideBarCollapsed,
        setSideBarCollapsed,
        showChatMenu,
        setShowChatMenu,
        renaming,
        setRenaming,
        deleting,
        setDeleting,
        appErrors,
        setAppErrors,
      }}
    >
      {props.children}
    </UIContext.Provider>
  );
};

export default UIContext;
