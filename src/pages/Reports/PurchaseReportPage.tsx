"use client";
import { DataTable } from "@/components/ui/dataTable";

// Dummy purchase data
type Purchase = {
  id: number;
  date: string;
  supplier: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
};

const purchaseData: Purchase[] = [
  {
    id: 1,
    date: "2025-09-02",
    supplier: "ABC Suppliers",
    product: "Laptop",
    quantity: 5,
    price: 1100,
    total: 5500,
  },
  {
    id: 2,
    date: "2025-09-04",
    supplier: "XYZ Traders",
    product: "Headphones",
    quantity: 20,
    price: 140,
    total: 2800,
  },
];

export default function PurchaseReportPage() {
  return (
    <div className="p-6 space-y-4">


      {/* Data Table */}
      <DataTable
        data={purchaseData}
        label="Purchase List"
        hiddenColumns={["id"]}
        rowsPerPage={10}
        selectable
        printHead={[
          { label: "Date", value: "date" },
          { label: "Supplier", value: "supplier" },
          { label: "Product", value: "product" },
          { label: "Quantity", value: "quantity" },
          { label: "Price", value: "price" },
          { label: "Total", value: "total" },
        ]}
      />
    </div>
  );
}
