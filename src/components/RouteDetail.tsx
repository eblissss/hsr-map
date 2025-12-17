import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Train,
  Car,
  Plane,
  DollarSign,
  MapPin,
  ArrowRight,
  Zap,
  User,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { RailRoute } from "../types";
import {
  STATUS_COLORS,
  getColorBySpeed,
  getColorHexBySpeed,
} from "../utils/colors";
import {
  calculateCostPerMile,
  formatLargeNumber,
  formatTravelTime,
} from "../utils/dataUtils";

// --- Utility for cleaner tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Helper: Get Thermal Color Class based on speed ---
const getMachClass = (speed: number) => {
  const hexColor = getColorHexBySpeed(speed);
  const rgbColor = getColorBySpeed(speed);
  const [r, g, b] = rgbColor;

  // Create RGBA for drop-shadow (with appropriate opacity based on speed)
  const rgbaOpacity = speed >= 200 ? "0.4" : speed >= 150 ? "0.4" : "0.5";
  const rgbaColor = `rgba(${r},${g},${b},${rgbaOpacity})`;

  return `text-[${hexColor}] drop-shadow-[0_0_15px_${rgbaColor}]`;
};

// --- Sub-Components ---

const DataBlock = ({
  label,
  value,
  subValue,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  subValue?: string;
  icon?: React.ElementType;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col p-2! rounded-lg bg-white/[0.02] border border-white/[0.04] transition-colors",
      className
    )}
  >
    <div className="flex items-center gap-2 mb-1.5 opacity-60">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span className="text-[12px] font-display font-bold tracking-[0.15em] uppercase">
        {label}
      </span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-data font-medium tracking-tight text-[var(--color-text-primary)]">
        {value}
      </span>
      {subValue && (
        <span className="text-sm font-data text-[var(--color-text-muted)]">
          {subValue}
        </span>
      )}
    </div>
  </div>
);

const Timeline = ({ currentStatus }: { currentStatus: string }) => {
  const steps = ["STUDYING", "PLANNING", "CONSTRUCTION", "COMPLETED"];
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="relative w-full py-4 px-4">
      {/* Base Line */}
      <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/[0.08] -translate-y-1/2" />

      {/* Active Progress Line */}
      <div
        className="absolute top-1/2 left-4 h-[1px] bg-[var(--color-text-primary)] -translate-y-1/2 transition-all duration-700 ease-out"
        style={{
          width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 1rem)`,
        }}
      />

      <div className="relative flex justify-between w-full px-2">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step}
              className="flex flex-col items-center gap-3 relative z-10 bg-[var(--color-substrate)] px-1 min-w-0 flex-1"
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isCurrent
                    ? "bg-[var(--color-text-primary)] scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    : isActive
                      ? "bg-[var(--color-text-muted)]"
                      : "bg-white/[0.1] border border-white/[0.1]"
                )}
              />
              {/* Only show label for active or current to reduce noise, or first/last */}
              <span
                className={cn(
                  "absolute top-5 text-[10px] font-display font-bold tracking-widest uppercase whitespace-nowrap transition-colors text-center w-full",
                  isCurrent ? "text-[var(--color-text-primary)]" : "opacity-60"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Component ---

interface RouteDetailProps {
  route: RailRoute;
  onClose: () => void;
}

export function RouteDetail({ route, onClose }: RouteDetailProps) {
  const [activeTab, setActiveTab] = useState<string>("travel");
  const cardRef = useRef<HTMLDivElement>(null);

  // Metrics
  const costPerMile = calculateCostPerMile(route);

  // Styling Logic
  const machColorClass = getMachClass(route.design_speed_mph);
  const statusColor = STATUS_COLORS[route.status] || "#ffffff";

  // Keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEscape);
    cardRef.current?.focus();
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-title"
      tabIndex={-1}
      className="fixed top-4 right-4 bottom-4 left-4 md:top-4 md:right-4 md:left-auto md:bottom-auto w-full max-w-[380px] md:max-w-[380px] z-[100] outline-none"
    >
      <div className="glass h-full flex flex-col rounded-2xl overflow-hidden animate-in slide-in-from-right-8 duration-300 relative p-2!">
        {/* Film Grain Overlay (from global.css) */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0 grain-overlay" />

        {/* --- Header --- */}
        <div className="relative shrink-0 pt-7 px-6 pb-4 z-10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 -mr-2 -mt-2 rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Close route details"
            title="Close route details (Escape)"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Badges */}
          <div className="flex items-center mb-2!">
            <span
              className="px-2! py-0.5 rounded text-[14px] font-mono font-bold uppercase tracking-wider border border-white/[0.1]"
              style={{
                color: statusColor,
                backgroundColor: `${statusColor}10`,
                borderColor: `${statusColor}20`,
              }}
            >
              {route.status}
            </span>
          </div>

          <h1
            id="route-title"
            className="text-2xl font-display font-medium text-[var(--color-text-primary)] leading-none mb-4! tracking-tight"
          >
            {route.name}
          </h1>
        </div>

        {/* --- Scrollable Body --- */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 z-10">
          {/* HERO: Speed and Completion */}
          <div className="pb-2! grid grid-cols-2 gap-2">
            {/* Design Speed Block */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] p-2!">
              <div className="flex flex-col relative z-10">
                <div className="flex items-center gap-2 mb-1 opacity-70">
                  <Zap className="w-3 h-3" />
                  <span className="text-[12px] font-display uppercase tracking-[0.2em] font-bold">
                    Design Speed
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-5xl font-data font-light tracking-tighter tabular-nums",
                      machColorClass
                    )}
                  >
                    {route.design_speed_mph}
                  </span>
                  <span className="text-md font-display font-bold text-[var(--color-text-muted)] mt-1">
                    MPH
                  </span>
                </div>
              </div>
            </div>

            {/* Completion Year Block */}
            {route.completion_year_tgt && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] p-2!">
                <div className="flex flex-col relative z-10">
                  <div className="flex items-center gap-2 mb-1 opacity-70">
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-[12px] font-display uppercase tracking-[0.2em] font-bold">
                      Completion
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-data font-light tracking-tighter tabular-nums text-[var(--color-text-primary)]">
                      {route.completion_year_tgt}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-2 mb-6!">
            <DataBlock
              label="Est. Cost"
              value={`$${route.cost_est_billions}`}
              subValue="B"
              icon={DollarSign}
            />
            <DataBlock
              label="Distance"
              value={route.length_miles}
              subValue="mi"
              icon={MapPin}
            />
          </div>

          {/* Timeline - Simplified */}
          <div className="pb-10!">
            <Timeline currentStatus={route.status} />
          </div>

          {/* Tab Navigation */}
          <div className="sticky top-0 bg-[var(--color-substrate)]/95 backdrop-blur z-20 border-b border-[var(--color-border)]">
            <div className="flex">
              {["travel", "cities", "impact"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2! text-[12px] font-display font-bold uppercase tracking-[0.15em] transition-all relative",
                      isActive
                        ? "text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    )}
                  >
                    {tab}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-text-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="py-2!">
            {activeTab === "travel" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Rail Time Row */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-white/[0.05] text-[var(--color-text-primary)]">
                      <Train className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-display uppercase tracking-wider">
                        Rail Time
                      </div>
                      <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                        Optimized
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-data text-[var(--color-text-primary)]">
                    {formatTravelTime(route.travel_time_minutes || 0)}
                  </div>
                </div>

                {/* Drive Time Row */}
                {route.drive_time_minutes && (
                  <div className="flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-white/[0.02]">
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-display uppercase tracking-wider">
                        Drive Time
                      </div>
                    </div>
                    <div className="text-lg font-data">
                      {formatTravelTime(route.drive_time_minutes || 0)}
                    </div>
                  </div>
                )}

                {/* Flight Time Row */}
                {route.flight_time_minutes && (
                  <div className="flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-white/[0.02]">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-display uppercase tracking-wider">
                        Flight Time
                      </div>
                    </div>
                    <div className="text-lg font-data">
                      {formatTravelTime(route.flight_time_minutes || 0)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "cities" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-wrap items-center gap-4">
                  {route.segments.map((segment, index) => (
                    <React.Fragment key={segment}>
                      <div className="flex items-center gap-2 pr-2! p-1! rounded-lg bg-white/[0.03] border border-white/[0.08]">
                        <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                        <span className="text-base font-display font-medium text-[var(--color-text-primary)]">
                          {segment}
                        </span>
                      </div>
                      {index < route.segments.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] opacity-60" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "impact" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="grid grid-cols-2 gap-2">
                  <DataBlock
                    label="Annual Riders"
                    value={formatLargeNumber(route.annual_ridership_est || 0)}
                    icon={User}
                    className="bg-transparent border-white/[0.06]"
                  />
                  <DataBlock
                    label="Jobs Created"
                    value={formatLargeNumber(route.jobs_created || 0)}
                    icon={ArrowRight}
                    className="bg-transparent border-white/[0.06]"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mt-2!">
                    <span className="text-sm font-display uppercase tracking-widest font-bold">
                      Cost per Mile
                    </span>
                    <span className="text-2xl font-data text-[var(--color-text-primary)]">
                      ${(costPerMile * 1000).toFixed(0)}M
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description Footer */}
          <div className="py-2!">
            <p className="text-sm text-[var(--color-text-muted)] font-display leading-6 font-light">
              {route.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
