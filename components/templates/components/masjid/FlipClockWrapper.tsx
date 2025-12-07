import React, { useEffect, useRef } from "react";
import { flipClock, clock, theme, css as fcCss } from "flipclock";

const FlipClockWrapper: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container before creating clock
    containerRef.current.innerHTML = "";

    // Create custom styles to match your countdown design
    const customStyles = `
    /* Reduce top padding of top half */
    .flip-clock-card-item-inner .top {
      padding-top: 0px !important;
      font-weight: 1000 !important;
      color: #ffffff !important;
      background: #0d0d0d !important;
      border-color: #000 !important;
      text-shadow:
        0 0 2px rgba(255,255,255,0.6),
        0 0 3px rgba(255,255,255,0.5) !important;
      font-family: inherit !important;
    }
    
    /* Reduce bottom padding of bottom half */
    .flip-clock-card-item-inner .bottom {
      padding-bottom: 0px !important;
      font-weight: 1000 !important;
      color: #ffffff !important;
      background: #0d0d0d !important;
      border-color: #000 !important;
      text-shadow:
        0 0 2px rgba(255,255,255,0.6),
        0 0 3px rgba(255,255,255,0.5) !important;
      font-family: inherit !important;
    }
    
    /* Alternative: target the card item itself */
    .flip-clock-card-item {
      padding: 0 !important;
    }
    
    /* If the above doesn't work, try targeting the face padding */
    .fc-face {
      padding-top: 0px !important;
      padding-bottom: 0px !important;
      background-color: #1a1a1a !important;
      border-radius: 8px !important;
      border: 1px solid #0a0a0a !important;
      box-shadow: 
        0 8px 16px rgba(0,0,0,0.9),
        inset 0 -4px 8px rgba(0,0,0,0.6),
        inset 0 4px 8px rgba(255,255,255,0.03) !important;
    }
    
    .fc-digit {
      color: #f5f5f5 !important;
      font-weight: 1200 !important;
      font-size: 300px !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    
    .fc-divider {
      color: #FFFFFF !important;
      font-size: 32px !important;
      font-weight: 700 !important;
      animation: blink 1s step-start infinite !important;
    }
    
    .flip-clock-divider-inner {
      color: #FFFFFF !important;
    }
    
    @keyframes blink {
      0%, 49% {
        opacity: 1;
      }
      50%, 100% {
        opacity: 0;
      }
    }
  `;

    // Add custom styles to the document
    const styleElement = document.createElement("style");
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);

    const fc = flipClock({
      parent: containerRef.current,
      face: clock({
        format: "[hh]:[mm]:[ss]",
      }),
      theme: theme({
        dividers: ":",
        css: fcCss({
          fontSize: "240px", // Larger font to match your design
          lineHeight: "160px", // Match the height of your design
        }),
        // Additional theme options if the library supports them
        faceWidth: 220,
        faceHeight: 180,
      }),
    });

    // Try to apply additional styling if possible
    setTimeout(() => {
      const faces = containerRef.current?.querySelectorAll(".fc-face");
      faces?.forEach((face) => {
        (face as HTMLElement).style.width = "220px";
        (face as HTMLElement).style.height = "220px";
        (face as HTMLElement).style.display = "flex";
        (face as HTMLElement).style.alignItems = "center";
        (face as HTMLElement).style.justifyContent = "center";
      });
    }, 100);

    return () => {
      fc.dispose?.(); // cleanup
      styleElement.remove(); // Remove custom styles
      if (containerRef.current) containerRef.current.innerHTML = ""; // clear on unmount
    };
  }, []);

  return (
    <div className="mb-0 mt-0 relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-2xl rounded-full"></div>
      <div className="relative">
        <div
          ref={containerRef}
          className="flex items-center justify-center gap-4"
        ></div>
      </div>
    </div>
  );
};

export default FlipClockWrapper;
