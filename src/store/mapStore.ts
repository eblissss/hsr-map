import { create } from "zustand";
import type { ViewState } from "../types";

interface MapStore {
  // Core state
  selectedRouteId: string | null;
  hoveredRouteId: string | null;
  viewState: ViewState;

  // Actions
  setSelectedRouteId: (id: string | null) => void;
  setHoveredRouteId: (id: string | null) => void;
  setViewState: (viewState: ViewState) => void;
}

// Default view: Continental US
const DEFAULT_VIEW_STATE: ViewState = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

export const useMapStore = create<MapStore>((set) => ({
  // Initial state
  selectedRouteId: null,
  hoveredRouteId: null,
  viewState: DEFAULT_VIEW_STATE,

  // Core actions
  setSelectedRouteId: (id) => {
    set({ selectedRouteId: id });
  },

  setHoveredRouteId: (id) => set({ hoveredRouteId: id }),

  setViewState: (viewState) => {
    set({ viewState });
  },
}));
