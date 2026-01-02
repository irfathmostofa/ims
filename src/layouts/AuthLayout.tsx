import { Outlet } from "react-router-dom";
import {
  Package,
  BarChart3,
  Globe,
  CreditCard,
  RefreshCw,
  Palette,
} from "lucide-react";

export default function AuthLayout() {
  const features = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Inventory Management",
      description: "Centralized tracking reduces errors, prevents overselling",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Accounting with COA",
      description: "Automatic journal entries, clear financial visibility",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "E-commerce Website",
      description:
        "Live stock visibility, orders auto-update inventory and logistic management",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "POS System",
      description: "Fast billing, all sales update accounts automatically",
    },
    {
      icon: <RefreshCw className="h-5 w-5" />,
      title: "Online + Offline Sync",
      description: "Website & shop share inventory, instant updates",
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: "Dynamic Themes",
      description: "Switch themes without code, easy UI customization",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003333] via-[#002222] to-[#001a1a]">
      {/* Animated background dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-teal-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-teal-400/20 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-teal-400/20 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Brand & Features */}
        <div className="flex-1 flex flex-col justify-center px-12">
          <div className="max-w-2xl mx-auto w-full">
            {/* Brand with fade-in animation */}
            <div className="mb-10 animate-fadeIn">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:scale-105 transition-transform duration-300">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1
                    className="text-5xl font-bold text-white animate-slideDown"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    UniStock
                    <span className="text-3xl font-semibold text-teal-300 ml-2">
                      Pro
                    </span>
                  </h1>
                  <p className="text-lg text-gray-300 mt-2 animate-slideUp">
                    Complete Inventory & Business Management
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid - Minimal */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-teal-400/30 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-500/20 rounded-lg hover:bg-teal-500/30 transition-colors">
                        <div className="text-teal-400">{feature.icon}</div>
                      </div>

                      <h4 className="font-medium text-white ">
                        {feature.title}
                      </h4>
                      {/* <p className="text-sm text-gray-400">
                          {feature.description}
                        </p> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 flex items-center justify-center px-8">
          <div className="w-full max-w-md animate-slideLeft">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Layout - Only login form */}
      <div className="lg:hidden min-h-screen flex flex-col items-center justify-center px-4">
        {/* Mobile Brand Header - Minimal */}

        {/* Login Form Only */}
        <div className="w-full max-w-md animate-fadeIn">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
