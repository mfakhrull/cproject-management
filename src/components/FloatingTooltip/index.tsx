import React, { useState, useRef } from "react";
import { useFloating, offset, shift, flip } from "@floating-ui/react";

interface FloatingTooltipProps {
  message: string;
  children: React.ReactNode;
  delay?: number; // Optional delay in milliseconds
  width?: string | number; // Optional width (e.g., "200px" or a number for pixels)
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({
  message,
  children,
  delay = 400, // Default delay of 400ms
  width, // Optional width prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  let timeout: NodeJS.Timeout;

  const { x, y, strategy, refs } = useFloating({
    placement: "top",
    middleware: [offset(10), flip(), shift()],
  });

  const handleMouseEnter = () => {
    timeout = setTimeout(() => setIsOpen(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setIsOpen(false);
  };

  return (
    <div
      ref={refs.setReference}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      {children}
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: width ? width : "auto", // Apply width if provided
          }}
          className="absolute z-10 rounded bg-opacity-85 bg-gray-600 px-4 py-1 text-xs text-white shadow-lg flex items-center justify-center text-center"
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default FloatingTooltip;
