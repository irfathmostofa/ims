"use client";

import { Eye, Pen, Plus, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { apiClient } from "@/hook/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Image = {
  id: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  code: string;
  image: string;
  is_primary: boolean;
};

type Product = {
  id: number;
  code: string;
  name: string;
  description: string;
  cost_price: number | string;
  selling_price: number | string;
  status: string;
  uom_name: string;
  images: Image[] | null;
  categories: Category[] | null;
  total_stock: number | string;
  badge: string | null;
  rating: number | null;
  review_count: number | null;
  total_sales: number | string;
  primary_variant_id: number | null;
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
        `${import.meta.env.VITE_SERVER}/product/get-all-products`,
        {
          method: "POST",
          data: { page: 1, limit: 10 },
          tokenType: "jwt",
        }
      );

      setProducts(data.data.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [update]);
  // console.log(products);
  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete product "${p.name}"?`)) return;

    try {
      setLoading(true);
      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/delete-products/${p.id}`,
        {
          method: "POST",
          data: { id: p.id },
          tokenType: "jwt",
        }
      );
      toast.success(result.message || "Product deleted!");
      setUpdate((prev) => prev + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete product");
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

      <DataTable
        data={products}
        label="Products List"
        selectable
        rowsPerPage={10}
        loading={loader}
        hiddenColumns={[
          "id",
          "primary_variant_id",
          "description",
          "images",
          "categories",
          "badge",
          "rating",
          "review_count",
          "total_stock",
        ]}
        printHead={[
          { label: "Code", value: "code" },
          { label: "Product Name", value: "name" },
          { label: "UOM", value: "uom_name" },
          { label: "Cost Price", value: "cost_price" },
          { label: "Selling Price", value: "selling_price" },
          { label: "Stock", value: "total_stock" },
          { label: "Status", value: "status" },
        ]}
        actions={[
          {
            label: <Eye size={16} className="inline" />,
            className: "",
            title: "View",
            onClick: (row) => router(`/inventory/products/${row.id}`),
          },
          {
            label: <Pen size={16} className="inline" />,
            className: "",
            title: "Edit",
            onClick: (row) => router(`/inventory/products/${row.id}/edit`),
          },
          {
            label: <Trash size={16} className="inline" />,
            onClick: (row) => deleteProduct(row),
            title: "Delete",
          },
        ]}
      />
    </div>
  );
}
