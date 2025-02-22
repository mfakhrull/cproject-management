"use client";

import React from "react";
import { Menu, Moon, Search, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useAppDispatch, useAppSelector } from "@/app/redux/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/app/state";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  
    // Use Clerk's useUser hook to access user details
    const { user } = useUser();

  return (
    <div className="flex w-[100%] items-center justify-between bg-white px-4 py-3 shadow-md dark:bg-black">
      {/* Search Bar */}
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <Menu className="h-8 w-8 dark:text-white" />
          </button>
        )}
        {/* Search Input */}
        <div className="relative flex h-min w-[200px]">
          <Search className="absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" />
          <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Icons and User Profile */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          disabled
          className={
            isDarkMode
              ? "rounded p-2 dark:hover:bg-gray-700"
              : "rounded p-2 hover:bg-gray-100"
          }
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 cursor-pointer dark:text-white" />
          ) : (
            <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
          )}
        </button>

        {/* Settings Link */}
        <Link
          href=""
          className={
            isDarkMode
              ? "h-min w-min rounded p-2 dark:hover:bg-gray-700"
              : "h-min w-min rounded p-2 hover:bg-gray-100"
          }
        >
          <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>

        {/* Divider Line */}
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>

        {/* User Profile and Authentication Buttons */}
        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <div className="flex items-center">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9",
                },
              }}
            />
            {/* Display username if available */}
            {user?.username || user?.firstName? (
              <span className="ml-3 text-gray-800 dark:text-white">
                {user.username || user.firstName}
              </span>
            ) : null}
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Navbar;
