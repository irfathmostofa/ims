"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function InvoiceSelector({
  invoices,
  selectedInvoice,
  setSelectedInvoice,
  loading,
  onSearchChange,
  searchParams,
}: {
  invoices: any[];
  selectedInvoice: any | null;
  setSelectedInvoice: (inv: any) => void;
  loading: boolean;
  onSearchChange: (params: any) => void;
  searchParams: any;
}) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchParams.search) {
        onSearchChange({ search: localSearch, page: "1" });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleDateFromSelect = (date: Date | undefined) => {
    setDateFrom(date);
    if (date) {
      onSearchChange({ from_date: format(date, "yyyy-MM-dd"), page: "1" });
    } else {
      onSearchChange({ from_date: "", page: "1" });
    }
  };

  const handleDateToSelect = (date: Date | undefined) => {
    setDateTo(date);
    if (date) {
      onSearchChange({ to_date: format(date, "yyyy-MM-dd"), page: "1" });
    } else {
      onSearchChange({ to_date: "", page: "1" });
    }
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setDateFrom(undefined);
    setDateTo(undefined);
    onSearchChange({
      search: "",
      from_date: "",
      to_date: "",
      page: "1",
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB");
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PARTIAL":
        return "bg-amber-100 text-amber-800";
      case "DUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border space-y-4 ">
      {/* Search + Date Filters */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Invoice
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8"
          >
            <RefreshCw size={14} className="mr-1" />
            Clear Filters
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-2">
              <Search size={16} />
              Search
            </Label>
            <Input
              id="search"
              placeholder="Invoice no, customer name..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Filter size={16} />
              Date From
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Filter size={16} />
              Date To
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-2 ">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 border rounded-lg p-2 space-y-2 h-100 overflow-y-auto">
            {invoices.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No invoices found. Try different search criteria.
              </div>
            ) : (
              invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                const totalAmount = parseFloat(inv.total_amount) || 0;
                const paidAmount = parseFloat(inv.paid_amount) || 0;
                const dueAmount = parseFloat(inv.due_amount) || 0;

                return (
                  <div
                    key={inv.id}
                    className={`p-3 border rounded-lg transition w-full cursor-pointer
                      ${
                        isSelected
                          ? "bg-blue-50 border-blue-400"
                          : "bg-white hover:bg-gray-50"
                      }
                    `}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">
                          {inv.code}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          {inv.party_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-gray-500">Date</div>
                        <div className="font-medium">
                          {formatDate(inv.invoice_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500">Total</div>
                        <div className="font-medium">
                          ৳{totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div>
                        <div className="text-gray-500">Paid</div>
                        <div className="font-medium text-green-600">
                          ৳{paidAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500">Due</div>
                        <div className="font-medium text-red-600">
                          ৳{dueAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
