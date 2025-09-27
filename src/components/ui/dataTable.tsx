"use client";

import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown, FileSpreadsheet, Printer, X } from "lucide-react";
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

type PrintColumn<T> = {
  label: string;
  value: keyof T;
};

type DataTableProps<T> = {
  data: T[];
  label?: string;
  hiddenColumns?: (keyof T)[];
  actions?: Action<T>[];
  selectable?: boolean;
  rowsPerPage?: number;
  printHead?: PrintColumn<T>[];
  loading?: boolean;
};

export function DataTable<T extends Record<string, any>>({
  data,
  label = "Data Table",
  hiddenColumns = [],
  actions = [],
  selectable = false,
  rowsPerPage = 5,
  printHead = [],
  loading = false,
}: DataTableProps<T>) {
  // ✅ All hooks declared at the top, never conditionally
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ✅ Headers calculation
  const headers = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter(
      (key) => !hiddenColumns.includes(key as keyof T)
    );
  }, [data, hiddenColumns]);

  // ✅ Sorting
  const sortedData = useMemo(() => {
    let sortable = [...data];
    if (sortConfig) {
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

  // ✅ Search filtering
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

  // ✅ Sort toggle
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc")
      direction = "desc";
    else if (sortConfig?.key === key && sortConfig.direction === "desc") {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  // ✅ Select rows
  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) setSelectedRows([]);
    else setSelectedRows(paginatedData.map((_, i) => i));
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

  // ✅ Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${label}.xlsx`);
  };

  // ✅ Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(label, 14, 10);

    const columnsToPrint =
      printHead && printHead.length > 0
        ? printHead
        : headers.map((h) => ({ label: h, value: h as keyof T }));

    const body = filteredData.map((row) =>
      columnsToPrint.map((col) => {
        const value = row[col.value];
        if (Array.isArray(value)) return "[Image]";
        if (
          typeof value === "string" &&
          (col.label.toLowerCase().includes("image") ||
            col.label.toLowerCase().includes("photo") ||
            col.label.toLowerCase().includes("avatar") ||
            value.startsWith("http"))
        )
          return "[Image]";
        return value;
      })
    );

    autoTable(doc, {
      head: [columnsToPrint.map((c) => c.label)],
      body: body,
    });

    doc.save(`${label}.pdf`);
  };

  // ✅ JSX Render
  return (
    <div className="space-y-4">
      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-bw-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Toolbar */}
      {!loading && (
        <>
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
              <button onClick={exportExcel} className="cursor-pointer h-5">
                <FileSpreadsheet />
              </button>
              <button onClick={exportPDF} className="cursor-pointer h-5">
                <FileDown />
              </button>
              <button
                onClick={() => printView(label)}
                className="cursor-pointer h-5"
              >
                <Printer />
              </button>
            </div>
          </div>
          {/* print data */}
          <div id={label} className="hidden">
            <h1 className="text-xl font-bold mb-2">{label}</h1>
            <table className="w-full border border-b-black">
              <thead>
                <tr>
                  {(printHead && printHead.length > 0
                    ? printHead
                    : headers.map((h) => ({ label: h, value: h as keyof T }))
                  ).map((col) => (
                    <th key={col.label} className="border border-b-black">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {(printHead && printHead.length > 0
                      ? printHead
                      : headers.map((h) => ({ label: h, value: h as keyof T }))
                    ).map((col, colIndex) => (
                      <td key={colIndex} className="border p-2">
                        {row[col.value]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Table */}
          <div className="overflow-x-auto border rounded-xl shadow-sm max-h-[60vh]">
            <table className="w-full border-collapse min-w-[600px]">
              <thead className="text-left sticky top-0 bg-bw-900 z-10">
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
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        headers.length +
                        (selectable ? 1 : 0) +
                        (actions.length > 0 ? 1 : 0)
                      }
                      className="text-center py-6 text-gray-500"
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {selectable && (
                        <td className="px-4 py-2 border-b">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowIndex)}
                            onChange={() => toggleRow(rowIndex)}
                          />
                        </td>
                      )}

                      {headers.map((header) => {
                        const value = row[header];
                        const isImageColumn =
                          header.toLowerCase().includes("image") ||
                          header.toLowerCase().includes("photo") ||
                          header.toLowerCase().includes("avatar");

                        if (isImageColumn) {
                          if (Array.isArray(value)) {
                            return (
                              <td key={header} className="px-2 py-1 border-b">
                                <div className="flex gap-1 flex-wrap">
                                  {value.map((img: string, i: number) => (
                                    <img
                                      key={i}
                                      src={img}
                                      alt={`${header}-${i}`}
                                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md border cursor-pointer"
                                      onClick={() => setPreviewImage(img)}
                                    />
                                  ))}
                                </div>
                              </td>
                            );
                          } else {
                            return (
                              <td key={header} className="px-2 py-1 border-b">
                                <img
                                  src={value}
                                  alt={header}
                                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md border cursor-pointer"
                                  onClick={() => setPreviewImage(value)}
                                />
                              </td>
                            );
                          }
                        }

                        return (
                          <td
                            key={header}
                            className="px-2 py-1 border-b text-bw-900 max-w-[150px] truncate"
                            title={String(value)}
                          >
                            {typeof value === "string" && value.length > 30
                              ? value.slice(0, 30) + "..."
                              : value}
                          </td>
                        );
                      })}

                      {actions.length > 0 && (
                        <td className="px-2 py-1 border-b space-x-1">
                          {actions.map((action, i) => (
                            <button
                              key={i}
                              className={`px-2 py-1 rounded text-sm ${
                                action.className ?? "bw-primary "
                              }`}
                              onClick={() => action.onClick(row)}
                            >
                              {action.label}
                            </button>
                          ))}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setPreviewImage(null)}
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[80vh] max-w-[80vw] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Pagination Component
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
