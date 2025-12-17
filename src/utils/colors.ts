import type { VelocityClass, ProjectStatus } from "../types";

// Thermal Spectrum Colors (RGB arrays for Deck.gl)
export const SPEED_COLORS: Record<VelocityClass, [number, number, number]> = {
  MACH_1: [0, 240, 255], // Electric Cyan
  MACH_2: [255, 193, 7], // Solar Amber
  MACH_3: [255, 87, 34], // Industrial Rust
};

// Hex colors for CSS
export const SPEED_COLORS_HEX: Record<VelocityClass, string> = {
  MACH_1: "#00F0FF",
  MACH_2: "#FFC107",
  MACH_3: "#FF5722",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  CONSTRUCTION: "#10B981",
  PLANNING: "#F59E0B",
  COMPLETED: "#059669",
  HALTED: "#EF4444",
  STUDYING: "#6B7280",
};

export function getColorBySpeed(speed: number): [number, number, number] {
  if (speed >= 200) return SPEED_COLORS.MACH_1;
  if (speed >= 150) return SPEED_COLORS.MACH_2;
  return SPEED_COLORS.MACH_3;
}

export function getColorHexBySpeed(speed: number): string {
  if (speed >= 200) return SPEED_COLORS_HEX.MACH_1;
  if (speed >= 150) return SPEED_COLORS_HEX.MACH_2;
  return SPEED_COLORS_HEX.MACH_3;
}
