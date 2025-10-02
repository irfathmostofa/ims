"use client";

import { Eye, Pen, Plus, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
// import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { apiClient } from "@/hook/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type Product = {
  id: number;
  code: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  cost_price: number;
  selling_price: number;
  uom_id: number;
};

export default function AllProductsPage() {
  const router = useNavigate();
  const [loader, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/products`,
        { method: "GET", tokenType: "jwt" }
      );

      setProducts(data.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch product setup data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [update]);
  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete product "${p.name}"?`)) return;

    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/delete-products/${p.id}`,
        {
          method: "POST",
          data: { id: p.id },
          tokenType: "jwt",
        }
      );
      toast.success(data.message || "Product deleted!");
      setUpdate((prev) => prev + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete Product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumbs
        labelOverrides={{
          products: "Products",
          all: "All Products",
        }}
      />
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-bw-900">All Products</h1>
        <Link
          to="/inventory/products/add"
          className="flex items-center gap-2 btn-bw-primary"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Table */}
      <DataTable
        data={products}
        label="Products List"
        selectable
        rowsPerPage={10}
        loading={loader}
        hiddenColumns={[
          "created_by",
          "created_at",
          "updated_by",
          "updated_at",
          "uom_id",
          "id",
        ]}
        printHead={[
          { label: "code", value: "code" },
          { label: "Product Name", value: "name" },
          { label: "cost price", value: "cost_price" },
          { label: "sale price", value: "selling_price" },
        ]}
        actions={[
          {
            label: <Eye size={16} className="inline" />,
            className: "",
            title: "view",
            onClick: (row) => router(`/inventory/products/${row.id}`),
          },
          {
            label: <Pen size={16} className="inline" />,
            className: "",
            title: "update",
            onClick: (row) => router(`/inventory/products/${row.id}/edit`),
          },
          {
            label: <Trash size={16} className="inline" />,
            onClick: (row) => deleteProduct(row),
            title: "delete",
          },
        ]}
      />
    </div>
  );
}
