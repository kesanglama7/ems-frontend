"use client";

import { useEffect, useMemo } from "react";
import L, {
  type LeafletMouseEvent,
  type Marker as LeafletMarker,
} from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

interface OfficeLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (latitude: number, longitude: number) => void;
}

const DEFAULT_POSITION: [number, number] = [
  27.717245,
  85.32396,
];

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const officeMarkerIcon = L.divIcon({
  className: "",
  iconSize: [44, 44],
  iconAnchor: [22, 42],
  popupAnchor: [0, -42],
  html: `
    <div
      style="
        width:44px;
        height:44px;
        display:flex;
        align-items:center;
        justify-content:center;
        filter:drop-shadow(0 4px 5px rgba(0,0,0,.22));
      "
    >
      <svg
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 10C20 15.5 12 22 12 22C12 22 4 15.5 4 10C4 5.58 7.58 2 12 2C16.42 2 20 5.58 20 10Z"
          fill="#2563eb"
          stroke="white"
          stroke-width="1.5"
        />
        <circle
          cx="12"
          cy="10"
          r="3"
          fill="white"
        />
      </svg>
    </div>
  `,
});

interface MapClickHandlerProps {
  onLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;
}

function MapClickHandler({
  onLocationChange,
}: MapClickHandlerProps) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onLocationChange(
        event.latlng.lat,
        event.latlng.lng,
      );
    },
  });

  return null;
}

interface MapControllerProps {
  latitude: number | null;
  longitude: number | null;
}

function MapController({
  latitude,
  longitude,
}: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (latitude === null || longitude === null) {
      return;
    }

    map.flyTo(
      [latitude, longitude],
      Math.max(map.getZoom(), 16),
      {
        duration: 0.6,
      },
    );
  }, [latitude, longitude, map]);

  return null;
}

export function OfficeLocationMap({
  latitude,
  longitude,
  radiusMeters,
  onLocationChange,
}: OfficeLocationMapProps) {
  const position = useMemo<[number, number] | null>(
    () =>
      latitude !== null && longitude !== null
        ? [latitude, longitude]
        : null,
    [latitude, longitude],
  );

  const center = position ?? DEFAULT_POSITION;

  return (
    <MapContainer
      center={center}
      zoom={position ? 17 : 13}
      scrollWheelZoom
      className="h-full min-h-[420px] w-full"
    >
      <TileLayer
        url={TILE_URL}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapClickHandler
        onLocationChange={onLocationChange}
      />

      <MapController
        latitude={latitude}
        longitude={longitude}
      />

      {position && (
        <>
          <Circle
            center={position}
            radius={radiusMeters}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.12,
              weight: 2,
            }}
          />

          <Marker
            position={position}
            icon={officeMarkerIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const marker =
                  event.target as LeafletMarker;

                const point = marker.getLatLng();

                onLocationChange(
                  point.lat,
                  point.lng,
                );
              },
            }}
          />
        </>
      )}
    </MapContainer>
  );
}