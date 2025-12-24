// types/return.ts
export type InvoiceItem = {
  id: number;
  product_variant_id: number;
  variant_name: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  returned_quantity: number;
  available_for_return: number;
  can_return: boolean;
};

export type Invoice = {
  id: number;
  code: string;
  branch_id: number;
  party_id: number;
  type: string;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  branch_name: string;
  party_name: string;
  party_phone: string;
  party_address: string;
  items: InvoiceItem[];
  total_returned_amount?: number;
};

export type ReturnCartItem = {
  id: number;
  product_variant_id: number;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  invoice_item_id?: number;
};
