// src/context/UserRoleContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface UserRoleContextType {
  role: string | null;
  loading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(
  undefined
);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userId } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/getRole?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user role");

        const data = await response.json();
        setRole(data.role); // Assuming the API returns { role: "admin" }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null); // Default to no role if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [userId]);

  return (
    <UserRoleContext.Provider value={{ role, loading }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
};
