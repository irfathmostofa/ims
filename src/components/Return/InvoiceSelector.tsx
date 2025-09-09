"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function InvoiceSelector({
  invoices,
  selectedInvoice,
  setSelectedInvoice,
}: {
  invoices: {
    id: string;
    customer: { name: string; phone: string };
    date?: string;
  }[];
  selectedInvoice: any | null;
  setSelectedInvoice: (inv: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer.phone.includes(search) ||
        inv.id.includes(search);

      const invDate = inv.date ? new Date(inv.date) : null;
      const matchesDate =
        !invDate ||
        ((!dateFrom || invDate >= dateFrom) && (!dateTo || invDate <= dateTo));

      return matchesSearch && matchesDate;
    });
  }, [invoices, search, dateFrom, dateTo]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border space-y-4">
      {/* Search + Date Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="search">Search Customer</Label>
          <Input
            id="search"
            placeholder="Search by name, phone or invoice no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-2 ">
        <Label>Select Invoice</Label>
        <div className="border rounded p-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-60 overflow-y-auto">
          {filteredInvoices.map((inv) => {
            const isSelected = selectedInvoice?.id === inv.id;
            const isDisabled = selectedInvoice && selectedInvoice.id !== inv.id;

            return (
              <div
                key={inv.id}
                className={`p-3 border rounded-lg transition w-full
                  ${isSelected ? "bg-blue-100 border-blue-400" : "bg-white"}
                  ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:bg-gray-50 cursor-pointer"
                  }
                `}
                onClick={() => !isDisabled && setSelectedInvoice(inv)}
              >
                <div className="font-medium truncate">
                  {inv.id} – {inv.customer.name}
                </div>
                {inv.date && (
                  <div className="text-xs text-gray-500">{inv.date}</div>
                )}
                <div className="text-xs text-gray-500">
                  {inv.customer.phone}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <p className="text-sm text-gray-500">No invoices found.</p>
      )}
    </div>
  );
}
