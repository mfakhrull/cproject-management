// src/context/UserPermissionsContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface UserPermissionsContextType {
  permissions: string[]; // List of permission keys
  loading: boolean;
}

const UserPermissionsContext = createContext<UserPermissionsContextType | undefined>(undefined);

export const UserPermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/getPermissions`);
        if (!response.ok) throw new Error("Failed to fetch permissions");

        const data = await response.json();
        setPermissions(data.permissions || []);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  return (
    <UserPermissionsContext.Provider value={{ permissions, loading }}>
      {children}
    </UserPermissionsContext.Provider>
  );
};

export const useUserPermissions = () => {
  const context = useContext(UserPermissionsContext);
  if (!context) {
    throw new Error("useUserPermissions must be used within a UserPermissionsProvider");
  }
  return context;
};
