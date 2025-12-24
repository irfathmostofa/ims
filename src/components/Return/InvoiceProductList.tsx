"use client";

import { Button } from "@/components/ui/button";
import { Package, Info } from "lucide-react";

export default function InvoiceProductList({
  products,
  addToReturnCart,
  returnCart,
  loading,
}: {
  products: any; // Could be array or object
  addToReturnCart: (product: any) => void;
  returnCart: any[];
  loading: boolean;
}) {
  // Helper function to get returned quantity from cart
  const getReturnedQuantity = (productVariantId: number) => {
    const cartItem = returnCart.find(
      (item) => item.product_variant_id === productVariantId
    );
    return cartItem ? cartItem.quantity : 0;
  };

  // Safely get products array
  const getProductsArray = () => {
    if (!products) return [];

    // If products is already an array
    if (Array.isArray(products)) return products;

    // If products is an object with items property
    if (products.items && Array.isArray(products.items)) return products.items;

    // If products is an invoice object with items property
    if (products.items) return products.items;

    return [];
  };

  const productsArray = getProductsArray();

  // Calculate available quantity for return
  const getAvailableQuantity = (product: any) => {
    const purchasedQty = parseFloat(product.quantity) || 0;
    const returnedQty = parseFloat(product.returned_quantity) || 0;
    const alreadyInCartQty = getReturnedQuantity(product.product_variant_id);

    // Available = purchased - already returned - already in cart
    return Math.max(0, purchasedQty - returnedQty - alreadyInCartQty);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border h-full">
        <h2 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
          <Package size={18} />
          Invoice Products
        </h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!productsArray || productsArray.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border h-full">
        <h2 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
          <Package size={18} />
          Invoice Products
        </h2>
        <div className="text-gray-500 text-center p-4">
          <Info size={24} className="mx-auto mb-2 text-gray-400" />
          <p>No products found in this invoice.</p>
          <p className="text-sm mt-1">
            {typeof products === "object" && !Array.isArray(products)
              ? "Products data is in unexpected format"
              : "The invoice is empty"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white  rounded-lg shadow-md  h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-900 font-bold flex items-center gap-2">
          <Package size={18} />
          Products ({productsArray.length})
        </h2>
        <div className="text-sm text-gray-500">
          Click "Return" to add products to return cart
        </div>
      </div>

      <div className="overflow-y-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-700">
                Product Details
              </th>
              <th className="text-center p-3 font-medium text-gray-700">
                Purchased
              </th>
              <th className="text-center p-3 font-medium text-gray-700">
                Available
              </th>
              <th className="text-center p-3 font-medium text-gray-700">
                Price
              </th>
              <th className="text-center p-3 font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {productsArray.map((product: any) => {
              const purchasedQty = parseFloat(product.quantity) || 0;
              const returnedQty = parseFloat(product.returned_quantity) || 0;
              const inCartQty = getReturnedQuantity(product.product_variant_id);
              const availableQty = getAvailableQuantity(product);
              const unitPrice = parseFloat(product.unit_price) || 0;
              const subtotal = parseFloat(product.subtotal) || 0;

              return (
                <tr
                  key={product.id || product.product_variant_id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]">
                      {product.product_name || "Unnamed Product"}
                    </div>
                    {product.variant_name && (
                      <div className="text-xs text-gray-600">
                        Variant: {product.variant_name}
                      </div>
                    )}
                    {product.variant_code && (
                      <div className="text-xs text-gray-500">
                        Code: {product.variant_code}
                      </div>
                    )}
                  </td>

                  <td className="text-center p-3">
                    <div className="font-medium">{purchasedQty}</div>
                    {returnedQty > 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        Already Returned: {returnedQty}
                      </div>
                    )}
                  </td>

                  <td className="text-center p-3">
                    <div
                      className={`font-medium ${
                        availableQty > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {availableQty}
                    </div>
                    {inCartQty > 0 && (
                      <div className="text-xs text-blue-500 mt-1">
                        In Cart: {inCartQty}
                      </div>
                    )}
                    {availableQty === 0 && returnedQty === 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        All purchased
                      </div>
                    )}
                  </td>

                  <td className="text-center p-3">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        ৳{unitPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: ৳{subtotal.toFixed(2)}
                      </div>
                    </div>
                  </td>

                  <td className="text-center p-3">
                    <Button
                      size="sm"
                      onClick={() =>
                        addToReturnCart({
                          ...product,
                          available_for_return: availableQty,
                        })
                      }
                      disabled={availableQty <= 0}
                      className={`
                        ${
                          availableQty > 0
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }
                      `}
                      title={
                        availableQty > 0
                          ? `Return this product (${availableQty} available)`
                          : "No quantity available for return"
                      }
                    >
                      {availableQty > 0 ? "Return" : "Unavailable"}
                    </Button>

                    {availableQty > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Max: {availableQty}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Products: </span>
            {productsArray.length}
          </div>
          <div>
            <span className="font-medium">Items Available: </span>
            {productsArray.reduce(
              (total: number, product: any) =>
                total + getAvailableQuantity(product),
              0
            )}
          </div>
          <div>
            <span className="font-medium">In Cart: </span>
            {returnCart.reduce((total, item) => total + item.quantity, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
