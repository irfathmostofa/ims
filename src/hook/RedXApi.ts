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

    // Default headers - most endpoints use these
    const defaultHeaders = {
      "API-ACCESS-TOKEN": `Bearer ${TOKEN}`,
      ...(options.method !== "GET" && options.method !== "DELETE"
        ? { "Content-Type": "application/json" }
        : {}),
    };

    console.log("RedX API Request:", {
      url,
      method: options.method,
      headers: defaultHeaders,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        cache: "no-cache",
      });

      console.log(
        "RedX API Response Status:",
        response.status,
        response.statusText
      );

      // Get the response as text first
      const responseText = await response.text();
      console.log(
        "RedX API Raw Response:",
        responseText.substring(0, 500) +
          (responseText.length > 500 ? "..." : "")
      );

      let data: any;

      // Try to parse as JSON if there's content
      if (responseText && responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("JSON Parse Error:", jsonError);
          console.error("Response text:", responseText);

          // If it's not JSON but we got a successful response, treat as string message
          if (response.ok) {
            data = { message: responseText };
          } else {
            data = {
              error:
                responseText ||
                `HTTP ${response.status}: ${response.statusText}`,
            };
          }
        }
      } else if (response.ok) {
        // Empty successful response
        data = {};
      } else {
        // Empty error response
        data = {
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          data: data,
        };

        // Extract error message from various possible response formats
        if (data.message) {
          error.message = data.message;
        } else if (data.error) {
          error.message = data.error;
        } else if (typeof data === "string") {
          error.message = data;
        } else if (data.errors && Array.isArray(data.errors)) {
          error.message = data.errors.join(", ");
        } else if (data.detail) {
          error.message = data.detail;
        }

        console.error("RedX API Error Details:", {
          error,
          url,
          status: response.status,
          responseData: data,
        });

        throw error;
      }

      console.log("RedX API Success Response:", data);
      return data;
    } catch (error) {
      console.error("RedX API Request Failed:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw {
          message: "Network error. Please check your connection.",
          status: 0,
          name: "NetworkError",
        } as ApiError;
      }

      if (error && typeof error === "object" && "message" in error) {
        throw error as ApiError;
      }

      throw {
        message: "Unknown API error occurred",
        status: 500,
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

      // Test with the simplest endpoint
      const data = await this.request<{ areas: Area[] }>("/areas");

      return {
        success: true,
        message: `API connection successful. Found ${
          data.areas?.length || 0
        } areas.`,
        data: data,
      };
    } catch (error: any) {
      console.error("Connection Test Error:", error);
      return {
        success: false,
        message: error.message || "Connection test failed",
      };
    }
  }

  // Parcel Endpoints - FIXED based on documentation
  async trackParcel(
    trackingId: string
  ): Promise<{ tracking: TrackingUpdate[] }> {
    console.log("Tracking parcel:", trackingId);
    // Documentation shows endpoint: /parcel/track/<:parcel_id>
    return this.request(`/parcel/track/${trackingId}`);
  }

  async getParcelInfo(trackingId: string): Promise<{ parcel: ParcelInfo }> {
    console.log("Getting parcel info:", trackingId);
    // Documentation shows endpoint: /parcel/info/<:tracking_id>
    return this.request(`/parcel/info/${trackingId}`);
  }

  async createParcel(data: CreateParcelData): Promise<{ tracking_id: string }> {
    console.log("Creating parcel:", data);

    // According to documentation, all fields except merchant_invoice_id, instruction, type, and parcel_details_json are required
    // Also note: cash_collection_amount and parcel_weight are strings in docs
    const payload = {
      ...data,
      // Ensure required string fields
      cash_collection_amount: data.cash_collection_amount.toString(),
      parcel_weight: data.parcel_weight.toString(),
      value: data.value?.toString() || "0",
    };

    return this.request("/parcel", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateParcel(
    data: UpdateParcelData
  ): Promise<{ success: boolean; message: string }> {
    console.log("Updating parcel:", data);
    // Documentation shows endpoint: /parcels (not /parcel)
    return this.request("/parcels", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Area Endpoints
  async getAreas(params?: {
    post_code?: number;
    district_name?: string;
  }): Promise<{ areas: Area[] }> {
    console.log("Getting areas...", params);

    let endpoint = "/areas";
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.post_code)
        queryParams.append("post_code", params.post_code.toString());
      if (params.district_name)
        queryParams.append("district_name", params.district_name);

      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }

    return this.request(endpoint);
  }

  async getAreasByPostCode(postCode: number): Promise<{ areas: Area[] }> {
    console.log("Getting areas by post code:", postCode);
    return this.request(`/areas?post_code=${postCode}`);
  }

  async getAreasByDistrict(districtName: string): Promise<{ areas: Area[] }> {
    console.log("Getting areas by district:", districtName);
    return this.request(
      `/areas?district_name=${encodeURIComponent(districtName)}`
    );
  }

  // Pickup Store Endpoints - NOTE: Some might need form data
  async createPickupStore(data: CreateStoreData): Promise<PickupStore> {
    console.log("Creating pickup store:", data);

    // According to sample request in docs, this might need form data
    // The sample uses --data instead of --data-raw
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

    // Documentation shows all parameters are required
    const query = new URLSearchParams({
      delivery_area_id: params.delivery_area_id.toString(),
      pickup_area_id: params.pickup_area_id.toString(),
      cash_collection_amount: params.cash_collection_amount.toString(),
      weight: params.weight.toString(),
    });

    return this.request(`/charge/charge_calculator?${query}`);
  }

  // Utility method to format error messages for display
  formatErrorMessage(error: ApiError): string {
    if (error.status === 401) {
      return "Authentication failed. Please check your API token.";
    } else if (error.status === 403) {
      return "Access denied. You don't have permission to perform this action.";
    } else if (error.status === 404) {
      return "The requested resource was not found.";
    } else if (error.status === 422) {
      return (
        "Validation error: " +
        (error.message || "Please check your input data.")
      );
    } else if (error.status === 429) {
      return "Too many requests. Please try again later.";
    } else if (error.status && error.status >= 500) {
      return "Server error. Please try again later.";
    } else if (error.message) {
      return error.message;
    }

    return "An unexpected error occurred.";
  }
}

export const redxApi = new RedXApi();
