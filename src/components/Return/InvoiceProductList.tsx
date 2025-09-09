"use client";

import { useState } from "react";

export default function InvoiceProductList({
  products,
  addToReturnCart,
}: {
  products: { id: number; name: string; price: number; qty: number }[];
  addToReturnCart: (product: any) => void;
}) {
  const [remainingProducts, setRemainingProducts] = useState(products);

  const handleReturn = (product: any) => {
    addToReturnCart(product);

    setRemainingProducts(
      (prev) =>
        prev
          .map((p) => (p.id === product.id ? { ...p, qty: p.qty - 1 } : p))
          .filter((p) => p.qty > 0) // remove if qty is 0
    );
  };

  return (
    <div className="bg-bw-50 p-4 rounded-md shadow-md w-full border">
      <h2 className="text-bw-900 font-bold mb-4">Invoice Products</h2>

      {remainingProducts.length === 0 ? (
        <p className="text-sm text-bw-600">All products returned ✅</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {remainingProducts.map((product) => (
            <div
              key={product.id}
              className="p-3 bg-bw-100 rounded-md flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-bw-800">{product.name}</p>
                <p className="text-sm text-bw-600">
                  ${product.price} × {product.qty}
                </p>
              </div>
              <button
                className="btn-bw-primary px-3 py-1"
                onClick={() => handleReturn(product)}
              >
                Return
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
