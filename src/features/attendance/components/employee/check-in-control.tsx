"use client";

import { useState } from "react";
import {
  MapPin,
  Navigation,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  useCheckIn,
  useCheckOut,
  useTodayAttendance,
} from "../../hooks/use-attendance";

import { useMyEmployeeProfile } from "@/features/employees/hooks/use-my-employee-profile";

function formatTime(
  dateStr: string | null,
): string {
  if (!dateStr) return "-";

  return new Date(
    dateStr,
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(
  minutes: number | null,
): string {
  if (minutes === null) {
    return "-";
  }

  const hours = Math.floor(
    minutes / 60,
  );

  const mins = minutes % 60;

  return hours > 0
    ? `${hours}h ${mins}m`
    : `${mins}m`;
}

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

/**
 * Get the employee's current location.
 *
 * We request a fresh location every time the employee
 * checks in or checks out instead of storing an old
 * location in component state.
 */
function getCurrentLocation(): Promise<LocationState> {
  return new Promise(
    (resolve, reject) => {
      if (
        typeof navigator ===
          "undefined" ||
        !navigator.geolocation
      ) {
        reject(
          new Error(
            "Geolocation is not supported by this browser.",
          ),
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,
          });
        },

        (error) => {
          reject(error);
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    },
  );
}

export const CheckInControl = () => {
  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  const {
    data: todayResponse,
    isLoading: isLoadingAttendance,
  } = useTodayAttendance();

  const {
    data: profile,
    isLoading: isLoadingProfile,
  } = useMyEmployeeProfile();

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [
    requestingLocation,
    setRequestingLocation,
  ] = useState(false);

  const [
    locationError,
    setLocationError,
  ] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Attendance
  // ---------------------------------------------------------------------------

  const attendance =
    todayResponse?.data;

  const isCheckedIn =
    !!attendance?.checkInAt &&
    !attendance?.checkOutAt;

  const isCheckedOut =
    !!attendance?.checkOutAt;

  // ---------------------------------------------------------------------------
  // Work mode
  // ---------------------------------------------------------------------------

  /**
   * Before check-in:
   * attendance may not exist yet, so use profile.workMode.
   *
   * After check-in:
   * use workModeSnapshot because this represents the
   * work mode that was recorded for this attendance.
   */
  const workMode =
    attendance?.workModeSnapshot ??
    profile?.workMode;

  const isOnField =
    workMode === "ON_FIELD";

  // ---------------------------------------------------------------------------
  // Geolocation support
  // ---------------------------------------------------------------------------

  const hasGeolocation =
    typeof navigator !==
      "undefined" &&
    "geolocation" in navigator;

  // ---------------------------------------------------------------------------
  // Location helper
  // ---------------------------------------------------------------------------

  async function getLocationPayload(): Promise<LocationPayload> {
    const currentLocation =
      await getCurrentLocation();

    return {
      latitude:
        currentLocation.latitude,

      longitude:
        currentLocation.longitude,

      accuracyMeters:
        currentLocation.accuracy,
    };
  }

  // ---------------------------------------------------------------------------
  // Check In
  // ---------------------------------------------------------------------------

  async function handleCheckIn() {
    setLocationError(null);

    /**
     * Remote employees do not need
     * location information.
     */
    if (!isOnField) {
      console.log(
        "Check-in payload:",
        undefined,
      );

      checkIn.mutate(undefined);

      return;
    }

    /**
     * ON_FIELD employees must provide
     * their current location.
     */
    try {
      setRequestingLocation(true);

      const payload =
        await getLocationPayload();

      console.log(
        "Check-in payload:",
        payload,
      );

      checkIn.mutate(payload);
    } catch (error) {
      console.error(
        "Unable to get check-in location:",
        error,
      );

      setLocationError(
        "Unable to get your location. Please allow location access and try again.",
      );
    } finally {
      setRequestingLocation(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Check Out
  // ---------------------------------------------------------------------------

  async function handleCheckOut() {
    setLocationError(null);

    /**
     * Remote attendance does not
     * require GPS coordinates.
     */
    if (!isOnField) {
      console.log(
        "Check-out payload:",
        undefined,
      );

      checkOut.mutate(undefined);

      return;
    }

    /**
     * Request a NEW location when checking out.
     *
     * Do not reuse check-in coordinates because
     * the employee may have moved.
     */
    try {
      setRequestingLocation(true);

      const payload =
        await getLocationPayload();

      console.log(
        "Check-out payload:",
        payload,
      );

      checkOut.mutate(payload);
    } catch (error) {
      console.error(
        "Unable to get check-out location:",
        error,
      );

      setLocationError(
        "Unable to get your location. Please allow location access and try again.",
      );
    } finally {
      setRequestingLocation(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (
    isLoadingAttendance ||
    isLoadingProfile
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />

            Time & Attendance
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />

          Time & Attendance
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Attendance information */}

        {attendance ? (
          <>
            {/* Status */}

            <div className="flex flex-wrap items-center gap-3">
              {attendance.status ===
              "COMPLETED" ? (
                <Badge
                  variant="default"
                  className="gap-1 p-1"
                >
                  <Timer className="size-3" />

                  Checked Out
                </Badge>
              ) : attendance.status ===
                "OPEN" ? (
                <Badge
                  variant="secondary"
                  className="gap-1 p-1"
                >
                  <Navigation className="size-3" />

                  Checked In
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="gap-1 p-1"
                >
                  <Timer className="size-3" />

                  Missing Checkout
                </Badge>
              )}

              {attendance.isLate && (
                <Badge
                  variant="destructive"
                  className="p-1"
                >
                  Late{" "}
                  {
                    attendance.lateMinutes
                  }
                  min
                </Badge>
              )}

              {isOnField && (
                <Badge
                  variant="outline"
                  className="gap-1 p-1"
                >
                  <MapPin className="size-3" />

                  On Field
                </Badge>
              )}

              {workMode ===
                "REMOTE" && (
                <Badge
                  variant="outline"
                  className="p-1"
                >
                  Remote
                </Badge>
              )}
            </div>

            {/* Metrics */}

            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Check In */}

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-muted-foreground">
                  Check In
                </p>

                <p className="font-semibold">
                  {formatTime(
                    attendance.checkInAt,
                  )}
                </p>
              </div>

              {/* Check Out */}

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-muted-foreground">
                  Check Out
                </p>

                <p className="font-semibold">
                  {formatTime(
                    attendance.checkOutAt,
                  )}
                </p>
              </div>

              {/* Total Hours */}

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-muted-foreground">
                  Total Hours
                </p>

                <p className="font-semibold">
                  {formatMinutes(
                    attendance.totalMinutes,
                  )}
                </p>
              </div>

              {/* Overtime */}

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-muted-foreground">
                  Overtime
                </p>

                <p className="font-semibold">
                  {formatMinutes(
                    attendance.overtimeMinutes,
                  )}
                </p>
              </div>
            </div>

            {/* Check-in location information */}

            {isOnField &&
              attendance.checkInDistanceMeters !==
                null && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900/50 dark:bg-blue-950/20">
                  <p className="flex flex-wrap items-center gap-2 text-blue-700 dark:text-blue-300">
                    <MapPin className="size-4" />

                    Check-in distance:

                    <span className="font-semibold">
                      {Math.round(
                        attendance.checkInDistanceMeters,
                      )}
                      m
                    </span>

                    {attendance.checkInAccuracyMeters !==
                      null &&
                      ` (±${Math.round(
                        attendance.checkInAccuracyMeters,
                      )}m)`}
                  </p>
                </div>
              )}

            {/* Check-out location information */}

            {isOnField &&
              attendance.checkOutDistanceMeters !==
                null && (
                <div className="rounded-lg border p-3 text-sm">
                  <p className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />

                    Check-out distance:

                    <span className="font-semibold text-foreground">
                      {Math.round(
                        attendance.checkOutDistanceMeters,
                      )}
                      m
                    </span>

                    {attendance.checkOutAccuracyMeters !==
                      null &&
                      ` (±${Math.round(
                        attendance.checkOutAccuracyMeters,
                      )}m)`}
                  </p>
                </div>
              )}
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              No attendance record for
              today.
            </p>

            {/* Show current work mode before check-in */}

            {isOnField && (
              <Badge
                variant="outline"
                className="gap-1"
              >
                <MapPin className="size-3" />

                On Field
              </Badge>
            )}

            {workMode ===
              "REMOTE" && (
              <Badge variant="outline">
                Remote
              </Badge>
            )}
          </div>
        )}

        {/* Browser does not support location */}

        {isOnField &&
          !hasGeolocation && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
              Geolocation is not
              supported by your browser.
              Location is required for
              on-field attendance.
            </div>
          )}

        {/* Requesting location */}

        {isOnField &&
          requestingLocation && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3 animate-pulse" />

              Requesting your current
              location...
            </div>
          )}

        {/* Location error */}

        {locationError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {locationError}
          </div>
        )}

        {/* Actions */}

        {!isCheckedOut && (
          <div className="flex gap-3">
            {/* Check In */}

            <Button
              onClick={
                handleCheckIn
              }
              disabled={
                isCheckedIn ||
                checkIn.isPending ||
                requestingLocation ||
                (isOnField &&
                  !hasGeolocation)
              }
              className="flex-1"
            >
              {requestingLocation &&
              !isCheckedIn
                ? "Getting Location..."
                : checkIn.isPending
                  ? "Checking In..."
                  : isCheckedIn
                    ? "Already Checked In"
                    : "Check In"}
            </Button>

            {/* Check Out */}

            <Button
              onClick={
                handleCheckOut
              }
              disabled={
                !isCheckedIn ||
                checkOut.isPending ||
                requestingLocation ||
                (isOnField &&
                  !hasGeolocation)
              }
              variant="outline"
              className="flex-1"
            >
              {requestingLocation &&
              isCheckedIn
                ? "Getting Location..."
                : checkOut.isPending
                  ? "Checking Out..."
                  : "Check Out"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};