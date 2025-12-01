"use client";

import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown, FileSpreadsheet, Printer, X } from "lucide-react";
import { printView } from "../utils/print";
import { CustomPagination } from "./custom/customPagination";

type Action<T> = {
  label: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
  title?: string;
  hide?: (row: T) => boolean;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

type PrintColumn<T> = {
  label: string;
  value: keyof T;
};

type ColumnConfig<T> = {
  key: keyof T;
  label: string;
};

type DataTableProps<T> = {
  data: T[];
  label?: string;
  showColumns?: (keyof T)[] | ColumnConfig<T>[]; // Updated: Can be array of keys or column configs
  actions?: Action<T>[];
  selectable?: boolean;
  rowsPerPage?: number;
  printHead?: PrintColumn<T>[];
  loading?: boolean;
  columnFormats?: Partial<
    Record<keyof T, (value: any, row: T) => React.ReactNode>
  >;
};

export function DataTable<T extends Record<string, any>>({
  data,
  label = "Data Table",
  showColumns = [],
  actions = [],
  selectable = false,
  rowsPerPage = 5,
  printHead = [],
  loading = false,
  columnFormats = {},
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Process showColumns to extract keys and labels
  const columnConfigs = useMemo((): ColumnConfig<T>[] => {
    if (!data || data.length === 0) return [];

    // If showColumns is empty, use all columns with default labels
    if (showColumns.length === 0) {
      return Object.keys(data[0]).map((key) => ({
        key: key as keyof T,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), // Convert snake_case to Title Case
      }));
    }

    // Process showColumns array
    return showColumns.map((col) => {
      if (
        typeof col === "string" ||
        typeof col === "number" ||
        typeof col === "symbol"
      ) {
        // Simple key without custom label
        return {
          key: col as keyof T,
          label: String(col)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        };
      } else {
        // ColumnConfig object with custom label
        return col as ColumnConfig<T>;
      }
    });
  }, [data, showColumns]);

  // Extract just the keys for internal use
  const headers = useMemo(
    () => columnConfigs.map((col) => col.key as string),
    [columnConfigs]
  );

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

  const filteredData = useMemo(() => {
    return sortedData.filter((row) =>
      headers.some((header) =>
        String(row[header] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [sortedData, headers, search]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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

  const exportExcel = () => {
    const exportData = filteredData.map((row) => {
      const obj: Record<string, any> = {};
      columnConfigs.forEach((col) => {
        const formatFn = columnFormats[col.key];
        let value: any = row[col.key];
        if (formatFn) {
          const formatted = formatFn(value, row);
          value = typeof formatted === "string" ? formatted : String(formatted);
        }
        obj[col.label] = value;
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${label}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(label, 14, 10);

    const body = filteredData.map((row) =>
      columnConfigs.map((col) => {
        const formatFn = columnFormats[col.key];
        let value: any = row[col.key];

        if (formatFn) {
          const formatted = formatFn(value, row);
          value = typeof formatted === "string" ? formatted : String(formatted);
        }

        if (
          Array.isArray(value) ||
          (typeof value === "string" && value.startsWith("http"))
        ) {
          return "[Image]";
        }

        return value;
      })
    );

    autoTable(doc, {
      head: [columnConfigs.map((c) => c.label)],
      body: body,
    });

    doc.save(`${label}.pdf`);
  };

  const getVisibleActions = (row: T): Action<T>[] => {
    return actions.filter((action) => !action.hide || !action.hide(row));
  };

  return (
    <div className="space-y-4 w-full">
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-bw-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base sm:text-lg font-semibold truncate max-w-full">
              {label}
            </h2>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search..."
                className="border px-2 py-1.5 rounded-lg text-sm flex-1 sm:flex-initial min-w-[150px]"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={exportExcel}
                  title="Excel"
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </button>
                <button
                  onClick={exportPDF}
                  title="Download PDF"
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <FileDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => printView(label)}
                  title="Print"
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Print data */}
          <div id={label} className="hidden">
            <h1 className="text-xl font-bold mb-2">{label}</h1>
            <table className="w-full border border-b-black">
              <thead>
                <tr>
                  {(printHead && printHead.length > 0
                    ? printHead
                    : columnConfigs.map((col) => ({
                        label: col.label,
                        value: col.key,
                      }))
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
                      : columnConfigs.map((col) => ({
                          label: col.label,
                          value: col.key,
                        }))
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

          {/* Desktop Table */}
          <div className=" lg:block overflow-x-auto border rounded-xl shadow-sm max-h-[60vh]">
            <table className="w-full border-collapse">
              <thead className="text-left sticky top-0 bg-bw-900 z-10">
                <tr>
                  {selectable && (
                    <th className="px-3 py-2 border-b whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === paginatedData.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  {columnConfigs.map((col) => (
                    <th
                      key={String(col.key)}
                      className="px-3 py-2 border-b text-white font-medium cursor-pointer select-none text-sm whitespace-nowrap"
                      onClick={() => requestSort(String(col.key))}
                    >
                      {col.label} {getSortIndicator(String(col.key))}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-3 py-2 border-b text-white font-medium text-sm whitespace-nowrap">
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
                        columnConfigs.length +
                        (selectable ? 1 : 0) +
                        (actions.length > 0 ? 1 : 0)
                      }
                      className="text-center py-6 text-gray-500 text-sm"
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rowIndex) => {
                    const visibleActions = getVisibleActions(row);

                    return (
                      <tr
                        key={rowIndex}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {selectable && (
                          <td className="px-3 py-2 border-b">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(rowIndex)}
                              onChange={() => toggleRow(rowIndex)}
                            />
                          </td>
                        )}

                        {columnConfigs.map((col) => {
                          const value = row[col.key];
                          const formatFn = columnFormats[col.key];

                          if (formatFn) {
                            return (
                              <td
                                key={String(col.key)}
                                className="px-2 py-2 border-b text-sm whitespace-nowrap"
                              >
                                {formatFn(value, row)}
                              </td>
                            );
                          }

                          const isImageColumn =
                            String(col.key).toLowerCase().includes("image") ||
                            String(col.key).toLowerCase().includes("photo") ||
                            String(col.key).toLowerCase().includes("avatar");

                          if (isImageColumn) {
                            if (Array.isArray(value)) {
                              return (
                                <td
                                  key={String(col.key)}
                                  className="px-2 py-2 border-b"
                                >
                                  <div className="flex gap-1 flex-wrap">
                                    {value.map((img: string, i: number) => (
                                      <img
                                        key={i}
                                        src={img || "https://placehold.co/400"}
                                        alt={`${col.label}-${i}`}
                                        className="w-10 h-10 object-cover rounded-md border cursor-pointer"
                                        onClick={() => setPreviewImage(img)}
                                      />
                                    ))}
                                  </div>
                                </td>
                              );
                            } else {
                              return (
                                <td
                                  key={String(col.key)}
                                  className="px-2 py-2 border-b"
                                >
                                  <img
                                    src={value || "https://placehold.co/400"}
                                    alt={col.label}
                                    className="w-10 h-10 object-cover rounded-md border cursor-pointer"
                                    onClick={() => setPreviewImage(value)}
                                  />
                                </td>
                              );
                            }
                          }

                          return (
                            <td
                              key={String(col.key)}
                              className="px-2 py-2 border-b text-bw-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                              title={String(value)}
                            >
                              {value}
                            </td>
                          );
                        })}

                        {actions.length > 0 && (
                          <td className="px-2 py-2 border-b whitespace-nowrap">
                            <div className="flex gap-1">
                              {visibleActions.map((action, i) => (
                                <button
                                  key={i}
                                  className={`px-2 py-1 rounded text-xs ${
                                    action.className ?? "bw-primary"
                                  }`}
                                  title={action.title}
                                  onClick={() => action.onClick(row)}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <CustomPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-full max-h-full">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black bg-white rounded-full p-1"
              onClick={() => setPreviewImage(null)}
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
