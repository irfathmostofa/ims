"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { products as demoProducts } from "@/data/dummyProducts";
import Barcode from "react-barcode";
import { printView } from "@/components/utils/print";
type Product = {
  id: number;
  name: string;
  category: string;
  unit?: string;
  price: number;
  stock: number;
  barcode: string;
  images?: string[];
  brand?: string;
  branch?: string;
  details?: string;
};

export default function ProductViewPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [copies, setCopies] = useState(20); // default number of barcode copies
  // Fetch product from dummy data
  useEffect(() => {
    if (!id) return;
    const prod = demoProducts.find((p) => p.id === Number(id)) || null;
    setProduct(prod);
  }, [id]);

  if (!product)
    return (
      <p className="p-6 text-center text-bw-700">
        Product not found or loading...
      </p>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Product Name */}
      <h1 className="text-3xl font-bold text-bw-900">{product.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Details + Barcode Sheet */}
        <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
          <h2 className="text-xl font-semibold text-bw-800">Product Details</h2>

          <div className="space-y-1 text-bw-700">
            <p>
              <strong>Category:</strong> {product.category}
            </p>
            {product.brand && (
              <p>
                <strong>Brand:</strong> {product.brand}
              </p>
            )}
            {product.branch && (
              <p>
                <strong>Branch:</strong> {product.branch}
              </p>
            )}
            {product.unit && (
              <p>
                <strong>Unit:</strong> {product.unit}
              </p>
            )}
            <p>
              <strong>Price:</strong> ${product.price}
            </p>
            <p>
              <strong>Stock:</strong> {product.stock}
            </p>
            {product.details && (
              <p>
                <strong>Details:</strong> {product.details}
              </p>
            )}
            <p>
              <strong>Barcode:</strong> {product.barcode}
            </p>
          </div>

          {/* Barcode Controls */}
          <div className="mt-4 space-y-2">
            <div className="flex gap-2 items-center justify-between">
              <div>
                <label className="block font-medium">
                  Number of Barcode Copies:
                </label>
                <input
                  type="number"
                  min={1}
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="border rounded px-3 py-1 w-24"
                />
              </div>
              <button
                onClick={() => {
                  setTimeout(() => {
                    printView("barcodeArea");
                  }, 1000);
                }}
                className="btn-bw-primary text-white rounded "
              >
                Print
              </button>
            </div>

            {/* {copies.map((_id) => (
              <Barcode key={_id} value={product.barcode} />
            ))} */}
            <Barcode value={product.barcode} />
          </div>
        </div>

        {/* Right: Product Images */}
        <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
          <h2 className="text-xl font-semibold text-bw-800">Product Images</h2>
          {product.images && product.images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Product Image ${idx + 1}`}
                  className="h-32 w-32 object-cover rounded-md border"
                />
              ))}
            </div>
          ) : (
            <p className="text-bw-600">No images available.</p>
          )}
        </div>
      </div>
      <div id="barcodeArea" className="hidden">
        <h1 className="text-xl font-bold mb-2">{product.name} barcode</h1>
        <div className="grid grid-cols-4 gap-4 items-center">
          {[...Array(copies)].map((_, idx) => (
            <Barcode key={idx} value={product.barcode} className=" m-3 h-20" />
          ))}
        </div>
      </div>
    </div>
  );
}
