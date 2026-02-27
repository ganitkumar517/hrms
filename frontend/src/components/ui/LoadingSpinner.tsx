import React from "react";
import { Spinner } from "@heroui/react";

interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = "Loading...",
  fullPage = false,
}) => {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Spinner size="md" color="primary" />
      <span className="text-gray-500 text-sm">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
