"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Trash2,
  Filter as FilterIcon,
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
  // NEW: optional per-column width control. Falls back to sensible defaults
  // (see DEFAULT_COL_MIN_WIDTH / DEFAULT_COL_WIDTH / DEFAULT_COL_MAX_WIDTH)
  // if omitted, so existing callers don't need to change anything.
  minWidth?: number;
  width?: number;
  maxWidth?: number;
};

type FilterOption = {
  label: string;
  value: string | number; // "" is treated as "All"; numbers are stringified when rendered
};

type FilterConfig<T = any> = {
  key: string;
  label: string;
  type?: "select" | "text" | "number" | "date" | "checkbox" | "custom";
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  group?: string;
  match?: (rowValue: any, filterValue: string, row: T) => boolean;
  render?: (
    value: string,
    onChange: (value: string) => void,
  ) => React.ReactNode;
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
  serial?: boolean;
  serialLabel?: string;
  rowKey?: keyof T | ((row: T) => string | number);
  onBulkDelete?: (rows: T[]) => void;
  bulkDeleteLabel?: string;
  filters?: FilterConfig<T>[];
  onFilterChange?: (filters: Record<string, string>) => void;
  filtersTitle?: string;
  onSearchChange?: (search: string) => void;
  // NEW: built-in "rows per page" selector, shown next to pagination.
  // - If `onRowsPerPageChange` is provided (server-side pagination), the
  //   component is CONTROLLED: it calls your handler and expects the parent
  //   to update `rowsPerPage`/refetch — same pattern as `page`/`onPageChange`.
  // - If omitted (internal pagination), the component manages rows-per-page
  //   itself, starting from the `rowsPerPage` prop as the initial value.
  // Pass `rowsPerPageOptions={[]}` (empty array) to hide the selector entirely.
  rowsPerPageOptions?: number[];
  onRowsPerPageChange?: (rowsPerPage: number) => void;
};

// NEW: default column sizing used when a column doesn't specify its own
// minWidth/width/maxWidth. Tuned so ~5-6 columns fit a typical laptop screen
// without the table ballooning when there's no `showColumns` (i.e. all keys
// of data[0] are auto-detected, which is exactly the "lots of columns" case).
const DEFAULT_COL_MIN_WIDTH = 140;
const DEFAULT_COL_WIDTH = 180;
const DEFAULT_COL_MAX_WIDTH = 240;

export function DataTable<T extends Record<string, any>>({
  data,
  label = "Data Table",
  showColumns = [],
  actions = [],
  selectable = false,
  rowsPerPage = 10,
  printHead = [],
  loading = false,
  columnFormats = {},
  pagination = false,
  page: externalPage,
  totalPages: externalTotalPages,
  onPageChange,
  serial = false,
  serialLabel = "#",
  rowKey,
  onBulkDelete,
  bulkDeleteLabel = "Delete Selected",
  filters = [],
  onFilterChange,
  filtersTitle = "Filters",
  onSearchChange,
  rowsPerPageOptions = [10, 20, 50, 100],
  onRowsPerPageChange,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(),
  );
  const [search, setSearch] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  // NEW: only used in uncontrolled (internal-pagination) mode. Starts from
  // whatever `rowsPerPage` was passed in as the initial page size.
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(rowsPerPage);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const defaultFilterMatch = (
    type: FilterConfig["type"],
    rowValue: any,
    filterValue: string,
  ): boolean => {
    switch (type) {
      case "text":
        return String(rowValue ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      case "number":
        return Number(rowValue) === Number(filterValue);
      case "date":
        return (
          new Date(rowValue).toDateString() ===
          new Date(filterValue).toDateString()
        );
      case "checkbox":
        return String(Boolean(rowValue)) === filterValue;
      case "select":
      default:
        return String(rowValue ?? "") === filterValue;
    }
  };

  const isFilterActive = (
    filter: FilterConfig,
    rawValue: string | undefined,
  ) => {
    if (filter.type === "checkbox") {
      return rawValue !== undefined && rawValue !== "";
    }
    return Boolean(rawValue);
  };

  const currentPage = pagination ? externalPage || 1 : internalPage;
  const handlePageChange = pagination
    ? onPageChange || (() => {})
    : setInternalPage;

  // NEW: when `onRowsPerPageChange` is supplied, the parent owns rows-per-page
  // (same controlled pattern as page/onPageChange) — always trust the prop.
  // Otherwise this component manages it internally via internalRowsPerPage.
  const effectiveRowsPerPage = onRowsPerPageChange
    ? rowsPerPage
    : internalRowsPerPage;

  const handleRowsPerPageChange = (value: number) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(value);
    } else {
      setInternalRowsPerPage(value);
    }
    handlePageChange(1); // changing page size should always reset to page 1
  };

  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) {
      return typeof rowKey === "function" ? rowKey(row) : (row[rowKey] as any);
    }
    return index;
  };

  useEffect(() => {
    if (!rowKey) {
      setSelectedRows(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, data]);

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
    let result = sortedData;

    if (!onFilterChange) {
      for (const filter of filters) {
        const activeValue = filterValues[filter.key] ?? filter.defaultValue;
        if (isFilterActive(filter, activeValue)) {
          result = result.filter((row) =>
            filter.match
              ? filter.match(row[filter.key], activeValue as string, row)
              : defaultFilterMatch(
                  filter.type,
                  row[filter.key],
                  activeValue as string,
                ),
          );
        }
      }
    }

    if (onSearchChange) {
      return result;
    }

    if (!search) return result;

    return result.filter((row) =>
      headers.some((header) =>
        String(row[header] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    );
  }, [
    sortedData,
    headers,
    search,
    filters,
    filterValues,
    onSearchChange,
    onFilterChange,
  ]);

  const totalPages = pagination
    ? externalTotalPages ||
      Math.max(1, Math.ceil(filteredData.length / rowsPerPage))
    : Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    handlePageChange(1);
    onSearchChange?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const next = { ...filterValues, [key]: value };
    setFilterValues(next);
    handlePageChange(1);
    onFilterChange?.(next);
  };

  const clearAllFilters = () => {
    const next: Record<string, string> = {};
    setFilterValues(next);
    handlePageChange(1);
    onFilterChange?.(next);
  };

  const activeFilterCount = useMemo(
    () =>
      filters.filter((f) =>
        isFilterActive(f, filterValues[f.key] ?? f.defaultValue),
      ).length,
    [filters, filterValues],
  );

  const filterGroups = useMemo(() => {
    const groups: { key: string; label: string; items: FilterConfig[] }[] = [];
    const groupIndex = new Map<string, number>();

    for (const filter of filters) {
      const groupKey = filter.group ?? filter.key;
      const existingIndex = groupIndex.get(groupKey);
      if (existingIndex === undefined) {
        groupIndex.set(groupKey, groups.length);
        groups.push({
          key: groupKey,
          label: filter.group ?? filter.label,
          items: [filter],
        });
      } else {
        groups[existingIndex].items.push(filter);
      }
    }
    return groups;
  }, [filters]);

  const renderFilterInput = (filter: FilterConfig) => {
    const value = filterValues[filter.key] ?? filter.defaultValue ?? "";
    const onChange = (v: string) => handleFilterChange(filter.key, v);
    const inputClass =
      "w-full border px-2.5 py-1.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-bw-primary/30" +
      (filter.icon ? " pl-8" : "");

    if (filter.render) {
      return (
        <React.Fragment key={filter.key}>
          {filter.render(value, onChange)}
        </React.Fragment>
      );
    }

    switch (filter.type) {
      case "text":
      case "number":
        return (
          <div key={filter.key} className="relative flex-1 min-w-0">
            {filter.icon && (
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                {filter.icon}
              </span>
            )}
            <input
              type={filter.type}
              placeholder={filter.placeholder ?? filter.label}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={inputClass}
            />
          </div>
        );
      case "date":
        return (
          <input
            key={filter.key}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} flex-1 min-w-0`}
          />
        );
      case "checkbox":
        return (
          <label
            key={filter.key}
            className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 border rounded-lg bg-white cursor-pointer select-none flex-1"
          >
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={(e) => onChange(String(e.target.checked))}
              className="rounded"
            />
            {filter.label}
          </label>
        );
      case "select":
      default:
        return (
          <select
            key={filter.key}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} flex-1 min-w-0`}
          >
            <option value="">All</option>
            {(filter.options ?? []).map((opt) => (
              <option key={opt.value} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );
    }
  };

  const toggleSelectAll = () => {
    const allSelected =
      displayData.length > 0 &&
      displayData.every((row, i) => selectedRows.has(getRowKey(row, i)));

    if (allSelected) {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        displayData.forEach((row, i) => next.delete(getRowKey(row, i)));
        return next;
      });
    } else {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        displayData.forEach((row, i) => next.add(getRowKey(row, i)));
        return next;
      });
    }
  };

  const toggleRow = (row: T, index: number) => {
    const key = getRowKey(row, index);
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearSelection = () => setSelectedRows(new Set());

  const handleBulkDelete = () => {
    if (!onBulkDelete) return;
    const keyToRow = new Map<string | number, T>();
    filteredData.forEach((row, i) => keyToRow.set(getRowKey(row, i), row));
    const rowsToDelete = Array.from(selectedRows)
      .map((k) => keyToRow.get(k))
      .filter((r): r is T => Boolean(r));
    onBulkDelete(rowsToDelete);
    clearSelection();
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

  // NEW: resolves the width style object for a column, falling back to the
  // shared defaults when the column config doesn't specify its own.
  const getColWidthStyle = (col: ColumnConfig<T>): React.CSSProperties => ({
    minWidth: col.minWidth ?? DEFAULT_COL_MIN_WIDTH,
    width: col.width ?? DEFAULT_COL_WIDTH,
    maxWidth: col.maxWidth ?? DEFAULT_COL_MAX_WIDTH,
  });

  // NEW: total minimum width the table needs (serial + checkbox + every
  // column's own minWidth + actions). Used as the table's own minWidth so it
  // can STRETCH TO FULL WIDTH when there's room (few columns on a wide
  // screen), but never shrink below what columns actually need — at which
  // point it overflows and the wrapper's overflow-x-auto kicks in with a
  // horizontal scrollbar instead of breaking the page.
  const tableMinWidth = useMemo(() => {
    let total = 0;
    if (serial) total += 48;
    if (selectable) total += 40;
    total += columnConfigs.reduce(
      (sum, col) => sum + (col.minWidth ?? DEFAULT_COL_MIN_WIDTH),
      0,
    );
    if (actions.length > 0) total += 140;
    return Math.max(total, 600);
  }, [serial, selectable, columnConfigs, actions.length]);

  const exportExcel = () => {
    const exportData = filteredData.map((row, index) => {
      const obj: Record<string, any> = {};

      if (serial) {
        obj[serialLabel] = index + 1;
      }

      columnConfigs.forEach((col) => {
        const formatFn = columnFormats[col.key];
        let value: any = row[col.key];
        if (formatFn) {
          const formatted = formatFn(value, row);
          // Only trust the formatter's output for export if it's a plain
          // string/number. If it returned JSX (e.g. a colored <span> for
          // display), String()-ing that React element gives "[object Object]"
          // — so keep the raw underlying value instead in that case.
          if (typeof formatted === "string" || typeof formatted === "number") {
            value = formatted;
          }
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

    const body = filteredData.map((row, index) => {
      const rowData: any[] = [];

      if (serial) {
        rowData.push(index + 1);
      }

      columnConfigs.forEach((col) => {
        const formatFn = columnFormats[col.key];
        let value: any = row[col.key];
        if (formatFn) {
          const formatted = formatFn(value, row);
          // Same fix as exportExcel: keep the raw value when the formatter
          // returns JSX rather than a plain string/number.
          if (typeof formatted === "string" || typeof formatted === "number") {
            value = formatted;
          }
        }
        if (
          Array.isArray(value) ||
          (typeof value === "string" && value.startsWith("http"))
        ) {
          rowData.push("[Image]");
        } else {
          rowData.push(value);
        }
      });

      return rowData;
    });

    const pdfHeaders = serial
      ? [serialLabel, ...columnConfigs.map((c) => c.label)]
      : columnConfigs.map((c) => c.label);

    autoTable(doc, {
      head: [pdfHeaders],
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
    <div className="space-y-3 w-full min-w-0">
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
                onChange={(e) => handleSearchChange(e.target.value)}
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

          {/* Filter panel */}
          {filters.length > 0 && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="md:hidden">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="w-full p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FilterIcon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-sm">{filtersTitle}</span>
                    {activeFilterCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {filtersOpen ? (
                    <X className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              <div
                className={`${
                  filtersOpen ? "block" : "hidden"
                } md:block p-4 space-y-3 border-t md:border-t-0`}
              >
                <div className="hidden md:flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {filtersTitle}
                  </h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filterGroups.map((group) => (
                    <div key={group.key}>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        {group.label}
                      </label>
                      <div className="flex gap-2">
                        {group.items.map((filter) => renderFilterInput(filter))}
                      </div>
                    </div>
                  ))}
                </div>

                {activeFilterCount > 0 && (
                  <div className="md:hidden pt-1">
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bulk action bar */}
          {selectable && selectedRows.size > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-sm text-red-700 font-medium">
                {selectedRows.size} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={clearSelection}
                  className="text-xs px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  Clear
                </button>
                {onBulkDelete && (
                  <button
                    onClick={handleBulkDelete}
                    className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {bulkDeleteLabel}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Print data (hidden) */}
          <PrintTemplate title={label}>
            <div id={label}>
              <table className="w-full border border-b-black">
                <thead>
                  <tr>
                    {serial && (
                      <th className="border border-b-black">{serialLabel}</th>
                    )}
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
                      {serial && <td className="border p-2">{rowIndex + 1}</td>}
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
          {/* FIX: min-w-0 lets this shrink inside a flex/grid ancestor (e.g. a
              dashboard shell with a sidebar) so overflow-x-auto can actually
              take effect instead of the whole page growing wider. */}
          <div className="hidden md:block w-full min-w-0 overflow-x-auto border rounded-xl shadow-sm max-h-[72vh]">
            {/* FIX: table-fixed makes every column's width/minWidth/maxWidth
                actually respected (auto layout ignores max-width on cells).
                width: 100% + minWidth: tableMinWidth is the key combo:
                - Few columns on a wide screen → 100% wins, table stretches
                  to fill the full device width, columns share the space.
                - Many columns whose total minWidth exceeds the container →
                  minWidth wins, table can't shrink further, so it overflows
                  and the wrapper's overflow-x-auto shows a horizontal
                  scrollbar instead of breaking the page layout. */}
            <table
              className="border-collapse table-fixed"
              style={{ width: "100%", minWidth: tableMinWidth }}
            >
              {/* FIX: an explicit <colgroup> is the authoritative source of
                  column widths for table-layout:fixed. Relying only on the
                  first row's cell widths is spec-legal but inconsistent
                  across browsers once any column lacks an explicit `width`
                  (like Actions previously did with only minWidth) — that
                  ambiguity is what caused columns to squeeze/overlap instead
                  of triggering the scrollbar. The colgroup removes the
                  ambiguity entirely. */}
              <colgroup>
                {serial && <col style={{ width: 48 }} />}
                {selectable && <col style={{ width: 40 }} />}
                {columnConfigs.map((col) => (
                  <col key={String(col.key)} style={getColWidthStyle(col)} />
                ))}
                {actions.length > 0 && (
                  <col style={{ width: 140, minWidth: 120 }} />
                )}
              </colgroup>
              <thead className="text-left sticky top-0 bg-bw-900 z-10">
                <tr>
                  {serial && (
                    <th
                      style={{ width: 48 }}
                      className="px-3 py-2.5 border-b text-white font-medium text-sm whitespace-nowrap"
                    >
                      {serialLabel}
                    </th>
                  )}
                  {selectable && (
                    <th
                      style={{ width: 40 }}
                      className="px-3 py-2.5 border-b whitespace-nowrap"
                    >
                      <input
                        type="checkbox"
                        checked={
                          displayData.length > 0 &&
                          displayData.every((row, i) =>
                            selectedRows.has(getRowKey(row, i)),
                          )
                        }
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                  )}
                  {columnConfigs.map((col) => (
                    <th
                      key={String(col.key)}
                      style={getColWidthStyle(col)}
                      className="px-3 py-2.5 border-b text-white font-medium cursor-pointer select-none text-sm whitespace-nowrap overflow-hidden text-ellipsis hover:bg-white/10 transition-colors"
                      onClick={() => requestSort(String(col.key))}
                      title={col.label}
                    >
                      {col.label} {getSortIndicator(String(col.key))}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th
                      style={{ minWidth: 120 }}
                      className="px-3 py-2.5 border-b text-white font-medium text-sm whitespace-nowrap"
                    >
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
                        (serial ? 1 : 0) +
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
                    const key = getRowKey(row, rowIndex);
                    const isSelected = selectedRows.has(key);
                    return (
                      <tr
                        key={key}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        {serial && (
                          <td
                            style={{ width: 48 }}
                            className="px-3 py-2 border-b text-sm text-gray-600 font-medium"
                          >
                            {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                          </td>
                        )}
                        {selectable && (
                          <td
                            style={{ width: 40 }}
                            className="px-3 py-2 border-b"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(row, rowIndex)}
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
                                style={getColWidthStyle(col)}
                                className="px-2 py-2 border-b text-sm whitespace-nowrap overflow-hidden"
                              >
                                {renderCellValue(col, row)}
                              </td>
                            );
                          }

                          return (
                            <td
                              key={String(col.key)}
                              style={getColWidthStyle(col)}
                              className="px-3 py-2 border-b text-bw-900 text-sm whitespace-nowrap"
                              title={String(value ?? "")}
                            >
                              <span className="block truncate">
                                {value ?? "—"}
                              </span>
                            </td>
                          );
                        })}
                        {actions.length > 0 && (
                          <td
                            style={{ minWidth: 120 }}
                            className="px-2 py-2 border-b whitespace-nowrap"
                          >
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
                const key = getRowKey(row, rowIndex);
                const isSelected = selectedRows.has(key);
                const previewCols = columnConfigs.slice(0, 3);
                const remainingCols = columnConfigs.slice(3);

                return (
                  <div
                    key={key}
                    className={`border rounded-xl shadow-sm overflow-hidden transition-all ${
                      isSelected ? "border-bw-primary bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div
                      className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer select-none"
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : rowIndex)
                      }
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {serial && (
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                            {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                          </span>
                        )}
                        {selectable && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleRow(row, rowIndex);
                            }}
                            className="rounded flex-shrink-0"
                          />
                        )}
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
                        className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {previewCols.slice(1).length > 0 && (
                      <div className="px-3 pb-2 flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-2">
                        {previewCols.slice(1).map((col) => (
                          <div
                            key={String(col.key)}
                            className="flex items-center gap-1 text-xs min-w-0"
                          >
                            <span className="text-gray-400 font-medium flex-shrink-0">
                              {col.label}:
                            </span>
                            <span className="text-bw-900 truncate">
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

                    {isExpanded && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {remainingCols.map((col) => (
                          <div
                            key={String(col.key)}
                            className="flex items-start justify-between px-3 py-2 gap-2"
                          >
                            <span className="text-xs font-medium text-gray-400 flex-shrink-0 w-24 sm:w-32 truncate">
                              {col.label}
                            </span>
                            <span className="text-sm text-bw-900 text-right flex-1 min-w-0 break-words">
                              {renderCellValue(col, row)}
                            </span>
                          </div>
                        ))}

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
          {(pagination || totalPages > 1) && (
            <div className="w-full overflow-x-auto">
              <CustomPagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
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
