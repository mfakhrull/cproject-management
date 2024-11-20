"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridSortModel,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { useAppSelector } from "@/app/redux/redux";

// Define a type for team data
interface ITeam {
  _id: string;
  teamName: string;
  productOwnerUsername: string;
  projectManagerUsername: string;
}

// Custom toolbar for DataGrid
const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

// Define column definitions for the DataGrid
const columns: GridColDef<ITeam>[] = [
  { field: "_id", headerName: "Team ID", width: 100 },
  { field: "teamName", headerName: "Team Name", width: 200 },
  { field: "productOwnerUsername", headerName: "Product Owner", width: 200 },
  { field: "projectManagerUsername", headerName: "Project Manager", width: 200 },
];

const Teams = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Pagination, sorting, and data states
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "teamName", sort: "asc" },
  ]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { page, pageSize } = paginationModel;
        const sortField = sortModel[0]?.field || "teamName";
        const sortOrder = sortModel[0]?.sort || "asc";

        const response = await fetch(
          `/api/teams/getTeams?page=${page + 1}&limit=${pageSize}&sort=${sortField}&order=${sortOrder}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch teams.");
        }

        const { teams: fetchedTeams = [], totalTeams = 0 } = await response.json();

        setTeams(fetchedTeams);
        setTotalTeams(totalTeams);
      } catch (err: any) {
        console.error("Error fetching teams:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [paginationModel, sortModel]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Teams" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={teams}
          columns={columns}
          getRowId={(row) => row._id}
          paginationMode="server"
          rowCount={totalTeams}
          paginationModel={paginationModel}
          onPaginationModelChange={(newPaginationModel) =>
            setPaginationModel(newPaginationModel)
          }
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
          slots={{
            toolbar: CustomToolbar,
          }}
          className="rounded-md bg-white dark:bg-dark-secondary dark:text-white"
          sx={{
            "& .MuiDataGrid-root": {
              borderColor: isDarkMode ? "#444" : "#ddd",
            },
            "& .MuiDataGrid-cell": {
              color: isDarkMode ? "#fff" : "#000",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
              color: isDarkMode ? "#fff" : "#000",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Teams;
