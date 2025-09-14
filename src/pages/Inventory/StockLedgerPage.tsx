"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/dataTable";
import { Input } from "@/components/ui/input";

// type StockTransaction = {
//   id: number;
//   product: string;
//   date: string;
//   type: "IN" | "OUT";
//   qty: number;
// };

export default function StockLedgerPage() {
  const transactions = [
    { id: 1, product: "Laptop", date: "2025-09-01", type: "IN", qty: 10 },
    { id: 2, product: "Laptop", date: "2025-09-05", type: "OUT", qty: 2 },
    { id: 3, product: "Mouse", date: "2025-09-03", type: "IN", qty: 20 },
    { id: 4, product: "Laptop", date: "2025-09-10", type: "OUT", qty: 1 },
  ];

  const [filter, setFilter] = useState({
    product: "",
    fromDate: "",
    toDate: "",
  });

  // ✅ Filtered transactions
  const filteredData = useMemo(() => {
    let data = [...transactions];
    if (filter.product)
      data = data.filter((t) =>
        t.product.toLowerCase().includes(filter.product.toLowerCase())
      );
    if (filter.fromDate) data = data.filter((t) => t.date >= filter.fromDate);
    if (filter.toDate) data = data.filter((t) => t.date <= filter.toDate);
    return data;
  }, [transactions, filter]);

  // ✅ Calculate balance for each product
  const balanceMap: Record<string, number> = {};
  const dataWithBalance = filteredData.map((t) => {
    const prevBalance = balanceMap[t.product] || 0;
    const newBalance =
      t.type === "IN" ? prevBalance + t.qty : prevBalance - t.qty;
    balanceMap[t.product] = newBalance;
    return { ...t, balance: newBalance };
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Stock Ledger</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 p-4 border rounded-lg bg-gray-50">
        <Input
          placeholder="Product Name"
          value={filter.product}
          onChange={(e) => setFilter({ ...filter, product: e.target.value })}
        />
        <Input
          type="date"
          placeholder="From Date"
          value={filter.fromDate}
          onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
        />
        <Input
          type="date"
          placeholder="To Date"
          value={filter.toDate}
          onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
        />
      </div>

      {/* Stock Ledger Table */}
      <DataTable
        data={dataWithBalance}
        label="Stock Ledger"
        hiddenColumns={["id"]}
        rowsPerPage={10}
        printHead={[
          { label: "Product", value: "product" },
          { label: "Date", value: "date" },
          { label: "Type", value: "type" },
          { label: "Quantity", value: "qty" },
          { label: "Balance", value: "balance" },
        ]}
        actions={[]}
      />
    </div>
  );
}
