import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { redxApi } from "@/hook/RedXApi";
import type { ParcelInfo, TrackingUpdate } from "@/types/redx";

export const TrackingTab = () => {
  const [trackingId, setTrackingId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [trackingData, setTrackingData] = useState<TrackingUpdate[]>([]);
  const [parcelInfo, setParcelInfo] = useState<ParcelInfo | null>(null);

  const handleTrackParcel = async () => {
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    try {
      const [infoResponse, trackingResponse] = await Promise.all([
        redxApi.getParcelInfo(trackingId),
        redxApi.trackParcel(trackingId),
      ]);

      setParcelInfo(infoResponse.parcel);
      setTrackingData(trackingResponse.tracking);
      toast.success("Parcel information loaded");
    } catch (error: any) {
      console.error("Tracking failed:", error);
      toast.error(error.message || "Failed to track parcel");
      setParcelInfo(null);
      setTrackingData([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode }
    > = {
      "pickup-pending": {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock size={12} />,
      },
      "picked-up": {
        color: "bg-blue-100 text-blue-800",
        icon: <Truck size={12} />,
      },
      "in-transit": {
        color: "bg-purple-100 text-purple-800",
        icon: <Navigation size={12} />,
      },
      delivered: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={12} />,
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle size={12} />,
      },
      returned: {
        color: "bg-gray-100 text-gray-800",
        icon: <AlertCircle size={12} />,
      },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: <AlertCircle size={12} />,
    };

    return (
      <div
        className={`${config.color} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
      >
        {config.icon}
        {status.replace("-", " ").toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck size={20} />
            Track Parcel
          </CardTitle>
          <CardDescription>
            Enter tracking ID to get real-time parcel status and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tracking Input */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter RedX Tracking ID (e.g., 21A427TU4BN3R)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="text-lg bg-white"
                />
              </div>
              <Button
                onClick={handleTrackParcel}
                disabled={loading}
                className="bg-[#003333] hover:bg-[#002222] text-white"
              >
                {loading ? "Tracking..." : "Track Parcel"}
              </Button>
            </div>

            {/* Parcel Information */}
            {parcelInfo && (
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Parcel Information</h3>
                    <div>{getStatusBadge(parcelInfo.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700">
                        Customer Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">
                            {parcelInfo.customer_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">
                            {parcelInfo.customer_phone}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-right">
                            {parcelInfo.customer_address}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-gray-700">
                        Parcel Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Area:</span>
                          <span className="font-medium">
                            {parcelInfo.delivery_area}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight:</span>
                          <span className="font-medium">
                            {parcelInfo.parcel_weight}g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">COD Amount:</span>
                          <span className="font-medium text-green-600">
                            ৳{parcelInfo.cash_collection_amount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Delivery Charge:
                          </span>
                          <span className="font-medium">
                            ৳{parcelInfo.charge}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tracking History */}
            {trackingData.length > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Tracking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingData.map((update, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0 ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          {index < trackingData.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{update.message_en}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {update.message_bn}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 whitespace-nowrap">
                              {new Date(update.time).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
