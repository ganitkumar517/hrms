import { format, parseISO } from "date-fns";

export const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "MMM dd, yyyy HH:mm");
  } catch {
    return dateStr;
  }
};

export const getTodayISO = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const getStatusColor = (status: string) => {
  return status === "Present" ? "success" : "danger";
};

export const getDepartmentColor = (dept: string): string => {
  const colors: Record<string, string> = {
    Engineering: "primary",
    HR: "secondary",
    Finance: "warning",
    Marketing: "success",
    Sales: "danger",
    Operations: "default",
    Design: "secondary",
    Legal: "warning",
    IT: "primary",
    Product: "success",
  };
  return colors[dept] || "default";
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};
