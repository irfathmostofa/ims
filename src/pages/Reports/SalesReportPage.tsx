"use client";

import { DataTable } from "@/components/ui/dataTable";

type Sale = {
  id: number;
  date: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
};

// Dummy sales data
const salesData: Sale[] = [
  {
    id: 1,
    date: "2025-09-01",
    customer: "John Doe",
    product: "Laptop",
    quantity: 2,
    price: 1200,
    total: 2400,
  },
  {
    id: 2,
    date: "2025-09-03",
    customer: "Jane Smith",
    product: "Headphones",
    quantity: 3,
    price: 150,
    total: 450,
  },
];

export default function SalesReportPage() {
  return (
    <div className="p-6 space-y-4">


      {/* Data Table */}
      <div>
        <DataTable
          data={salesData}
          label="Sales List"
          hiddenColumns={["id"]}
          rowsPerPage={10}
          printHead={[
            { label: "Date", value: "date" },
            { label: "Customer", value: "customer" },
            { label: "Product", value: "product" },
            { label: "Quantity", value: "quantity" },
            { label: "Price", value: "price" },
            { label: "Total", value: "total" },
          ]}
        />
      </div>
    </div>
  );
}
