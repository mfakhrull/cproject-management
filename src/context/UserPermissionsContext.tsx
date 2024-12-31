"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface UserPermissionsContextType {
  permissions: string[]; // List of permission keys
  employeeId: string | null; // Employee ID of the user
  username: string | null; // Username of the user
  role: string | null; // Role of the user
  loading: boolean; // Loading state
}

const UserPermissionsContext = createContext<
  UserPermissionsContextType | undefined
>(undefined);

export const UserPermissionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { userId } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/getPermissions`, {
          method: "GET", // Explicitly set the method to GET
        });
        if (!response.ok) throw new Error("Failed to fetch permissions");

        const data = await response.json();
        setPermissions(data.permissions || []);
        setEmployeeId(data.employeeId || null);
        setUsername(data.username || null); // Update username from API response
        setRole(data.role || null); // Update role from API response
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setPermissions([]);
        setEmployeeId(null);
        setUsername(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  return (
    <UserPermissionsContext.Provider
      value={{
        permissions,
        employeeId,
        username,
        role,
        loading,
      }}
    >
      {children}
    </UserPermissionsContext.Provider>
  );
};

export const useUserPermissions = () => {
  const context = useContext(UserPermissionsContext);
  if (!context) {
    throw new Error(
      "useUserPermissions must be used within a UserPermissionsProvider"
    );
  }
  return context;
};
