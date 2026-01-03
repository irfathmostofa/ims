"use client";

import { useEffect, useState } from "react";
import { Pen, Plus, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCrud } from "@/hook/crudHelper";
import { toast } from "sonner";
import { formatDate } from "@/components/utils/formatter";

type AccountingPeriod = {
  id?: number;
  start_date: string;
  end_date: string;
  is_closed: boolean;
};

export default function AccountingPeriodPage() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [form, setForm] = useState<Partial<AccountingPeriod>>({
    is_closed: false, // Default to open/false
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);

  const { fetchAll, save, remove } = useCrud<AccountingPeriod>({
    listUrl: `${import.meta.env.VITE_SERVER}/accounts/accounting-periods`,
    createUrl: `${import.meta.env.VITE_SERVER}/accounts/accounting-period`,
    updateUrl: `${
      import.meta.env.VITE_SERVER
    }/accounts/update-accounting-period`,
    deleteUrl: `${
      import.meta.env.VITE_SERVER
    }/accounts/delete-accounting-period`,
    formatCreate: (data) => ({
      start_date: data.start_date,
      end_date: data.end_date,
      is_closed: data.is_closed || false,
    }),
    formatUpdate: (data) => ({
      start_date: data.start_date,
      end_date: data.end_date,
      is_closed: data.is_closed,
    }),
  });

  // Fetch accounting periods
  useEffect(() => {
    fetchAll(setPeriods, setLoading);
  }, [update]);

  // Function to format date for input field
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Save (Create / Update)
  const handleSave = async () => {
    if (!form.start_date) {
      toast.error("Start date is required");
      return;
    }

    if (!form.end_date) {
      toast.error("End date is required");
      return;
    }

    // Validate dates
    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    // is_closed is a boolean, so we don't need to check if it's provided
    // It will default to false if undefined

    if (!confirm(`Are you sure?`)) return;

    await save(form, form.id);
    setForm({ is_closed: false }); // Reset with default
    setOpen(false);
    setUpdate(update + 1);
  };

  // Edit period
  const handleEdit = (period: AccountingPeriod) => {
    setForm({
      ...period,
      start_date: formatDateForInput(period.start_date),
      end_date: formatDateForInput(period.end_date),
      is_closed: period.is_closed,
    });
    setOpen(true);
  };

  // Delete period
  const handleDelete = async (period: AccountingPeriod) => {
    const periodName = `${formatDate(period.start_date)} to ${formatDate(
      period.end_date
    )}`;
    if (
      !confirm(
        `Delete Accounting Period "${periodName}"? This action cannot be undone.`
      )
    )
      return;
    await remove(period.id!);
    setUpdate((prev) => prev + 1);
  };

  // Calculate period duration in days
  const getPeriodDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  // Get status display
  const getStatusDisplay = (isClosed: boolean) => {
    return isClosed ? "Closed" : "Open";
  };

  // Get status badge style
  const getStatusStyle = (isClosed: boolean) => {
    return isClosed
      ? "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
      : "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Accounting Periods</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your financial accounting periods for reporting
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Period
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Accounting Period" : "Add Accounting Period"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="border px-3 py-2 rounded w-full"
                    value={form.start_date || ""}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    className="border px-3 py-2 rounded w-full"
                    value={form.end_date || ""}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {form.start_date && form.end_date && (
                <div className="text-xs text-blue-600 p-2 bg-blue-50 rounded">
                  Period Duration:{" "}
                  {getPeriodDuration(form.start_date, form.end_date)}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Status *
                </label>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={
                    form.is_closed === undefined
                      ? "false"
                      : form.is_closed.toString()
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_closed: e.target.value === "true",
                    })
                  }
                >
                  <option value="false">Open (Allows transactions)</option>
                  <option value="true">Closed (Finalized - no changes)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  • Open: Allows transactions and modifications
                  <br />• Closed: Period is finalized, no changes allowed
                </p>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full btn-bw-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : form.id
                    ? "Update Period"
                    : "Add Period"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={periods}
        label="Accounting Periods List"
        selectable
        loading={loading}
        rowsPerPage={20}
        showColumns={[
          {
            key: "start_date",
            label: "Start Date",
          },
          {
            key: "end_date",
            label: "End Date",
          },

          {
            key: "is_closed",
            label: "Status",
          },
        ]}
        columnFormats={{
          start_date: (val: string) => formatDate(val),
          end_date: (val: string) => formatDate(val),
          is_closed: (value: boolean) => (
            <span className={getStatusStyle(value)}>
              {getStatusDisplay(value)}
            </span>
          ),
        }}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: (row) => handleEdit(row as AccountingPeriod),
          },
          {
            label: <Trash size={16} />,
            onClick: (row) => handleDelete(row as AccountingPeriod),
          },
        ]}
      />
    </div>
  );
}
