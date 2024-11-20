"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import React, { useEffect, useState } from "react";
import { debounce } from "lodash";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{
    tasks: any[];
    projects: any[];
    users: any[];
  }>({ tasks: [], projects: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = debounce(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.length < 3) {
      setResults({ tasks: [], projects: [], users: [] });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?query=${value}`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
      setResults({ tasks: [], projects: [], users: [] });
    } finally {
      setIsLoading(false);
    }
  }, 500);

  // Cleanup debounce effect
  useEffect(() => {
    return () => handleSearch.cancel();
  }, [handleSearch]);

  return (
    <div className="p-8">
      <Header name="Search" />
      <div>
        <input
          type="text"
          placeholder="Search..."
          className="w-1/2 rounded border p-3 shadow"
          onChange={handleSearch}
        />
      </div>

      <div className="p-5">
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!isLoading && !error && (
          <div>
            {/* Tasks Section */}
            {results.tasks.length > 0 && (
              <>
                <h2 className="text-lg font-semibold mt-4">Tasks</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.tasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))}
                </div>
              </>
            )}

            {/* Projects Section */}
            {results.projects.length > 0 && (
              <>
                <h2 className="text-lg font-semibold mt-4">Projects</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.projects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </>
            )}

            {/* Users Section */}
            {results.users.length > 0 && (
              <>
                <h2 className="text-lg font-semibold mt-4">Users</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.users.map((user) => (
                    <UserCard key={user._id} user={user} />
                  ))}
                </div>
              </>
            )}

            {/* No Results */}
            {results.tasks.length === 0 &&
              results.projects.length === 0 &&
              results.users.length === 0 && <p>No results found.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
