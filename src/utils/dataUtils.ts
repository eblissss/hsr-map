import type { RailRoute } from "../types";

/**
 * Calculate cost per mile for a route
 */
export function calculateCostPerMile(route: RailRoute): number {
  return route.cost_est_billions / route.length_miles;
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format time in minutes to hours and minutes
 */
export function formatTravelTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get time savings percentage vs driving
 */
export function getTimeSavings(route: RailRoute): number {
  if (!route.travel_time_minutes || !route.drive_time_minutes) return 0;
  return (
    ((route.drive_time_minutes - route.travel_time_minutes) /
      route.drive_time_minutes) *
    100
  );
}
