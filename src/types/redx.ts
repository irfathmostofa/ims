// Base Types
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Parcel Types
export interface TrackingUpdate {
  message_en: string;
  message_bn: string;
  time: string;
}

export interface ParcelInfo {
  tracking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: string;
  delivery_area_id: number;
  charge: number;
  cash_collection_amount: number;
  parcel_weight: number;
  merchant_invoice_id?: string;
  status: string;
  instruction?: string;
  created_at: string;
  delivery_type: string;
  value: string;
  pickup_location: {
    id: number;
    name: string;
    address: string;
    area_name: string;
    area_id: number;
  };
}

export interface CreateParcelData {
  customer_name: string;
  customer_phone: string;
  delivery_area: string;
  delivery_area_id: number;
  customer_address: string;
  cash_collection_amount: string;
  parcel_weight: number;
  merchant_invoice_id?: string;
  instruction?: string;
  value?: string;
  is_closed_box?: string;
  pickup_store_id?: number;
  parcel_details_json?: Array<{
    name: string;
    category: string;
    value: number;
    quantity?: number;
    weight?: number;
  }>;
}

export interface UpdateParcelData {
  entity_type: "parcel-tracking-id";
  entity_id: string;
  update_details: {
    property_name: string;
    new_value: string;
    reason?: string;
  };
}

// Area Types
export interface Area {
  id: number;
  name: string;
  post_code: number;
  division_name: string;
  zone_id: number;
}

// Pickup Store Types
export interface PickupStore {
  id: number;
  name: string;
  address: string;
  area_name: string;
  area_id: number;
  phone: string;
  created_at?: string;
}

export interface CreateStoreData {
  name: string;
  phone: string;
  address: string;
  area_id: number;
}

// Charge Calculation Types
export interface ChargeParams {
  delivery_area_id: number;
  pickup_area_id: number;
  cash_collection_amount: number;
  weight: number;
}

export interface ChargeResponse {
  deliveryCharge: number;
  codCharge: number;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  weight?: number;
  image?: string;
  description?: string;
}

export interface ParcelItem {
  id: string;
  name: string;
  category: string;
  value: number;
  quantity: number;
  weight: number;
  sku?: string;
  brand?: string;
  image?: string;
}
