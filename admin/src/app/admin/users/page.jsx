"use client";

import { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { FormSelect } from "@/components/forms/FormFields";
import { useUsers, useUpdateUserRole } from "@/hooks/useResource";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useUsers();
  const updateRole = useUpdateUserRole();

  const users = (data?.data || []).filter(
    (u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId, role) => {
    updateRole.mutate({ id: userId, role });
  };

  const columns = [
    { key: "username", label: "Username", render: (row) => row.username || "—" },
    { key: "email", label: "Email" },
    {
      key: "provider",
      label: "Provider",
      render: (row) => (
        <StatusBadge variant={row.provider === "google" ? "info" : row.provider === "facebook" ? "purple" : "default"}>
          {row.provider}
        </StatusBadge>
      ),
    },
    { key: "points", label: "Points", render: (row) => row.points ?? 0 },
    { key: "streak", label: "Streak", render: (row) => row.streak ?? 0 },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
          className="input-base py-1 px-2 w-24"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    { key: "createdAt", label: "Joined", render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage="No users found"
      />
    </div>
  );
}
