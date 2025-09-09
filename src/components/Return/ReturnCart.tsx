"use client";

import { Trash2 } from "lucide-react";

export default function ReturnCart({
  cart,
  //   adjustQuantity,
  removeFromCart,
  totalRefund,
  handleConfirmReturn,
  handleClear,
}: {
  cart: any[];
  adjustQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  totalRefund: number;
  handleConfirmReturn: () => void;
  handleClear: () => void;
}) {
  return (
    <div className="w-full md:w-96 bg-bw-50 p-4 rounded-md shadow-md flex flex-col border">
      <h2 className="text-bw-900 font-bold text-xl mb-4">Return Cart</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {cart.length === 0 && (
          <p className="text-bw-500">No items in return cart.</p>
        )}
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-2 bg-bw-100 rounded-md border"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-red-600">
                Refund: ${item.price} × {item.qty} = ${item.price * item.qty}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {/* <button
                className="p-1 rounded-md hover:bg-bw-200"
                onClick={() => adjustQuantity(item.id, -1)}
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center">{item.qty}</span>
              <button
                className="p-1 rounded-md hover:bg-bw-200"
                onClick={() => adjustQuantity(item.id, 1)}
              >
                <Plus size={16} />
              </button> */}
              <button
                className="ml-2 text-red-500 px-2 py-1 hover:bg-bw-200 rounded-md"
                onClick={() => removeFromCart(item.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4 flex flex-col gap-2">
        <p className="font-bold text-lg text-red-700">
          Total Refund: ${totalRefund}
        </p>
        <div className="flex gap-2">
          <button
            className="btn-bw-primary flex-1 py-2 font-semibold"
            onClick={handleConfirmReturn}
            disabled={cart.length === 0}
          >
            Confirm Return
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white flex-1 py-2 rounded-md font-semibold"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
