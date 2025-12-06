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

// IMPORTANT: Use environment variables properly
const BASE_URL =
  import.meta.env.VITE_REDX_BASE_URL ||
  "https://sandbox.redx.com.bd/v1.0.0-beta";
const TOKEN =
  import.meta.env.VITE_REDX_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

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

    console.log("RedX API Request:", { url, method: options.method, headers });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors", // Important for CORS requests
        cache: "no-cache",
      });

      console.log(
        "RedX API Response Status:",
        response.status,
        response.statusText
      );

      // First, get the response as text
      const responseText = await response.text();
      console.log(
        "RedX API Raw Response:",
        responseText.substring(0, 200) + "..."
      );

      let data: any;

      // Try to parse as JSON if it looks like JSON
      if (
        responseText.trim().startsWith("{") ||
        responseText.trim().startsWith("[")
      ) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("JSON Parse Error:", jsonError);
          console.error("Problematic JSON string:", responseText);

          // If it's not valid JSON, return the text
          data = { message: responseText, raw: responseText };
        }
      } else {
        // If it's not JSON, return as text
        data = { message: responseText, raw: responseText };
      }

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          data: data,
        };

        // Try to extract error message from various response formats
        if (data.message) {
          error.message = data.message;
        } else if (data.error) {
          error.message = data.error;
        } else if (typeof data === "string") {
          error.message = data;
        } else if (data.raw && typeof data.raw === "string") {
          error.message = data.raw.substring(0, 100); // Limit error message length
        }

        console.error("RedX API Error:", error);
        throw error;
      }

      console.log("RedX API Success Response:", data);
      return data;
    } catch (error) {
      console.error("RedX API Request Failed:", error);

      if (error instanceof Error) {
        throw {
          message: error.message,
          name: error.name,
        } as ApiError;
      }

      throw {
        message: "Unknown API error occurred",
      } as ApiError;
    }
  }

  // Helper to debug API issues
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log("Testing RedX API Connection...");
      console.log("Base URL:", BASE_URL);
      console.log("Token exists:", !!TOKEN);
      console.log("Token first 20 chars:", TOKEN.substring(0, 20) + "...");

      // First try a simple HEAD request to check connectivity
      const testUrl = `${BASE_URL}/areas`;
      console.log("Testing URL:", testUrl);

      const response = await fetch(testUrl, {
        method: "HEAD",
        headers: {
          "API-ACCESS-TOKEN": `Bearer ${TOKEN}`,
        },
      });

      console.log(
        "Connection Test Status:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        // Then make actual API call
        const data = await this.request<{ areas: Area[] }>("/areas");
        return {
          success: true,
          message: "API connection successful",
          data: data,
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`,
        };
      }
    } catch (error: any) {
      console.error("Connection Test Error:", error);
      return {
        success: false,
        message: error.message || "Connection test failed",
      };
    }
  }

  // Parcel Endpoints
  async trackParcel(
    trackingId: string
  ): Promise<{ tracking: TrackingUpdate[] }> {
    console.log("Tracking parcel:", trackingId);
    return this.request(`/parcel/track/${trackingId}`);
  }

  async getParcelInfo(trackingId: string): Promise<{ parcel: ParcelInfo }> {
    console.log("Getting parcel info:", trackingId);
    return this.request(`/parcel/info/${trackingId}`);
  }

  async createParcel(data: CreateParcelData): Promise<{ tracking_id: string }> {
    console.log("Creating parcel:", data);
    return this.request("/parcel", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateParcel(
    data: UpdateParcelData
  ): Promise<{ success: boolean; message: string }> {
    console.log("Updating parcel:", data);
    return this.request("/parcels", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Area Endpoints
  async getAreas(): Promise<{ areas: Area[] }> {
    console.log("Getting areas...");
    return this.request("/areas");
  }

  async getAreasByPostCode(postCode: number): Promise<{ areas: Area[] }> {
    console.log("Getting areas by post code:", postCode);
    return this.request(`/areas?post_code=${postCode}`);
  }

  async getAreasByDistrict(districtName: string): Promise<{ areas: Area[] }> {
    console.log("Getting areas by district:", districtName);
    return this.request(`/areas?district_name=${districtName}`);
  }

  // Pickup Store Endpoints
  async createPickupStore(data: CreateStoreData): Promise<PickupStore> {
    console.log("Creating pickup store:", data);
    return this.request("/pickup/store", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPickupStores(): Promise<{ pickup_stores: PickupStore[] }> {
    console.log("Getting pickup stores...");
    return this.request("/pickup/stores");
  }

  async getPickupStoreInfo(
    storeId: number
  ): Promise<{ pickup_store: PickupStore }> {
    console.log("Getting pickup store info:", storeId);
    return this.request(`/pickup/store/info/${storeId}`);
  }

  // Charge Calculation
  async calculateCharge(params: ChargeParams): Promise<ChargeResponse> {
    console.log("Calculating charge:", params);
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
