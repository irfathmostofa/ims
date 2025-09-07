"use client";

import { Plus, Minus } from "lucide-react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function Cart({
  cart,
  adjustQuantity,
  removeFromCart,
  total,
  handleSave,
  handleClear,
}: {
  cart: CartItem[];
  adjustQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  total: number;
  handleSave: () => void;
  handleClear: () => void;
}) {
  return (
    <div className="w-full md:w-96 bg-bw-50 p-4 rounded-md shadow-md flex flex-col border ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-bw-900 font-bold mb-4 text-xl flex-3">Cart</h2>{" "}
        <button
          className="bg-red-500 hover:bg-red-600 text-white flex-1 py-2 rounded-md font-semibold"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {cart.length === 0 && (
          <p className="text-bw-500">No items in the cart.</p>
        )}
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-2 bg-bw-100 rounded-md"
          >
            <div>
              <p className="text-bw-800 font-medium">{item.name}</p>
              <p className="text-bw-700 text-sm">
                ${item.price} x {item.quantity} = ${item.price * item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded-md hover:bg-bw-200"
                onClick={() => adjustQuantity(item.id, -1)}
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                className="p-1 rounded-md hover:bg-bw-200"
                onClick={() => adjustQuantity(item.id, 1)}
              >
                <Plus size={16} />
              </button>
              <button
                className="ml-2 text-red-500 font-bold px-2 py-1 hover:bg-bw-200 rounded-md"
                onClick={() => removeFromCart(item.id)}
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-bw-200 pt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            className="btn-bw-primary flex-1 py-2 text-lg font-semibold"
            disabled={cart.length === 0}
            onClick={handleSave}
          >
            Save
          </button>

          <button
            className="bg-green-500 hover:bg-green-600 text-white flex-1 py-2 rounded-md font-semibold"
            onClick={handleClear}
          >
            New
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-bw-primary flex-1 py-2 text-lg font-semibold"
            onClick={handleSave}
          >
            Pay ${total}
          </button>
        </div>
      </div>
    </div>
  );
}
