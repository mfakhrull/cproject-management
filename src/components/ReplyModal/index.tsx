"use client";

import React, { useState, useEffect } from "react";
import { CornerDownLeft, X } from "lucide-react";

interface ReplyModalProps {
  parentComment: {
    _id: string;
    text: string;
    user: {
      name: string;
      avatar?: string;
    };
    timestamp: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (replyText: string, parentCommentId: string) => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  parentComment,
  isOpen,
  onClose,
  onSendReply,
}) => {
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");

  // Fetch replies for the parent comment
  const fetchReplies = async () => {
    try {
      const response = await fetch(
        `/api/tasks/activityLog/replies?parentCommentId=${parentComment._id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch replies");
      }
      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  // Fetch replies whenever the modal opens or parentComment changes
  useEffect(() => {
    if (isOpen) {
      fetchReplies();
    }
  }, [isOpen, parentComment]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    await onSendReply(replyText.trim(), parentComment._id);
    setReplyText(""); // Reset input field
    fetchReplies(); // Refresh replies after sending
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium">Thread</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Parent Comment */}
        <div className="p-6">
          <div className="flex items-start gap-3">
            <img
              src={parentComment.user.avatar || "https://via.placeholder.com/40"}
              alt={parentComment.user.name}
              className="h-8 w-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">{parentComment.user.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(parentComment.timestamp).toLocaleString()}
              </p>
              <p className="mt-2 text-sm">{parentComment.text}</p>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="max-h-64 overflow-y-auto border-t border-gray-200 px-6 py-4">
          {replies.length > 0 ? (
            replies.map((reply) => (
              <div key={reply._id} className="mb-4">
                <div className="flex items-start gap-3">
                  <img
                    src={reply.user.avatar || "https://via.placeholder.com/40"}
                    alt={reply.user.name}
                    className="h-6 w-6 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{reply.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(reply.timestamp).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm">{reply.text}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No replies yet.</p>
          )}
        </div>

        {/* Reply Input */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              className="flex-grow rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendReply();
                }
              }}
            />
            <button
              className="rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
              onClick={handleSendReply}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
