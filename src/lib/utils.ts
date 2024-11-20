export const dataGridClassNames = `
  border border-gray-200 bg-white shadow 
  dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200
`;

export const dataGridSxStyles = (isDarkMode: boolean) => ({
  "& .MuiDataGrid-columnHeaders": {
    color: isDarkMode ? "#e5e7eb" : undefined,
    '& [role="row"] > *': {
      backgroundColor: isDarkMode ? "#1d1f21" : "white",
      borderColor: isDarkMode ? "#2d3135" : undefined,
    },
  },
  "& .MuiIconButton-root": {
    color: isDarkMode ? "#a3a3a3" : undefined,
  },
  "& .MuiTablePagination-root": {
    color: isDarkMode ? "#a3a3a3" : undefined,
  },
  "& .MuiTablePagination-selectIcon": {
    color: isDarkMode ? "#a3a3a3" : undefined,
  },
  "& .MuiDataGrid-cell": {
    border: "none",
  },
  "& .MuiDataGrid-row": {
    borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
  },
  "& .MuiDataGrid-withBorderColor": {
    borderColor: isDarkMode ? "#2d3135" : "#e5e7eb",
  },
});
