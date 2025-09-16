"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/dataTable";

// Dummy data
const sales = [
  { description: "Laptop Sale", total: 2400, date: "2025-09-01" },
  { description: "Headphones Sale", total: 450, date: "2025-09-03" },
];

const purchases = [
  { description: "Laptop Purchase", total: 5500, date: "2025-09-02" },
  { description: "Headphones Purchase", total: 2800, date: "2025-09-04" },
];

export default function ProfitabilityReport() {
  // Calculate totals
  const totalSales = useMemo(() => sales.reduce((a, b) => a + b.total, 0), []);
  const totalPurchases = useMemo(
    () => purchases.reduce((a, b) => a + b.total, 0),
    []
  );
  const grossProfit = totalSales - totalPurchases;

  // Prepare dynamic table data
  const reportData = [
    { description: "Total Sales", amount: totalSales },
    { description: "Total Purchases", amount: totalPurchases },
    { description: "Gross Profit", amount: grossProfit },
  ];

  return (
    <div className="p-6">
      <DataTable
        data={reportData}
        label="Profitability Report"
        rowsPerPage={10}
        printHead={[
          { label: "Description", value: "description" },
          { label: "Amount", value: "amount" },
        ]}
      />
    </div>
  );
}
