import type {
  ApiError,
  Area,
  ChargeParams,
  ChargeResponse,
  CreateParcelData,
  CreateStoreData,
  ParcelInfo,
  PickupStore,
  TrackingUpdate,
  UpdateParcelData,
} from "@/types/redx";

const BASE_URL = process.env.REDX_BASE_URL;

const TOKEN = process.env.REDX_TOKEN;

class RedXApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      "API-ACCESS-TOKEN": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };

        try {
          const errorData = await response.json();
          error.message = errorData.message || error.message;
          error.data = errorData;
        } catch {
          // If response is not JSON, use text
          const text = await response.text();
          if (text) error.message = text;
        }

        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw { message: error.message } as ApiError;
      }
      throw error;
    }
  }

  // Parcel Endpoints
  async trackParcel(
    trackingId: string
  ): Promise<{ tracking: TrackingUpdate[] }> {
    return this.request(`/parcel/track/${trackingId}`);
  }

  async getParcelInfo(trackingId: string): Promise<{ parcel: ParcelInfo }> {
    return this.request(`/parcel/info/${trackingId}`);
  }

  async createParcel(data: CreateParcelData): Promise<{ tracking_id: string }> {
    return this.request("/parcel", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateParcel(
    data: UpdateParcelData
  ): Promise<{ success: boolean; message: string }> {
    return this.request("/parcels", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Area Endpoints
  async getAreas(): Promise<{ areas: Area[] }> {
    return this.request("/areas");
  }

  async getAreasByPostCode(postCode: number): Promise<{ areas: Area[] }> {
    return this.request(`/areas?post_code=${postCode}`);
  }

  async getAreasByDistrict(districtName: string): Promise<{ areas: Area[] }> {
    return this.request(`/areas?district_name=${districtName}`);
  }

  // Pickup Store Endpoints
  async createPickupStore(data: CreateStoreData): Promise<PickupStore> {
    return this.request("/pickup/store", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPickupStores(): Promise<{ pickup_stores: PickupStore[] }> {
    return this.request("/pickup/stores");
  }

  async getPickupStoreInfo(
    storeId: number
  ): Promise<{ pickup_store: PickupStore }> {
    return this.request(`/pickup/store/info/${storeId}`);
  }

  // Charge Calculation
  async calculateCharge(params: ChargeParams): Promise<ChargeResponse> {
    const query = new URLSearchParams({
      delivery_area_id: params.delivery_area_id.toString(),
      pickup_area_id: params.pickup_area_id.toString(),
      cash_collection_amount: params.cash_collection_amount.toString(),
      weight: params.weight.toString(),
    });

    return this.request(`/charge/charge_calculator?${query}`);
  }
}

export const redxApi = new RedXApi();
