"use client";

import { Fragment, useEffect, useState } from "react";
import { Plus, Search, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { formatDate, formatCurrency } from "@/components/utils/formatter";
import { apiClient } from "@/hook/apiClient";

type JournalLine = {
  id?: number;
  account_id: number;
  account_name?: string;
  account_code?: string;
  debit_amount: number;
  credit_amount: number;
};

type JournalEntry = {
  id?: number;
  code: string;
  entry_date: string;
  narration: string;
  total_debit: number;
  total_credit: number;
  lines: JournalLine[];
  created_at?: string;
};

type Account = {
  id: number;
  name: string;
  code: string;
};

type AccountingPeriod = {
  id: number;
  start_date: string;
  end_date: string;
  is_closed: boolean;
};

type FilterType = {
  branch_id?: number;
  period_id?: number;
  date_from?: string;
  date_to?: string;
  page: number;
  limit: number;
};

export default function ManualJournalPage() {
  const { user } = useAuthStore();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    limit: 20,
  });

  const [form, setForm] = useState({
    period_id: undefined as number | undefined,
    entry_date: new Date().toISOString().split("T")[0],
    narration: "",
    lines: [] as Array<{
      account_id: number;
      debit_amount: number;
      credit_amount: number;
    }>,
  });

  useEffect(() => {
    fetchAccounts();
    fetchPeriods();
    fetchJournals();
  }, [filters.page]);

  const fetchAccounts = async () => {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/accounts/get-accounts`,
        { method: "GET", tokenType: "jwt" }
      );
      if (response.success) setAccounts(response.data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/accounts/accounting-periods`,
        { method: "GET", tokenType: "jwt" }
      );
      if (response.success) {
        setPeriods(response.data || []);
        const openPeriod = response.data?.find(
          (p: AccountingPeriod) => !p.is_closed
        );
        if (openPeriod)
          setForm((prev) => ({ ...prev, period_id: openPeriod.id }));
      }
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const fetchJournals = async () => {
    setSearchLoading(true);
    try {
      const payload = { branch_id: user?.branch.id, ...filters };
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/accounts/get-journal-entries`,
        { method: "POST", tokenType: "jwt", data: payload }
      );

      if (response.success) {
        const journalData = response.data;
        setJournals(journalData.data || []);
        setPagination(journalData.pagination);
      }
    } catch (error: any) {
      console.error("Error fetching journals:", error);
      toast.error(error.message || "Failed to fetch journal entries");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        { account_id: 0, debit_amount: 0, credit_amount: 0 },
      ],
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], [field]: value };

      if (field === "debit_amount" && value > 0) lines[index].credit_amount = 0;
      else if (field === "credit_amount" && value > 0)
        lines[index].debit_amount = 0;

      return { ...prev, lines };
    });
  };

  const handleRemoveLine = (index: number) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    if (!form.lines.length) return { totalDebit: 0, totalCredit: 0 };
    const totalDebit = form.lines.reduce(
      (sum, line) => sum + (line.debit_amount || 0),
      0
    );
    const totalCredit = form.lines.reduce(
      (sum, line) => sum + (line.credit_amount || 0),
      0
    );
    return { totalDebit, totalCredit };
  };

  const handleSaveJournal = async () => {
    const { totalDebit, totalCredit } = calculateTotals();

    if (!form.period_id) {
      toast.error("Please select accounting period");
      return;
    }
    if (!form.entry_date) {
      toast.error("Please select entry date");
      return;
    }
    if (form.lines.length < 2) {
      toast.error("At least 2 line items are required");
      return;
    }
    for (const line of form.lines) {
      if (!line.account_id || line.account_id === 0) {
        toast.error("Please select account for all lines");
        return;
      }
      if (line.debit_amount === 0 && line.credit_amount === 0) {
        toast.error("Please enter amount for all lines");
        return;
      }
    }
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error(`Debit must equal Credit`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        branch_id: user?.branch.id,
        period_id: form.period_id,
        entry_date: form.entry_date,
        narration: form.narration || "",
        lines: form.lines.map((line) => ({
          account_id: line.account_id,
          debit: line.debit_amount || 0,
          credit: line.credit_amount || 0,
        })),
      };

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/accounts/menual-journal-entry`,
        { method: "POST", tokenType: "jwt", data: payload }
      );

      if (response.success) {
        toast.success("Journal entry saved");
        setOpenDialog(false);
        resetForm();
        fetchJournals();
      } else {
        toast.error(response.message || "Failed to save journal entry");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save journal entry");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      period_id: periods.find((p) => !p.is_closed)?.id,
      entry_date: new Date().toISOString().split("T")[0],
      narration: "",
      lines: [],
    });
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const grandTotals = journals.reduce(
    (acc, j) => {
      acc.totalDebit += Number(j.total_debit);
      acc.totalCredit += Number(j.total_credit);
      return acc;
    },
    { totalDebit: 0, totalCredit: 0 }
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Journal Entries</h1>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
          className="gap-2 btn-bw-primary"
        >
          <Plus size={18} /> New Entry
        </Button>
      </div>
      {/* Filters */}
      <div className="bg-white p-4 border rounded mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">Period</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={filters.period_id || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  period_id: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                  page: 1,
                }))
              }
            >
              <option value="">All Periods</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {formatDate(period.start_date)} -{" "}
                  {formatDate(period.end_date)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">From</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={filters.date_from || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  date_from: e.target.value || undefined,
                  page: 1,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">To</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={filters.date_to || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  date_to: e.target.value || undefined,
                  page: 1,
                }))
              }
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={fetchJournals}
              disabled={searchLoading}
              className="flex-1"
            >
              <Search size={16} className="mr-2" />
              Search
            </Button>
            <Button
              onClick={() => setFilters({ page: 1, limit: 20 })}
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
      {/* Journal Ledger Table - Traditional Double Entry Format */}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          {/* ================= HEADER ================= */}
          <thead>
            <tr className="bg-gray-200 border-b">
              <th className="p-2 w-28 text-left border">Date</th>
              <th className="p-2 w-32 text-left border">Voucher No</th>
              <th className="p-2 w-48 text-left border">Narration</th>
              <th className="p-2 text-left border">Particulars</th>
              <th className="p-2 w-32 text-right border">Debit</th>
              <th className="p-2 w-32 text-right border">Credit</th>
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody>
            {journals.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No journal entries found
                </td>
              </tr>
            ) : (
              journals.map((journal) => (
                <Fragment key={journal.id}>
                  {journal.lines.map((line, idx) => (
                    <tr key={line.id} className="border-b">
                      {/* Date */}
                      {idx === 0 && (
                        <td
                          rowSpan={journal.lines.length}
                          className="p-2 align-top font-medium border"
                        >
                          {formatDate(journal.entry_date)}
                        </td>
                      )}

                      {/* Voucher */}
                      {idx === 0 && (
                        <td
                          rowSpan={journal.lines.length}
                          className="p-2 align-top font-medium border"
                        >
                          {journal.code}
                        </td>
                      )}

                      {/* Narration */}
                      {idx === 0 && (
                        <td
                          rowSpan={journal.lines.length}
                          className="p-2 align-top text-gray-700 border"
                        >
                          {journal.narration}
                        </td>
                      )}

                      {/* Particulars */}
                      <td className="p-2 border">
                        {line.credit_amount > 0 ? (
                          <span className="">To {line.account_name}</span>
                        ) : (
                          line.account_name
                        )}
                      </td>

                      {/* Debit */}
                      <td className="p-2 text-right border">
                        {line?.debit_amount.toFixed(2)}
                      </td>

                      {/* Credit */}
                      <td className="p-2 text-right border">
                        {line?.credit_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))
            )}
          </tbody>

          {/* ================= FOOTER ================= */}
          <tfoot>
            <tr className=" bg-gray-200 font-bold">
              <td colSpan={4} className="p-3 text-right border">
                Grand Total
              </td>
              <td className="p-3 text-right  border">
                {formatCurrency(grandTotals.totalDebit)}
              </td>
              <td className="p-3 text-right  border">
                {formatCurrency(grandTotals.totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} •{" "}
            {pagination.total} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(pagination.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {/* New Journal Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl bg-amber-50">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Period *</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={form.period_id || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      period_id: Number(e.target.value),
                    }))
                  }
                >
                  <option value="">Select Period</option>
                  {periods
                    .filter((p) => !p.is_closed)
                    .map((period) => (
                      <option key={period.id} value={period.id}>
                        {formatDate(period.start_date)} -{" "}
                        {formatDate(period.end_date)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Date *</label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={form.entry_date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, entry_date: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                rows={2}
                value={form.narration}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, narration: e.target.value }))
                }
                placeholder="Enter narration..."
              />
            </div>

            <div className="border rounded">
              <div className="flex justify-between items-center p-3 border-b bg-gray-50">
                <h3 className="font-medium">Journal Lines *</h3>
                <Button size="sm" onClick={handleAddLine} variant="outline">
                  <Plus size={16} className="mr-1" /> Add Line
                </Button>
              </div>

              <div className="p-3 space-y-3">
                {form.lines.map((line, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      className="flex-1 border px-3 py-2 rounded"
                      value={line.account_id}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "account_id",
                          Number(e.target.value)
                        )
                      }
                    >
                      <option value="">Select Account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      className="w-32 border px-3 py-2 rounded text-right"
                      placeholder="Debit"
                      value={line.debit_amount || ""}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "debit_amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />

                    <input
                      type="number"
                      className="w-32 border px-3 py-2 rounded text-right"
                      placeholder="Credit"
                      value={line.credit_amount || ""}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "credit_amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />

                    <button
                      onClick={() => handleRemoveLine(index)}
                      className="text-red-500 p-2 hover:bg-red-50 rounded"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border rounded bg-gray-50">
              <div className="text-sm">
                Total Lines:{" "}
                <span className="font-medium">{form.lines.length}</span>
              </div>
              <div className="text-right">
                <div className="flex gap-6">
                  <div>
                    <div className="text-sm text-gray-600">Total Debit</div>
                    <div
                      className={`font-bold ${
                        Math.abs(totalDebit - totalCredit) > 0.01
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {formatCurrency(totalDebit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Credit</div>
                    <div
                      className={`font-bold ${
                        Math.abs(totalDebit - totalCredit) > 0.01
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {formatCurrency(totalCredit)}
                    </div>
                  </div>
                </div>
                {Math.abs(totalDebit - totalCredit) > 0.01 && (
                  <div className="text-sm text-red-600 mt-1">
                    Unbalanced:{" "}
                    {formatCurrency(Math.abs(totalDebit - totalCredit))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveJournal}
                disabled={loading || Math.abs(totalDebit - totalCredit) > 0.01}
              >
                {loading ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
