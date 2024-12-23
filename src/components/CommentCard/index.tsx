"use client";

import React from "react";
import { CornerDownLeft } from "lucide-react";

interface CommentCardProps {
  comment: {
    _id: string;
    text: string;
    user: {
      name: string;
      avatar?: string;
    };
    timestamp: string;
  };
  onReply: (parentCommentId: string) => void; // Callback to open reply modal
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, onReply }) => {
  return (
    <div className="mb-4 rounded bg-white p-6 pb-5 shadow-md">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <img
          src={comment.user.avatar || "https://via.placeholder.com/40"}
          alt={comment.user.name}
          className="h-8 w-8 rounded-full"
        />
        <div className="flex-grow">
          {/* Comment Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{comment.user.name}</p>
            <p className="text-xs text-gray-500">
              {new Date(comment.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Comment Text */}
          <p className="mt-2 text-sm">{comment.text}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-gray-200"></div>

      {/* Reply Button */}
      <div className="mt-3 flex justify-end">
        <button
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-slate-800"
          onClick={() => onReply(comment._id)}
        >
          <CornerDownLeft size={14} />
          Reply
        </button>
      </div>
    </div>
  );
};

export default CommentCard;
