import React from "react";

interface TaskTagsProps {
  tags: string[];
}

const TaskTags: React.FC<TaskTagsProps> = ({ tags }) => {
  return (
    <div className="border-b border-gray-200 pb-6">
      <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
        Labels
      </p>
      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No labels</p>
      )}
    </div>
  );
};

export default TaskTags;
