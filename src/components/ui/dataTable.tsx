"use client";

import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileDown,
  FileSpreadsheet,
  Printer,
  X,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import { printView } from "../utils/print";
import { CustomPagination } from "./custom/customPagination";
import { formatDate } from "../utils/formatter";
import PrintTemplate from "./PrintLayout";

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
  showColumns?: (keyof T)[] | ColumnConfig<T>[];
  actions?: Action<T>[];
  selectable?: boolean;
  rowsPerPage?: number;
  printHead?: PrintColumn<T>[];
  loading?: boolean;
  columnFormats?: Partial<
    Record<keyof T, (value: any, row: T) => React.ReactNode>
  >;
  pagination?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
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
  pagination = false,
  page: externalPage,
  totalPages: externalTotalPages,
  onPageChange,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // Mobile: track which row is expanded to show all fields as cards
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const currentPage = pagination ? externalPage || 1 : internalPage;
  const handlePageChange = pagination
    ? onPageChange || (() => {})
    : setInternalPage;

  const columnConfigs = useMemo((): ColumnConfig<T>[] => {
    if (!data || data.length === 0) return [];
    if (showColumns.length === 0) {
      return Object.keys(data[0]).map((key) => ({
        key: key as keyof T,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      }));
    }
    return showColumns.map((col) => {
      if (
        typeof col === "string" ||
        typeof col === "number" ||
        typeof col === "symbol"
      ) {
        return {
          key: col as keyof T,
          label: String(col)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        };
      } else {
        return col as ColumnConfig<T>;
      }
    });
  }, [data, showColumns]);

  const headers = useMemo(
    () => columnConfigs.map((col) => col.key as string),
    [columnConfigs],
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
          .includes(search.toLowerCase()),
      ),
    );
  }, [sortedData, headers, search]);

  const totalPages = pagination
    ? externalTotalPages || Math.ceil(filteredData.length / rowsPerPage)
    : Math.ceil(filteredData.length / rowsPerPage);

  const displayData = pagination
    ? filteredData
    : filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
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
    if (selectedRows.length === displayData.length) setSelectedRows([]);
    else setSelectedRows(displayData.map((_, i) => i));
  };

  const toggleRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key)
      return <ChevronsUpDown className="inline w-3 h-3 ml-0.5 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline w-3 h-3 ml-0.5" />
    ) : (
      <ChevronDown className="inline w-3 h-3 ml-0.5" />
    );
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
      }),
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

  const renderCellValue = (col: ColumnConfig<T>, row: T) => {
    const value = row[col.key];
    const formatFn = columnFormats[col.key];

    if (formatFn) {
      return formatFn(value, row);
    }

    const isImageColumn =
      String(col.key).toLowerCase().includes("image") ||
      String(col.key).toLowerCase().includes("photo") ||
      String(col.key).toLowerCase().includes("avatar");

    if (isImageColumn) {
      if (Array.isArray(value)) {
        return (
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
        );
      } else {
        return (
          <img
            src={value || "https://placehold.co/400"}
            alt={col.label}
            className="w-10 h-10 object-cover rounded-md border cursor-pointer"
            onClick={() => setPreviewImage(value)}
          />
        );
      }
    }

    return (
      <span
        className="block truncate max-w-[180px]"
        title={String(value ?? "")}
      >
        {value ?? "—"}
      </span>
    );
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
                className="border px-3 py-1.5 rounded-lg text-sm flex-1 sm:flex-initial min-w-[140px] focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handlePageChange(1);
                }}
              />
              <div className="flex gap-1.5">
                <button
                  onClick={exportExcel}
                  title="Export Excel"
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                >
                  <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={exportPDF}
                  title="Download PDF"
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                >
                  <FileDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    setTimeout(() => {
                      printView(label);
                    }, 2000);
                  }}
                  title="Print"
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Print data (hidden) */}
          <PrintTemplate title={label}>
            <div id={label}>
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
                  {filteredData.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex}>
                      {(printHead && printHead.length > 0
                        ? printHead
                        : columnConfigs.map((col: any) => ({
                            label: col.label,
                            value: col.key,
                          }))
                      ).map((col: any, colIndex: number) => {
                        const value = row[col.value];
                        const isDateString =
                          typeof value === "string" &&
                          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
                        const date = isDateString ? new Date(value) : null;
                        const isValidDate = date && !isNaN(date.getTime());
                        return (
                          <td key={colIndex} className="border p-2">
                            {isValidDate ? formatDate(date) : value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PrintTemplate>

          {/* ── DESKTOP TABLE (md and up) ── */}
          <div className="hidden md:block w-full overflow-x-auto border rounded-xl shadow-sm max-h-[60vh]">
            <table
              className="w-full border-collapse"
              style={{ minWidth: "600px" }}
            >
              <thead className="text-left sticky top-0 bg-bw-900 z-10">
                <tr>
                  {selectable && (
                    <th className="px-3 py-2.5 border-b whitespace-nowrap w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === displayData.length &&
                          displayData.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                  )}
                  {columnConfigs.map((col) => (
                    <th
                      key={String(col.key)}
                      className="px-3 py-2.5 border-b text-white font-medium cursor-pointer select-none text-sm whitespace-nowrap hover:bg-white/10 transition-colors"
                      onClick={() => requestSort(String(col.key))}
                    >
                      {col.label} {getSortIndicator(String(col.key))}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-3 py-2.5 border-b text-white font-medium text-sm whitespace-nowrap">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        columnConfigs.length +
                        (selectable ? 1 : 0) +
                        (actions.length > 0 ? 1 : 0)
                      }
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  displayData.map((row, rowIndex) => {
                    const visibleActions = getVisibleActions(row);
                    return (
                      <tr
                        key={rowIndex}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedRows.includes(rowIndex) ? "bg-blue-50" : ""
                        }`}
                      >
                        {selectable && (
                          <td className="px-3 py-2 border-b">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(rowIndex)}
                              onChange={() => toggleRow(rowIndex)}
                              className="rounded"
                            />
                          </td>
                        )}
                        {columnConfigs.map((col) => {
                          const value = row[col.key];
                          const formatFn = columnFormats[col.key];
                          const isImageColumn =
                            String(col.key).toLowerCase().includes("image") ||
                            String(col.key).toLowerCase().includes("photo") ||
                            String(col.key).toLowerCase().includes("avatar");

                          if (formatFn || isImageColumn) {
                            return (
                              <td
                                key={String(col.key)}
                                className="px-2 py-2 border-b text-sm whitespace-nowrap"
                              >
                                {renderCellValue(col, row)}
                              </td>
                            );
                          }

                          return (
                            <td
                              key={String(col.key)}
                              className="px-3 py-2 border-b text-bw-900 text-sm whitespace-nowrap max-w-[200px]"
                              title={String(value ?? "")}
                            >
                              <span className="block truncate">
                                {value ?? "—"}
                              </span>
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

          {/* ── MOBILE CARD VIEW (below md) ── */}
          <div className="md:hidden w-full space-y-2">
            {displayData.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm border rounded-xl">
                No data found
              </div>
            ) : (
              displayData.map((row, rowIndex) => {
                const visibleActions = getVisibleActions(row);
                const isExpanded = expandedRow === rowIndex;
                // Show first 3 columns in collapsed state
                const previewCols = columnConfigs.slice(0, 3);
                const remainingCols = columnConfigs.slice(3);

                return (
                  <div
                    key={rowIndex}
                    className={`border rounded-xl shadow-sm overflow-hidden transition-all ${
                      selectedRows.includes(rowIndex)
                        ? "border-bw-primary bg-blue-50"
                        : "bg-white"
                    }`}
                  >
                    {/* Card Header row */}
                    <div
                      className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none"
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : rowIndex)
                      }
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {selectable && (
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowIndex)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleRow(rowIndex);
                            }}
                            className="rounded flex-shrink-0"
                          />
                        )}
                        {/* First column value as title */}
                        {columnConfigs[0] && (
                          <span className="font-medium text-sm text-bw-900 truncate">
                            {(() => {
                              const val = row[columnConfigs[0].key];
                              const fmt = columnFormats[columnConfigs[0].key];
                              if (fmt) return fmt(val, row);
                              return val ?? "—";
                            })()}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Preview fields (cols 2–3) always visible */}
                    {previewCols.slice(1).length > 0 && (
                      <div className="px-3 pb-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100">
                        {previewCols.slice(1).map((col) => (
                          <div
                            key={String(col.key)}
                            className="flex items-center gap-1 text-xs"
                          >
                            <span className="text-gray-400 font-medium">
                              {col.label}:
                            </span>
                            <span className="text-bw-900 truncate max-w-[120px]">
                              {(() => {
                                const val = row[col.key];
                                const fmt = columnFormats[col.key];
                                if (fmt) return fmt(val, row);
                                return val ?? "—";
                              })()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expanded fields */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {remainingCols.map((col) => (
                          <div
                            key={String(col.key)}
                            className="flex items-start justify-between px-3 py-2 gap-2"
                          >
                            <span className="text-xs font-medium text-gray-400 flex-shrink-0 w-32 truncate">
                              {col.label}
                            </span>
                            <span className="text-sm text-bw-900 text-right flex-1 min-w-0">
                              {renderCellValue(col, row)}
                            </span>
                          </div>
                        ))}

                        {/* Actions in expanded state */}
                        {visibleActions.length > 0 && (
                          <div className="px-3 py-2 flex flex-wrap gap-2">
                            {visibleActions.map((action, i) => (
                              <button
                                key={i}
                                className={`px-3 py-1.5 rounded text-xs font-medium ${
                                  action.className ?? "bw-primary"
                                }`}
                                title={action.title}
                                onClick={() => action.onClick(row)}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions when not expanded (if few actions) */}
                    {!isExpanded &&
                      visibleActions.length > 0 &&
                      remainingCols.length === 0 && (
                        <div className="px-3 pb-2 flex flex-wrap gap-2 border-t border-gray-100 pt-2">
                          {visibleActions.map((action, i) => (
                            <button
                              key={i}
                              className={`px-3 py-1 rounded text-xs ${
                                action.className ?? "bw-primary"
                              }`}
                              title={action.title}
                              onClick={() => action.onClick(row)}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })
            )}
          </div>

          {/* Row count */}
          <div className="text-xs text-gray-400 text-right">
            {filteredData.length} {filteredData.length === 1 ? "row" : "rows"}
            {search && ` matching "${search}"`}
          </div>

          {/* Pagination */}
          {pagination && (
            <CustomPagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-white p-4 rounded-xl shadow-2xl max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black bg-white rounded-full p-1 shadow"
              onClick={() => setPreviewImage(null)}
            >
              <X size={18} />
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
