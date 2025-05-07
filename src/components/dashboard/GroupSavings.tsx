
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getSavings } from "@/lib/savingsService";

interface GroupSavingsProps {
  defaultTotalSavings?: number;
  defaultGoal?: number;
  growthRate?: number;
}

const GroupSavings: React.FC<GroupSavingsProps> = ({
  defaultTotalSavings = 0,
  defaultGoal = 2000000,
  growthRate = 0,
}) => {
  const navigate = useNavigate();
  const [savingsAmount, setSavingsAmount] = useState<number>(defaultTotalSavings);
  const [goalAmount, setGoalAmount] = useState<number>(defaultGoal);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleCardClick = () => {
    navigate('/payments?tab=history');
  };

  // Function to fetch savings data from the server
  const fetchSavingsData = async () => {
    try {
      setIsLoading(true);

      // Import the getGroupSavingsRecord function
      const { getGroupSavingsRecord } = await import('@/lib/savingsService');
      const savingsRecord = await getGroupSavingsRecord();

      if (savingsRecord) {
        console.log('Savings record found:', savingsRecord);

        // Set savings amount
        setSavingsAmount(savingsRecord.total_amount);

        // Set goal amount if available
        if (savingsRecord.goal_amount !== undefined) {
          setGoalAmount(savingsRecord.goal_amount);
        }

        // Set last updated date
        if (savingsRecord.last_updated_at) {
          try {
            setLastUpdated(new Date(savingsRecord.last_updated_at));
          } catch (dateError) {
            console.error('Error parsing last_updated_at:', dateError);
            setLastUpdated(new Date());
          }
        } else if (savingsRecord.last_updated) {
          try {
            setLastUpdated(new Date(savingsRecord.last_updated));
          } catch (dateError) {
            console.error('Error parsing last_updated:', dateError);
            setLastUpdated(new Date());
          }
        } else {
          setLastUpdated(new Date());
        }
      } else {
        // Fallback to just getting the savings amount
        const amount = await getSavings();
        setSavingsAmount(amount);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching savings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchSavingsData();

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchSavingsData();
    }, 30000); // 30 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const progressPercentage = (savingsAmount / goalAmount) * 100;

  return (
    <Card
      className="section-card-teal card-hover cursor-pointer h-full"
      onClick={handleCardClick}
    >
      <CardHeader className="px-2 sm:px-3 md:px-4 pt-2 sm:pt-3 md:pt-4 pb-1 sm:pb-2">
        <CardTitle className="text-sm sm:text-base md:text-lg text-white flex items-center">
          <span className="inline-block w-1.5 sm:w-2 h-3 sm:h-4 bg-[#00B8D4] mr-1.5 sm:mr-2"></span>
          Savings of the Group
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4 flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#00B8D4]">
                  ৳{savingsAmount.toLocaleString()}
                </h3>
                <span className="text-[8px] sm:text-[10px] md:text-xs text-white">
                  {growthRate > 0 ? "+" : ""}
                  {growthRate}% this month
                </span>
              </div>

              <div className="mb-2">
                <Progress value={progressPercentage} className="h-1.5 sm:h-2 bg-white/10" color="#00B8D4" />
              </div>

              <div className="flex justify-between text-[10px] sm:text-xs text-gray-300">
                <span>Current</span>
                <span>Goal: <span className="text-[#00B8D4]">৳{goalAmount.toLocaleString()}</span></span>
              </div>
            </div>

            {lastUpdated && (
              <div className="mt-2 text-[8px] sm:text-[10px] md:text-xs text-gray-400 text-right">
                Last updated: {lastUpdated.toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupSavings;
