import React, { useState, useCallback } from "react";

const Slider = React.forwardRef(({ 
  className = "", 
  min = 0, 
  max = 100, 
  value = [0, 100], 
  onChange,
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = useState(value);
  
  const handleChange = useCallback((newValue) => {
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  const getPercentage = (val) => ((val - min) / (max - min)) * 100;

  return (
    <div 
      ref={ref}
      className={`relative flex w-full touch-none select-none items-center ${className}`}
      {...props}
    >
      {/* Track */}
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        {/* Range */}
        <div 
          className="absolute h-full bg-slate-900 rounded-full"
          style={{
            left: `${getPercentage(internalValue[0])}%`,
            width: `${getPercentage(internalValue[1]) - getPercentage(internalValue[0])}%`
          }}
        />
      </div>
      
      {/* Left Thumb */}
      <div
        className="absolute block h-5 w-5 rounded-full border-2 border-slate-900 bg-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        style={{ left: `calc(${getPercentage(internalValue[0])}% - 10px)` }}
      />
      
      {/* Right Thumb */}
      <div
        className="absolute block h-5 w-5 rounded-full border-2 border-slate-900 bg-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        style={{ left: `calc(${getPercentage(internalValue[1])}% - 10px)` }}
      />
    </div>
  );
});

Slider.displayName = "Slider";

export { Slider };