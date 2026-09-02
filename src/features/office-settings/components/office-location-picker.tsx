"use client";

import dynamic from "next/dynamic";
import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Loader2,
  LocateFixed,
  MapPin,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const OfficeLocationMap = dynamic(
  () =>
    import("./office-location-map").then(
      (module) => module.OfficeLocationMap,
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[420px] w-full rounded-none" />
    ),
  },
);

interface OfficeLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;
  onAddressResolved: (address: string) => void;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  display_name?: string;
}

let lastNominatimRequestAt = 0;

async function respectNominatimRateLimit() {
  const elapsed =
    Date.now() - lastNominatimRequestAt;

  const remaining = 1100 - elapsed;

  if (remaining > 0) {
    await new Promise((resolve) =>
      window.setTimeout(resolve, remaining),
    );
  }

  lastNominatimRequestAt = Date.now();
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
) {
  await respectNominatimRateLimit();

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Could not resolve the selected address.",
    );
  }

  return (await response.json()) as NominatimReverseResult;
}

async function searchLocation(query: string) {
  await respectNominatimRateLimit();

  const params = new URLSearchParams({
    format: "jsonv2",
    q: query,
    limit: "1",
    addressdetails: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Could not search for this location.",
    );
  }

  return (await response.json()) as NominatimSearchResult[];
}

export function OfficeLocationPicker({
  latitude,
  longitude,
  radiusMeters,
  onLocationChange,
  onAddressResolved,
}: OfficeLocationPickerProps) {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] =
    useState(false);
  const [isLocating, setIsLocating] =
    useState(false);
  const [isResolving, setIsResolving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const geocodeRequestId = useRef(0);

  async function handleLocationSelected(
    lat: number,
    lng: number,
  ) {
    onLocationChange(lat, lng);
    setError(null);

    const requestId =
      ++geocodeRequestId.current;

    try {
      setIsResolving(true);

      const result = await reverseGeocode(
        lat,
        lng,
      );

      if (
        requestId === geocodeRequestId.current &&
        result.display_name
      ) {
        onAddressResolved(
          result.display_name,
        );
      }
    } catch {
      // Coordinates remain selected even if
      // reverse geocoding is unavailable.
    } finally {
      if (
        requestId === geocodeRequestId.current
      ) {
        setIsResolving(false);
      }
    }
  }

  async function handleSearch() {
    const query = search.trim();

    if (!query) {
      return;
    }

    try {
      setError(null);
      setIsSearching(true);

      const results =
        await searchLocation(query);

      const result = results[0];

      if (!result) {
        setError(
          "No location found. Try a more specific address.",
        );
        return;
      }

      const lat = Number(result.lat);
      const lng = Number(result.lon);

      onLocationChange(lat, lng);
      onAddressResolved(
        result.display_name,
      );
    } catch {
      setError(
        "Location search is temporarily unavailable.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    void handleSearch();
  }

  function handleCurrentLocation() {
    setError(null);

    if (!navigator.geolocation) {
      setError(
        "Location access is not supported by this browser.",
      );
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);

        void handleLocationSelected(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      () => {
        setIsLocating(false);
        setError(
          "Unable to access your current location. Check your browser location permission.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 30_000,
      },
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="border-b bg-muted/20 p-3">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Search office address, e.g. Thamel, Kathmandu"
              className="pl-9"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void handleSearch()
            }
            disabled={
              isSearching ||
              !search.trim()
            }
          >
            {isSearching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search />
            )}

            Search
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={
              handleCurrentLocation
            }
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LocateFixed />
            )}

            Current location
          </Button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="relative">
        <OfficeLocationMap
          latitude={latitude}
          longitude={longitude}
          radiusMeters={radiusMeters}
          onLocationChange={
            handleLocationSelected
          }
        />

        {isResolving && (
          <div className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-md border bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
            <Loader2 className="size-3.5 animate-spin" />
            Finding address…
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" />

          <span>
            Click anywhere on the map or
            drag the pin to set the exact
            office location.
          </span>
        </div>

        {latitude !== null &&
          longitude !== null && (
            <span className="shrink-0 font-mono">
              {latitude.toFixed(6)},{" "}
              {longitude.toFixed(6)}
            </span>
          )}
      </div>
    </div>
  );
}