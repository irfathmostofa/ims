import { useState, useCallback } from "react";
import { redxApi } from "../../src/hook/RedXApi";
import {
  type ApiError,
  type ChargeParams,
  type CreateParcelData,
  type CreateStoreData,
  type UpdateParcelData,
} from "../../src/types/redx";

export function useRedx() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(
    async <T>(request: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const result = await request();
        setLoading(false);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  return {
    loading,
    error,
    clearError: () => setError(null),

    // Parcel methods
    trackParcel: (trackingId: string) =>
      handleRequest(() => redxApi.trackParcel(trackingId)),

    getParcelInfo: (trackingId: string) =>
      handleRequest(() => redxApi.getParcelInfo(trackingId)),

    createParcel: (data: CreateParcelData) =>
      handleRequest(() => redxApi.createParcel(data)),

    updateParcel: (data: UpdateParcelData) =>
      handleRequest(() => redxApi.updateParcel(data)),

    calculateCharge: (params: ChargeParams) =>
      handleRequest(() => redxApi.calculateCharge(params)),

    // Area methods
    getAreas: () => handleRequest(() => redxApi.getAreas()),

    getAreasByPostCode: (postCode: number) =>
      handleRequest(() => redxApi.getAreasByPostCode(postCode)),

    getAreasByDistrict: (districtName: string) =>
      handleRequest(() => redxApi.getAreasByDistrict(districtName)),

    // Pickup Store methods
    createPickupStore: (data: CreateStoreData) =>
      handleRequest(() => redxApi.createPickupStore(data)),

    getPickupStores: () => handleRequest(() => redxApi.getPickupStores()),

    getPickupStoreInfo: (storeId: number) =>
      handleRequest(() => redxApi.getPickupStoreInfo(storeId)),
  };
}
