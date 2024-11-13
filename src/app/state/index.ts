// src/app/state/index.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of the global state
export interface InitialStateTypes {
  isSidebarCollapsed: boolean; // State to determine if the sidebar is collapsed
  isDarkMode: boolean; // State to determine if dark mode is enabled
}

// Initial state values
const initialState: InitialStateTypes = {
  isSidebarCollapsed: false, // Sidebar is expanded by default
  isDarkMode: false, // Dark mode is disabled by default
};

// Create a Redux slice to manage global state
export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    // Action to toggle the sidebar collapsed state
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    // Action to toggle dark mode
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
  },
});

// Export actions to be used in components to update the state
export const { setIsSidebarCollapsed, setIsDarkMode } = globalSlice.actions;
// Export the reducer to be used in the Redux store
export default globalSlice.reducer;
