"use client";

import CompanyForm from "@/components/Setup/CompanyForm";
import FinishSetup from "@/components/Setup/FinishSetup";
import ProgressStepper from "@/components/Setup/ProgressStepper";
import ProductSetup from "@/components/Setup/ProductSetup";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";

const steps = ["Company", "Products", "Finish"];

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [setupData, setSetupData] = useState<any>({
    company: null,
    user: null,
    products: [],
    productsSkipped: false,
  });
  const checkCompany = async () => {
    try {
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/get-companies`,
        {
          method: "GET",
          tokenType: "jwt",
        },
      );

      if (data.data && data.data.length > 0) {
        navigate("/");
      } else {
        navigate("/setup-wizard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
    }
  };
  useEffect(() => {
    checkCompany();
  }, []);
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompanySubmit = (data: { company: any; user: any }) => {
    setSetupData((prev: any) => ({
      ...prev,
      company: data.company,
      user: data.user,
    }));
    next();
  };

  const handleProductSubmit = (data: any) => {
    setSetupData((prev: any) => ({
      ...prev,
      products: data.products || [],
      productsSkipped: data.skipped || false,
    }));
    next();
  };

  const handleFinish = () => {
    toast.success("🎉 Setup completed successfully!");
    navigate("/");
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">
          Setup Your Store
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1">
          Get started in just a few steps
        </p>
      </div>

      <ProgressStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={goToStep}
      />

      <div className="mt-8">
        {currentStep === 0 && (
          <CompanyForm
            onSubmit={handleCompanySubmit}
            defaultValues={setupData.company}
          />
        )}

        {currentStep === 1 && (
          <ProductSetup
            onNext={handleProductSubmit}
            onBack={back}
            defaultValues={setupData.products}
          />
        )}

        {currentStep === 2 && (
          <FinishSetup data={setupData} onBack={back} onFinish={handleFinish} />
        )}
      </div>
    </div>
  );
}
