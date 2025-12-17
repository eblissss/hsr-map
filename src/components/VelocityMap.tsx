import { useState, useCallback, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";
import type { PickingInfo } from "@deck.gl/core";
import type { RailRouteFeature } from "../types";
import { useMapStore } from "../store/mapStore";
import { getColorBySpeed } from "../utils/colors";
import routesData from "../data/routes.json";
import stationsData from "../data/stations.json";

// Base map style - CARTO dark matter with labels for borders
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface StationFeature {
  type: "Feature";
  properties: {
    name: string;
    importance: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

// Easing function for smooth flyTo
const cubicBezier = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export function VelocityMap() {
  const {
    selectedRouteId,
    hoveredRouteId,
    viewState,
    setSelectedRouteId,
    setHoveredRouteId,
    setViewState,
  } = useMapStore();

  const [cursor, setCursor] = useState<string>("default");
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  const routes = (routesData as any).features as RailRouteFeature[];
  const stations = (stationsData as any).features as StationFeature[];

  // Handle route/station click
  const handleClick = useCallback(
    (info: PickingInfo) => {
      if (info.object) {
        // Check if clicked object is a route (has id) or station (has name)
        if (info.object.properties.id) {
          // Route clicked
          const routeId = info.object.properties.id;
          setSelectedRouteId(routeId);

          // Calculate bounds for the route
          const coords = info.object.geometry.coordinates as [number, number][];
          const lons = coords.map((c) => c[0]);
          const lats = coords.map((c) => c[1]);

          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);

          const centerLon = (minLon + maxLon) / 2;
          const centerLat = (minLat + maxLat) / 2;

          // Calculate zoom level based on bounds
          const lonDiff = maxLon - minLon;
          const latDiff = maxLat - minLat;
          const maxDiff = Math.max(lonDiff, latDiff);
          const zoom = Math.min(12, Math.max(5, 8 - Math.log2(maxDiff)));

          setViewState({
            longitude: centerLon,
            latitude: centerLat,
            zoom: zoom,
            pitch: 0,
            bearing: 0,
            transitionDuration: 2000,
            transitionEasing: cubicBezier,
          });
        } else if (info.object.properties.name) {
          // Station clicked - zoom to station location
          const coords = info.object.geometry.coordinates as [number, number];
          const [longitude, latitude] = coords;

          setViewState({
            longitude,
            latitude,
            zoom: 10,
            pitch: 0,
            bearing: 0,
            transitionDuration: 1000,
            transitionEasing: cubicBezier,
          });

          // Clear route selection when clicking on a station
          setSelectedRouteId(null);
        }
      } else {
        // Click on empty space - reset
        setSelectedRouteId(null);
        setViewState({
          longitude: -98.5795,
          latitude: 39.8283,
          zoom: 4,
          pitch: 0,
          bearing: 0,
          transitionDuration: 2000,
          transitionEasing: cubicBezier,
        });
      }
    },
    [setSelectedRouteId, setViewState]
  );

  // Handle route hover
  const handleHover = useCallback(
    (info: PickingInfo) => {
      if (info.object) {
        // Check if it's a route or station
        if (info.object.properties) {
          if (info.object.properties.id) {
            // It's a route
            const route = info.object.properties;
            setHoveredRouteId(route.id);
            setCursor("pointer");
            setTooltip({
              x: info.x,
              y: info.y,
              content: `${route.name} : ${route.design_speed_mph} MPH`,
            });
          } else if (info.object.properties.name) {
            // It's a station
            setHoveredRouteId(null);
            setCursor("pointer");
            setTooltip({
              x: info.x,
              y: info.y,
              content: info.object.properties.name,
            });
          }
        }
      } else {
        setHoveredRouteId(null);
        setCursor("default");
        setTooltip(null);
      }
    },
    [setHoveredRouteId]
  );

  // Create layers
  const layers = useMemo(() => {
    return [
      new PathLayer({
        id: "rail-network",
        data: routes,
        pickable: true,
        widthScale: 1,
        widthMinPixels: 1.5,
        widthMaxPixels: 10,
        getPath: (d: RailRouteFeature) => d.geometry.coordinates,
        getColor: (d: RailRouteFeature) => {
          const adjustedColor = getColorBySpeed(d.properties.design_speed_mph);

          // Dim non-selected routes when something is selected
          if (selectedRouteId && d.properties.id !== selectedRouteId) {
            return [adjustedColor[0], adjustedColor[1], adjustedColor[2], 51]; // 20% opacity
          }

          // Vary opacity based on construction status for gradient effect
          let opacity = 255;
          if (
            d.properties.status === "STUDYING" ||
            d.properties.status === "HALTED"
          ) {
            opacity = 100; // 40% opacity
          } else if (d.properties.status === "PLANNING") {
            opacity = 153; // 60% opacity
          }

          // Full opacity for selected/hovered
          if (
            d.properties.id === selectedRouteId ||
            d.properties.id === hoveredRouteId
          ) {
            opacity = 255;
          }

          return [...adjustedColor, opacity] as [
            number,
            number,
            number,
            number,
          ];
        },
        getWidth: (d: RailRouteFeature) => {
          if (d.properties.id === selectedRouteId) return 6;
          if (d.properties.id === hoveredRouteId) return 4;
          return 1.5;
        },
        getDashArray: (d: RailRouteFeature) => {
          // Dashed for planning, solid for construction/funded
          return d.properties.status === "PLANNING" ||
            d.properties.status === "STUDYING"
            ? [4, 4]
            : [0, 0];
        },
        dashJustified: true,
        dashGapPickable: true,
        updateTriggers: {
          getWidth: [selectedRouteId, hoveredRouteId],
          getColor: [selectedRouteId],
        },
        transitions: {
          getWidth: {
            duration: 300,
            easing: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
          },
          getColor: {
            duration: 300,
          },
        },
      }),
      // Elevated layer for selected route (parallax effect)
      ...(selectedRouteId
        ? [
            new PathLayer({
              id: "rail-network-elevated",
              data: routes.filter((r) => r.properties.id === selectedRouteId),
              pickable: false,
              widthScale: 1,
              widthMinPixels: 7,
              widthMaxPixels: 12,
              getPath: (d: RailRouteFeature) => d.geometry.coordinates,
              getColor: (d: RailRouteFeature) => {
                const baseColor = getColorBySpeed(
                  d.properties.design_speed_mph
                );
                return [...baseColor, 30]; // Subtle glow
              },
              getWidth: 8,
            }),
          ]
        : []),
      new ScatterplotLayer({
        id: "stations",
        data: stations,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusMinPixels: 2,
        radiusMaxPixels: 8,
        lineWidthMinPixels: 1,
        getPosition: (d: StationFeature) => d.geometry.coordinates,
        getRadius: 100,
        getFillColor: [255, 255, 255, 200],
        getLineColor: [255, 255, 255, 255],
        updateTriggers: {
          getRadius: [hoveredRouteId],
        },
        transitions: {
          getRadius: {
            duration: 200,
          },
        },
      }),
    ];
  }, [routes, stations, selectedRouteId, hoveredRouteId]);

  // US bounds to restrict panning and zooming
  const usBounds = {
    minLongitude: -125,
    maxLongitude: -65,
    minLatitude: 25,
    maxLatitude: 50,
  };

  // Constrain view state to US bounds
  const constrainViewState = useCallback((viewState: any) => {
    return {
      ...viewState,
      longitude: Math.max(
        usBounds.minLongitude,
        Math.min(usBounds.maxLongitude, viewState.longitude)
      ),
      latitude: Math.max(
        usBounds.minLatitude,
        Math.min(usBounds.maxLatitude, viewState.latitude)
      ),
      zoom: Math.max(3, Math.min(12, viewState.zoom)), // Min zoom 3 (continental view), max zoom 12 (detailed view)
    };
  }, []);

  return (
    <>
      <DeckGL
        viewState={constrainViewState(viewState)}
        controller={true}
        layers={layers}
        onClick={handleClick}
        onHover={handleHover}
        getCursor={() => cursor}
        pickingRadius={20}
        onViewStateChange={({ viewState: newViewState }) => {
          // Update store only if not in transition
          if (!newViewState.transitionDuration) {
            setViewState(constrainViewState(newViewState));
          }
        }}
        style={{
          position: "absolute",
          inset: "0",
          transition: "filter 2s ease-out",
        }}
      >
        <Map
          mapStyle={MAP_STYLE}
          style={{ width: "100%", height: "100%" }}
          onLoad={(event) => {
            const map = event.target;
            // Hide water-related layers but keep all boundary layers
            const style = map.getStyle();
            if (style && style.layers) {
              style.layers.forEach((layer: any) => {
                const layerId = layer.id?.toLowerCase() || "";
                // Only hide layers that are specifically water features, be very conservative
                const isWaterLayer =
                  layerId === "waterway" && layer.type === "line";
                if (isWaterLayer) {
                  map.setLayoutProperty(layer.id, "visibility", "none");
                }
              });
            }
          }}
        />
      </DeckGL>

      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="deck-tooltip"
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
}
