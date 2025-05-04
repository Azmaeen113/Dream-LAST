
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GroupSavingsProps {
  totalSavings: number;
  goal: number;
  growthRate: number;
}

const GroupSavings: React.FC<GroupSavingsProps> = ({
  totalSavings,
  goal,
  growthRate,
}) => {
  const progressPercentage = (totalSavings / goal) * 100;

  return (
    <Card className="section-card card-hover">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-lg">Savings of the Group</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-2xl font-bold text-dreamland-accent">
            ৳{totalSavings.toLocaleString()}
          </h3>
          <span className="text-xs text-dreamland-secondary">
            {growthRate > 0 ? "+" : ""}
            {growthRate}% this month
          </span>
        </div>
        
        <div className="mb-2">
          <Progress value={progressPercentage} className="h-2 bg-gray-700" />
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>Current</span>
          <span>Goal: ৳{goal.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupSavings;
