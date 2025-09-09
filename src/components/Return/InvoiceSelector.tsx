"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    date?: string; // e.g., "2025-09-08"
  }[];
  selectedInvoice: any | null;
  setSelectedInvoice: (inv: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer.phone.includes(search);

      const invDate = inv.date ? new Date(inv.date) : null;
      const matchesDate =
        !invDate ||
        ((!dateFrom || invDate >= dateFrom) && (!dateTo || invDate <= dateTo));

      return matchesSearch && matchesDate;
    });
  }, [invoices, search, dateFrom, dateTo]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Select Invoice</h2>

      {/* Search by customer */}
      <div className="space-y-2 flex gap-2">
        <div className="flex-2  space-y-2">
          <Label htmlFor="search">Search Customer</Label>
          <Input
            id="search"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
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

        <div className="flex-1  space-y-2">
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

      {/* Invoice dropdown */}
      <div className="space-y-2">
        <Label>Select Invoice</Label>
        <Select
          value={selectedInvoice?.id || ""}
          onValueChange={(val) =>
            setSelectedInvoice(invoices.find((inv) => inv.id === val) || null)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="-- Choose Invoice --" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto bg-white" >
            {filteredInvoices.map((inv) => (
              <SelectItem key={inv.id} value={inv.id}>
                {inv.id} – {inv.customer.name} {inv.date ? `(${inv.date})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredInvoices.length === 0 && (
        <p className="text-sm text-gray-500">No invoices found.</p>
      )}
    </div>
  );
}
