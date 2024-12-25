"use client";

import React, { useState, useRef, useEffect } from "react";
import { PlayCircle, StopCircle, RotateCcw, Clock } from "lucide-react";
import { toast } from "sonner";
import FloatingTooltip from "@/components/FloatingTooltip"; // Import your tooltip component
import { useUserPermissions } from "@/context/UserPermissionsContext"; // Import the permissions hook

const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const TimeTracker: React.FC<{ taskId: string; activityLogRef: any }> = ({
  taskId,
  activityLogRef,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackedTime, setTrackedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const { permissions } = useUserPermissions(); // Get user permissions

  // Load saved state from localStorage
  useEffect(() => {
    const savedTrackingState = localStorage.getItem(`timeTracker-${taskId}`);
    if (savedTrackingState) {
      const {
        isTracking: savedIsTracking,
        startTime: savedStartTime,
        trackedTime: savedTrackedTime,
      } = JSON.parse(savedTrackingState);

      setTrackedTime(savedTrackedTime);
      setStartTime(savedIsTracking ? savedStartTime : null);
      setIsTracking(savedIsTracking);

      if (savedIsTracking && savedStartTime) {
        const elapsedTime = Math.floor((Date.now() - savedStartTime) / 1000);
        setTrackedTime(savedTrackedTime + elapsedTime);
      }
    }
  }, [taskId]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(
      `timeTracker-${taskId}`,
      JSON.stringify({ isTracking, startTime, trackedTime }),
    );
  }, [isTracking, startTime, trackedTime, taskId]);

  const saveToDatabase = async (currentTime: number, action: string) => {
    try {
      await fetch(`/api/tasks/trackTime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, trackedTime: currentTime, action }),
      });

      toast.success(`Time ${action} saved to database.`);

      // Refresh ActivityLog after saving to the database
      if (
        activityLogRef &&
        typeof activityLogRef.current?.refresh === "function"
      ) {
        activityLogRef.current.refresh();
      }
    } catch (error) {
      console.error("Failed to save time tracker data:", error);
      toast.error("Failed to save time to database.");
    }
  };

  const startTracking = async () => {
    if (!isTracking) {
      const currentStartTime = Date.now();
      setIsTracking(true);
      setStartTime(currentStartTime);
      intervalRef.current = window.setInterval(() => {
        setTrackedTime((prev) => prev + 1);
      }, 1000);
      toast.success("Time tracking started.");

      // Log start activity to the database
      await saveToDatabase(trackedTime, "started");
    }
  };

  const stopTracking = async () => {
    if (isTracking) {
      setIsTracking(false);
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      await saveToDatabase(trackedTime, "stopped"); // Save to database on stop
      toast.success("Time tracking stopped.");
    }
  };

  const resetTime = async () => {
    setTrackedTime(0);
    setStartTime(null);
    localStorage.removeItem(`timeTracker-${taskId}`);
    await saveToDatabase(0, "reset"); // Save reset state to database
    toast.success("Time tracking reset.");
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const canStartTime =
    permissions.includes("can_start_time") ||
    permissions.includes("can_edit_task") ||
    permissions.includes("admin") ||
    permissions.includes("project_manager");

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Clock size={16} className="text-gray-600" />
      <div className="flex items-center gap-2">
        {!isTracking && trackedTime === 0 && (
          <>
            {!canStartTime ? (
              <FloatingTooltip message="Permission Required">
                <button
                  onClick={startTracking}
                  disabled
                  className="flex cursor-not-allowed items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-400"
                >
                  <PlayCircle size={16} />
                  Start
                </button>
              </FloatingTooltip>
            ) : (
              <button
                onClick={startTracking}
                className="flex items-center gap-2 rounded bg-purple-100 px-4 py-2 text-purple-600 hover:bg-purple-200"
              >
                <PlayCircle size={16} />
                Start
              </button>
            )}
          </>
        )}
        {(isTracking || trackedTime > 0) && (
          <>
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`flex items-center gap-2 rounded px-4 py-2 ${
                isTracking
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-purple-100 text-purple-600 hover:bg-purple-200"
              }`}
            >
              {isTracking ? <StopCircle size={16} /> : <PlayCircle size={16} />}
              {formatTime(trackedTime)}
            </button>
            {!isTracking && trackedTime > 0 && (
              <button
                onClick={resetTime}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;
