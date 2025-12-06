import React, { useState, useEffect } from "react";

interface FlipCardProps {
  value: number;
  previousValue?: number;
  label?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ value, previousValue, label }) => {
  const [animateFlip, setAnimateFlip] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [topFlipValue, setTopFlipValue] = useState(value);
  const [bottomFlipValue, setBottomFlipValue] = useState(
    previousValue || value
  );

  // Pad single digits with a leading zero
  const formattedValue = displayValue.toString().padStart(2, "0");
  const formattedTopFlip = topFlipValue.toString().padStart(2, "0");
  const formattedBottomFlip = bottomFlipValue.toString().padStart(2, "0");

  useEffect(() => {
    if (value !== displayValue) {
      setAnimateFlip(true);
      setTopFlipValue(displayValue);
      setBottomFlipValue(value);

      // After animation completes, update the display value
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setAnimateFlip(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [value, displayValue]);

  return (
    <div className="flex flex-col items-center mx-1">
      <div className="flip-card">
        <div className="top">
          <span className="text-clock-text dark:text-gray-200">
            {formattedValue}
          </span>
        </div>
        <div className="bottom">
          <span className="text-clock-text dark:text-gray-200">
            {formattedValue}
          </span>
        </div>

        {animateFlip && (
          <>
            <div className="top-flip">
              <span className="text-clock-text dark:text-gray-200">
                {formattedTopFlip}
              </span>
            </div>
            <div className="bottom-flip">
              <span className="text-clock-text dark:text-gray-200">
                {formattedBottomFlip}
              </span>
            </div>
          </>
        )}
      </div>

      {label && (
        <div className="text-xs uppercase tracking-wide mt-1 text-gray-600 dark:text-gray-400">
          {label}
        </div>
      )}
    </div>
  );
};

export default FlipCard;
