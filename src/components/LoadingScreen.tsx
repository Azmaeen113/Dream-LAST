import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animation timing - complete in 2 seconds
    const duration = 2000; // 2 seconds
    const interval = 10; // Update every 10ms for smooth animation
    const steps = duration / interval;
    const increment = 100 / steps;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;

      if (currentProgress >= 100) {
        clearInterval(timer);
        setProgress(100);

        // Small delay before calling onLoadingComplete to ensure the animation is visible
        setTimeout(() => {
          onLoadingComplete();
        }, 200);
      } else {
        setProgress(currentProgress);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
      <div className="w-full max-w-screen-md px-4">
        <img
          src="/images/logo.png"
          alt="DreamLand Logo"
          className="w-full object-contain mb-4"
        />

        <div className="text-center mb-8">
          <p className="text-white text-2xl tracking-wide" style={{ fontFamily: "'Shrikhand', cursive", letterSpacing: "0.5px" }}>
            Building Dreams, Creating Realities...
          </p>
        </div>

        <Progress
          value={progress}
          className="h-2 bg-gray-800"
          color="white"
        />

        <div className="text-center mt-4 text-white">
          <span className="text-lg">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
