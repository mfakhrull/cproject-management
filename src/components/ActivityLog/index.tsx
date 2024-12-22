import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const ActivityLog = forwardRef(({ taskId }: { taskId: string }, ref) => {
  const [activities, setActivities] = useState<any[]>([]);

  // Fetch activities from the API
  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/tasks/activityLog?taskId=${taskId}`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // Log a new activity (e.g., comments or other actions)
  const logActivity = async (activity: any) => {
    try {
      const response = await fetch("/api/tasks/activityLog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });

      if (!response.ok) throw new Error("Failed to log activity");

      await fetchActivities(); // Refresh activities after logging
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  // Expose logActivity to the parent component
  useImperativeHandle(ref, () => ({
    logActivity,
    refresh: fetchActivities, // Allow parent to manually refresh activities
  }));

  // Initial fetch of activities when the component mounts
  useEffect(() => {
    fetchActivities();
  }, [taskId]);

  return (
    <div className="mt-10 flex h-full w-1/3 flex-col border-l border-gray-200 bg-gray-50">
      {/* Activity Header */}
      <div>
        <p className="mb-8 p-5 text-xs font-semibold uppercase text-gray-500 bg-white border-b border-gray-200">
          Activity
        </p>
      </div>

      {/* Activity List */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{activity.text}</p>
              <p className="text-xs text-gray-400">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No activity yet.</p>
        )}
      </div>

      {/* Comment Input */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-grow rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  logActivity({
                    taskId,
                    type: "comment",
                    text: input.value.trim(),
                    user: { name: "User", avatar: "https://via.placeholder.com/40" },
                    timestamp: new Date().toISOString(),
                  });
                  input.value = ""; // Clear the input field
                }
              }
            }}
          />
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => {
              const input = document.querySelector(
                "input[type='text']"
              ) as HTMLInputElement;
              if (input && input.value.trim()) {
                logActivity({
                  taskId,
                  type: "comment",
                  text: input.value.trim(),
                  user: { name: "User", avatar: "https://via.placeholder.com/40" },
                  timestamp: new Date().toISOString(),
                });
                input.value = ""; // Clear the input field
              }
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
});

export default ActivityLog;
