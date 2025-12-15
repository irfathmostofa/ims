// components/NetworkStatusToast.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff, Check } from "lucide-react";

interface NetworkStatusToastProps {
  /** Custom message for offline state */
  offlineMessage?: string;
  /** Custom message for online state */
  onlineMessage?: string;
  /** Duration in milliseconds for toast to show (default: Infinity for offline, 4000 for online) */
  duration?: {
    offline?: number;
    online?: number;
  };
  /** Show retry button when offline */
  showRetryButton?: boolean;
  /** Custom retry button text */
  retryButtonText?: string;
  /** Position of the toast */
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  /** Custom CSS class for the toast */
  className?: string;
}

// Simple version without custom toast styling (uses Sonner's built-in styles)
export const SimpleNetworkStatusToast = (props: NetworkStatusToastProps) => {
  useEffect(() => {
    const handleOffline = () => {
      toast.error(props.offlineMessage || "No internet connection", {
        id: "network-offline",
        duration: props.duration?.offline || 4000,
        position: props.position || "top-center",
        icon: <WifiOff className="h-4 w-4" />,
        action: props.showRetryButton
          ? {
              label: props.retryButtonText || "Retry",
              onClick: () => window.location.reload(),
            }
          : undefined,
      });
    };

    const handleOnline = () => {
      toast.success(props.onlineMessage || "Back online!", {
        id: "network-online",
        duration: props.duration?.online || 4000,
        position: props.position || "top-center",
        icon: <Check className="h-4 w-4" />,
      });
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      handleOffline();
    }

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      toast.dismiss("network-offline");
      toast.dismiss("network-online");
    };
  }, [props]);

  return null;
};
