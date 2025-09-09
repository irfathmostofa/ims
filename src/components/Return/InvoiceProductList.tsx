"use client";

export default function InvoiceProductList({
  products,
  addToReturnCart,
}: {
  products: { id: number; name: string; price: number; qty: number }[];
  addToReturnCart: (product: any) => void;
}) {
  return (
    <div className="bg-bw-50 p-4 rounded-md shadow-md">
      <h2 className="text-bw-900 font-bold mb-4">Invoice Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
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
              onClick={() => addToReturnCart(product)}
            >
              Return
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
