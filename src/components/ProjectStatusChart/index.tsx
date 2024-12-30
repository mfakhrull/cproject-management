// src/components/ProjectStatusChart.tsx
"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface ProjectStatusChartProps {
  projectStatus: { name: string; count: number }[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({ projectStatus }) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
      <h3 className="mb-4 text-lg font-semibold dark:text-white">
        Project Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            dataKey="count"
            data={projectStatus}
            cx="50%"
            cy="50%"
            fill="var(--chart-2)"
            label
          >
            {projectStatus.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
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

export default ProjectStatusChart;
