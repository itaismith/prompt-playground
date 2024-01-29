import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ErrorBanner: React.FC<{ errorMessage: string }> = (props) => {
  return (
    <div className="self-center flex flex-col gap-2 items-center text-gray-400">
      <ExclamationTriangleIcon className="w-5 h-5" />
      <p className="text-sm">{props.errorMessage}</p>
    </div>
  );
};

export default ErrorBanner;
