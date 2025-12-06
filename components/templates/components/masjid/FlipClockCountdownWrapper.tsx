import React from "react";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";

interface FlipClockCountdownWrapperProps {
  targetTime: Date;
}

export const FlipClockCountdownWrapper: React.FC<
  FlipClockCountdownWrapperProps
> = ({ targetTime }) => {
  return (
    <div className="mb-20 mt-0 relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-2xl rounded-full"></div>

      <FlipClockCountdown
        to={targetTime}
        renderMap={["hours", "minutes", "seconds"]}
        labels={["Days", "Hours", "Minutes", "Seconds"]}
        labelStyle={{ display: "none" }}
        showLabels={false}
        showSeparators={true}
        daysInHours={true}
        digitBlockStyle={{
          width: 220,
          height: 240,
          fontSize: 200,
          fontWeight: "700",
          backgroundColor: "#1a1a1a",
          color: "#f5f5f5",
          borderRadius: 8,
          boxShadow:
            "0 8px 16px rgba(0,0,0,0.9), inset 0 -4px 8px rgba(0,0,0,0.6), inset 0 4px 8px rgba(255,255,255,0.03)",
          border: "1px solid #0a0a0a",
        }}
        dividerStyle={{ color: "transparent", height: 0 }}
        separatorStyle={{
          color: "#666",
          size: "32px",
        }}
        duration={0.5}
      />
    </div>
  );
};

export default FlipClockCountdownWrapper;
