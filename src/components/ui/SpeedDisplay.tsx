import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface SpeedDisplayProps {
  type: "download" | "upload";
  value: string;
  iconSize?: number;
  textSize?: string;
  color?: string;
}

export const SpeedDisplay: React.FC<SpeedDisplayProps> = ({
  type,
  value,
  iconSize = 4,
  textSize = "text-sm",
  color,
}) => {
  const isDownload = type === "download";
  const defaultColor = isDownload ? "text-green-500" : "text-blue-500";
  const Icon = isDownload ? ArrowDown : ArrowUp;

  return (
    <div className={`flex items-center gap-1 ${color || defaultColor}`}>
      <Icon className={`w-${iconSize} h-${iconSize}`} />
      <span className={`${textSize} font-medium`}>{value}</span>
    </div>
  );
};
