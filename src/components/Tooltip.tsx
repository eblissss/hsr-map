import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {isVisible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 text-slate-300 text-xs rounded border border-white/10 whitespace-nowrap z-50 pointer-events-none animate-tooltip-fade-in max-w-xs">
          <span className="block text-left">{content}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-black/95"></span>
        </span>
      )}
    </span>
  );
}

interface InfoIconProps {
  tooltip: string;
}

export function InfoIcon({ tooltip }: InfoIconProps) {
  return (
    <Tooltip content={tooltip}>
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 ml-1 text-[9px] text-slate-500 hover:text-slate-300 transition-colors border border-slate-600 hover:border-slate-400 rounded-full font-data">
        i
      </span>
    </Tooltip>
  );
}

