"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { SendHorizontal } from "lucide-react";
import CommentCard from "@/components/CommentCard";
import ReplyModal from "@/components/ReplyModal";
import { useAuth } from "@clerk/nextjs";

const ActivityLog = forwardRef(
  ({ taskId, isOpen }: { taskId: string; isOpen: boolean }, ref) => {
    const [activities, setActivities] = useState<any[]>([]);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState<any | null>(null);
    const [commentText, setCommentText] = useState<string>("");
    const [userName, setUserName] = useState<string>(""); // Store user's name
    const { userId: clerkId } = useAuth(); // Get Clerk user ID

    const [hasFetchedActivities, setHasFetchedActivities] = useState(false);

    // Fetch activities from the API
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/tasks/activityLog?taskId=${taskId}`);
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(data);
        setHasFetchedActivities(true); // Indicate that activities have been fetched
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    // Fetch user details
    const fetchUserName = async () => {
      if (!clerkId) return; // Ensure `clerkId` is available
      try {
        const response = await fetch(`/api/users/getUser?clerk_id=${clerkId}`);
        if (!response.ok) throw new Error("Failed to fetch user details");
        const user = await response.json();
        setUserName(user.username || "Unknown User");
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    // Log a new activity (e.g., comments or replies)
    const logActivity = async (activity: any) => {
      try {
        const response = await fetch("/api/tasks/activityLog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activity),
        });

        if (!response.ok) throw new Error("Failed to log activity");

        // Optimized: Add new activity to the list without re-fetching
        const newActivity = await response.json();
        setActivities((prev) => [newActivity, ...prev]);
      } catch (error) {
        console.error("Error logging activity:", error);
      }
    };

    // Expose logActivity and refresh methods to the parent component
    useImperativeHandle(ref, () => ({
      logActivity,
      refresh: fetchActivities, // Allow parent to manually refresh activities
    }));

    // Fetch activities only once on mount
    useEffect(() => {
      if (!hasFetchedActivities) {
        fetchActivities();
      }
      fetchUserName();
    }, [taskId, clerkId, hasFetchedActivities]);

    const handleReply = (parentCommentId: string) => {
      const parentComment = activities.find(
        (activity) => activity._id === parentCommentId,
      );
      const replies = activities.filter(
        (activity) => activity.parentCommentId === parentCommentId,
      );

      setSelectedComment({ ...parentComment, replies });
      setReplyModalOpen(true);
    };

    const handleSendReply = (replyText: string, parentCommentId: string) => {
      logActivity({
        taskId,
        type: "comment",
        text: replyText,
        parentCommentId,
        user: {
          userId: clerkId,
          name: userName,
        },
      });

      setReplyModalOpen(false);
    };

    const handleSendComment = () => {
      if (!commentText.trim()) return;

      logActivity({
        taskId,
        type: "comment",
        text: commentText.trim(),
        user: {
          userId: clerkId,
          name: userName,
        },
      });

      setCommentText(""); // Clear input field
    };

    return (
      <div
        className={`transition-all duration-300 ease-in-out mt-1 ${
          isOpen ? "w-full" : "w-14"
        } flex flex-col border-l border-gray-200 bg-gray-50`}
      >
        {/* Activity Header */}
        <div>
          <p className="mb-8 border-b border-gray-200 bg-white px-6 pb-9 pt-10 text-sm font-semibold uppercase text-gray-500">
            Activity
          </p>
        </div>
        {/* Activity List */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6">
          {activities.length > 0 ? (
            activities.map((activity) =>
              activity.type === "comment" ? (
                <CommentCard
                  key={activity._id}
                  comment={activity}
                  onReply={handleReply}
                />
              ) : (
                <div
                  key={activity._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {activity.text}
                    </span>
                  </div>
                </div>
              ),
            )
          ) : (
            <p className="text-sm text-gray-400">No activity yet.</p>
          )}
        </div>
        {/* Comment Input */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              placeholder="Write a comment..."
              className="flex-grow rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendComment();
                }
              }}
            />

            <SendHorizontal
              size={30}
              className="cursor-pointer text-gray-500 hover:text-blue-600"
              onClick={handleSendComment}
            />
          </div>
        </div>
        {/* Reply Modal */}
        {replyModalOpen && selectedComment && (
          <ReplyModal
            isOpen={replyModalOpen}
            parentComment={selectedComment}
            onClose={() => setReplyModalOpen(false)}
            onSendReply={handleSendReply}
          />
        )}
      </div>
    );
  },
);

export default ActivityLog;
