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
import Image from "next/image";
import { useAppSelector } from "@/app/redux/redux";

// Define a type for user data returned from the backend
interface IUser {
  clerk_id: string;
  username: string;
  profilePictureUrl?: string;
  teamName?: string; // Updated to reflect populated team name
}

// Custom toolbar for DataGrid
const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

// Define column definitions for the DataGrid
const columns: GridColDef<IUser>[] = [
  { field: "clerk_id", headerName: "Clerk ID", width: 150 },
  { field: "username", headerName: "Username", width: 150 },
  {
    field: "profilePictureUrl",
    headerName: "Profile Picture",
    width: 100,
    renderCell: (params) => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-9 w-9">
          <Image
            src={params.value || "/placeholder-profile.png"}
            alt={params.row.username}
            width={100}
            height={50}
            className="h-full rounded-full object-cover"
          />
        </div>
      </div>
    ),
  },
  { field: "teamName", headerName: "Team", width: 200 }, // Updated column to display the team name
];

const Users = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Pagination, sorting, and data states
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "username", sort: "asc" },
  ]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { page, pageSize } = paginationModel;
        const sortField = sortModel[0]?.field || "username";
        const sortOrder = sortModel[0]?.sort || "asc";

        // Fetch users from the new API endpoint
        const response = await fetch(
          `/api/users/getUsersWithTeams?page=${page + 1}&limit=${pageSize}&sort=${sortField}&order=${sortOrder}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users.");
        }

        const { users: fetchedUsers = [], totalUsers = 0 } = await response.json();

        setUsers(fetchedUsers);
        setTotalUsers(totalUsers);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [paginationModel, sortModel]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Users" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.clerk_id}
          paginationMode="server"
          rowCount={totalUsers}
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

export default Users;
