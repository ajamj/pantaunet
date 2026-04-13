import React from "react";
import { SpeedDisplay } from "./SpeedDisplay";

interface MetricCardProps {
  title: string;
  value: string;
  total: string;
  type: "download" | "upload";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  total,
  type,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-transparent hover:border-blue-500/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <SpeedDisplay type={type} value={title} iconSize={6} color="text-gray-500 dark:text-gray-400" />
      </div>
      <div className={`text-4xl font-bold ${type === 'download' ? 'text-green-500' : 'text-blue-500'}`}>
        {value}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Total: {total}
      </div>
    </div>
  );
};
