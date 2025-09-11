"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useParams } from "react-router-dom";
import { products as demoProducts } from "@/data/dummyProducts";

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
  const barcodeRefs = useRef<SVGSVGElement[]>([]);

  // Fetch product from dummy data
  useEffect(() => {
    if (!id) return;
    const prod = demoProducts.find((p) => p.id === Number(id)) || null;
    setProduct(prod);
  }, [id]);

  // Generate barcodes
  useEffect(() => {
    if (product) {
      barcodeRefs.current.forEach((ref) => {
        if (ref) {
          JsBarcode(ref, product.barcode, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
          });
        }
      });
    }
  }, [product, copies]);

  //   const downloadBarcode = (index: number) => {
  //     const svg = barcodeRefs.current[index];
  //     if (!svg || !product) return;

  //     const serializer = new XMLSerializer();
  //     const source = serializer.serializeToString(svg);
  //     const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  //     const url = URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `${product.barcode}-${index + 1}.svg`;
  //     link.click();
  //     URL.revokeObjectURL(url);
  //   };

  if (!product)
    return (
      <p className="p-6 text-center text-bw-700">
        Product not found or loading...
      </p>
    );

  // Calculate rows needed (10 per row)
  //   const rows = Math.ceil(copies / 10);

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

          {/* Barcode Sheet: 10 per row */}
          {/* <div className="mt-4 space-y-4">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-wrap gap-4"
                style={{ pageBreakInside: "avoid" }}
              >
                {Array.from({ length: 10 }).map((_, colIdx) => {
                  const index = rowIdx * 10 + colIdx;
                  if (index >= copies) return null;
                  return (
                    <div
                      key={colIdx}
                      className="p-2 border rounded flex flex-col items-center w-[8%]"
                    >
                      <svg ref={(el) => (barcodeRefs.current[index] = el!)} />
                      <span className="text-xs mt-1">{product.barcode}</span>
                      <Button
                        className="mt-1"
                        onClick={() => downloadBarcode(index)}
                      >
                        Download
                      </Button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div> */}
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
    </div>
  );
}
