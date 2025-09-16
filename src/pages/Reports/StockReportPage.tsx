"use client";

import { DataTable } from "@/components/ui/dataTable";
import { products } from "@/data/dummyProducts"; // Your product inventory

export default function StockReportPage() {
  return (
    <div className="p-6 space-y-4">

      {/* Dynamic Data Table */}
      <DataTable
        data={products}
        label="Stock List"
        hiddenColumns={["details"]}
        rowsPerPage={10}
        selectable
        printHead={[
          { label: "Product", value: "name" },
          { label: "Category", value: "category" },
          { label: "Brand", value: "brand" },
          { label: "Stock", value: "stock" },
          { label: "Price", value: "price" },
          { label: "Branch", value: "branch" },
        ]}
      />
    </div>
  );
}
