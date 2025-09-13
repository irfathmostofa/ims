"use client";

import React, { useState, useMemo } from "react";
// You’ll need xlsx and jspdf for export
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { FileText, Printer, Sheet } from "lucide-react";
import { printView } from "../utils/print";

type Action<T> = {
  label: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

type DataTableProps<T> = {
  data: T[];
  label?: string;
  hiddenColumns?: (keyof T)[];
  actions?: Action<T>[];
  selectable?: boolean;
  rowsPerPage?: number;
};

export function DataTable<T extends Record<string, any>>({
  data,
  label = "Data Table",
  hiddenColumns = [],
  actions = [],
  selectable = false,
  rowsPerPage = 5,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
  }

  const headers = Object.keys(data[0]).filter(
    (key) => !hiddenColumns.includes(key as keyof T)
  );

  // ✅ Sort
  const sortedData = useMemo(() => {
    let sortable = [...data];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [data, sortConfig]);

  // ✅ Search
  const filteredData = useMemo(() => {
    return sortedData.filter((row) =>
      headers.some((header) =>
        String(row[header]).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [sortedData, headers, search]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // ✅ Sorting toggle
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    } else if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((_, i) => i));
    }
  };

  const toggleRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // ✅ Export to Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${label}.xlsx`);
  };

  // ✅ Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(label, 14, 10);
    autoTable(doc, {
      head: [headers],
      body: filteredData.map((row) => headers.map((h) => row[h])),
    });
    doc.save(`${label}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* 🔹 Toolbar */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{label}</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            className="border px-3 py-2 rounded-lg"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <button className="" onClick={exportExcel}>
            <Sheet />
          </button>
          <button className="" onClick={exportPDF}>
            <FileText />
          </button>
          <button className="" onClick={() => printView(label)}>
            <Printer />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bw-primary text-left">
            <tr>
              {selectable && (
                <th className="px-4 py-2 border-b">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}

              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 border-b text-white font-medium capitalize cursor-pointer select-none"
                  onClick={() => requestSort(header)}
                >
                  {header} {getSortIndicator(header)}
                </th>
              ))}

              {actions.length > 0 && (
                <th className="px-4 py-2 border-b text-white font-medium">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {selectable && (
                  <td className="px-4 py-2 border-b">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => toggleRow(rowIndex)}
                    />
                  </td>
                )}

                {headers.map((header) => (
                  <td key={header} className="px-4 py-2 border-b text-bw-900">
                    {row[header]}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td className="px-4 py-2 border-b space-x-2">
                    {actions.map((action, i) => (
                      <button
                        key={i}
                        className={`px-2 py-1 rounded text-sm ${
                          action.className ?? "bg-blue-500 text-white"
                        }`}
                        onClick={() => action.onClick(row)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

// ✅ Reusable Pagination Component
type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <button
        className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>

      <span className="px-2">
        Page {page} of {totalPages}
      </span>

      <button
        className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}
