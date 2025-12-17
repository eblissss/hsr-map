export type ProjectStatus =
  | "STUDYING"
  | "PLANNING"
  | "CONSTRUCTION"
  | "COMPLETED"
  | "HALTED";

export interface RailRoute {
  id: string;
  name: string;
  segments: string[];

  // Technicals
  design_speed_mph: number;

  // Economics
  cost_est_billions: number;

  // Status
  status: ProjectStatus;
  completion_year_tgt: number | null;
  length_miles: number;

  // Travel Time Comparisons
  travel_time_minutes?: number; // HSR travel time
  drive_time_minutes?: number; // Current driving time
  flight_time_minutes?: number; // Flight time + airport overhead

  // Impact Metrics
  jobs_created?: number;
  annual_ridership_est?: number;

  // Editorial
  description: string;
}

export interface RailRouteFeature {
  type: "Feature";
  id: string;
  properties: RailRoute;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

export interface RailRoutesCollection {
  type: "FeatureCollection";
  features: RailRouteFeature[];
}

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number;
  transitionEasing?: (t: number) => number;
}
