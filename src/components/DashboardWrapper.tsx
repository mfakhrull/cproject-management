"use client";

import React, { useEffect } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StoreProvider, { useAppSelector } from "@/app/redux/redux";
import { TaskProvider } from "@/context/TaskContext";
import { Toaster } from "sonner"; // Import the Toaster component

interface DashboardWrapperProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardWrapperProps> = ({ children }) => {
    // Access the state to determine if the sidebar is collapsed
    const isSidebarCollapsed = useAppSelector(
      (state) => state.global.isSidebarCollapsed
    );

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={`flex w-full flex-col transition-all duration-300 ease-in-out bg-gray-50 dark:bg-dark-bg ${
          isSidebarCollapsed ? "" : "md:pl-64"
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children }) => {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <SignedIn>
            <StoreProvider>
            <TaskProvider>
              <DashboardLayout>{children}</DashboardLayout>
              <Toaster position="bottom-right" />
              </TaskProvider>
            </StoreProvider>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
};

export default DashboardWrapper;
