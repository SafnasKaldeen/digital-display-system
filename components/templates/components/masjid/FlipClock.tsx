import React, { useState, useEffect } from "react";
import FlipCard from "./FlipCard";

export interface TimeUnit {
  label: string;
  value: number;
  previous?: number;
}

interface FlipClockProps {
  timeUnits: TimeUnit[];
  className?: string;
}

const FlipClock: React.FC<FlipClockProps> = ({ timeUnits, className = "" }) => {
  return (
    <div className={`flex justify-center ${className}`}>
      {timeUnits.map((unit, index) => (
        <React.Fragment key={unit.label}>
          <FlipCard
            value={unit.value}
            previousValue={unit.previous}
            label={unit.label}
          />

          {/* Add separator after hours and minutes */}
          {(index === 0 || index === 1) && index < timeUnits.length - 1 && (
            <div className="mx-1 text-4xl flex items-center pb-6">
              <span className="text-gray-700 dark:text-gray-300">:</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FlipClock;
