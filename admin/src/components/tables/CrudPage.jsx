"use client";

import { useState, useCallback } from "react";
import DataTable from "@/components/tables/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Plus } from "lucide-react";

/**
 * Generic CRUD page component.
 *
 * @param {string} title - Page title
 * @param {object} hooks - { useList, useCreate, useUpdate, useRemove }
 * @param {object[]} columns - DataTable columns
 * @param {function} renderForm - (values, handleChange, setField) => JSX
 * @param {object} defaultValues - Initial form values for create
 * @param {function} toFormValues - (row) => form values for edit
 * @param {object} listParams - Params to pass to useList
 * @param {function} transformSubmit - (values) => data to send to API
 * @param {string} modalSize - Modal size
 */
export default function CrudPage({
  title,
  hooks,
  columns,
  renderForm,
  defaultValues = {},
  toFormValues,
  listParams,
  transformSubmit,
  modalSize = "md",
  renderFilters,
  filterFn,
}) {
  const { data, isLoading, error, refetch } = hooks.useList(listParams);
  const createMutation = hooks.useCreate();
  const updateMutation = hooks.useUpdate();
  const removeMutation = hooks.useRemove();

  const [modal, setModal] = useState({ open: false, mode: "create", item: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [formValues, setFormValues] = useState(defaultValues);
  const [filters, setFilters] = useState({});

  const openCreate = () => {
    setFormValues({ ...defaultValues });
    setModal({ open: true, mode: "create", item: null });
  };

  const openEdit = (row) => {
    setFormValues(toFormValues ? toFormValues(row) : { ...row });
    setModal({ open: true, mode: "edit", item: row });
  };

  const closeModal = () => setModal({ open: false, mode: "create", item: null });

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  }, []);

  const setField = useCallback((name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = transformSubmit ? transformSubmit(formValues) : formValues;
    try {
      if (modal.mode === "create") {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({ id: modal.item._id, data: payload });
      }
      closeModal();
    } catch {
      // Error is handled by the mutation hook via toast
    }
  };

  const handleDelete = async () => {
    try {
      await removeMutation.mutateAsync(confirm.id);
      setConfirm({ open: false, id: null });
    } catch {
      // handled by hook
    }
  };

  // Add action column with edit/delete
  const allColumns = [
    ...columns,
    {
      key: "_actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="btn-ghost btn-sm text-primary">
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, id: row._id }); }}
            className="btn-ghost btn-sm text-danger"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  let items = data?.data || [];
  if (filterFn && filters) {
    items = items.filter((item) => filterFn(item, filters));
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add New
        </button>
      </div>

      {renderFilters && (
        <div className="mb-4 flex flex-wrap gap-3">
          {renderFilters(filters, setFilters)}
        </div>
      )}

      <DataTable
        columns={allColumns}
        data={items}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        pagination={
          data?.pagination
            ? {
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
                onPageChange: () => {}, // handled by listParams if needed
              }
            : undefined
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.mode === "create" ? `Add ${title.replace(/s$/, "")}` : `Edit ${title.replace(/s$/, "")}`}
        size={modalSize}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm(formValues, handleChange, setField)}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={closeModal} className="btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={isMutating} className="btn-primary btn-sm">
              {isMutating ? "Saving..." : modal.mode === "create" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={removeMutation.isPending}
      />
    </div>
  );
}
