"use client";

import { DataTable } from "@/components/ui/dataTable";
import { formatDate } from "@/components/utils/formatter";
import { apiClient } from "@/hook/apiClient";
import { useEffect, useState } from "react";

export default function SalesReportPage() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };
  const fetchSalesData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/get-All-invoices`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            page: page,
            limit: limit,
          },
        },
      );
      console.log(result);
      if (result.success) {
        setSalesData(result.data);
        setPagination({
          currentPage: result.pagination.page,
          totalPages: result.pagination.total_pages,
          total: result.pagination.total,
          limit: result.pagination.limit,
        });
      } else {
        console.error("API error:", result.message);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSalesData(pagination.currentPage, pagination.limit);
  }, []);

  return (
    <div className="p-6 space-y-4">
      {/* Data Table */}
      <div>
        <DataTable
          data={salesData}
          label="Sales List"
          pagination
          rowsPerPage={pagination.limit}
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          loading={loading}
          showColumns={[
            { key: "id", label: "ID" },
            { key: "party_name", label: "Customer" },
            { key: "paid_amount", label: "Paid" },
            { key: "total_amount", label: "Total" },
            { key: "branch_name", label: "Branch" },
            { key: "invoice_date", label: "Date" },
          ]}
          printHead={[
            { label: "Date", value: "date" },
            { label: "Customer", value: "customer" },
            { label: "Product", value: "product" },
            { label: "Quantity", value: "quantity" },
            { label: "Price", value: "price" },
            { label: "Total", value: "total" },
          ]}
          columnFormats={{
            invoice_date: (value: string) => formatDate(value),
          }}
        />
      </div>
    </div>
  );
}
