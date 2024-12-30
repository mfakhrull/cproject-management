"use client";

import React from "react";
import { BarChart, Bar, CartesianGrid, XAxis, LabelList, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

interface TaskPriorityChartProps {
  taskDistribution: { priority: string; count: number }[];
}

const COLORS = [
    "hsl(var(--chart-3))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const TaskPriorityChart: React.FC<TaskPriorityChartProps> = ({ taskDistribution }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Priority Distribution</CardTitle>
        <CardDescription>Overview of tasks by priority</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ priority: { label: "Priority", color: "hsl(var(--chart-1))" } }}>
          <BarChart
            accessibilityLayer
            data={taskDistribution}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="priority"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              stroke="var(--foreground)"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {taskDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Updated task priorities overview.
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskPriorityChart;