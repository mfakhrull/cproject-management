"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";

interface TaskStatusChartProps {
  taskStatus: { name: string; count: number }[];
  className?: string; // Optional className prop
  colorMapping?: Record<string, string>; // Optional custom color mapping
  title?: string; // Optional title for the card
  description?: string; // Optional description for the card
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const TaskStatusChart: React.FC<TaskStatusChartProps> = ({
  taskStatus,
  className = "", // Default to empty string
  colorMapping = {}, // Default to an empty object
  title = "Task Status Distribution", // Default title
  description = "Overview of tasks by status", // Default description
}) => {
  // Calculate total tasks
  const totalTasks = taskStatus.reduce(
    (total, status) => total + status.count,
    0,
  );

  return (
    <div
      className={`rounded-lg bg-white p-4 shadow dark:bg-dark-secondary ${className}`}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            dataKey="count"
            data={taskStatus}
            cx="50%"
            cy="50%"
            fill="var(--chart-2)"
            label
          >
            {taskStatus.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorMapping[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskStatusChart;
