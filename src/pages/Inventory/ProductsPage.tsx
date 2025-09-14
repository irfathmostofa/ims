"use client";

import { Eye, Pen, Plus, Trash } from "lucide-react";
import { products } from "@/data/dummyProducts";
import { DataTable } from "@/components/ui/dataTable";
// import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AllProductsPage() {
  const router = useNavigate();

  return (
    <div className="">
      {/* Header */}
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
        hiddenColumns={["details", "barcode", "id"]}
        printHead={[
          { label: "Product Name", value: "name" },
          { label: "Price ($)", value: "price" },
          { label: "Stock", value: "stock" },
        ]}
        actions={[
          {
            label: <Eye size={16} className="inline" />,
            className: "",
            onClick: (row) => router(`/inventory/products/${row.id}`),
          },
          {
            label: <Pen size={16} className="inline" />,
            className: "",
            onClick: (row) => router(`/inventory/products/${row.id}/edit`),
          },
          {
            label: <Trash size={16} className="inline" />,
            className: " ",
            onClick: (row) => alert(`Delete ${row.name}`),
          },
        ]}
      />
      <div id="Products List" className="hidden">
        <h1 className="text-xl font-bold mb-2">Product Report</h1>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">${p.price}</td>
                <td className="border p-2">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
