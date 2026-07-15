"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Building2,
  User,
  Package,
  ArrowRight,
} from "lucide-react";

type Props = {
  data: {
    company: any;
    user: any;
    products?: any[];
    productsSkipped?: boolean;
  };
  onBack: () => void;
  onFinish: () => void;
};

export default function FinishSetup({ data, onBack, onFinish }: Props) {
  const { company, user, products, productsSkipped } = data;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex p-3 bg-green-50 rounded-full mb-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">All Set!</h2>
        <p className="text-sm text-gray-500 mt-1">Your store is ready to go</p>
      </div>

      <div className="space-y-3">
        {/* Company */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{company?.name}</p>
            <p className="text-xs text-gray-500">{company?.email}</p>
            {company?.address && (
              <p className="text-xs text-gray-400 mt-0.5">{company.address}</p>
            )}
          </div>
        </div>

        {/* Admin User */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <User className="w-5 h-5 text-purple-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || company?.email}
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                Super Admin
              </span>
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Package className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            {productsSkipped ? (
              <p className="text-sm text-gray-500">No products added yet</p>
            ) : products && products.length > 0 ? (
              <p className="text-sm text-gray-900">
                {products.length} product{products.length > 1 ? "s" : ""}{" "}
                uploaded
              </p>
            ) : (
              <p className="text-sm text-gray-500">No products added</p>
            )}
            <p className="text-xs text-gray-400">
              You can manage products later
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="px-6">
          ← Back
        </Button>
        <Button
          onClick={onFinish}
          className="bg-green-600 hover:bg-green-700 text-white px-6 flex items-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
