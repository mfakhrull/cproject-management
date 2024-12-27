import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OverallScoreChartProps {
  overallScore: number;
}

export default function OverallScoreChart({
  overallScore,
}: OverallScoreChartProps) {
  const pieChartData = [
    {
      name: "Risks",
      value: 100 - overallScore,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Opportunities",
      value: overallScore,
      fill: "hsl(var(--chart-3))",
    },
  ];

  return (
    <div className="w-full h-48">
      <PieChart width={200} height={200}>
        <Pie
          data={pieChartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          label
        >
          <Label
            value={`${overallScore}%`}
            position="center"
            style={{
              fontSize: "18px",
              fill: "var(--foreground)",
              textAnchor: "middle",
            }}
          />
        </Pie>
      </PieChart>
    </div>
  );
}
