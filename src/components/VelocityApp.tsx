import { useMemo } from "react";
import { VelocityMap } from "./VelocityMap";
import { RouteDetail } from "./RouteDetail";
import { ErrorBoundary } from "./ErrorBoundary";
import { useMapStore } from "../store/mapStore";
import routesData from "../data/routes.json";
import type { RailRouteFeature } from "../types";
import "maplibre-gl/dist/maplibre-gl.css";

export function VelocityApp() {
  const { selectedRouteId, setSelectedRouteId } = useMapStore();

  const routes = (routesData as any).features as RailRouteFeature[];
  const selectedRoute = useMemo(() => {
    return routes.find((r) => r.properties.id === selectedRouteId);
  }, [routes, selectedRouteId]);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen overflow-hidden bg-[hsl(240,5%,8%)]">
        <VelocityMap />

        {/* HSRmap Logo */}
        <div className="absolute bottom-4 left-4 z-10 group cursor-default">
          <div className="relative overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-md px-5! py-2.5! shadow-2xl transition-all duration-500! hover:border-[var(--color-mach-1)] hover:shadow-[0_0_20px_-10px_var(--color-mach-1)]">
            <div className="relative flex items-center gap-3">
              <div className="flex items-baseline gap-0.5 leading-none">
                <span className="font-display text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
                  HSR
                </span>
                <span className="font-data text-sm font-medium tracking-wide text-[var(--color-text-muted)] transition-all duration-300! group-hover:text-[var(--color-mach-1)] group-hover:translate-x-0.5">
                  map
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Detail Floating Dialog */}
        {selectedRoute && (
          <RouteDetail
            route={selectedRoute.properties}
            onClose={() => setSelectedRouteId(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
