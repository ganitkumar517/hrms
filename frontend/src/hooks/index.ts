import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { addToast, removeToast } from "../store/slices/uiSlice";
import { useCallback } from "react";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);

export const useToast = () => {
  const dispatch = useAppDispatch();

  const toast = useCallback(
    ({
      type,
      title,
      message,
    }: {
      type: "success" | "error" | "warning" | "info";
      title: string;
      message?: string;
    }) => {
      const id = Date.now().toString();
      dispatch(addToast({ type, title, message }));
      setTimeout(() => {
        dispatch(removeToast(id));
      }, 4000);
    },
    [dispatch]
  );

  return { toast };
};

export const parseApiError = (error: any): string => {
  if (error?.data?.detail) {
    if (typeof error.data.detail === "string") {
      return error.data.detail;
    }
    if (Array.isArray(error.data.detail)) {
      return error.data.detail.map((e: any) => e.msg).join(", ");
    }
  }
  return "An unexpected error occurred. Please try again.";
};
